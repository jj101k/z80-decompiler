const { TrivialInstructionHandler } = require("./TrivialInstructionHandler")
const { InstructionHandler } = require("./InstructionHandler")
const DataWalker = require("../DataWalker")

/**
 *
 */
class ED extends InstructionHandler {
    /**
     * These don't require further decoding but may take args
     *
     * @protected
     * @readonly
     * @type {Record<number, InstructionHandler>}
     */
    get simpleOpcodes() {
        return {
            [0x47]: new TrivialInstructionHandler("LD I, A"),
            [0x4f]: new TrivialInstructionHandler("LD R, A"),
            [0x57]: new TrivialInstructionHandler("LD A, I"),
            [0x5f]: new TrivialInstructionHandler("LD A, R"),
            [0xb0]: new TrivialInstructionHandler("LDIR"),
            [0xb8]: new TrivialInstructionHandler("LDDR"),
        }
    }

    /**
     * @abstract
     * @param {DataWalker} dw
     * @returns {string | undefined}
     */
    get(dw) {
        const nn = dw.uint8()
        if(this.simpleOpcodes[nn]) {
            return this.simpleOpcodes[nn].get(dw)
        }

        return null
    }
}
exports.ED = ED
