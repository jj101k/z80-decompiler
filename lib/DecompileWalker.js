
const { CodeDecompiler } = require("./CodeDecompiler")
const { DecomposedInstruction } = require("./InstructionHandler/DecomposedInstruction")
const { Initial } = require("./InstructionHandler/Initial")

/**
 * @typedef {"fn" | "j"} jumpType
 */

/**
 *
 */
const debugOptions = {
    jump: 1 << 0,
}

/**
 *
 */
class DecompileWalker extends CodeDecompiler {
    /**
     *
     */
    #debugOptions = 0
    /**
     *
     */
    #finished = false

    /**
     *
     */
    #handler = new Initial()

    /**
     * @type {Record<number, {rel: number[], direct: number[], type: jumpType}}
     */
    #jumps = {}

    /**
     * @type {number | null}
     */
    #jumpTo = null

    /**
     *
     */
    #lastEndPoint = 0

    /**
     * @type {Set<number>}
     */
    #memoryLocations = new Set()

    /**
     * @type {Map<number, [DecomposedInstruction | undefined, number]>}
     */
    #seen = new Map()

    /**
     *
     */
    #startPoint = 0

    /**
     * @type {Set<number>} This can include targets outside the range
     */
    #targets = new Set()

    /**
     *
     * @param {number} n
     */
    #addTargetFile(n) {
        if(!this.#targets.has(n)) {
            if(n < 0 || n >= this.dw.length) {
                console.warn(`Jump target ${this.addr(n)} (${this.addr(n + this.loadPoint)}) is out of range`)
            }
            this.#targets.add(n)
        }
    }

    /**
     *
     * @param {debugOptions[""]} type
     * @param {string} message
     */
    #debug(type, message) {
        if(this.#debugOptions & type) {
            console.debug(message)
        }
    }

    /**
     *
     * @param {number} n
     * @returns The file offset
     */
    #memoryAddress(n) {
        return n - this.loadPoint
    }

    /**
     *
     * @param {number} n
     * @returns The file offset
     */
    #relativeAddress(n) {
        return this.#startPoint + n
    }

    /**
     * Set to true during instruction parsing if it jumps to an unknown location
     */
    unknownJump = false

    /**
     *
     */
    get finished() {
        return this.#finished
    }

    /**
     *
     */
    get lastEndPoint() {
        return this.#lastEndPoint
    }

    /**
     *
     */
    get startPoint() {
        return this.#startPoint
    }

    /**
     *
     * @param {number} n
     */
    addJumpTo(n) {
        this.#jumpTo = this.addTarget(n)
    }

    /**
     *
     * @param {number} n
     */
    addJumpToRel(n) {
        this.#jumpTo = this.addTargetRel(n)
    }

    /**
     *
     * @param {number} n
     */
    addMemoryLocation(n) {
        this.#memoryLocations.add(n)
    }

    /**
     *
     * @param {number} n
     * @param {jumpType} [type]
     */
    addTarget(n, type = "j") {
        this.#debug(debugOptions.jump, `JT ${this.addr(n)}`)
        if(!this.#jumps[n]) {
            this.#jumps[n] = {rel: [], direct: [], type}
        }
        this.#jumps[n].direct.push(this.#startPoint + this.loadPoint)

        const fn = this.#memoryAddress(n)
        this.#addTargetFile(fn)
        this.#debug(debugOptions.jump, `-> ${this.addr(fn + this.loadPoint)}`)
        return fn
    }

    /**
     *
     * @param {number} n
     */
    addTargetRel(n) {
        this.#debug(debugOptions.jump, `JTR ${this.addr(this.#startPoint + this.loadPoint)}+${n}`)
        const address = this.#relativeAddress(n) + this.loadPoint
        if(!this.#jumps[address]) {
            this.#jumps[address] = {rel: [], direct: [], type: "j"}
        }
        this.#jumps[address].rel.push(this.#startPoint + this.loadPoint)

        const fn = this.#relativeAddress(n)
        this.#addTargetFile(fn)
        this.#debug(debugOptions.jump, `-> ${this.addr(fn + this.loadPoint)}`)
        return fn
    }

    /**
     *
     * @returns {DecomposedInstruction | null | undefined}
     */
    decode() {
        this.#startPoint = this.dw.offset
        this.#jumpTo = null
        this.unknownJump = false
        let n

        try {
            n = this.#handler.get(this.dw, this)
        } catch(e) {
            if(!(e instanceof RangeError)) {
                console.log(e)
            }
            this.#seen.set(this.#startPoint, [undefined, this.dw.offset - this.#startPoint])
            for(const t of this.#targets) {
                if(!this.#seen.has(t) && t >= 0 && t < this.dw.length) {
                    this.dw.offset = t
                    this.#debug(debugOptions.jump, `Auto-jump ${this.addr(t + this.loadPoint)}`)
                    return this.decode()
                }
            }
            this.#finished = true
        }
        if(n) {
            this.#lastEndPoint = this.dw.offset
            this.#seen.set(this.#startPoint, [n, this.#lastEndPoint - this.#startPoint])
            if(this.#jumpTo) {
                this.dw.offset = this.#jumpTo
            }
            if(this.unknownJump || this.#seen.has(this.dw.offset)) {
                for(const t of this.#targets) {
                    if(!this.#seen.has(t) && t >= 0 && t < this.dw.length) {
                        this.dw.offset = t
                        this.#debug(debugOptions.jump, `Auto-jump ${this.addr(t + this.loadPoint)}`)
                        return n
                    }
                }
                this.#finished = true
            }
        }
        return n
    }

    /**
     *
     */
    *dump() {
        console.log(`Memory locations are: ${[...this.#memoryLocations].map(n => this.addr(n))}`)
        const functions = Object.entries(this.#jumps).filter(([n, j]) => j.type == "fn").sort(([na], [nb]) => +na - +nb)
        const jumps = Object.entries(this.#jumps).filter(([n, j]) => j.type == "j").sort(([na], [nb]) => +na - +nb)
        const relJumps = jumps.filter(([n, j]) => j.direct.length == 0)
        const directJumps = jumps.filter(([n, j]) => j.direct.length > 0)

        const directJumpsInRange = directJumps.filter(([n]) => +n > this.loadPoint && +n <= this.dw.length + this.loadPoint)
        const functionsInRange = functions.filter(([n]) => +n > this.loadPoint && +n <= this.dw.length + this.loadPoint)
        const relJumpsInRange = relJumps.filter(([n]) => +n > this.loadPoint && +n <= this.dw.length + this.loadPoint)

        const dl = (directJumpsInRange.length - 1).toString().length
        const fl = (functionsInRange.length - 1).toString().length
        const rl = (relJumpsInRange.length - 1).toString().length
        const labels = Object.fromEntries([
            ...functionsInRange.map(([n], i) => [n, `fn${i.toString().padStart(fl, "0")}`]),
            ...directJumpsInRange.map(([n], i) => [n, `jp${i.toString().padStart(dl, "0")}`]),
            ...relJumpsInRange.map(([n], i) => [n, `re${i.toString().padStart(rl, "0")}`]),
        ])

        /**
         *
         * @param {string} content
         * @param {string} bytes
         * @param {number} location
         * @param {string} label
         * @returns
         */
        const out = (content, bytes, location, label = "") => {
            return [
                label.padEnd(7, " "),
                content.padEnd(16, " "),
                ";",
                bytes.padEnd(11, " "),
                `@${this.u16r(location + this.loadPoint)}`
            ].join(" ")
        }

        /**
         *
         * @param {string} content
         * @returns
         */
        const outMeta = (content) => {
            return [
                "".padEnd(7, " "),
                content.padEnd(40, " ")
            ].join(" ")
        }

        const startPoints = [...this.#seen.entries()].filter(([k, [di]]) => !!di).map(([k]) => k).sort((a, b) => a - b)
        yield outMeta(`ORG ${this.addr(startPoints[0] + this.loadPoint)}`)
        let offset = 0
        for(const startPoint of startPoints) {
            if(startPoint < 0 || startPoint >= this.dw.length) {
                continue
            }
            if(startPoint > offset + 1) {
                yield out(`DS ${startPoint-offset}`, "...", startPoint)
                offset = startPoint
            }
            const [n, l] = this.#seen.get(startPoint)
            const bytes = this.u8r(...this.dw.inspectAt(startPoint, l))
            const label = labels[startPoint + this.loadPoint]
            const caption = n.toString(labels, startPoint + this.loadPoint)
            yield out(caption, bytes, startPoint, label ?? "")

            offset = startPoint + l
        }
    }
}

module.exports = DecompileWalker