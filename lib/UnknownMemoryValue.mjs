import { UnknownEntryValue } from "./UnknownEntryValue.mjs"

/**
 *
 */
export class UnknownMemoryValue extends UnknownEntryValue {
    /**
     * @readonly
     */
    address
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
        super(fromPoint, length * 8)
        this.address = address
        this.length = length
    }

    /**
     *
     * @param {Record<number, string>} labels
     * @returns {string}
     */
    toString(labels = {}) {
        const addrLabel = this.addr(this.address, labels)
        /**
         * @type {string}
         */
        let line
        switch(this.length) {
            case 1:
                line = `byte[${addrLabel}]`
                break
            case 2:
                line = `word[${addrLabel}]`
                break
            default:
                line = `data[${addrLabel}, ${this.length}]`
                break
        }

        return this.addEntryLabel(line, labels)
    }
}
