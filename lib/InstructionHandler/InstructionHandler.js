const { AnyDecompiler } = require("../AnyDecompiler")
const DataWalker = require("../DataWalker")
const DecompileWalker = require("../DecompileWalker")
const { DecomposedInstruction } = require("./DecomposedInstruction")

/**
 * @abstract
 */
class InstructionHandler extends AnyDecompiler {
    /**
     * @abstract
     * @param {DataWalker} dw
     * @param {DecompileWalker} context
     * @returns {DecomposedInstruction | undefined}
     */
    get(dw, context) {
        throw new Error("Not implemented")
    }
}

exports.InstructionHandler = InstructionHandler