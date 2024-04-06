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
     * @param {boolean} bracketExpressions
     * @returns {string}
     */
    static str(v, labels, bracketExpressions = false) {
        if(typeof v == "number") {
            return "$" + v.toString(16)
        } else {
            return v?.toString(labels, bracketExpressions) ?? "?"
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
     *
     * @param {Record<number, string>} [labels]
     * @param {boolean} [bracketExpressions]
     * @returns {string}
     */
    toString(labels, bracketExpressions) {
        throw new Error("Not implemented")
    }
}