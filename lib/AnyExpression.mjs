import { EffectivelyClampedValue } from "./EffectivelyClampedValue.mjs"
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
        if(a === 0) return b
        if(b === 0) return a
        if(Utilities.isNumber(a) && Utilities.isNumber(b)) {
            return a + b
        }
        // Bypass if it's a + a
        const aUid = a.toString()
        const bUid = b.toString()
        if(aUid == bUid) {
            return new UnknownExpressionValue(a, 2, "*")
        } else if(a instanceof UnknownExpressionValue && a.op == "*" && (a.a.toString() == bUid || a.b.toString() == bUid)) {
            if(a.a.toString() == bUid) {
                return new UnknownExpressionValue(b, AnyExpression.add(a.b, 1), "*")
            } else {
                return new UnknownExpressionValue(b, AnyExpression.add(a.a, 1), "*")
            }
        } else if(b instanceof UnknownExpressionValue && b.op == "*" && (b.a.toString() == aUid || b.b.toString() == aUid)) {
            if(b.a.toString() == aUid) {
                return new UnknownExpressionValue(a, AnyExpression.add(b.b, 1), "*")
            } else {
                return new UnknownExpressionValue(a, AnyExpression.add(b.a, 1), "*")
            }
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
            return v & 0xffff
        } else if(v instanceof EffectivelyClampedValue) {
            if(v.bits <= 16) {
                return v
            } else {
                return new UnknownClampedValue(v.value, 16)
            }
        } else {
            return new UnknownClampedValue(v, 16)
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
            return v & 0xff
        } else if(v instanceof EffectivelyClampedValue) {
            if(v.bits <= 8) {
                return v
            } else {
                return new UnknownClampedValue(v.value, 8)
            }
        } else {
            return new UnknownClampedValue(v, 8)
        }
    }
    /**
     *
     * @param {import("./UtilityTypes.mjs").anyValue | null} a
     * @param {import("./UtilityTypes.mjs").anyValue | null} b
     * @returns
     */
    static divide(a, b) {
        if(a === null || b === null) return null
        if(a === 1) return b
        if(b === 1) return a
        if(Utilities.isNumber(a) && Utilities.isNumber(b)) {
            const v = a / b
            return Math.trunc(v)
        }
        return new UnknownExpressionValue(a, b, "/")
    }
    /**
     *
     * @param {import("./UtilityTypes.mjs").anyValue | null} a
     * @param {import("./UtilityTypes.mjs").anyValue | null} b
     * @returns
     */
    static multiply(a, b) {
        if(a === null || b === null) return null
        if(a === 1) return b
        if(b === 1) return a
        if(Utilities.isNumber(a) && Utilities.isNumber(b)) {
            return a * b
        }
        return new UnknownExpressionValue(a, b, "*")
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
     * @param {number} b
     * @returns
     */
    static shiftLeft(a, b) {
        if(a === null || b === null) return null
        if(b === 0) return a
        return AnyExpression.multiply(a, 1 << b)
    }
    /**
     *
     * @param {import("./UtilityTypes.mjs").anyValue | null} a
     * @param {number} b
     * @returns
     */
    static shiftRight(a, b) {
        if(a === null || b === null) return null
        if(b === 0) return a
        return AnyExpression.divide(a, 1 << b)
    }
    /**
     *
     * @param {import("./UtilityTypes.mjs").anyValue | null} a
     * @param {import("./UtilityTypes.mjs").anyValue | null} b
     * @returns
     */
    static subtract(a, b) {
        if(a === null || b === null) return null
        if(a === 0) return b
        if(b === 0) return a
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