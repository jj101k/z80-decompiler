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
     * @returns
     */
    #$byte(v) {
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
     * @returns
     */
    $dump(skipMemory, skipRegister, activeMemoryValues, activeRegisterValues) {
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
                displayRegisterValues[r] = this.$registerValue(v)
            }
        }
        for(const r of Object.values(Z80Registers16b)) {
            if(skipRegister.has(r)) {
                continue
            }
            const v = activeRegisterValues[r]
            if(v !== undefined) {
                displayRegisterValues[r] = this.$registerValue(v)
            }
        }

        const registerValues = Object.entries(displayRegisterValues).map(([a, v]) => `${a}=${v}`)
        if(memoryValues.length || registerValues.length) {
            return [...memoryValues, ...registerValues].join(", ")
        } else {
            return ""
        }
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
     * @returns
     */
    $registerValue(v) {
        return UnknownValue.$str(v, this.#labels)
    }
}