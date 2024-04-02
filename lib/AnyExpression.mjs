import { UnknownClampedValue } from "./UnknownClampedValue.mjs"
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
    static and(a, b) {
        if(a === null || b === null) return null
        if(Utilities.isNumber(a) && Utilities.isNumber(b)) {
            return a & b
        }
        return new UnknownExpressionValue(a, b, "&")
    }
    /**
     *
     * @param {import("./UtilityTypes.mjs").anyValue | null} v
     * @returns {import("./UtilityTypes.mjs").anyValue | null}
     */
    static as16bit(v) {
        if(v === null) {
            return null
        } else if(Utilities.isNumber(v)) {
            return (65536 + v % 65536) % 65536
        } else if(v instanceof UnknownExpressionValue) {
            return new UnknownClampedValue(v, 16)
        } else {
            return v
        }
    }
    /**
     *
     * @param {import("./UtilityTypes.mjs").anyValue | null} v
     * @returns {import("./UtilityTypes.mjs").anyValue | null}
     */
    static as8bit(v) {
        if(v === null) {
            return null
        } else if(Utilities.isNumber(v)) {
            return (256 + v % 256) % 256
        } else if(v instanceof UnknownExpressionValue) {
            return new UnknownClampedValue(v, 8)
        } else {
            return v
        }
    }
    /**
     *
     * @param {import("./UtilityTypes.mjs").anyValue | null} a
     * @param {import("./UtilityTypes.mjs").anyValue | null} b
     * @returns
     */
    static or(a, b) {
        if(a === null || b === null) return null
        if(Utilities.isNumber(a) && Utilities.isNumber(b)) {
            return a | b
        }
        return new UnknownExpressionValue(a, b, "|")
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
    /**
     *
     * @param {import("./UtilityTypes.mjs").anyValue | null} a
     * @param {import("./UtilityTypes.mjs").anyValue | null} b
     * @returns
     */
    static xor(a, b) {
        if(a === null || b === null) return null
        if(Utilities.isNumber(a) && Utilities.isNumber(b)) {
            return a ^ b
        }
        return new UnknownExpressionValue(a, b, "^")
    }
}