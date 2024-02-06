const DataWalker = require("../DataWalker")
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
        const n = dw.uint8()
        return this.name.replace(/n/, this.u8(n))
    }
}

exports.Uint8InstructionHandler = Uint8InstructionHandler