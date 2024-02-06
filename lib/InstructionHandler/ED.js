const { TrivialInstructionHandler } = require("./TrivialInstructionHandler")
const { InstructionHandler } = require("./InstructionHandler")
const DataWalker = require("../DataWalker")
const { BitView } = require("../BitView")
const { rpR, hlR } = require("../rpR")

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
                if(nnx.b3 == 0b010) {
                    // 4a 42 5a 52 6a 62 7a 72
                    // 16-bit arithmetic
                    const op = (nnx.a3 & 0b1) ? "ADC" : "SBC"
                    const rp = rpR[nnx.a3 & 0b011]
                    return `${op} HL, ${rp}`
                } else if(nnx.a2 != hlR && nnx.b4 == 0b0011) {
                    // 43 53 73
                    // 16-bit load
                    const nn = dw.uint16()
                    const rp = rpR[nnx.a2]
                    return `LD (${this.addr(nn)}), ${rp}`
                } else if(nnx.a2 != hlR && nnx.b4 == 0b1011) {
                    // 4B 5B 7B
                    // 16-bit load
                    const nn = dw.uint16()
                    const rp = rpR[nnx.a2]
                    return `LD ${rp}, (${this.addr(nn)})`
                }
            }
        }

        return null
    }
}
exports.ED = ED
