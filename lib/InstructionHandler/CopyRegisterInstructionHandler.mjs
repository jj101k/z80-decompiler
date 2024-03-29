import { DataWalker } from "../DataWalker.mjs"
import { DecompileWalker } from "../DecompileWalker.mjs"
import { Z80Registers16B, Z80Registers8B } from "../Z80Registers.mjs"
import { TrivialInstructionHandler } from "./TrivialInstructionHandler.mjs"

/**
 * Copying from register to register
 * @template {Z80Registers8B | Z80Registers16B} T
 */
export class CopyRegisterInstructionHandler extends TrivialInstructionHandler {
    /**
     *
     */
    #fromRegister
    /**
     *
     */
    #toRegister
    /**
     *
     * @protected
     * @param {DataWalker} dw
     * @param {DecompileWalker} context
     * @returns
     */
    get(dw, context) {
        const di = super.get(dw, context)
        context.state.storeRegisterValue(this.#toRegister, context.state.getRegisterValue(this.#fromRegister))
        return di
    }
    /**
     *
     * @param {T} toRegister
     * @param {T} fromRegister
     */
    constructor(toRegister, fromRegister) {
        super(`LD ${toRegister}, ${fromRegister}`)
        this.#fromRegister = fromRegister
        this.#toRegister = toRegister
    }
}