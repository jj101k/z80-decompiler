//@ts-check

const { Decompiler, addHlIxIy, hlIndirect, arOpR, bitR, rsR } = require("./Decompiler")
const { BitView } = require("./BitView")

/**
 * @abstract
 */
class FDDD extends Decompiler {
    /**
     * @abstract
     * @protected
     * @type {string}
     */
    offsetRegister

    /**
     *
     * @returns {string | undefined | null}
     */
    try() {
        const nnx = new BitView(this.dw.uint8())

        switch (nnx.pre) {
            case 0: { // 0x.d 0-3
                const r = addHlIxIy(nnx, this.offsetRegister)
                if (r) {
                    return r
                }
                if (nnx.rest == 33) { // 0x.d21
                    const s = this.dw.uint16()
                    return `LD IX, ${this.u16(s)}`
                } else if (nnx.a3 == hlIndirect && (nnx.b3 & 6) == 4) { // 0x.d34-5
                    const op = (nnx.b3 & 1) ? "DEC" : "INC"
                    const d = this.dw.int8()
                    return `${op} (${this.offsetRegister}${this.rel(d)})`
                } else if (nnx.a3 == hlIndirect && nnx.b3 == hlIndirect) { // 0x.d36
                    const d = this.dw.int8()
                    const n = this.dw.uint8()
                    return `LD (${this.offsetRegister}${this.rel(d)}), ${this.u8(n)}`
                }
                break
            }
            case 1: { // 0x.d 4-7
                if (nnx.a3 == hlIndirect && nnx.b3 != hlIndirect) {
                    const r = nnx.b3
                    const d = this.dw.int8()
                    return `LD (${this.offsetRegister}${this.rel(d)}), ${r}`
                } else if (nnx.a3 != hlIndirect && nnx.b3 == hlIndirect) {
                    const r = nnx.b3
                    const d = this.dw.int8()
                    return `LD ${r}, (${this.offsetRegister}${this.rel(d)})`
                }
                break
            }
            case 2: { // 0x.d 8-b
                if (nnx.b3 == hlIndirect) {
                    const op = arOpR[nnx.a3]
                    const d = this.dw.int8()

                    return `${op} (${this.offsetRegister}${this.rel(d)}})`
                }
                break
            }
            case 3: { // 0x.d c-f
                if (nnx.rest == 11) { // 0xcb
                    // Bit manipulation
                    const a = this.dw.uint8()
                    const e = new BitView(this.dw.uint8())
                    if (e.pre != 0 && e.b3 == hlIndirect) {
                        return `${bitR[e.pre]} ${e.a3} (${this.offsetRegister}${this.rel(a)}})`
                    } else if (e.pre == 0 && e.a3 != 6) {
                        // Rotate / shift
                        return `${rsR[e.a3]} (${this.offsetRegister}${this.rel(a)}})`
                    }
                }
                break
            }
        }

        return null
    }
}
exports.FDDD = FDDD
