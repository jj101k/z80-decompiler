const DataWalker = require("../DataWalker")
const DecompileWalker = require("../DecompileWalker")
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
        const nn = dw.uint16()
        this.handle(this.#decompile, +nn)
        return this.name.replace(/nn/, this.#decompile.addr(nn))
    }
}

exports.JumpInstructionHandler = JumpInstructionHandler