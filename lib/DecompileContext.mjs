
import { CodeDecompiler } from "./CodeDecompiler.mjs"
import { DecompileVolatileState } from "./DecompileVolatileState.mjs"
import { InitialInstructionHandler } from "./InstructionHandler/InitialInstructionHandler.mjs"
import { MachineState } from "./MachineState/MachineState.mjs"
import { MachineStateView16b } from "./MachineState/MachineStateView16b.mjs"
import { MachineStateView8b } from "./MachineState/MachineStateView8b.mjs"
import { Z80Registers16b } from "./Z80Registers.mjs"

/**
 * @typedef {"fn" | "j"} jumpType
 */

/**
 *
 */
const debugOptions = Object.freeze({
    jump: 1 << 0,
    parse: 1 << 1,
    state: 1 << 2,
})

/**
 *
 */
export class DecompileContext extends CodeDecompiler {
    /**
     *
     */
    static dumpInstructionStats = true
    /**
     *
     */
    #debugOptions = 0

    /**
     * Where the last linear decompile run started
     */
    #entryPoint = this.loadPoint

    /**
     *
     */
    #finished = false

    /**
     *
     */
    #handler = new InitialInstructionHandler()

    /**
     * @type {Record<number, {rel: number[], direct: number[], type: jumpType}>}
     * Maps memory addresses to the relative/direct caller lists (also memory addresses)
     */
    #jumps = {}

    /**
     * @type {number | null}
     */
    #lastByteLength = null

    /**
     * @type {Record<number, MachineState[]>}
     */
    #machineStates = {}

    /**
     * @type {Set<number>} A set of literal memory locations.
     */
    #memoryLocations = new Set()

    /**
     * @type {Set<number>} A set of literal memory locations, possibly including
     * unrelated content which was put in HL.
     */
    #probableAddresses = new Set()

    /**
     * @type {Map<number, [import("./DecomposedInstruction/DecomposedInstruction.mjs").DecomposedInstruction | undefined, number]>}
     */
    #seen = new Map()

    /**
     * @type {Set<number>} This can include targets outside the range. These are
     * file offsets.
     */
    #targets = new Set()

    /**
     *
     * @param {number} n
     */
    #addTargetFile(n) {
        if(!this.#targets.has(n)) {
            if(n < 0 || n >= this.dw.length) {
                console.warn(`Jump target ${this.$addr(n)} (${this.$addr(n + this.loadPoint)}) is out of range`)
            }
            this.#targets.add(n)
        }
    }

    /**
     * Clears all volatile state which might be present before a jump
     *
     * @returns
     */
    #clearVolatileState() {
        const vState = new DecompileVolatileState(this.#entryPoint)
        this.#debug(debugOptions.state, `Clear at ${this.$addr(this.#entryPoint)}`)
        vState.addEventListener("storedRegisterValue", ({register, value: n}) => {
            if(n === null) {
                return
            }
            switch(register) {
                case Z80Registers16b.HL: {
                    if(!this.#memoryLocations.has(n) && !this.#targets.has(n - this.loadPoint)) {
                        this.#probableAddresses.add(n)
                    }
                    break
                }
                case Z80Registers16b.IX:
                    // Fall through
                case Z80Registers16b.IY:
                {
                    this.#memoryLocations.add(n)
                    break
                }
                case Z80Registers16b.SP: {
                    this.#memoryLocations.add(n)
                    break
                }
            }
        })

        vState.addEventListener("readMemory", (location) => {
            this.addMemoryLocation(location)
        })
        vState.addEventListener("storedMemory", (location) => {
            this.addMemoryLocation(location)
        })

        return vState
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
     * @param {number} n The memory offset
     * @returns The file offset
     */
    #memoryAddress(n) {
        return n - this.loadPoint
    }

    /**
     *
     */
    volatileState

    /**
     * Where the last linear decompile run started. Set this to start from that position.
     */
    get entryPoint() {
        return this.#entryPoint
    }
    set entryPoint(v) {
        if(this.#probableAddresses.has(v)) {
            this.#probableAddresses.delete(v)
        }
        this.dw.offset = v - this.loadPoint
        this.#entryPoint = v
        this.volatileState = this.#clearVolatileState()
    }

    /**
     *
     */
    get finished() {
        return this.#finished
    }

    set finished(v) {
        this.#finished = v
    }

    /**
     *
     */
    get lastByteLength() {
        return this.#lastByteLength
    }

    /**
     *
     */
    get outOfRangeContent() {
        const memoryLocations = [...this.#memoryLocations, ...this.#probableAddresses]
        const functions = Object.entries(this.#jumps).filter(([, j]) => j.type == "fn").map(([n]) => +n)
        const jumps = Object.entries(this.#jumps).filter(([, j]) => j.type == "j").map(([n]) => +n)

        /**
         *
         * @param {number} n
         * @returns
         */
        const outOfRange = (n) => n < this.loadPoint || n >= this.dw.length + this.loadPoint
        return {
            memoryLocations: memoryLocations.filter(outOfRange),
            jumps: jumps.filter(outOfRange),
            functions: functions.filter(outOfRange),
        }
    }

    /**
     *
     */
    get s16() {
        return new MachineStateView16b(this.state)
    }

    /**
     *
     */
    get s8() {
        return new MachineStateView8b(this.state)
    }

    /**
     *
     */
    get state() {
        return this.volatileState.state
    }

    /**
     *
     * @param {import("./DataWalker.mjs").DataWalker} dw
     * @param {number} loadPoint
     */
    constructor(dw, loadPoint) {
        super(dw, loadPoint)
        this.volatileState = this.#clearVolatileState()
        this.#machineStates[loadPoint] = [this.state]
    }

    /**
     * This notes that n is definitely being used as readable or writeable
     * memory. It might still possibly be used as code.
     *
     * @param {number} n A location in memory
     */
    addMemoryLocation(n) {
        this.#probableAddresses.delete(n)
        this.#memoryLocations.add(n)
    }

    /**
     *
     * @param {number} n
     * @param {jumpType} [type]
     * @returns The file offset
     */
    addTarget(n, type = "j") {
        this.#debug(debugOptions.jump, `JT ${this.$addr(n)}`)
        if(!this.#jumps[n]) {
            this.#jumps[n] = {rel: [], direct: [], type}
        }
        const startPoint = this.volatileState.startPoint
        this.#jumps[n].direct.push(startPoint + this.loadPoint)

        const fn = this.#memoryAddress(n)
        this.#addTargetFile(fn)
        this.#debug(debugOptions.jump, `-> ${this.$addr(fn + this.loadPoint)}`)
        return fn
    }

    /**
     *
     * @param {number} n
     */
    addTargetRel(n) {
        const startPoint = this.volatileState.startPoint
        this.#debug(debugOptions.jump, `JTR ${this.$addr(startPoint + this.loadPoint)}+${n}`)

        const fileTarget = this.volatileState.relativeAddress(n)

        const address = fileTarget + this.loadPoint
        if(!this.#jumps[address]) {
            this.#jumps[address] = {rel: [], direct: [], type: "j"}
        }
        this.#jumps[address].rel.push(startPoint + this.loadPoint)

        this.#addTargetFile(fileTarget)
        this.#debug(debugOptions.jump, `-> ${this.$addr(address)}`)
        return fileTarget
    }

    /**
     *
     * @returns {import("./DecomposedInstruction/DecomposedInstruction.mjs").DecomposedInstruction | null | undefined}
     */
    decode() {
        const startPoint = this.dw.offset
        this.#lastByteLength = null
        let n

        this.volatileState.initWorkingState(this.#jumps[this.dw.offset + this.loadPoint]?.type === "fn", startPoint)

        this.#debug(debugOptions.state, "" + this.state)
        this.#debug(debugOptions.parse, `Resolving at ${this.$addr(this.dw.offset + this.loadPoint)}`)
        try {
            n = this.#handler.resolve(this.dw, this)
        } catch(e) {
            if(!(e instanceof RangeError)) {
                console.error(e)
            }
            this.#seen.set(startPoint, [undefined, this.dw.offset - startPoint])
            for(const t of this.#targets) {
                if(!this.#seen.has(t) && t >= 0 && t < this.dw.length) {
                    this.entryPoint = t + this.loadPoint
                    this.#debug(debugOptions.jump, `Auto-jump (catch) ${this.$addr(this.dw.offset + this.loadPoint)} -> ${this.$addr(t + this.loadPoint)}`)
                    return this.decode()
                }
            }
            this.#finished = true
        }
        this.#debug(debugOptions.state, "" + this.state)
        const newState = this.volatileState.resolveWorkingState()
        if(newState) {
            let ms = this.#machineStates[startPoint]
            if(!ms) {
                ms = this.#machineStates[startPoint] = []
            }
            ms.push(newState)
        }
        if(n) {
            const endPoint = this.dw.offset
            this.#lastByteLength = endPoint - startPoint
            this.#seen.set(startPoint, [n, endPoint - startPoint])

            const jumpTo = this.volatileState.jumpTo
            if(jumpTo) {
                this.volatileState = this.#clearVolatileState()
                this.entryPoint = jumpTo + this.loadPoint
            }
            if(this.volatileState.unknownJump || this.#seen.has(this.dw.offset)) {
                for(const t of this.#targets) {
                    if(!this.#seen.has(t) && t >= 0 && t < this.dw.length) {
                        this.entryPoint = t + this.loadPoint
                        this.#debug(debugOptions.jump, `Auto-jump ${this.$addr(endPoint + this.loadPoint)} -> ${this.$addr(t + this.loadPoint)}`)
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
        const memoryLocations = [...this.#memoryLocations, ...this.#probableAddresses].sort((a, b) => a - b)
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

        const functions = Object.entries(this.#jumps).filter(([, j]) => j.type == "fn").sort(([na], [nb]) => +na - +nb)
        const jumps = Object.entries(this.#jumps).filter(([, j]) => j.type == "j").sort(([na], [nb]) => +na - +nb)
        const relJumps = jumps.filter(([, j]) => j.direct.length == 0)
        const directJumps = jumps.filter(([, j]) => j.direct.length > 0)

        const directJumpsInRange = directJumps.filter(([n]) => +n >= this.loadPoint && +n < this.dw.length + this.loadPoint)
        const functionsInRange = functions.filter(([n]) => +n >= this.loadPoint && +n < this.dw.length + this.loadPoint)
        const memoryLocationsInRange = memoryLocations.filter((r) => r >= this.loadPoint && r < this.dw.length + this.loadPoint)
        const relJumpsInRange = relJumps.filter(([n]) => +n >= this.loadPoint && +n < this.dw.length + this.loadPoint)

        const dl = (directJumpsInRange.length - 1).toString().length
        const fl = (functionsInRange.length - 1).toString().length
        const ml = (memoryLocationsInRange.length - 1).toString().length
        const rl = (relJumpsInRange.length - 1).toString().length

        /**
         * @type {Record<number, string>}
         */
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
                return this.u8(...this.dw.inspectAt(at, abbreviateAtBytes)) + "..."
            } else {
                return this.u8(...this.dw.inspectAt(at, l))
            }
        }

        /**
         * This writes out a single line representing one location.
         *
         * @param {string} content
         * @param {number} length
         * @param {number} location
         * @param {string} label
         * @param {MachineState[]} states
         * @returns
         */
        const out = (content, length, location, label = "", states = []) => {
            return [
                label.padEnd(7, " "),
                content.padEnd(16, " "),
                ";",
                abbrBytes(location, length).padEnd(14, " "),
                `@${this.u16(location + this.loadPoint)}`,
                ";",
                states.map(s => s.dump(labels)).join("; ")
            ].join(" ")
        }

        /**
         * This writes out several locations in a row, generally for anonymous
         * data blocks.
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

        const startPoints = [...this.#seen.entries()].filter(([, [di]]) => !!di).map(([k]) => k).sort((a, b) => a - b)
        yield outMeta(`ORG ${this.$addr(startPoints[0] + this.loadPoint)}`)
        let offset = 0
        /**
         * @type {MachineState[] | undefined}
         */
        let lastStates = undefined
        for(const startPoint of startPoints) {
            if(startPoint < 0 || startPoint >= this.dw.length) {
                continue
            }
            if(startPoint > offset) {
                lastStates = undefined
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
                        yield out("DS 1", 1, offset, labels[offset + this.loadPoint] ?? "")
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
            /**
             * @type {MachineState[]}
             */
            const currentStates = this.#machineStates[startPoint] ?? lastStates ?? []
            yield out(caption, l, startPoint, label ?? "", currentStates)
            lastStates = currentStates

            if(!stats[n.uid]) {
                stats[n.uid] = 0
            }
            stats[n.uid]++

            offset = startPoint + l
        }

        const missingMemoryLocations = memoryLocationsInRange.filter(r => !seenMemoryLocations.has(r))
        if(missingMemoryLocations.length) {
            console.warn(`Missing memory locations (>= ${this.$addr(this.loadPoint)} and < ${this.$addr(this.dw.length + this.loadPoint)})`, missingMemoryLocations.map(r => `${this.$addr(r)}`))
        }

        if(DecompileContext.dumpInstructionStats) {
            console.warn("Dumping instruction frequency")
            const statResults = Object.entries(stats).sort(([, a], [, b]) => b - a)
            let seen = 0
            for(const [name, frequency] of statResults) {
                seen++
                console.warn(`${seen} ${frequency}x ${name} `)
            }
        }
    }

    /**
     *
     */
    invalidateState() {
        this.volatileState = this.#clearVolatileState()
        this.state.changed = true
    }

    /**
     * Returns the appropriate state view
     *
     * @param {number} bits
     * @returns
     */
    stateView(bits) {
        switch(bits) {
            case 8: return this.s8
            case 16: return this.s16
            default: throw new Error(`Internal error: Invalid state bits ${bits}`)
        }
    }
}