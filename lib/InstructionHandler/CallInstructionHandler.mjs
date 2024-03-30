import {JumpInstructionHandler} from "./JumpInstructionHandler.mjs"

/**
 *
 */
export class CallInstructionHandler extends JumpInstructionHandler {
    /**
     * @protected
     * @param {import("../DecompileWalker.mjs").DecompileWalker} decompile
     * @param {number} nn
     */
    handle(decompile, nn) {
        decompile.addTarget(nn, "fn")
    }
}