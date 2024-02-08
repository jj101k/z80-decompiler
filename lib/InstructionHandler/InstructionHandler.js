const { AnyDecompiler } = require("../AnyDecompiler")
const DataWalker = require("../DataWalker")
const { DecomposedInstruction } = require("./DecomposedInstruction")

/**
 * @abstract
 */
class InstructionHandler extends AnyDecompiler {
    /**
     * @abstract
     * @param {DataWalker} dw
     * @returns {DecomposedInstruction | undefined}
     */
    get(dw) {
        throw new Error("Not implemented")
    }
}

exports.InstructionHandler = InstructionHandler