const DataWalker = require("../DataWalker")
const DecompileWalker = require("../DecompileWalker")
const { DecomposedInstruction } = require("./DecomposedInstruction")
const { InstructionHandler } = require("./InstructionHandler")

/**
 * @abstract
 */
class JumpInstructionHandler extends InstructionHandler {
    /**
     *
     */
    name

    /**
     * @abstract
     * @protected
     * @param {DecompileWalker} decompile
     * @param {number} nn
     */
    handle(decompile, nn) {
        throw new Error("Not implemented")
    }

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
     * @param {DecompileWalker} context
     * @returns
     */
    get(dw, context) {
        const di = new DecomposedInstruction(this.name, dw)
        this.handle(context, +di.arguments[0])
        return di
    }
}

exports.JumpInstructionHandler = JumpInstructionHandler