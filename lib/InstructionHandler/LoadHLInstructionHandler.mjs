import { DataWalker } from "../DataWalker.mjs"
import { DecompileWalker } from "../DecompileWalker.mjs"
import { DecomposedInstruction } from "./DecomposedInstruction.mjs"
import { TrivialInstructionHandler } from "./TrivialInstructionHandler.mjs"

/**
 *
 */
export class LoadHLInstructionHandler extends TrivialInstructionHandler {
    /**
     * @protected
     * @param {DataWalker} dw
     * @param {DecompileWalker} context
     * @returns
     */
    get(dw, context) {
        const di = super.get(dw, context)
        if(di) {
            context.addMemoryLocation(+di.arguments[0])
        }
        context.storeRegisterValue("HL", di ? +di.arguments[0] : null)
        return di
    }
}