import { VariableWidthInstructionHandler } from "./VariableWidthInstructionHandler.mjs"

/**
 * Copying from register to register
 * @template {import("../Z80Registers.mjs").Z80Registers8B | import("../Z80Registers.mjs").Z80Registers16B} T
 * @extends {VariableWidthInstructionHandler<T>}
 */
export class CopyRegisterInstructionHandler extends VariableWidthInstructionHandler {
    /**
     *
     */
    #fromRegister
    /**
     *
     */
    get #toRegister() {
        return this.register
    }
    /**
     *
     * @protected
     * @param {import("../DataWalker.mjs").DataWalker} dw
     * @param {import("../DecompileWalker.mjs").DecompileWalker} context
     * @returns
     */
    get(dw, context) {
        const di = super.get(dw, context)
        const state = this.getState(context)
        state.storeRegisterValue(this.#toRegister, state.getRegisterValue(this.#fromRegister))
        return di
    }
    /**
     *
     * @param {T} toRegister
     * @param {T} fromRegister
     */
    constructor(toRegister, fromRegister) {
        super(`LD ${toRegister}, ${fromRegister}`, toRegister)
        this.#fromRegister = fromRegister
    }
}