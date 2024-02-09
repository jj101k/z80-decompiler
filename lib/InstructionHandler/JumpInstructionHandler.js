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
    #decompile

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
     * @param {DecompileWalker} decompile
     */
    constructor(name, decompile) {
        super()
        this.#decompile = decompile
        this.name = name
    }

    /**
     *
     * @param {DataWalker} dw
     * @returns
     */
    get(dw) {
        const di = new DecomposedInstruction(this.name, dw)
        this.handle(this.#decompile, +di.arguments[0])
        return di
    }
}

exports.JumpInstructionHandler = JumpInstructionHandler