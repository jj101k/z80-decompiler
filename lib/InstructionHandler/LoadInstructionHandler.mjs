import { SaveLoadInstructionHandler } from "./SaveLoadInstructionHandler.mjs"

/**
 * @template {import("../Z80Registers.mjs").Z80Registers8B | import("../Z80Registers.mjs").Z80Registers16B} T
 * @extends {SaveLoadInstructionHandler<T>}
 */
export class LoadInstructionHandler extends SaveLoadInstructionHandler {
    /**
     *
     * @param {import("../DataWalker.mjs").DataWalker} dw
     * @param {import("../DecompileWalker.mjs").DecompileWalker} context
     * @returns
     */
    get(dw, context) {
        const di = super.get(dw, context)
        const state = this.getState(context)
        state.storeRegisterValue(this.register, state.getMemoryValue(di ? +di.arguments[0] : null))
        return di
    }
}