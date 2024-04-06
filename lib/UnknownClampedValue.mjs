import { UnknownValue } from "./UnknownValue.mjs"

/**
 *
 */
export class UnknownClampedValue extends UnknownValue {
    /**
     *
     */
    bits
    /**
     *
     */
    v
    /**
     *
     * @param {UnknownValue} v
     * @param {number} bits
     */
    constructor(v, bits) {
        super()
        this.v = v
        this.bits = bits
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