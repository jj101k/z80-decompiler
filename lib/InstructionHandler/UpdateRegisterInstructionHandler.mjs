import { DataWalker } from "../DataWalker.mjs"
import { DecompileWalker } from "../DecompileWalker.mjs"
import { DecomposedMemoryRegisterInstruction } from "./DecomposedMemoryRegisterInstruction.mjs"
import { VariableWidthInstructionHandler } from "./VariableWidthInstructionHandler.mjs"

/**
 * Handles storing literal values in registers
 *
 * @template {import("../Z80Registers.mjs").Z80Registers8B | import("../Z80Registers.mjs").Z80Registers16B} T
 * @extends {VariableWidthInstructionHandler<T>}
 */
export class UpdateRegisterInstructionHandler extends VariableWidthInstructionHandler {
    /**
     *
     * @protected
     * @param {DataWalker} dw
     * @param {DecompileWalker} context
     * @returns
     */
    get(dw, context) {
        const di = new DecomposedMemoryRegisterInstruction(this.name, dw)
        this.getState(context).storeRegisterValue(this.register, +di.arguments[0])
        return di
    }
}