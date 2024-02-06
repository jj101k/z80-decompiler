const DecompileWalker = require("../DecompileWalker")
const { RelJumpInstructionHandler } = require("./RelJumpInstructionHandler")

/**
 *
 */
class RelUncondJumpInstructionHandler extends RelJumpInstructionHandler {
    /**
     * @protected
     * @param {DecompileWalker} decompile
     * @param {number} e
     */
    handle(decompile, e) {
        decompile.addJumpToRel(+e)
    }
}

exports.RelUncondJumpInstructionHandler = RelUncondJumpInstructionHandler