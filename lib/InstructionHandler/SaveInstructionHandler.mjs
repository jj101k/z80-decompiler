import { DataWalker } from "../DataWalker.mjs"
import { DecompileWalker } from "../DecompileWalker.mjs"
import { SaveLoadInstructionHandler } from "./SaveLoadInstructionHandler.mjs"

/**
 *
 */
export class SaveInstructionHandler extends SaveLoadInstructionHandler {
    /**
     *
     * @param {DataWalker} dw
     * @param {DecompileWalker} context
     * @returns
     */
    get(dw, context) {
        const di = super.get(dw, context)
        const address = di ? +di.arguments[0] : null
        if(address !== null) {
            context.storeMemoryValue(address, context.getRegisterValue(this.register), this.length)
        }
        return di
    }
}