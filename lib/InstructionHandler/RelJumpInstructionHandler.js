const DataWalker = require("../DataWalker")
const DecompileWalker = require("../DecompileWalker")
const { DecomposedInstruction } = require("./DecomposedInstruction")
const { InstructionHandler } = require("./InstructionHandler")

/**
 * @abstract
 */
class RelJumpInstructionHandler extends InstructionHandler {
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
     * @param {number} e
     */
    handle(decompile, e) {
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
        const e = dw.int8()
        this.handle(this.#decompile, +e)
        return new DecomposedInstruction(this.name, e)
    }
}

exports.RelJumpInstructionHandler = RelJumpInstructionHandler