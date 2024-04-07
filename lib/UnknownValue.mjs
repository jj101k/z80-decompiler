/**
 * @abstract
 */
export class UnknownValue {
    /**
     * @param {number} v
     * @param {Record<number, string>} labels
     * @returns {string}
     */
    static addr(v, labels) {
        return labels[v] ?? v.toString(16)
    }
    /**
     *
     * @param {UnknownValue | number | null} v
     * @param {Record<number, string>} labels
     * @returns {string}
     */
    static str(v, labels) {
        if(typeof v == "number") {
            return "$" + v.toString(16)
        } else {
            return v?.toString(labels) ?? "?"
        }
    }
    /**
     * @protected
     * @param {number} v
     * @param {Record<number, string>} labels
     * @returns {string}
     */
    addr(v, labels) {
        return UnknownValue.addr(v, labels)
    }

    /**
     * @abstract
     * @type {boolean}
     */
    get isAtomic() {
        throw new Error("Not implemented")
    }

    /**
     *
     * @param {Record<number, string>} [labels]
     * @returns {string}
     */
    toString(labels) {
        throw new Error("Not implemented")
    }
}