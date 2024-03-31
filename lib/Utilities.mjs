import { UnknownMemoryValue } from "./UnknownMemoryValue.mjs"
import { UnknownRegisterValue } from "./UnknownRegisterValue.mjs"

/**
 *
 */
export class Utilities {
    /**
    *
    * @param {import("./UtilityTypes.mjs").anyValue | null} v
    * @returns {v is number}
    */
    static isNumber(v) {
        return v !== null && !(v instanceof UnknownRegisterValue) && !(v instanceof UnknownMemoryValue)
    }
}