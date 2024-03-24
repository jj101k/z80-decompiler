import { DataWalker } from "../DataWalker.mjs"
import { DecompileWalker } from "../DecompileWalker.mjs"
import { TrivialInstructionHandler } from "./TrivialInstructionHandler.mjs"

/**
 * Copying from register to register
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
        context.storeRegisterValue(this.#toRegister, context.getRegisterValue(this.#fromRegister))
        return di
    }
    /**
     *
     * @param {import("../Z80Registers.mjs").Z80Registers} toRegister
     * @param {import("../Z80Registers.mjs").Z80Registers} fromRegister
     */
    constructor(toRegister, fromRegister) {
        super(`LD ${toRegister}, ${fromRegister}`)
        this.#fromRegister = fromRegister
        this.#toRegister = toRegister
    }
}