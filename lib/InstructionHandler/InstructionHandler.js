const { AnyDecompiler } = require("../AnyDecompiler")
const DataWalker = require("../DataWalker")

/**
 * @abstract
 */
class InstructionHandler extends AnyDecompiler {
    /**
     * @abstract
     * @param {DataWalker} dw
     * @returns {string | undefined}
     */
    get(dw) {
        throw new Error("Not implemented")
    }
}

exports.InstructionHandler = InstructionHandler