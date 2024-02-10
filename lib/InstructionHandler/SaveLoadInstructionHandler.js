const DataWalker = require("../DataWalker")
const DecompileWalker = require("../DecompileWalker")
const { DecomposedInstruction } = require("./DecomposedInstruction")
const { Uint16InstructionHandler } = require("./Uint16InstructionHandler")

/**
 *
 */
class SaveLoadInstructionHandler extends Uint16InstructionHandler {
    /**
     *
     * @param {DataWalker} dw
     * @param {DecompileWalker} context
     * @returns
     */
    get(dw, context) {
        const di = new DecomposedInstruction(this.name, dw)
        context.addMemoryLocation(+di.arguments[0])
        return di
    }
}

exports.SaveLoadInstructionHandler = SaveLoadInstructionHandler