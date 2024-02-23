import {DecompileWalker} from "../DecompileWalker.mjs"
import {JumpInstructionHandler} from "./JumpInstructionHandler.mjs"

/**
 *
 */
export class UncondJumpInstructionHandler extends JumpInstructionHandler {
    /**
     * @protected
     * @param {DecompileWalker} decompile
     * @param {number} nn
     */
    handle(decompile, nn) {
        decompile.addJumpTo(nn)
    }
}