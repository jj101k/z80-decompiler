import { UnknownValue } from "./Value/index.mjs"

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
        return v !== null && !(v instanceof UnknownValue)
    }
}