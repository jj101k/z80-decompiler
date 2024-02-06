const DecompileWalker = require("../DecompileWalker")
const { RelJumpInstructionHandler } = require("./RelJumpInstructionHandler")

/**
 *
 */
class RelCondJumpInstructionHandler extends RelJumpInstructionHandler {
    /**
     * @protected
     * @param {DecompileWalker} decompile
     * @param {number} e
     */
    handle(decompile, e) {
        decompile.addTargetRel(+e)
    }
}

exports.RelCondJumpInstructionHandler = RelCondJumpInstructionHandler