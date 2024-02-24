import {DataWalker} from "../DataWalker.mjs"
import {DecompileWalker} from "../DecompileWalker.mjs"
import {DecomposedMemoryRegisterInstruction} from "./DecomposedMemoryRegisterInstruction.mjs"
import {Uint16InstructionHandler} from "./Uint16InstructionHandler.mjs"

/**
 *
 */
export class UpdateMemoryRegisterInstructionHandler extends Uint16InstructionHandler {
    /**
     *
     * @param {DataWalker} dw
     * @param {DecompileWalker} context
     * @returns
     */
    get(dw, context) {
        const di = new DecomposedMemoryRegisterInstruction(this.name, dw)
        context.addProbableMemoryLocation(+di.arguments[0])
        return di
    }
}