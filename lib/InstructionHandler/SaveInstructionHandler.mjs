import { SaveLoadInstructionHandler } from "./SaveLoadInstructionHandler.mjs"

/**
 * @template {import("../Z80Registers.mjs").Z80Registers8b | import("../Z80Registers.mjs").Z80Registers16b} T
 * @extends {SaveLoadInstructionHandler<T>}
 */
export class SaveInstructionHandler extends SaveLoadInstructionHandler {
    /**
     *
     * @param {import("../DataWalker.mjs").DataWalker} dw
     * @param {import("../DecompileContext.mjs").DecompileContext} context
     * @returns
     */
    get(dw, context) {
        const di = super.get(dw, context)
        const address = di ? +di.arguments[0] : null
        if(address !== null) {
            const state = this.getState(context)
            state.storeMemoryValue(address, state.getRegisterValue(this.register))
        }
        return di
    }
}