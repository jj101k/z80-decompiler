import {AnyDecompiler} from "../AnyDecompiler.mjs"
import {DataWalker} from "../DataWalker.mjs"
import {DecompileWalker} from "../DecompileWalker.mjs"
import {DecomposedInstruction} from "./DecomposedInstruction.mjs"

/**
 * @abstract
 */
export class InstructionHandler extends AnyDecompiler {
    /**
     * @abstract
     * @param {DataWalker} dw
     * @param {DecompileWalker} context
     * @returns {DecomposedInstruction | undefined | null}
     */
    get(dw, context) {
        throw new Error("Not implemented")
    }
}