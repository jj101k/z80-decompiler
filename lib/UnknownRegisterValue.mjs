import { UnknownEntryValue } from "./UnknownEntryValue.mjs"
import { Z80Machine } from "./Z80Machine.mjs"

/**
 *
 */
export class UnknownRegisterValue extends UnknownEntryValue {
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
        super(fromPoint, Z80Machine.registerBits[register])
        this.register = register
    }

    /**
     *
     * @param {Record<number, string>} labels
     * @param {boolean} [bracketExpressions]
     * @returns {string}
     */
    toString(labels = {}, bracketExpressions = false) {
        return this.addEntryLabel(this.register, labels)
    }
}
