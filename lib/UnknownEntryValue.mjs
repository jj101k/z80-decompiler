import { UnknownValue } from "./UnknownValue.mjs"

/**
 * @abstract
 */
export class UnknownEntryValue extends UnknownValue {
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
     * @protected
     *
     * @param {number} fromPoint
     */
    constructor(fromPoint) {
        super()
        this.fromPoint = fromPoint
    }
}