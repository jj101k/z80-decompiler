import { DecomposedMemoryRegisterInstruction } from "./DecomposedMemoryRegisterInstruction.mjs"
import { VariableWidthInstructionHandler } from "./VariableWidthInstructionHandler.mjs"

/**
 * Handles storing literal values in registers
 *
 * @template {import("../Z80Registers.mjs").Z80Registers8b | import("../Z80Registers.mjs").Z80Registers16b} T
 * @extends {VariableWidthInstructionHandler<T>}
 */
export class UpdateRegisterInstructionHandler extends VariableWidthInstructionHandler {
    /**
     *
     * @protected
     * @param {import("../DataWalker.mjs").DataWalker} dw
     * @param {import("../DecompileContext.mjs").DecompileContext} context
     * @returns
     */
    get(dw, context) {
        const di = new DecomposedMemoryRegisterInstruction(this.name, dw, context.startPoint)
        this.getState(context).storeRegisterValue(this.register, +di.arguments[0])
        return di
    }
}