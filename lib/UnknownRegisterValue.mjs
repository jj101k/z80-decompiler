import { UnknownValue } from "./UnknownValue.mjs"

/**
 *
 */
export class UnknownRegisterValue extends UnknownValue {
    /**
     * @readonly
     */
    fromPoint
    /**
     * @readonly
     */
    register

    /**
     *
     * @param {import("./Z80Registers.mjs").Z80Registers16b | import("./Z80Registers.mjs").Z80Registers8b} register
     * @param {number} fromPoint
     */
    constructor(register, fromPoint) {
        super()
        this.register = register
        this.fromPoint = fromPoint
    }

    /**
     *
     * @param {Record<number, string>} labels
     * @returns {string}
     */
    toString(labels = {}) {
        return `${this.register}@${this.addr(this.fromPoint, labels)}`
    }
}
