import { UnknownValue } from "./UnknownValue.mjs"

/**
 * @abstract
 */
export class EffectivelyClampedValue extends UnknownValue {
    /**
     * @readonly
     */
    bits
    /**
     * @abstract
     * @type {UnknownValue}
     */
    get value() {
        throw new Error("Not implemented")
    }
    /**
     *
     * @param {number} bits
     */
    constructor(bits) {
        super()
        this.bits = bits
    }
}