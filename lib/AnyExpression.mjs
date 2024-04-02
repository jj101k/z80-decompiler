import { UnknownExpressionValue } from "./UnknownExpressionValue.mjs"
import { UnknownValue } from "./UnknownValue.mjs"
import { Utilities } from "./Utilities.mjs"

/**
 *
 */
export class AnyExpression extends UnknownValue {
    /**
     *
     * @param {import("./UtilityTypes.mjs").anyValue | null} a
     * @param {import("./UtilityTypes.mjs").anyValue | null} b
     * @returns
     */
    static add(a, b) {
        if(a === null || b === null) return null
        if(Utilities.isNumber(a) && Utilities.isNumber(b)) {
            return a + b
        }
        return new UnknownExpressionValue(a, b, "+")
    }
    /**
     *
     * @param {import("./UtilityTypes.mjs").anyValue | null} a
     * @param {import("./UtilityTypes.mjs").anyValue | null} b
     * @returns
     */
    static subtract(a, b) {
        if(a === null || b === null) return null
        if(Utilities.isNumber(a) && Utilities.isNumber(b)) {
            return a - b
        }
        return new UnknownExpressionValue(a, b, "-")
    }
}