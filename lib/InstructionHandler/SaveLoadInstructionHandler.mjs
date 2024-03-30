import { VariableWidthInstructionHandler } from "./VariableWidthInstructionHandler.mjs"

/**
 * @abstract
 * @template {import("../Z80Registers.mjs").Z80Registers8B | import("../Z80Registers.mjs").Z80Registers16B} T
 * @extends {VariableWidthInstructionHandler<T>}
 */
export class SaveLoadInstructionHandler extends VariableWidthInstructionHandler {
    /**
     *
     * @param {import("../DataWalker.mjs").DataWalker} dw
     * @param {import("../DecompileWalker.mjs").DecompileWalker} context
     * @returns
     */
    get(dw, context) {
        const di = super.get(dw, context)
        if(di) {
            context.addMemoryLocation(+di.arguments[0])
        }
        return di
    }
}