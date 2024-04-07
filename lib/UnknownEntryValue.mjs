import { EffectivelyClampedValue } from "./EffectivelyClampedValue.mjs"

/**
 * @abstract
 */
export class UnknownEntryValue extends EffectivelyClampedValue {
    /**
     *
     */
    static showEntryPoints = false

    /**
     * @protected
     * @readonly
     */
    fromPoint


    /**
     * @protected
     *
     * @param {string} line
     * @param {Record<number, string>} labels
     * @returns {string}
     */
    addEntryLabel(line, labels) {
        if(UnknownEntryValue.showEntryPoints) {
            return `${line} @${this.entryLabel(labels)}`
        } else {
            return line
        }
    }

    /**
     * @protected
     *
     * @param {Record<number, string>} labels
     * @returns {string}
     */
    entryLabel(labels) {
        return this.addr(this.fromPoint, labels)
    }

    /**
     *
     */
    get isAtomic() {
        return true
    }

    /**
     * @protected
     *
     * @param {number} fromPoint
     * @param {number} bits
     */
    constructor(fromPoint, bits) {
        super(bits)
        this.fromPoint = fromPoint
    }

    /**
     *
     */
    get value() {
        return this
    }
}