import { JumpInstructionHandler } from "./JumpInstructionHandler.mjs"

/**
 *
 */
export class UncondJumpInstructionHandler extends JumpInstructionHandler {
    /**
     * @protected
     * @param {import("../DecompileWalker.mjs").DecompileWalker} decompile
     * @param {number} nn
     */
    handle(decompile, nn) {
        decompile.addJumpTo(nn)
    }
}