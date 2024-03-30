import { RelJumpInstructionHandler } from "./RelJumpInstructionHandler.mjs"

/**
 *
 */
export class RelCondJumpInstructionHandler extends RelJumpInstructionHandler {
    /**
     * @protected
     * @param {import("../DecompileWalker.mjs").DecompileWalker} decompile
     * @param {number} e
     */
    handle(decompile, e) {
        decompile.addTargetRel(+e)
    }
}