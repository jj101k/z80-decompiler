//@ts-check

/**
 *
 */
class DataWalker {
    #dv
    offset = 0
    /**
     *
     * @param {Buffer} contents
     */
    constructor(contents) {
        this.#dv = new DataView(contents.buffer, 0, contents.byteLength)
    }
    /**
     *
     * @returns
     */
    int8() {
        return this.#dv.getInt8(this.offset++)
    }
    /**
     *
     * @returns
     */
    inspect() {
        return this.inspectAt(this.offset, 4)
    }
    /**
     *
     * @param {number} offset
     * @param {number} length
     * @returns
     */
    inspectAt(offset, length) {
        /**
         * @type {number[]}
         */
        const values = []
        for(let i = 0; i < length; i++) {
            values.push(this.#dv.getUint8(offset + i))
        }
        return values
    }
    /**
     *
     * @returns
     */
    peekUint8() {
        return this.#dv.getUint8(this.offset)
    }
    /**
     *
     * @returns
     */
    uint16() {
        const a = this.#dv.getUint16(this.offset, true)
        this.offset += 2
        return a
    }
    /**
     *
     * @returns
     */
    uint8() {
        return this.#dv.getUint8(this.offset++)
    }
}

module.exports = DataWalker