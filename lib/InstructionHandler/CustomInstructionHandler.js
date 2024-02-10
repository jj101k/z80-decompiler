const DataWalker = require("../DataWalker")
const DecompileWalker = require("../DecompileWalker")
const { InstructionHandler } = require("./InstructionHandler")


/**
 *
 */
class CustomInstructionHandler extends InstructionHandler {
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
        this.get = get.bind(this)
    }
}

exports.CustomInstructionHandler = CustomInstructionHandler