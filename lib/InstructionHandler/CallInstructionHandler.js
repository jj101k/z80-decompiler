const DecompileWalker = require("../DecompileWalker")
const { JumpInstructionHandler } = require("./JumpInstructionHandler")

/**
 *
 */
class CallInstructionHandler extends JumpInstructionHandler {
    /**
     * @protected
     * @param {DecompileWalker} decompile
     * @param {number} nn
     */
    handle(decompile, nn) {
        decompile.addTarget(nn, "fn")
    }
}

exports.CallInstructionHandler = CallInstructionHandler