import {JumpInstructionHandler} from "./JumpInstructionHandler.mjs"

/**
 *
 */
export class CallInstructionHandler extends JumpInstructionHandler {
    /**
     * @protected
     * @param {import("../DecompileContext.mjs").DecompileContext} decompile
     * @param {number} nn
     */
    handle(decompile, nn) {
        decompile.addTarget(nn, "fn")
        decompile.invalidateState()
    }
}