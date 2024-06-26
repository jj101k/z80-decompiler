
import { Utilities } from "../Utilities.mjs"
import { AnyExpression, UnknownMemoryValue, UnknownRegisterValue } from "../Value/index.mjs"
import { Z80CompoundRegisters, Z80Registers16b, Z80Registers8b } from "../Z80Registers.mjs"
import { MachineStateDumper } from "./MachineStateDumper.mjs"

/**
 *
 */
export class MachineState {
    /**
     * @type {Record<string, {location:
     * import("../UtilityTypes.mjs").anyValue,length: number, value:
     * import("../UtilityTypes.mjs").anyValue | null}>}
     */
    #activeMemoryExpressions = {}
    /**
     * @type {Record<number, import("../UtilityTypes.mjs").anyValue | null>}
     */
    #activeMemoryValues = {}

    /**
     * @type {Partial<Record<import("../Z80Registers.mjs").Z80AnyRegister, import("../UtilityTypes.mjs").anyValue | null>>}
     */
    #activeRegisterValues = {}

    /**
     * True when something in the state has been modified
     */
    #changed = false

    /**
     * @type {Record<string, Array<(content: any) => any>>}
     */
    #eventHandlers = {}

    /**
     * @type {Set<number>}
     */
    #modifiedMemory = new Set()

    /**
     * @type {Set<string>}
     */
    #modifiedMemoryExpression = new Set()

    /**
     * @type {Set<import("../Z80Registers.mjs").Z80AnyRegister>}
     */
    #modifiedRegisters = new Set()

    /**
     * @type {Partial<Record<import("../Z80Registers.mjs").Z80AnyRegister, (import("../UtilityTypes.mjs").anyValue | null)[]>>}
     */
    #pushedRegisterValues = {}

    /**
     *
     * @returns
     */
    get #dumpExcludeList() {
        /**
         * @type {Set<number>}
         */
        const skipMemory = new Set()
        /**
         * @type {Set<import("../Z80Registers.mjs").Z80AnyRegister>}
         */
        const skipRegister = new Set()

        for (const a of Object.keys(this.#activeMemoryValues)) {
            if(!this.#modifiedMemory.has(+a)) {
                skipMemory.add(+a)
            }
        }
        for(const r of Object.values(Z80Registers8b)) {
            if((r in this.#activeRegisterValues) && !this.#modifiedRegisters.has(r)) {
                skipRegister.add(r)
            }
        }
        for(const r of Object.values(Z80Registers16b)) {
            if((r in this.#activeRegisterValues) && !this.#modifiedRegisters.has(r)) {
                skipRegister.add(r)
            }
        }
        return { skipMemory, skipRegister }
    }

    /**
     *
     * @param {import("../Z80Registers.mjs").Z80AnyRegister} register
     */
    #clearRegisterValue(register) {
        this.#activeRegisterValues[register] = null
        this.#emit("storedRegisterValue", {register, value: null})
    }

    /**
     *
     * @param {string} event
     * @param {any} content
     */
    #emit(event, content) {
        const handlers = this.#eventHandlers[event] ?? []
        for(const handler of handlers) {
            handler(content)
        }
    }

    /**
     * Expands a wide register into its underlying register references.
     *
     * @param {import("../Z80Registers.mjs").Z80Registers16b} register
     * @returns {import("../Z80Registers.mjs").Z80AnyRegister[]} The lowest-level registers
     */
    #expandWideRegister(register) {
        if(register in Z80CompoundRegisters) {
            return Z80CompoundRegisters[register] ?? []
        }
        return []
    }

    /**
     * Gets the current register value, or the initial one.
     *
     * @param {import("../Z80Registers.mjs").Z80AnyRegister} register
     * @returns {import("../UtilityTypes.mjs").anyValue | null}
     */
    #getRegisterValue(register) {
        const v = this.#activeRegisterValues[register]
        if(v === undefined) {
            return this.#initialRegisterValue(register)
        } else {
            return v
        }
    }

    /**
     *
     * @param {import("../Z80Registers.mjs").Z80AnyRegister} register
     * @returns {import("../UtilityTypes.mjs").anyValue | null}
     */
    #initialRegisterValue(register) {
        return new UnknownRegisterValue(register, this.clearedAt)
    }

    /**
     *
     * @param {import("../Z80Registers.mjs").Z80AnyRegister} register
     * @param {import("../UtilityTypes.mjs").anyValue | null} n
     */
    #storeRegisterValue(register, n) {
        this.#activeRegisterValues[register] = n
        this.#emit("storedRegisterValue", {register, value: n})
    }

    /**
     *
     * @param {import("../Z80Registers.mjs").Z80Registers8b} register
     * @returns {import("../Z80Registers.mjs").Z80Registers16b[]}
     */
    #widenNarrowRegister(register) {
        ///@ts-expect-error
        return Object.entries(Z80CompoundRegisters).filter(([, ars]) => ars.includes(register)).map(([cr]) => cr)
    }

    /**
     * @type {number}
     */
    clearedAt = 0

    /**
     * True if the current state is not the same as its predecessor (if any),
     * including if the previous state was changed.
     *
     * @type {boolean}
     */
    different

    /**
     * @type {boolean}
     */
    reset

    /**
     * True when something in the state has been modified
     */
    get changed() {
        return this.#changed
    }
    set changed(v) {
        this.#changed = v
        if(v) {
            this.different = true
        }
    }

    /**
     *
     * @param {MachineState} [copyFrom]
     */
    constructor(copyFrom) {
        if(copyFrom) {
            this.#activeMemoryValues = {...copyFrom.#activeMemoryValues}
            this.#activeRegisterValues = {...copyFrom.#activeRegisterValues}
            this.#eventHandlers = copyFrom.#eventHandlers
            this.#pushedRegisterValues = Object.fromEntries(
                Object.entries(copyFrom.#pushedRegisterValues).map(([r, p]) => [r, [...p]]))
            this.clearedAt = copyFrom.clearedAt
            this.different = copyFrom.changed
        } else {
            this.different = true
        }
        this.reset = !copyFrom
    }

    /**
     *
     * @param {string} event
     * @param {(content: any) => any} handler
     */
    addEventListener(event, handler) {
        if(this.#eventHandlers[event]) {
            this.#eventHandlers[event].push(handler)
        }
    }

    /**
     *
     * @param {string} register
     * @throws
     * @returns
     */
    assertNarrowRegisterValue(register) {
        if(
            ///@ts-expect-error
            Z80CompoundRegisters[register] ||
            ///@ts-expect-error
            ![Object.values(Z80Registers16b), ...Object.values(Z80Registers8b)].includes(register)
        ) {
            throw new Error(`${register} is not a valid wide register`)
        }
        ///@ts-expect-error
        return this.#getRegisterValue(register)
    }

    /**
     *
     * @param {string} register
     * @throws
     * @returns
     */
    assertWideRegisterValue(register) {
        ///@ts-expect-error
        if(!Object.values(Z80Registers16b).includes(register)) {
            throw new Error(`${register} is not a valid wide register`)
        }
        ///@ts-expect-error
        return this.getWideRegisterValue(register)
    }

    /**
     *
     * @param {import("../Z80Registers.mjs").Z80Registers8b} register
     */
    clearNarrowRegisterValue(register) {
        this.#modifiedRegisters.add(register)
        this.changed = true
        this.#clearRegisterValue(register)

        const compoundRegisters = this.#widenNarrowRegister(register)
        for(const cr of compoundRegisters) {
            this.#clearRegisterValue(cr)
        }
    }

    /**
     *
     * @param {import("../Z80Registers.mjs").Z80Registers16b} register
     */
    clearWideRegisterValue(register) {
        this.#modifiedRegisters.add(register)
        this.changed = true
        for(const sr of this.#expandWideRegister(register)) {
            this.#clearRegisterValue(sr)
        }
        this.#clearRegisterValue(register)
    }

    /**
     *
     * @param {Record<number, string>} labels
     * @returns
     */
    dump(labels = {}) {
        const dumper = new MachineStateDumper(labels)

        // Skip over any expressions which are in all of them.
        const { skipMemory, skipRegister } = this.#dumpExcludeList
        return dumper.$dump(skipMemory, skipRegister, this.#activeMemoryValues, this.#activeMemoryExpressions, this.#activeRegisterValues, this.reset)
    }

    /**
     *
     * @param {import("../UtilityTypes.mjs").anyValue | null} address
     * @param {number} length
     * @param {number} offset
     * @returns {import("../UtilityTypes.mjs").anyValue | null}
     */
    getMemoryBytes(address, length, offset = 0) {
        if(address === null) {
            return null
        }
        this.#emit("readMemory", address)
        if(typeof address == "number") {
            let someKnown = false
            for(let i = 0; i < length; i++) {
                const vi = this.#activeMemoryValues[address + offset + i]
                if(vi !== undefined) {
                    someKnown = true
                    break
                }
            }
            if(!someKnown) {
                return new UnknownMemoryValue(address, length, this.clearedAt)
            }
            if(length == 1) {
                return this.#activeMemoryValues[address + offset]
            }
            /**
             * @type {import("../UtilityTypes.mjs").anyValue | null}
             */
            let v = 0
            for(let i = 0; i < length; i++) {
                const vi = this.#activeMemoryValues[address + offset + i]
                v = AnyExpression.add(v, AnyExpression.shiftLeft(vi, i * 8 - 1))
            }
            return v
        } else {
            const v = this.#activeMemoryExpressions["" + address]
            if(v !== undefined) {
                return v.value
            } else {
                return new UnknownMemoryValue(address, length, this.clearedAt)
            }
        }
    }

    /**
     *
     * @param {import("../Z80Registers.mjs").Z80Registers8b} register
     * @returns {import("../UtilityTypes.mjs").anyValue | null}
     */
    getNarrowRegisterValue(register) {
        // If it's not compound, return it as-is
        const compoundRegisters = this.#widenNarrowRegister(register)
        if(compoundRegisters.length == 0) {
            return this.#getRegisterValue(register)
        }

        // If it has a directly stored value, return that
        const directValue = this.#activeRegisterValues[register]
        if(directValue !== null && directValue !== undefined) {
            return directValue
        }

        const wideRegisterValue = this.#activeRegisterValues[compoundRegisters[0]]
        if(wideRegisterValue === null) {
            // If it's been cleared, just return null
            return null
        } else if(wideRegisterValue === undefined) {
            // If it hasn't been set, return the initial value for the register
            return this.#getRegisterValue(register)
        }

        // Dig out the underlying value
        const srsc = this.#expandWideRegister(compoundRegisters[0])
        for(const [i, sr] of srsc.entries()) {
            if(sr == register) {
                return AnyExpression.as8bit(AnyExpression.shiftRight(wideRegisterValue, (srsc.length - i - 1) * 8))
            }
        }

        return null
    }

    /**
     *
     * @param {import("../Z80Registers.mjs").Z80Registers16b} register
     * @returns {import("../UtilityTypes.mjs").anyValue | null}
     */
    getWideRegisterValue(register) {
        // If it's not compound, return it as-is
        const srsc = this.#expandWideRegister(register)
        if(srsc.length == 0) {
            return this.#getRegisterValue(register)
        }
        // If it has a directly stored value, return that
        const directValue = this.#activeRegisterValues[register]
        if(directValue !== null && directValue !== undefined) {
            return directValue
        }
        // If any have been cleared, just return null
        let anySet = false
        for(const sr of srsc) {
            const v = this.#activeRegisterValues[sr]
            if(v === null) {
                return null
            } else if(v !== undefined) {
                anySet = true
            }
        }
        // If none have been set, return the initial value for the compound register
        if(!anySet) {
            return this.#getRegisterValue(register)
        }

        // Otherwise, compute it from the components
        /**
         * @type {import("../UtilityTypes.mjs").anyValue | null}
         */
        let vOut = 0
        for(const [i, sr] of srsc.entries()) {
            const v = this.#getRegisterValue(sr)
            vOut = AnyExpression.add(vOut, AnyExpression.shiftLeft(v, (srsc.length - i - 1) * 8))
        }
        return vOut
    }

    /**
     *
     * @param {import("../Z80Registers.mjs").Z80AnyRegister} register
     */
    popRegisterValue(register) {
        this.changed = true
        this.#modifiedRegisters.add(register)
        this.#storeRegisterValue(register, this.#pushedRegisterValues[register]?.pop() ?? null)
    }

    /**
     *
     * @param {import("../Z80Registers.mjs").Z80AnyRegister} register
     */
    pushRegisterValue(register) {
        this.changed = true
        let pushed = this.#pushedRegisterValues[register]
        if(!pushed) {
            pushed = this.#pushedRegisterValues[register] = []
        }
        pushed.push(this.#getRegisterValue(register))
    }

    /**
     *
     * @param {string} event
     * @param {(content: any) => any} handler
     */
    removeEventListener(event, handler) {
        if(this.#eventHandlers[event]) {
            this.#eventHandlers[event] = this.#eventHandlers[event].filter(h => h !== handler)
        }
    }

    /**
     *
     * @param {import("../UtilityTypes.mjs").anyValue | null} location
     * @param {import("../UtilityTypes.mjs").anyValue | null} n
     * @param {number} length
     */
    storeMemoryBytes(location, n, length) {
        this.changed = true
        if(location === null) {
            return // Can't do anything else.
        }
        this.#emit("storedMemory", location)

        if(typeof location == "number") {
            // Note that it was modified
            for(let i = 0; i < length; i++) {
                this.#modifiedMemory.add(location + i)
            }
            // Store the value
            if(Utilities.isNumber(n)) {
                for(let i = 0; i < length; i++) {
                    this.#activeMemoryValues[location + i] = (n >> i) & 0xff
                }
            } else if(length == 1) {
                this.#activeMemoryValues[location] = n
            } else if(n instanceof UnknownMemoryValue && n.length == length) {
                const bytes = n.bytes
                for(const [i, byte] of bytes.entries()) {
                    this.#activeMemoryValues[location + i] = byte
                }
            } else {
                for(let i = 0; i < length; i++) {
                    this.#activeMemoryValues[location + i] = null
                }
            }
        } else {
            // Note that it was modified
            this.#modifiedMemoryExpression.add("" + location)
            // Store the value
            this.#activeMemoryExpressions["" + location] = {location, length, value: n}
        }
    }

    /**
     *
     * @param {import("../Z80Registers.mjs").Z80Registers8b} register
     * @param {import("../UtilityTypes.mjs").anyValue | null} n
     */
    storeNarrowRegisterValue(register, n) {
        if(n === null) {
            return this.clearNarrowRegisterValue(register)
        }
        this.#modifiedRegisters.add(register)
        this.changed = true

        // Commit the wide register value
        const compoundRegisters = this.#widenNarrowRegister(register)
        for (const cr of compoundRegisters) {
            const components = this.#expandWideRegister(cr)
            for(const r of components) {
                if(r != register) {
                    // Commit. This will save the narrow register in its initial
                    // state if it has not been already.
                    this.#storeRegisterValue(r, this.#getRegisterValue(r))
                }
            }
            this.#clearRegisterValue(cr)
        }

        this.#storeRegisterValue(register, AnyExpression.as8bit(n))
    }

    /**
     *
     * @param {import("../Z80Registers.mjs").Z80Registers16b} register
     * @param {import("../UtilityTypes.mjs").anyValue | null} n
     */
    storeWideRegisterValue(register, n) {
        if(n === null) {
            return this.clearWideRegisterValue(register)
        }
        this.#modifiedRegisters.add(register)
        this.changed = true

        // No commit needed - all narrow register values are dropped
        const srs = this.#expandWideRegister(register)
        for(const sr of srs) {
            this.#clearRegisterValue(sr)
        }

        this.#storeRegisterValue(register, AnyExpression.as16bit(n))
    }

    /**
     *
     * @returns
     */
    toString() {
        return `MachineState@{${this.clearedAt}}: M=${Object.values(this.#activeMemoryValues).length}, R=${Object.values(this.#activeRegisterValues).length}${this.changed ? "*" : ""}`
    }
}