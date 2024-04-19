import { Z80Machine } from "../Z80Machine.mjs"
import { ParsingInstructionHandler } from "./ParsingInstructionHandler.mjs"

/**
 * @abstract
 *
 * For classes which accept either 8b or 16b operations
 * @template {import("../Z80Registers.mjs").Z80Registers8b | import("../Z80Registers.mjs").Z80Registers16b} T
 */
export class VariableWidthInstructionHandler extends ParsingInstructionHandler {
    /**
     *
     */
    #length
    /**
     * @protected
     */
    register

    /**
     *
     * @param {import("../DecompileContext.mjs").DecompileContext} context
     * @returns {import("../MachineState/MachineStateView.mjs").MachineStateView<T>}
     */
    getState(context) {
        return context.stateView(this.#length * 8)
    }

    /**
     *
     * @param {string} name
     * @param {T} register
     */
    constructor(name, register) {
        super(name)
        this.#length = Z80Machine.assertRegister(register)
        this.register = register
    }
}