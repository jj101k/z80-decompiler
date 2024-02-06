const { InstructionHandler } = require("./InstructionHandler")

/**
 *
 */
class TrivialInstructionHandler extends InstructionHandler {
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
    get() {
        return this.name
    }
}

exports.TrivialInstructionHandler = TrivialInstructionHandler