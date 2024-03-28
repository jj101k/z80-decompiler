import { DataWalker } from "../DataWalker.mjs"
import { DecompileWalker } from "../DecompileWalker.mjs"
import { SaveLoadInstructionHandler } from "./SaveLoadInstructionHandler.mjs"

/**
 *
 */
export class LoadInstructionHandler extends SaveLoadInstructionHandler {
    /**
     *
     * @param {DataWalker} dw
     * @param {DecompileWalker} context
     * @returns
     */
    get(dw, context) {
        const di = super.get(dw, context)
        context.storeRegisterValue(this.register, context.getMemoryValue(di ? +di.arguments[0] : null, this.length))
        return di
    }
}