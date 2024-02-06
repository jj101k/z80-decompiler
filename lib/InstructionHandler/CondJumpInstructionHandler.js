const DecompileWalker = require("../DecompileWalker")
const { JumpInstructionHandler } = require("./JumpInstructionHandler")

/**
 *
 */
class CondJumpInstructionHandler extends JumpInstructionHandler {
    /**
     * @protected
     * @param {DecompileWalker} decompile
     * @param {number} nn
     */
    handle(decompile, nn) {
        decompile.addTarget(nn)
    }
}

exports.CondJumpInstructionHandler = CondJumpInstructionHandler