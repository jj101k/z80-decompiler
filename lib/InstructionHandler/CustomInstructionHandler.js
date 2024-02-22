const DataWalker = require("../DataWalker")
const DecompileWalker = require("../DecompileWalker")
const { DecomposedInstruction } = require("./DecomposedInstruction")
const { InstructionHandler } = require("./InstructionHandler")


/**
 *
 */
class CustomInstructionHandler extends InstructionHandler {
    /**
     * @type {(this: CustomInstructionHandler, dw: DataWalker, context: DecompileWalker) => string | undefined}
     */
    #getCustom
    /**
     *
     */
    name
    /**
     *
     * @param {string} name
     * @param {(this: CustomInstructionHandler, dw: DataWalker, context: DecompileWalker) => string | undefined} get
     */
    constructor(name, get) {
        super()
        this.name = name
        this.#getCustom = get.bind(this)
    }

    /**
     * @abstract
     * @param {DataWalker} dw
     * @param {DecompileWalker} context
     * @returns {DecomposedInstruction | undefined}
     */
    get(dw, context) {
        const result = this.#getCustom(dw, context)
        if(result) {
            return new DecomposedInstruction(result)
        } else {
            return undefined
        }
    }
}

exports.CustomInstructionHandler = CustomInstructionHandler