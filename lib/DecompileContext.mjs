
import { CodeDecompiler } from "./CodeDecompiler.mjs"
import { InitialInstructionHandler } from "./InstructionHandler/InitialInstructionHandler.mjs"
import { MachineState } from "./MachineState.mjs"
import { MachineStateView16b } from "./MachineStateView16b.mjs"
import { MachineStateView8b } from "./MachineStateView8b.mjs"
import { Utilities } from "./Utilities.mjs"
import { Z80Registers16b } from "./Z80Registers.mjs"

/**
 * @typedef {"fn" | "j"} jumpType
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
    #jumpTo = null

    /**
     *
     */
    #lastEndPoint = 0

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
     * The file offset at which the currently decoded instruction started
     */
    #startPoint = 0

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
                console.warn(`Jump target ${this.addr(n)} (${this.addr(n + this.loadPoint)}) is out of range`)
            }
            this.#targets.add(n)
        }
    }

    /**
     * Clears all state which might be present before a jump
     *
     * @returns
     */
    #clearState() {
        const state = new MachineState()
        state.clearedAt = this.#entryPoint
        this.#debug(debugOptions.state, `Clear at ${this.addr(state.clearedAt)}`)
        state.addEventListener("storedRegisterValue", ({register, value: n}) => {
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

        state.addEventListener("readMemory", (location) => {
            this.addMemoryLocation(location)
        })
        state.addEventListener("storedMemory", (location) => {
            this.addMemoryLocation(location)
        })

        return state
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
     * @param {number} n
     * @returns The file offset
     */
    #relativeAddress(n) {
        return this.#startPoint + n
    }

    /**
     * @type {MachineState}
     */
    state

    /**
     * Set to true during instruction parsing if it jumps to an unknown location
     */
    unknownJump = false

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
        this.state = this.#clearState()
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
    get lastEndPoint() {
        return this.#lastEndPoint
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
    get startPoint() {
        return this.#startPoint
    }

    /**
     *
     * @param {import("./DataWalker.mjs").DataWalker} dw
     * @param {number} loadPoint
     */
    constructor(dw, loadPoint) {
        super(dw, loadPoint)
        this.state = this.#clearState()
        this.#machineStates[loadPoint] = [this.state]
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
     */
    addJumpToHL() {
        const activeHLValue = this.s16.getRegisterValue(Z80Registers16b.HL)
        if(Utilities.isNumber(activeHLValue)) {
            this.#jumpTo = this.addTarget(activeHLValue)
        } else {
            this.unknownJump = true
        }
    }

    /**
     *
     * @param {number} n
     */
    addJumpToRel(n) {
        this.#jumpTo = this.addTargetRel(n)
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
     * @type {Record<number, MachineState[]>}
     */
    #machineStates = {}

    /**
     *
     * @returns {import("./DecomposedInstruction/DecomposedInstruction.mjs").DecomposedInstruction | null | undefined}
     */
    decode() {
        this.#startPoint = this.dw.offset
        this.#jumpTo = null
        this.unknownJump = false
        let n

        const oldState = this.state
        this.state = new MachineState(this.state)

        this.#debug(debugOptions.state, "" + this.state)
        this.#debug(debugOptions.parse, `Resolving at ${this.addr(this.dw.offset + this.loadPoint)}`)
        try {
            n = this.#handler.resolve(this.dw, this)
        } catch(e) {
            if(!(e instanceof RangeError)) {
                console.error(e)
            }
            this.#seen.set(this.#startPoint, [undefined, this.dw.offset - this.#startPoint])
            for(const t of this.#targets) {
                if(!this.#seen.has(t) && t >= 0 && t < this.dw.length) {
                    this.entryPoint = t + this.loadPoint
                    this.#debug(debugOptions.jump, `Auto-jump (catch) ${this.addr(this.dw.offset + this.loadPoint)} -> ${this.addr(t + this.loadPoint)}`)
                    return this.decode()
                }
            }
            this.#finished = true
        }
        this.#debug(debugOptions.state, "" + this.state)
        if(this.state.changed) {
            this.state.changed = false // Reset the flag and keep it
            let ms = this.#machineStates[this.#startPoint]
            if(!ms) {
                ms = this.#machineStates[this.#startPoint] = []
            }
            ms.push(this.state)
        } else {
            this.state = oldState // Put the old one back
        }
        if(n) {
            this.#lastEndPoint = this.dw.offset
            this.#seen.set(this.#startPoint, [n, this.#lastEndPoint - this.#startPoint])
            if(this.#jumpTo) {
                this.state = this.#clearState()
                this.entryPoint = this.#jumpTo + this.loadPoint
            }
            if(this.unknownJump || this.#seen.has(this.dw.offset)) {
                for(const t of this.#targets) {
                    if(!this.#seen.has(t) && t >= 0 && t < this.dw.length) {
                        this.entryPoint = t + this.loadPoint
                        this.#debug(debugOptions.jump, `Auto-jump ${this.addr(this.#lastEndPoint + this.loadPoint)} -> ${this.addr(t + this.loadPoint)}`)
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
                `@${this.u16r(location + this.loadPoint)}`,
                ";",
                (this.#machineStates[location] ?? []).map(s => s.dump(labels)).join("; ")
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

        const startPoints = [...this.#seen.entries()].filter(([, [di]]) => !!di).map(([k]) => k).sort((a, b) => a - b)
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
            yield out(caption, l, startPoint, label ?? "")

            if(!stats[n.uid]) {
                stats[n.uid] = 0
            }
            stats[n.uid]++

            offset = startPoint + l
        }

        const missingMemoryLocations = memoryLocationsInRange.filter(r => !seenMemoryLocations.has(r))
        if(missingMemoryLocations.length) {
            console.warn(`Missing memory locations (>= ${this.addr(this.loadPoint)} and < ${this.addr(this.dw.length + this.loadPoint)})`, missingMemoryLocations.map(r => `${this.addr(r)}`))
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
        this.state = this.#clearState()
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