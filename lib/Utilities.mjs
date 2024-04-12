import { UnknownValue } from "./UnknownValue.mjs"

/**
 *
 */
export class Utilities {
    /**
     * Expresses v using hex notation. For a string this just puts "$" at the start.
     *
     * @param {number | string} v
     * @returns
     */
    static $(v) {
        if(typeof v == "number") {
            if(Math.abs(v) < 10) {
                return v
            }
            return "$" + v.toString(16)
        } else {
            return "$" + v
        }
    }
    /**
     *
     * @param {import("./UtilityTypes.mjs").anyValue | null} v
     * @returns {v is number}
     */
    static isNumber(v) {
        return v !== null && !(v instanceof UnknownValue)
    }
}