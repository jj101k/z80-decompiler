const DataWalker = require("../DataWalker")
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
        const nn = dw.uint16()
        return this.name.replace(/nn/, this.u16(nn))
    }
}

exports.Uint16InstructionHandler = Uint16InstructionHandler