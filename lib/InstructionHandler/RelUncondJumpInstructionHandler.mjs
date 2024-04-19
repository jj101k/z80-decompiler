import { RelJumpInstructionHandler } from "./RelJumpInstructionHandler.mjs"

/**
 *
 */
export class RelUncondJumpInstructionHandler extends RelJumpInstructionHandler {
    /**
     * @protected
     * @param {import("../DecompileContext.mjs").DecompileContext} context
     * @param {number} e
     */
    handle(context, e) {
        context.volatileState.addJumpTo(context.addTargetRel(+e))
    }
}