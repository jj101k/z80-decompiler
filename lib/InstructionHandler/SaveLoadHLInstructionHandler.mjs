import {DataWalker} from "../DataWalker.mjs"
import {DecompileWalker} from "../DecompileWalker.mjs"
import {DecomposedInstruction} from "./DecomposedInstruction.mjs"
import {Uint16InstructionHandler} from "./Uint16InstructionHandler.mjs"

/**
 *
 */
export class SaveLoadHLInstructionHandler extends Uint16InstructionHandler {
    /**
     * @protected
     * @param {DataWalker} dw
     * @param {DecompileWalker} context
     * @returns
     */
    get(dw, context) {
        const di = new DecomposedInstruction(this.name, dw)
        context.addMemoryLocation(+di.arguments[0])
        context.clearHLValue()
        return di
    }
}