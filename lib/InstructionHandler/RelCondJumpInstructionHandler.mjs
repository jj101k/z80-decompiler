import { RelJumpInstructionHandler } from "./RelJumpInstructionHandler.mjs"

/**
 *
 */
export class RelCondJumpInstructionHandler extends RelJumpInstructionHandler {
    /**
     * @protected
     * @param {import("../DecompileContext.mjs").DecompileContext} decompile
     * @param {number} e
     */
    handle(decompile, e) {
        decompile.addTargetRel(+e)
    }
}