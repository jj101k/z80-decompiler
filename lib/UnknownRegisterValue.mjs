/**
 *
 */
export class UnknownRegisterValue {
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
        this.register = register
        this.fromPoint = fromPoint
    }

    toString() {
        return `${this.register}@${this.fromPoint.toString(16)}`
    }
}
