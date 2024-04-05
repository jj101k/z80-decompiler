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
     * @returns {string}
     */
    toString(labels = {}) {
        return `(${this.v.toString(labels)} [${this.bits}b])`
    }
}