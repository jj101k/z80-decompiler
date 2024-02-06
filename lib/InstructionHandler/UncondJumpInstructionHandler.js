const DecompileWalker = require("../DecompileWalker")
const { JumpInstructionHandler } = require("./JumpInstructionHandler")

/**
 *
 */
class UncondJumpInstructionHandler extends JumpInstructionHandler {
    /**
     * @protected
     * @param {DecompileWalker} decompile
     * @param {number} nn
     */
    handle(decompile, nn) {
        decompile.addJumpTo(nn)
    }
}

exports.UncondJumpInstructionHandler = UncondJumpInstructionHandler