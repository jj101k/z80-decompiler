import { UnknownClampedValue } from "./UnknownClampedValue.mjs"
import { UnknownMemoryValue } from "./UnknownMemoryValue.mjs"
import { UnknownValue } from "./UnknownValue.mjs"
import { Utilities } from "./Utilities.mjs"
import { Z80Registers16b, Z80Registers8b } from "./Z80Registers.mjs"

/**
 *
 */
export class MachineStateDumper {
    #labels

    /**
     *
     * @param {import("./UtilityTypes.mjs").anyValue | null} v
     * @returns {string}
     */
    #$byte(v) {
        if(v instanceof UnknownClampedValue && v.bits >= 8) {
            return this.#$byte(v.value)
        }
        if(Utilities.isNumber(v)) {
            return Utilities.$(v)
        } else if(v) {
            return v.toString(this.#labels)
        } else {
            return "?"
        }
    }

    /**
     *
     * @param {Set<number>} skipMemory
     * @param {Set<import("./Z80Registers.d.mts").Z80AnyRegister>} skipRegister
     * @param {Record<number, import("./UtilityTypes.mjs").anyValue | null>} activeMemoryValues
     * @param {Partial<Record<import("./Z80Registers.d.mts").Z80AnyRegister, import("./UtilityTypes.mjs").anyValue | null>>} activeRegisterValues
     * @returns
     */
    #$dumpStates(skipMemory, skipRegister, activeMemoryValues, activeRegisterValues) {
        if(Object.keys(activeMemoryValues).length + Object.keys(activeRegisterValues).length == 0) {
            return []
        }
        const contiguousMemoryValues = this.#getContiguousMemoryValues(activeMemoryValues, skipMemory)
        const memoryValues = Object.entries(contiguousMemoryValues).map(([a, vs]) => `${UnknownMemoryValue.addr(+a, this.#labels)}=${this.$memoryValue(vs)}`)
        /**
         * @type {Partial<Record<import("./Z80Registers.d.mts").Z80AnyRegister, string>>}
         */
        const displayRegisterValues = {}
        for(const r of Object.values(Z80Registers8b)) {
            if(skipRegister.has(r)) {
                continue
            }
            const v = activeRegisterValues[r]
            if(v !== undefined) {
                displayRegisterValues[r] = this.$registerValue(v, 8)
            }
        }
        for(const r of Object.values(Z80Registers16b)) {
            if(skipRegister.has(r)) {
                continue
            }
            const v = activeRegisterValues[r]
            if(v !== undefined) {
                displayRegisterValues[r] = this.$registerValue(v, 16)
            }
        }

        const registerValues = Object.entries(displayRegisterValues).map(([a, v]) => `${a}=${v}`)
        return [...memoryValues, ...registerValues]
    }

    /**
     *
     * @param {string} s
     * @returns
     */
    #abbreviateMiddle(s) {
        return s.replace(/(..){2}(\1*)\1{2}/g, (a, $1, $2) => `${$1.repeat(2)}(...${$2.length}*...)${$1.repeat(2)}`)
    }

    /**
     *
     * @param {Record<number, import("./UtilityTypes.mjs").anyValue | null>} activeMemoryValues
     * @param {Set<number>} skipMemory
     * @returns
     */
    #getContiguousMemoryValues(activeMemoryValues, skipMemory) {
        /**
         * @type {Record<number, (import("./UtilityTypes.mjs").anyValue | null)[]>}
         */
        const contiguousMemoryValues = {}
        /**
         * @type {{lastAddress: number, bytes: (import("./UtilityTypes.mjs").anyValue | null)[]} | null}
         */
        let activeRecord = null
        for (const [a, v] of Object.entries(activeMemoryValues)) {
            if (skipMemory.has(+a)) {
                continue
            }
            if (!activeRecord || activeRecord.lastAddress + 1 < +a) {
                const bytes = [v]
                contiguousMemoryValues[+a] = bytes
                activeRecord = { lastAddress: +a, bytes: bytes }
            } else if (activeRecord.lastAddress + 1 == +a) {
                activeRecord.lastAddress = +a
                activeRecord.bytes.push(v)
            }
        }
        return contiguousMemoryValues
    }

    /**
     *
     * @param {Record<number, string>} labels
     */
    constructor(labels) {
        this.#labels = labels
    }

    /**
     *
     * @param {Set<number>} skipMemory
     * @param {Set<import("./Z80Registers.d.mts").Z80AnyRegister>} skipRegister
     * @param {Record<number, import("./UtilityTypes.mjs").anyValue | null>} activeMemoryValues
     * @param {Partial<Record<import("./Z80Registers.d.mts").Z80AnyRegister, import("./UtilityTypes.mjs").anyValue | null>>} activeRegisterValues
     * @param {boolean} reset
     * @returns
     */
    $dump(skipMemory, skipRegister, activeMemoryValues, activeRegisterValues, reset) {
        /**
         * @type {string[]}
         */
        const stateInfo = []
        if(reset) {
            stateInfo.push("initial state")
        } else if(Object.keys(activeMemoryValues).length + Object.keys(activeRegisterValues).length == 0) {
            stateInfo.push("cleared state")
        }
        stateInfo.push(...this.#$dumpStates(skipMemory, skipRegister, activeMemoryValues, activeRegisterValues))
        return stateInfo.join(", ")
    }

    /**
     *
     * @param {(import("./UtilityTypes.mjs").anyValue | null)[]} vs
     * @returns
     */
    $memoryValue(vs) {
        if(vs.length == 1) {
            return this.#$byte(vs[0])
        } else {
            return Utilities.$(this.#abbreviateMiddle(vs.map(v => {
                if(Utilities.isNumber(v)) {
                    return v.toString(16).padStart(2, "0")
                } else if(v) {
                    return `[${v.toString(this.#labels)}]`
                } else {
                    return "??"
                }
            }).join("")))
        }
    }

    /**
     *
     * @param {import("./UtilityTypes.mjs").anyValue | null} v
     * @param {number} bits
     * @returns {string}
     */
    $registerValue(v, bits) {
        if(v instanceof UnknownClampedValue && v.bits >= bits) {
            return this.$registerValue(v.value, bits)
        }
        return UnknownValue.$str(v, this.#labels)
    }
}