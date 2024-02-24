
import {CodeDecompiler} from "./CodeDecompiler.mjs"
import {DecomposedInstruction} from "./InstructionHandler/DecomposedInstruction.mjs"
import {Initial} from "./InstructionHandler/Initial.mjs"

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
export class DecompileWalker extends CodeDecompiler {
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
     * @type {Record<number, {rel: number[], direct: number[], type: jumpType}>}
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
     * @type {Set<number>}
     */
    #probableMemoryLocations = new Set()

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
        this.#probableMemoryLocations.delete(n)
        this.#memoryLocations.add(n)
    }

    /**
     *
     * @param {number} n
     */
    addProbableMemoryLocation(n) {
        if(!this.#memoryLocations.has(n)) {
            this.#probableMemoryLocations.add(n)
        }
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
        /**
         * @type {{start: number, length: number}[]}
         */
        const memoryRegions = []
        const memoryLocations = [...this.#memoryLocations, ...this.#probableMemoryLocations].sort((a, b) => a - b)
        if(memoryLocations.length) {
            let currentMemoryRegion = {start: memoryLocations[0], length: 0}
            memoryRegions.push(currentMemoryRegion)
            for(const l of memoryLocations) {
                if(l == currentMemoryRegion.start + currentMemoryRegion.length) {
                    currentMemoryRegion.length++
                } else {
                    currentMemoryRegion = {start: l, length: 1}
                    memoryRegions.push(currentMemoryRegion)
                }
            }
        }

        const functions = Object.entries(this.#jumps).filter(([n, j]) => j.type == "fn").sort(([na], [nb]) => +na - +nb)
        const jumps = Object.entries(this.#jumps).filter(([n, j]) => j.type == "j").sort(([na], [nb]) => +na - +nb)
        const relJumps = jumps.filter(([n, j]) => j.direct.length == 0)
        const directJumps = jumps.filter(([n, j]) => j.direct.length > 0)

        const directJumpsInRange = directJumps.filter(([n]) => +n >= this.loadPoint && +n < this.dw.length + this.loadPoint)
        const functionsInRange = functions.filter(([n]) => +n >= this.loadPoint && +n < this.dw.length + this.loadPoint)
        const memoryLocationsInRange = memoryLocations.filter((r) => r >= this.loadPoint && r < this.dw.length + this.loadPoint)
        const relJumpsInRange = relJumps.filter(([n]) => +n >= this.loadPoint && +n < this.dw.length + this.loadPoint)

        const dl = (directJumpsInRange.length - 1).toString().length
        const fl = (functionsInRange.length - 1).toString().length
        const ml = (memoryLocationsInRange.length - 1).toString().length
        const rl = (relJumpsInRange.length - 1).toString().length
        const labels = Object.fromEntries([
            ...functionsInRange.map(([n], i) => [n, `fn${i.toString().padStart(fl, "0")}`]),
            ...directJumpsInRange.map(([n], i) => [n, `jp${i.toString().padStart(dl, "0")}`]),
            ...memoryLocationsInRange.map((r, i) => [r, `mp${i.toString().padStart(ml, "0")}`]),
            ...relJumpsInRange.map(([n], i) => [n, `re${i.toString().padStart(rl, "0")}`]),
        ])

        /**
         * @type {Set<number>}
         */
        const seenMemoryLocations = new Set()

        /**
         *
         */
        const abbreviateAtBytes = 4

        /**
         *
         * @param {number} at
         * @param {number} l
         * @returns
         */
        const abbrBytes = (at, l) => {
            if(l > abbreviateAtBytes) {
                return this.u8r(...this.dw.inspectAt(at, abbreviateAtBytes)) + "..."
            } else {
                return this.u8r(...this.dw.inspectAt(at, l))
            }
        }

        /**
         *
         * @param {string} content
         * @param {number} length
         * @param {number} location
         * @param {string} label
         * @returns
         */
        const out = (content, length, location, label = "") => {
            return [
                label.padEnd(7, " "),
                content.padEnd(16, " "),
                ";",
                abbrBytes(location, length).padEnd(14, " "),
                `@${this.u16r(location + this.loadPoint)}`
            ].join(" ")
        }

        /**
         *
         * @param {string} content
         * @param {number} length
         * @param {number} location
         * @param {string} label
         * @returns
         */
        const outBlock = function*(content, length, location, label = "") {
            for(let i = 0; i < length; i += abbreviateAtBytes) {
                if(i == 0) {
                    yield out(content, Math.min(length, abbreviateAtBytes), location, label)
                } else {
                    yield out("", Math.min(length - i, abbreviateAtBytes), location + i, "")
                }
            }
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

        /**
         * @type {Record<string, number>}
         */
        const stats = {}

        const startPoints = [...this.#seen.entries()].filter(([k, [di]]) => !!di).map(([k]) => k).sort((a, b) => a - b)
        yield outMeta(`ORG ${this.addr(startPoints[0] + this.loadPoint)}`)
        let offset = 0
        for(const startPoint of startPoints) {
            if(startPoint < 0 || startPoint >= this.dw.length) {
                continue
            }
            if(startPoint > offset) {
                const memoryLocationsInGap = memoryLocationsInRange.filter(r => r - this.loadPoint >= offset && r - this.loadPoint < startPoint)
                for(let i = 0; i < memoryLocationsInGap.length; i++) {
                    const memoryLocation = memoryLocationsInGap[i]
                    if(memoryLocation - this.loadPoint > offset) {
                        const l = memoryLocation - this.loadPoint - offset
                        yield *outBlock(`DS ${l}`, l, offset)
                        offset = memoryLocation - this.loadPoint
                    }
                    seenMemoryLocations.add(memoryLocation)
                    /**
                     * @type {(typeof memoryLocationsInGap[0]) | undefined}
                     */
                    const nextLocation = memoryLocationsInGap[i + 1]
                    const nextPoint = nextLocation !== undefined ? nextLocation - this.loadPoint : startPoint
                    // Auto-expand
                    if(offset + 1 < nextPoint) {
                        const l = nextPoint - offset
                        yield *outBlock(`DS ${l}`, l, offset, labels[offset + this.loadPoint] ?? "")
                        offset = nextPoint
                    } else {
                        yield out(`DS 1`, 1, offset, labels[offset + this.loadPoint] ?? "")
                        offset++
                    }
                }
                if(startPoint > offset) {
                    const l = startPoint - offset
                    yield *outBlock(`DS ${l}`, l, offset)
                }
                offset = startPoint
            }
            const [n, l] = this.#seen.get(startPoint)
            const label = labels[startPoint + this.loadPoint]
            const caption = n.toString(labels, startPoint + this.loadPoint)
            yield out(caption, l, startPoint, label ?? "")

            if(!stats[n.uid]) {
                stats[n.uid] = 0
            }
            stats[n.uid]++

            offset = startPoint + l
        }

        const missingMemoryLocations = memoryLocationsInRange.filter(r => !seenMemoryLocations.has(r))
        if(missingMemoryLocations.length) {
            console.warn("Missing memory locations", missingMemoryLocations.map(r => `${this.addr(r)}`))
        }

        console.warn("Dumping instruction frequency")
        const statResults = Object.entries(stats).sort(([, a], [, b]) => b - a)
        let seen = 0
        for(const [name, frequency] of statResults) {
            seen++
            console.warn(`${seen} ${frequency}x ${name} `)
        }
    }
}