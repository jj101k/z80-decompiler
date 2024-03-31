/**
 *
 */
export class UnknownMemoryValue {
    /**
     * @readonly
     */
    address
    /**
     * @readonly
     */
    fromPoint
    /**
     * @readonly
     */
    length

    /**
     *
     * @param {number} address
     * @param {number} length
     * @param {number} fromPoint
     */
    constructor(address, length, fromPoint) {
        this.address = address
        this.fromPoint = fromPoint
        this.length = length
    }

    toString() {
        return `(${this.address.toString(16)}{${this.length}})@${this.fromPoint.toString(16)}`
    }
}
