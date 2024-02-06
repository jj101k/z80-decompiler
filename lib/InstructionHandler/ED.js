const { TrivialInstructionHandler } = require("./TrivialInstructionHandler")
const { InstructionHandler } = require("./InstructionHandler")
const DataWalker = require("../DataWalker")
const { BitView } = require("../BitView")
const { rpR } = require("../rpR")

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
        const nnx = new BitView(nn)
        switch(nnx.pre) {
            case 0x01: { // 0x4-0x7
                // 4a 42 5a 52 6a 62 7a 72
                if(nnx.b3 == 0b010) {
                    // 16-bit arithmetic
                    const op = (nnx.a3 & 0b1) ? "ADC" : "SBC"
                    const rp = rpR[nnx.a3 & 0b011]
                    return `${op} HL, ${rp}`
                }
            }
        }

        return null
    }
}
exports.ED = ED
