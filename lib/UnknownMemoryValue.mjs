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
     */
    get bytes() {
        /**
         * @type {UnknownMemoryValue[]}
         */
        const bytes = []
        for(let i = 0; i < this.length; i++) {
            bytes.push(new UnknownMemoryValue(this.address + i, 1, this.fromPoint))
        }
        return bytes
    }

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
