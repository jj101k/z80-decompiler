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
        if(this.#fromRegister == "HL") {
            const activeHLValue = context.getRegisterValue("HL")
            if(activeHLValue !== null) {
                context.storeRegisterValue(this.register, activeHLValue)
            }
        }
        return di
    }
    /**
     *
     * @param {string} toRegister
     * @param {string} fromRegister
     */
    constructor(toRegister, fromRegister) {
        super(`LD ${toRegister}, ${fromRegister}`, toRegister)
        this.#fromRegister = fromRegister
    }
}