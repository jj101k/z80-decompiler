const { addHlIxIy, arOpR } = require("../CodeDecompiler")
const { BitView } = require("../BitView")
const { TrivialInstructionHandler } = require("./TrivialInstructionHandler")
const { Uint16InstructionHandler } = require("./Uint16InstructionHandler")
const { CustomInstructionHandler } = require("./CustomInstructionHandler")
const { XDCB } = require("./XDCB")
const { InstructionHandler } = require("./InstructionHandler")
const { hlIndirect } = require("../registerRef")
const DataWalker = require("../DataWalker")

/**
 * @abstract
 */
class XD extends InstructionHandler {
    /**
     * @abstract
     * @protected
     * @type {string}
     */
    offsetRegister

    /**
     * These don't require further decoding but may take args
     *
     * @protected
     * @readonly
     * @type {Record<number, InstructionHandler>}
     */
    get simpleOpcodes() {
        return {
            [0x21]: new Uint16InstructionHandler(`LD ${this.offsetRegister}, nn`),
            [0x36]: new CustomInstructionHandler(`LD (${this.offsetRegister}+d), n`, function(dw) {
                const d = dw.int8()
                const n = dw.uint8()
                return this.name.replace(/[+]d/, this.rel(d)).replace(/n/, this.u8(n))
            }),
            [0xcb]: new XDCB(this.offsetRegister),
            [0xe3]: new TrivialInstructionHandler(`EX (SP), ${this.offsetRegister}`),
        }
    }

    /**
     * @abstract
     * @param {DataWalker} dw
     * @returns {string | undefined}
     */
    get(dw) {
        const nnx = new BitView(dw.uint8())

        if(this.simpleOpcodes[nnx.n]) {
            return this.simpleOpcodes[nnx.n].get(dw)
        }

        switch (nnx.pre) {
            case 0: { // 0x.d 0-3
                const r = addHlIxIy(nnx, this.offsetRegister)
                if (r) {
                    return r
                }
                if (nnx.a3 == hlIndirect && (nnx.b3 & 6) == 4) { // 0x.d34-5
                    const op = (nnx.b3 & 1) ? "DEC" : "INC"
                    const d = dw.int8()
                    return `${op} (${this.offsetRegister}${this.rel(d)})`
                }
                break
            }
            case 1: { // 0x.d 4-7
                if (nnx.a3 == hlIndirect && nnx.b3 != hlIndirect) {
                    const r = nnx.b3
                    const d = dw.int8()
                    return `LD (${this.offsetRegister}${this.rel(d)}), ${r}`
                } else if (nnx.a3 != hlIndirect && nnx.b3 == hlIndirect) {
                    const r = nnx.b3
                    const d = dw.int8()
                    return `LD ${r}, (${this.offsetRegister}${this.rel(d)})`
                }
                break
            }
            case 2: { // 0x.d 8-b
                if (nnx.b3 == hlIndirect) {
                    const op = arOpR[nnx.a3]
                    const d = dw.int8()

                    return `${op} (${this.offsetRegister}${this.rel(d)}})`
                }
                break
            }
            case 3: { // 0x.d c-f
                // Nothing here currently
                break
            }
        }

        return null
    }
}
exports.XD = XD
