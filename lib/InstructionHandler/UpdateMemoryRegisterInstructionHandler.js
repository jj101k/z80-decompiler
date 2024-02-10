const DataWalker = require("../DataWalker")
const DecompileWalker = require("../DecompileWalker")
const { DecomposedMemoryRegisterInstruction } = require("./DecomposedMemoryRegisterInstruction")
const { Uint16InstructionHandler } = require("./Uint16InstructionHandler")

/**
 *
 */
class UpdateMemoryRegisterInstructionHandler extends Uint16InstructionHandler {
    /**
     *
     * @param {DataWalker} dw
     * @param {DecompileWalker} context
     * @returns
     */
    get(dw, context) {
        const di = new DecomposedMemoryRegisterInstruction(this.name, dw)
        context.addProbableMemoryLocation(+di.arguments[0])
        return di
    }
}

exports.UpdateMemoryRegisterInstructionHandler = UpdateMemoryRegisterInstructionHandler