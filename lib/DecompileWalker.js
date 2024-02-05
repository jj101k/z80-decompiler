//@ts-check

const { BitView } = require("./BitView")
const { DD } = require("./DD")
const { Decompiler, registerRef, addHlIxIy, rpR, hlIndirect, arOpR, rsR, bitR } = require("./Decompiler")
const { FD } = require("./FD")

/**
 *
 */
class DecompileWalker extends Decompiler {
    /**
     *
     */
    #finished = false

    /**
     * @type {number | null}
     */
    #jumpTo = null

    /**
     *
     */
    #lastEndPoint = 0

    /**
     * @type {Map<number, string>}
     */
    #seen = new Map()

    /**
     * @type {Set<number>}
     */
    #targets = new Set()

    /**
     *
     * @param {number} n
     */
    #addJumpToFile(n) {
        this.#addTargetFile(n)
        this.#jumpTo = n
    }

    /**
     *
     * @param {number} n
     */
    #addTargetFile(n) {
        this.#targets.add(n)
    }

    /**
     *
     * @param {number} n
     * @returns The file offset
     */
    #memoryAddress(n) {
        return n - this.loadPoint
    }

    /**
     *
     * @param {number} n
     * @returns The file offset
     */
    #relativeAddress(n) {
        return this.dw.offset + n
    }

    /**
     *
     */
    get dd() {
        return new DD(this.dw, this.loadPoint)
    }

    /**
     *
     */
    get fd() {
        return new FD(this.dw, this.loadPoint)
    }

    /**
     *
     */
    get finished() {
        return this.#finished
    }

    /**
     *
     */
    get lastEndPoint() {
        return this.#lastEndPoint
    }

    /**
     *
     * @param {number} n
     */
    addJumpTo(n) {
        return this.#addJumpToFile(this.#memoryAddress(n))
    }

    /**
     *
     * @param {number} n
     */
    addJumpToRel(n) {
        return this.#addJumpToFile(this.#relativeAddress(n))
    }

    /**
     *
     * @param {number} n
     */
    addTarget(n) {
        this.#targets.add(this.#memoryAddress(n))
    }

    /**
     *
     * @param {number} n
     */
    addTargetRel(n) {
        this.#targets.add(this.#relativeAddress(n))
    }

    /**
     *
     * @returns {string | null | undefined}
     */
    decode() {
        const startPoint = this.dw.offset
        this.#jumpTo = null
        const n = this.semanticDecode(new BitView(this.dw.uint8()))
        if(n) {
            this.#lastEndPoint = this.dw.offset
            this.#seen.set(startPoint, n)
            if(this.#jumpTo) {
                this.dw.offset = this.#jumpTo
            }
            if(this.#seen.has(this.dw.offset)) {
                for(const t of this.#targets) {
                    if(!this.#seen.has(t)) {
                        console.log(`-- jumping to previously optional offset ${this.addr(t)}`)
                        this.dw.offset = t
                        return n
                    }
                }
                this.#finished = true
            }
        }
        return n
    }

    /**
     * This decodes based on rules
     *
     * @param {BitView} n
     * @returns {string | undefined | null}
     */
    semanticDecode(n) {
        switch(n.pre) {
            case 0b00: { // 0x0-0x3
                const r = addHlIxIy(n, "HL")
                if(r) {
                    return r
                }
                if(n.rest == 0b00_0000) { // 0x00
                    return `NOP`
                } else if((n.a3 & 0b100) == 0b000 && n.b3 == 0b111) {
                    const raOpR = {
                        [0b00]: "RLCA",
                        [0b01]: "RRCA",
                        [0b10]: "RLA",
                        [0b11]: "RRA",
                    }
                    return raOpR[n.a3]
                } else if(n.rest == 0b01_0000) { // 0x10
                    const d = this.dw.int8()
                    this.addTargetRel(+d)
                    return `DJNZ $${this.rel(d + 2)}`
                } else if(n.rest == 0b01_1000) { // 0x18
                    const d = this.dw.int8()
                    this.addJumpToRel(+d)
                    return `JR $${this.rel(d + 2)}`
                } else if((n.a3 & 0b110) == 0b100 && n.b3 == 0b010) {
                    const a = this.dw.uint16()
                    if(n.a2 & 0b1) {
                        return `LD HL, (${this.addr(a)})` // 0x2a
                    } else {
                        return `LD (${this.addr(a)}), HL` // 0x22
                    }
                } else if((n.a3 & 0b100) == 0b100 && n.b3 == 0b111) {
                    // General-purpose AF
                    const opR = {
                        [0b100]: "DAA", // 0x27
                        [0b101]: "CPL", // 0x2F
                        [0b110]: "CCF", // 0x3F
                        [0b111]: "SCF", // 0x37
                    }
                    return opR[n.a3]
                } else if(n.rest == 0b11_0010) { // 0x32
                    const s = this.dw.uint16()
                    return `LD (${this.addr(s)}), A`
                } else if(n.rest == 0b11_0110) { // 0x36
                    const a = this.dw.uint8()
                    return `LD (HL), ${this.u8(a)}`
                } else if(n.rest == 0b11_1010) { // 0x3a
                    const s = this.dw.uint16()
                    return `LD A, (${this.addr(s)})`
                } else if(n.b4 == 0b0001) {
                    const s = this.dw.uint16()
                    return `LD ${rpR[n.a2]}, ${this.u16(s)}`
                } else if((n.a3 & 0b101) == 0b000 && n.b3 == 0b010) {
                    const idr = n.a3 ? "DE" : "BC"
                    return `LD (${idr}), A`
                } else if((n.a3 & 0b101) == 0b001 && n.b3 == 0b010) {
                    const isr = (n.a3 & 0b010) ? "DE" : "BC"
                    return `LD A, (${isr})`
                } else if((n.a3 & 0b100) == 0b100 && n.b3 == 0b000) {
                    const fR = {
                        [0b100]: "NZ",
                        [0b101]: "Z",
                        [0b110]: "NC",
                        [0b111]: "C",
                    }

                    const d = this.dw.int8()
                    this.addTargetRel(+d)
                    return `JR ${fR[n.a3]} $${this.rel(d + 2)}`
                } else if((n.b3 & 0b110) == 0b100) {
                    const op = (n.b3 & 1) ? "DEC" : "INC"
                    const r = this.register(n.a3)
                    return `${op} ${r}`
                } else if((n.b3 & 0b101) == 0b001) {
                    // 16-bit arithmetic
                    const rp = rpR[n.a2]
                    const arithmeticOpR = {
                        [0b1001]: "ADD HL,",
                        [0b0011]: "INC",
                        [0b1011]: "DEC",
                    }
                    if(arithmeticOpR[n.b4]) {
                        return `${arithmeticOpR[n.b4]} ${rp}`
                    }
                } else if(n.a3 != hlIndirect && n.b3 == hlIndirect) {
                    const d = this.register(n.a3)
                    const a = this.dw.uint8()
                    return `LD ${d}, ${this.u8(a)}`
                }
                break
            }
            case 0b01: { // 0x4-0x7
                if(n.a3 != hlIndirect && n.b3 == hlIndirect) {
                    const d = this.register(n.a3)
                    return `LD ${d}, (HL)`
                } else if(n.a3 == hlIndirect && n.b3 != hlIndirect) {
                    const s = this.register(n.b3)
                    return `LD (HL), ${s}`
                } else if(!(n.a3 == hlIndirect && n.b3 == hlIndirect)) {
                    const s = this.register(n.b3)
                    const d = this.register(n.a3)
                    return `LD ${d}, ${s}`
                }
                break
            }
            case 0b10: { // 0x8-0xb
                const op = arOpR[n.a3]
                const r = this.register(n.b3)

                return `${op} ${r}`
            }
            case 0b11: { // 0xc-0xf
                if(n.b4 == 0b0001) { // 0xc1
                    return `POP ${rpR[n.a2]}`
                } else if(n.b4 == 0b0101) {
                    return `PUSH ${rpR[n.a2]}`
                } else if(n.rest == 0b00_0011) { // 0xc3
                    const to = this.dw.uint16()
                    this.addJumpTo(to)
                    return `JP ${this.addr(to)}`
                } else if(n.rest == 0b00_1001) { // 0xc9
                    this.addJumpToRel(-1) // TODO IMPROVE This is a hack to trigger the "seen" response
                    return `RET`
                } else if(n.rest == 0b00_1011) { // 0xcb
                    return this.cb(new BitView(this.dw.uint8()))
                } else if(n.rest == 0b00_1101) { // 0xcd
                    const to = this.dw.uint16()
                    this.addTarget(to)
                    return `CALL ${this.addr(to)}`
                } else if(n.rest == 0b01_0011) { // 0xd3
                    const n = this.dw.uint8()
                    return `OUT (${this.addr(n)}), A`
                } else if(n.rest == 0b01_1101) { // 0xdd
                    return this.dd.try()
                } else if(n.rest == 0b10_1101) { // 0xed
                    const nn = this.dw.uint8()
                    const nnx = new BitView(nn)
                    if(nnx.pre == 0b01 && (nnx.a3 & 0b100) == 0b000) {
                        const toA = nnx.a3 & 0b010
                        const reg = (nnx.a3 & 0b001) ? "R" : "A"
                        if(toA) {
                            return `LD A, ${reg}`
                        } else {
                            return `LD ${reg}, A`
                        }
                    } else if(nnx.pre == 0b10) {
                        if(nnx.rest == 0b11_0000) { // 0xedb0
                            return `LDIR`
                        } else if(nnx.rest == 0b11_1000) { // 0xedb8
                            return `LDDR`
                        }
                    }
                } else if(n.rest == 0b11_0011) { // 0xf3
                    return `DI`
                } else if(n.rest == 0b11_1101) { // 0xfd
                    return this.fd.try()
                }
                const fR = {
                    [0b000]: "NZ",
                    [0b001]: "Z",
                    [0b010]: "NC",
                    [0b011]: "C",
                    [0b100]: "NP",
                    [0b101]: "P",
                    [0b110]: "NS",
                    [0b111]: "S",
                }
                const jcrR = {
                    [0b000]: "RET",
                    [0b010]: "JP",
                    [0b100]: "CALL",
                }

                if(jcrR[n.b3]) {
                    if(jcrR[n.b3] == "RET") {
                        return `${jcrR[n.b3]} ${fR[n.a3]}`
                    } else {
                        const a = this.dw.uint16()
                        this.addTarget(a)
                        return `${jcrR[n.b3]} ${fR[n.a3]} ${this.addr(a)}`
                    }
                } else if(n.b3 == hlIndirect) {
                    // 8-bit arithmetic & logic
                    const op = arOpR[n.a3]
                    const a = this.dw.uint8()
                    return `${op} ${this.u8(a)}`
                }
                break
            }
        }

        return null
    }
}

module.exports = DecompileWalker