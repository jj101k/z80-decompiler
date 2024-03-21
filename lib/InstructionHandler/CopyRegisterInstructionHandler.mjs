import { DataWalker } from "../DataWalker.mjs"
import { DecompileWalker } from "../DecompileWalker.mjs"
import { ImportRegisterInstructionHandler } from "./ImportRegisterInstructionHandler.mjs"

/**
 * Copying from register to register
 */
export class CopyRegisterInstructionHandler extends ImportRegisterInstructionHandler {
    /**
     *
     */
    #fromRegister
    /**
     *
     * @protected
     * @param {DataWalker} dw
     * @param {DecompileWalker} context
     * @returns
     */
    get(dw, context) {
        const di = super.get(dw, context)
        if(this.#fromRegister == "HL" && context.activeHLValue !== null) {
            context.storeRegisterValue(this.register, context.activeHLValue)
        }
        return di
    }
    /**
     *
     * @param {string} name
     * @param {string} toRegister
     * @param {string} fromRegister
     */
    constructor(name, toRegister, fromRegister) {
        super(name, toRegister)
        this.#fromRegister = fromRegister
    }
}