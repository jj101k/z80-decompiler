
import { AnyExpression } from "./AnyExpression.mjs"
import { UnknownMemoryValue } from "./UnknownMemoryValue.mjs"
import { UnknownRegisterValue } from "./UnknownRegisterValue.mjs"
import { UnknownValue } from "./UnknownValue.mjs"
import { Utilities } from "./Utilities.mjs"
import { Z80CompoundRegisters, Z80Registers16b, Z80Registers8b } from "./Z80Registers.mjs"

/**
 *
 */
export class MachineState {
    /**
     * @type {Record<number, import("./UtilityTypes.mjs").anyValue | null>}
     */
    #activeMemoryValues = {}

    /**
     * @type {Partial<Record<import("./Z80Registers.d.mts").Z80AnyRegister, import("./UtilityTypes.mjs").anyValue | null>>}
     */
    #activeRegisterValues = {}

    /**
     * @type {Record<string, Array<(content: any) => any>>}
     */
    #eventHandlers = {}

    /**
     *
     * @param {import("./Z80Registers.d.mts").Z80AnyRegister} register
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
     * @param {import("./Z80Registers.d.mts").Z80Registers16b} register
     * @returns {import("./Z80Registers.d.mts").Z80AnyRegister[]} The lowest-level registers
     */
    #expandWideRegister(register) {
        if(register in Z80CompoundRegisters) {
            return Z80CompoundRegisters[register] ?? []
        }
        return []
    }

    /**
     *
     * @param {import("./Z80Registers.mjs").Z80AnyRegister} register
     * @returns {import("./UtilityTypes.mjs").anyValue | null}
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
     * @param {import("./Z80Registers.mjs").Z80AnyRegister} register
     * @returns {import("./UtilityTypes.mjs").anyValue | null}
     */
    #initialRegisterValue(register) {
        return new UnknownRegisterValue(register, this.clearedAt)
    }

    /**
     *
     * @param {import("./Z80Registers.mjs").Z80AnyRegister} register
     * @param {import("./UtilityTypes.mjs").anyValue | null} n
     */
    #storeRegisterValue(register, n) {
        this.#activeRegisterValues[register] = n
        this.#emit("storedRegisterValue", {register, value: n})
    }

    /**
     *
     * @param {import("./Z80Registers.mjs").Z80Registers8b} register
     * @returns {import("./Z80Registers.mjs").Z80Registers16b[]}
     */
    #widenNarrowRegister(register) {
        ///@ts-expect-error
        return Object.entries(Z80CompoundRegisters).filter(([, ars]) => ars.includes(register)).map(([cr]) => cr)
    }

    /**
     *
     */
    changed = false

    /**
     * @type {number}
     */
    clearedAt = 0

    /**
     *
     * @param {MachineState} [copyFrom]
     */
    constructor(copyFrom) {
        if(copyFrom) {
            this.#activeMemoryValues = {...copyFrom.#activeMemoryValues}
            this.#activeRegisterValues = {...copyFrom.#activeRegisterValues}
            this.#eventHandlers = copyFrom.#eventHandlers
            this.clearedAt = copyFrom.clearedAt
        }
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
     * @param {import("./Z80Registers.d.mts").Z80Registers8b} register
     */
    clearNarrowRegisterValue(register) {
        this.changed = true
        this.#clearRegisterValue(register)

        const compoundRegisters = this.#widenNarrowRegister(register)
        for(const cr of compoundRegisters) {
            this.#clearRegisterValue(cr)
        }
    }

    /**
     *
     * @param {import("./Z80Registers.mjs").Z80Registers16b} register
     */
    clearWideRegisterValue(register) {
        this.changed = true
        for(const sr of this.#expandWideRegister(register)) {
            this.#clearRegisterValue(sr)
        }
        this.#clearRegisterValue(register)
    }

    /**
     *
     * @param {Record<number, string>} labels
     * @param {MachineState[] | undefined} lastStates
     * @returns
     */
    dump(labels = {}, lastStates = undefined) {
        if(Object.keys(this.#activeMemoryValues).length + Object.keys(this.#activeRegisterValues).length == 0) {
            return "initial state"
        }


        // Skip over any expressions which are in all of them.
        /**
         * @type {Set<number>}
         */
        const skipMemory = new Set()
        /**
         * @type {Set<import("./Z80Registers.mjs").Z80AnyRegister>}
         */
        const skipRegister = new Set()
        if(lastStates?.length) {
            for(const [a, v] of Object.entries(this.#activeMemoryValues)) {
                const expected = v?.toString()
                if(lastStates.every(s => s.#activeMemoryValues[+a]?.toString() === expected)) {
                    skipMemory.add(+a)
                }
            }
            for(const [r, v] of Object.entries(this.#activeRegisterValues)) {
                const expected = v?.toString()
                if(lastStates.every(s => s.#activeRegisterValues[r]?.toString() === expected)) {
                    skipRegister.add(r)
                }
            }
        }
        /**
         * @type {Record<number, (import("./UtilityTypes.mjs").anyValue | null)[]>}
         */
        const contiguousMemoryValues = {}
        /**
         * @type {{lastAddress: number, bytes: (import("./UtilityTypes.mjs").anyValue | null)[]} | null}
         */
        let activeRecord = null
        for(const [a, v] of Object.entries(this.#activeMemoryValues)) {
            if(skipMemory.has(+a)) {
                continue
            }
            if(!activeRecord || activeRecord.lastAddress + 1 < +a) {
                const bytes = [v]
                contiguousMemoryValues[+a] = bytes
                activeRecord = {lastAddress: +a, bytes: bytes}
            } else if(activeRecord.lastAddress + 1 == +a) {
                activeRecord.lastAddress = +a
                activeRecord.bytes.push(v)
            }
        }
        /**
         *
         * @param {string} s
         * @returns
         */
        const abbreviateMiddle = (s) => s.replace(/(..){2}(\1*)\1{2}/g, (a, $1, $2) => `${$1.repeat(2)}(...${$2.length}*...)${$1.repeat(2)}`)

        /**
         *
         * @param {import("./UtilityTypes.mjs").anyValue | null} v
         * @returns
         */
        const $byte = (v) => {
            if(Utilities.isNumber(v)) {
                return Utilities.$(v)
            } else if(v) {
                return v.toString(labels)
            } else {
                return "?"
            }
        }
        /**
         *
         * @param {(import("./UtilityTypes.mjs").anyValue | null)[]} vs
         * @returns
         */
        const $byteRun = (vs) => {
            if(vs.length == 1) {
                return $byte(vs[0])
            } else {
                return Utilities.$(abbreviateMiddle(vs.map(v => {
                    if(Utilities.isNumber(v)) {
                        return v.toString(16).padStart(2, "0")
                    } else if(v) {
                        return `[${v.toString(labels)}]`
                    } else {
                        return "??"
                    }
                }).join("")))
            }
        }

        const memoryValues = Object.entries(contiguousMemoryValues).map(([a, vs]) => `${UnknownMemoryValue.addr(+a, labels)}=${$byteRun(vs)}`)
        /**
         * @type {Partial<Record<import("./Z80Registers.d.mts").Z80AnyRegister, import("./UtilityTypes.mjs").anyValue | null>>}
         */
        const displayRegisterValues = {}
        for(const [r, v] of Object.entries(this.#activeRegisterValues)) {
            if(!skipRegister.has(r)) {
                displayRegisterValues[r] = v
            }
        }
        for(const [cr, ars] of Object.entries(Z80CompoundRegisters)) {
            if(skipRegister.has(cr)) {
                continue
            }
            if(ars.every(ar => this.#activeRegisterValues[ar] === undefined)) {
                continue
            }
            ///@ts-expect-error
            displayRegisterValues[cr] = this.getWideRegisterValue(cr)
            if(ars.every(ar => (this.#activeRegisterValues[ar] ?? null) !== null) || ars.every(ar => this.#activeRegisterValues[ar] === null)) {
                for(const ar of ars) {
                    delete displayRegisterValues[ar]
                }
            }
        }
        const registerValues = Object.entries(displayRegisterValues).map(([a, v]) => `${a}=${UnknownValue.$str(v, labels)}`)
        if(memoryValues.length || registerValues.length) {
            return [...memoryValues, ...registerValues].join(", ")
        } else {
            return ""
        }
    }

    /**
     *
     * @param {number | null} address
     * @param {number} length
     * @param {number} offset
     * @returns {import("./UtilityTypes.mjs").anyValue | null}
     */
    getMemoryBytes(address, length, offset = 0) {
        if(address === null) {
            return null
        }
        this.#emit("readMemory", address)
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
         * @type {import("./UtilityTypes.mjs").anyValue | null}
         */
        let v = 0
        for(let i = 0; i < length; i++) {
            const vi = this.#activeMemoryValues[address + offset + i]
            v = AnyExpression.add(v, AnyExpression.shiftLeft(vi, i * 8 - 1))
        }
        return v
    }

    /**
     *
     * @param {import("./Z80Registers.mjs").Z80Registers8b} register
     * @returns {import("./UtilityTypes.mjs").anyValue | null}
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
     * @param {import("./Z80Registers.mjs").Z80Registers16b} register
     * @returns {import("./UtilityTypes.mjs").anyValue | null}
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
         * @type {import("./UtilityTypes.mjs").anyValue | null}
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
     * @param {number} location
     * @param {import("./UtilityTypes.mjs").anyValue | null} n
     * @param {number} length
     */
    storeMemoryBytes(location, n, length) {
        this.#emit("storedMemory", location)
        this.changed = true
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
    }

    /**
     *
     * @param {import("./Z80Registers.mjs").Z80Registers8b} register
     * @param {import("./UtilityTypes.mjs").anyValue | null} n
     */
    storeNarrowRegisterValue(register, n) {
        if(n === null) {
            return this.clearNarrowRegisterValue(register)
        }
        this.changed = true

        const compoundRegisters = this.#widenNarrowRegister(register)
        for (const cr of compoundRegisters) {
            this.#clearRegisterValue(cr)
        }

        this.#storeRegisterValue(register, AnyExpression.as8bit(n))
    }

    /**
     *
     * @param {import("./Z80Registers.mjs").Z80Registers16b} register
     * @param {import("./UtilityTypes.mjs").anyValue | null} n
     */
    storeWideRegisterValue(register, n) {
        if(n === null) {
            return this.clearWideRegisterValue(register)
        }
        this.changed = true
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