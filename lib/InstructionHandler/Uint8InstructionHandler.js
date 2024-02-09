const DataWalker = require("../DataWalker")
const { DecomposedInstruction } = require("./DecomposedInstruction")
const { InstructionHandler } = require("./InstructionHandler")

/**
 *
 */
class Uint8InstructionHandler extends InstructionHandler {
    /**
     *
     */
    name
    /**
     *
     * @param {string} name
     */
    constructor(name) {
        super()
        this.name = name
    }

    /**
     *
     * @param {DataWalker} dw
     * @returns
     */
    get(dw) {
        return new DecomposedInstruction(this.name, dw)
    }
}

exports.Uint8InstructionHandler = Uint8InstructionHandler