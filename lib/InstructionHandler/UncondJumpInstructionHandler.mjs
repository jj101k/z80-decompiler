import { JumpInstructionHandler } from "./JumpInstructionHandler.mjs"

/**
 *
 */
export class UncondJumpInstructionHandler extends JumpInstructionHandler {
    /**
     * @protected
     * @param {import("../DecompileContext.mjs").DecompileContext} context
     * @param {number} nn
     */
    handle(context, nn) {
        context.volatileState.addJumpTo(context.addTarget(nn))
    }

    /**
     *
     * @param {string} name
     */
    constructor(name) {
        super(name)
    }
}