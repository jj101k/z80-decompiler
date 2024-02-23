import {DecompileWalker} from "../DecompileWalker.mjs"
import {RelJumpInstructionHandler} from "./RelJumpInstructionHandler.mjs"

/**
 *
 */
export class RelCondJumpInstructionHandler extends RelJumpInstructionHandler {
    /**
     * @protected
     * @param {DecompileWalker} decompile
     * @param {number} e
     */
    handle(decompile, e) {
        decompile.addTargetRel(+e)
    }
}