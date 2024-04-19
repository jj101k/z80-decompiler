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
    get isAtomic() {
        return false
    }
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
     * @returns {string}
     */
    toString(labels = {}) {
        return `${this.v.toString(labels)} [${this.bits}b]`
    }
}