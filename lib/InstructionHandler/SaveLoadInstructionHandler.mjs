import { DataWalker } from "../DataWalker.mjs"
import { DecompileWalker } from "../DecompileWalker.mjs"
import { VariableWidthInstructionHandler } from "./VariableWidthInstructionHandler.mjs"

/**
 * @abstract
 * @template {import("../Z80Registers.mjs").Z80Registers8B | import("../Z80Registers.mjs").Z80Registers16B} T
 * @extends {VariableWidthInstructionHandler<T>}
 */
export class SaveLoadInstructionHandler extends VariableWidthInstructionHandler {
    /**
     *
     * @param {DataWalker} dw
     * @param {DecompileWalker} context
     * @returns
     */
    get(dw, context) {
        const di = super.get(dw, context)
        context.addMemoryLocation(+di.arguments[0])
        return di
    }
}