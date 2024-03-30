import { Z80Machine } from "../Z80Machine.mjs"
import { TrivialInstructionHandler } from "./TrivialInstructionHandler.mjs"

/**
 * @abstract
 *
 * For classes which accept either 8b or 16b operations
 * @template {import("../Z80Registers.mjs").Z80Registers8B | import("../Z80Registers.mjs").Z80Registers16B} T
 */
export class VariableWidthInstructionHandler extends TrivialInstructionHandler {
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
     * @param {import("../DecompileWalker.mjs").DecompileWalker} context
     * @returns {import("../MachineStateView.mjs").MachineStateView<T>}
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