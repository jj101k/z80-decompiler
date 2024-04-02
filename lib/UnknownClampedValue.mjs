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
     * @returns
     */
    toString() {
        return `(${this.v} [${this.bits}b])`
    }
}