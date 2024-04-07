import { EffectivelyClampedValue } from "./EffectivelyClampedValue.mjs"

/**
 *
 */
export class UnknownClampedValue extends EffectivelyClampedValue {
    /**
     * @readonly
     */
    v
    /**
     *
     */
    get value() {
        return this.v
    }
    /**
     *
     * @param {import("./UnknownValue.mjs").UnknownValue} v
     * @param {number} bits
     */
    constructor(v, bits) {
        super(bits)
        this.v = v
    }

    /**
     *
     * @param {Record<number, string>} labels
     * @param {boolean} [bracketExpressions]
     * @returns {string}
     */
    toString(labels = {}, bracketExpressions = false) {
        const expr = `${this.v.toString(labels)} [${this.bits}b]`
        if(bracketExpressions) {
            return `(${expr})`
        } else {
            return expr
        }
    }
}