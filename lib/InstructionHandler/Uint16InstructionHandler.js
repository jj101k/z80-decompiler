const DataWalker = require("../DataWalker")
const { DecomposedInstruction } = require("./DecomposedInstruction")
const { InstructionHandler } = require("./InstructionHandler")

/**
 *
 */
class Uint16InstructionHandler extends InstructionHandler {
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

exports.Uint16InstructionHandler = Uint16InstructionHandler