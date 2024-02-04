//@ts-check

const DataWalker = require("./DataWalker")

/**
 *
 */
class Decompiler {
    /**
     * @protected
     * @readonly
     */
    dw

    /**
     * @readonly
     */
    loadPoint

    /**
     *
     * @param {number} l
     * @param {number[]} ns
     * @returns
     */
    #data(l, ...ns) {
        const lo = l * 2 / 8
        return ns.map(n => n.toString(16).padStart(lo, "0")).join(" ")
    }

    /**
     *
     * @param {DataWalker} dw
     * @param {number} loadPoint
     */
    constructor(dw, loadPoint) {
        this.dw = dw
        this.loadPoint = loadPoint
    }

    /**
     * @param {number} n
     * @returns
     */
    addr(n) {
        return this.#data(16, n)
    }

    /**
     *
     * @param {number[]} ns
     * @returns
     */
    u8(...ns) {
        return this.#data(8, ...ns)
    }

    /**
     *
     * @param {number[]} ns
     * @returns
     */
    u16(...ns) {
        return this.#data(16, ...ns)
    }

    /**
     *
     * @param {number} n
     * @returns
     */
    rel(n) {
        if(n >= 0) {
            return `+${n}`
        } else {
            return `${n}`
        }
    }
}

const bitR = {
    [0b01]: "BIT",
    [0b10]: "RES",
    [0b11]: "SET",
}

const hlR = 0b10
const rpR = {
    [0b00]: "BC",
    [0b01]: "DE",
    [hlR]: "HL",
    [0b11]: "SP",
}

const arOpR = {
    [0b000]: "ADD",
    [0b001]: "ADC",
    [0b010]: "SUB",
    [0b011]: "SBC",
    [0b100]: "AND",
    [0b101]: "XOR",
    [0b110]: "OR",
    [0b111]: "CP",
}

/**
 *
 */
const hlIndirect = 0b110

/**
 *
 */
class BitView {
    #n
    /**
     * **nn ****
     */
    get a2() {
        return (this.#n >> 4) & 0b11
    }
    /**
     * **nn n***
     */
    get a3() {
        return (this.#n >> 3) & 0b111
    }
    /**
     * **** *nnn
     */
    get b3() {
        return this.#n & 0b111
    }
    /**
     * **** nnnn
     */
    get b4() {
        return this.#n & 0b1111
    }
    /**
     * nnnn nnnn
     */
    get n() {
        return this.#n
    }
    /**
     * nn** ****
     */
    get pre() {
        return this.#n >> 6
    }
    /**
     * **nn nnnn
     */
    get rest() {
        return this.#n & 0b111111
    }
    /**
     *
     * @param {number} n
     */
    constructor(n) {
        this.#n = n
    }
}

const rsR = {
    [0b000]: "RCL",
    [0b001]: "RRC",
    [0b010]: "RL",
    [0b011]: "RR",
    [0b100]: "SLA",
    [0b101]: "SRA",
    // Note: no 110
    [0b111]: "SRL",
}

/**
 *
 * @param {BitView} nx
 * @param {string} reg
 */
const addHlIxIy = (nx, reg) => {
    if(nx.b4 == 0b1001) {
        const r = nx.a2 == hlR ? reg : rpR[nx.a2]
        return `ADD ${r}`
    }
    return undefined
}

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

        switch(nnx.pre) {
            case 0b00: { // 0x.d 0-3
                const r = addHlIxIy(nnx, this.offsetRegister)
                if(r) {
                    return r
                }
                if(nnx.rest == 0b10_0001) { // 0x.d21
                    const s = this.dw.uint16()
                    return `LD IX, ${this.u16(s)}`
                } else if(nnx.a3 == hlIndirect && (nnx.b3 & 0b110) == 0b100) { // 0x.d34-5
                    const op = (nnx.b3 & 1) ? "DEC" : "INC"
                    const d = this.dw.int8()
                    return `${op} (${this.offsetRegister}${this.rel(d)})`
                } else if(nnx.a3 == hlIndirect && nnx.b3 == hlIndirect) { // 0x.d36
                    const d = this.dw.int8()
                    const n = this.dw.uint8()
                    return `LD (${this.offsetRegister}${this.rel(d)}), ${this.u8(n)}`
                }
                break
            }
            case 0b01: { // 0x.d 4-7
                if(nnx.a3 == hlIndirect && nnx.b3 != hlIndirect) {
                    const r = nnx.b3
                    const d = this.dw.int8()
                    return `LD (${this.offsetRegister}${this.rel(d)}), ${r}`
                } else if(nnx.a3 != hlIndirect && nnx.b3 == hlIndirect) {
                    const r = nnx.b3
                    const d = this.dw.int8()
                    return `LD ${r}, (${this.offsetRegister}${this.rel(d)})`
                }
                break
            }
            case 0b10: { // 0x.d 8-b
                if(nnx.b3 == hlIndirect) {
                    const op = arOpR[nnx.a3]
                    const d = this.dw.int8()

                    return `${op} (${this.offsetRegister}${this.rel(d)}})`
                }
                break
            }
            case 0b11: { // 0x.d c-f
                if(nnx.rest == 0b00_1011) { // 0xcb
                    // Bit manipulation
                    const a = this.dw.uint8()
                    const e = new BitView(this.dw.uint8())
                    if(e.pre != 0b00 && e.b3 == hlIndirect) {
                        return `${bitR[e.pre]} ${e.a3} (${this.offsetRegister}${this.rel(a)}})`
                    } else if(e.pre == 0b00 && e.a3 != 0b110) {
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

/**
 *
 */
class FD extends FDDD {
    offsetRegister = "IY"
}

/**
 *
 */
class DD extends FDDD {
    offsetRegister = "IX"
}

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
        this.addTarget(n)
        this.#jumpTo = n
    }

    /**
     *
     * @param {number} n
     */
    addTarget(n) {
        this.#targets.add(n)
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
        const registerRef = {
            [0b111]: "A",
            [0b000]: "B",
            [0b001]: "C",
            [0b010]: "D",
            [0b011]: "E",
            [0b100]: "F",
            [0b101]: "L",
            [hlIndirect]: "(HL)",
        }

        /**
         *
         * @param {number} n
         * @returns
         */
        const register = (n) => registerRef[n]

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
                    this.addTarget(this.dw.offset + d)
                    return `DJNZ $${this.rel(d + 2)}`
                } else if(n.rest == 0b01_1000) { // 0x18
                    const d = this.dw.int8()
                    this.addJumpTo(this.dw.offset + d)
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
                    this.addTarget(this.dw.offset + d)
                    return `JR ${fR[n.a3]} $${this.rel(d + 2)}`
                } else if((n.b3 & 0b110) == 0b100) {
                    const op = (n.b3 & 1) ? "DEC" : "INC"
                    const r = register(n.a3)
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
                    const d = register(n.a3)
                    const a = this.dw.uint8()
                    return `LD ${d}, ${this.u8(a)}`
                }
                break
            }
            case 0b01: { // 0x4-0x7
                if(n.a3 != hlIndirect && n.b3 == hlIndirect) {
                    const d = register(n.a3)
                    return `LD ${d}, (HL)`
                } else if(n.a3 == hlIndirect && n.b3 != hlIndirect) {
                    const s = register(n.b3)
                    return `LD (HL), ${s}`
                } else if(!(n.a3 == hlIndirect && n.b3 == hlIndirect)) {
                    const s = register(n.b3)
                    const d = register(n.a3)
                    return `LD ${d}, ${s}`
                }
                break
            }
            case 0b10: { // 0x8-0xb
                const op = arOpR[n.a3]
                const r = register(n.b3)

                return `${op} ${r}`
            }
            case 0b11: { // 0xc-0xf
                if(n.b4 == 0b0001) { // 0xc1
                    return `POP ${rpR[n.a2]}`
                } else if(n.b4 == 0b0101) {
                    return `PUSH ${rpR[n.a2]}`
                } else if(n.rest == 0b00_0011) { // 0xc3
                    const to = this.dw.uint16()
                    this.addJumpTo(to - this.loadPoint)
                    return `JP ${this.addr(to)}`
                } else if(n.rest == 0b00_1001) { // 0xc9
                    this.addJumpTo(this.dw.offset - 1) // TODO IMPROVE This is a hack to trigger the "seen" response
                    return `RET`
                } else if(n.rest == 0b00_1011) { // 0xcb
                    // Bit manipulation
                    const e = new BitView(this.dw.uint8())
                    const r = register(e.b3)
                    if(e.pre == 0b00) {
                        // Rotate / shift
                        if(e.a3 != 0b110) {
                            return `${rsR[e.a3]} ${r}`
                        }
                    } else {
                        return `${bitR[e.pre]} ${e.a3}, ${r}`
                    }
                } else if(n.rest == 0b00_1101) { // 0xcd
                    const to = this.dw.uint16()
                    this.addTarget(to - this.loadPoint)
                    return `CALL ${this.addr(to)}`
                } else if(n.rest == 0b01_0011) { // 0xd3
                    const n = this.dw.uint8()
                    return `OUT (${this.addr(n)}), A`
                } else if(n.rest == 0b01_1101) { // 0xdd
                    return new DD(this.dw, this.loadPoint).try()
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
                    return new FD(this.dw, this.loadPoint).try()
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
                        this.addTarget(a - this.loadPoint)
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