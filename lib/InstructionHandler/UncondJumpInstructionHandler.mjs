import { JumpInstructionHandler } from "./JumpInstructionHandler.mjs"

/**
 *
 */
export class UncondJumpInstructionHandler extends JumpInstructionHandler {
    /**
     * @protected
     * @param {import("../DecompileContext.mjs").DecompileContext} decompile
     * @param {number} nn
     */
    handle(decompile, nn) {
        decompile.addJumpTo(nn)
    }

    /**
     *
     * @param {string} name
     */
    constructor(name) {
        super(name)
    }
}