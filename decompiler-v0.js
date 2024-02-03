//@ts-check
const fs = require("fs")
const [filename] = process.argv.slice(2)

const bitR = {
    [0b01]: "BIT",
    [0b10]: "RES",
    [0b11]: "SET",
}

const rpR = {
    [0b00]: "BC",
    [0b01]: "DE",
    [0b10]: "HL",
    [0b11]: "SP",
}

const loadPoint = 0x5e27 // From previous file

class DataWalker {
    #dv
    offset = 0
    /**
     *
     * @param {Buffer} contents
     */
    constructor(contents) {
        this.#dv = new DataView(contents.buffer, 0, contents.byteLength)
    }
    /**
     *
     * @returns
     */
    int8() {
        return this.#dv.getInt8(this.offset++)
    }
    /**
     *
     * @returns
     */
    inspect() {
        return this.#dv.getUint32(this.offset).toString(16).padStart(8, "0")
    }
    /**
     *
     * @returns
     */
    peekUint8() {
        return this.#dv.getUint8(this.offset)
    }
    /**
     *
     * @returns
     */
    uint16() {
        return this.#dv.getUint16(this.offset++, true)
    }
    /**
     *
     * @returns
     */
    uint8() {
        return this.#dv.getUint8(this.offset++)
    }
}

const opR = {
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
 * @abstract
 */
class FDDD {
    #dw

    /**
     * @abstract
     * @protected
     * @type {string}
     */
    offsetRegister

    /**
     *
     * @param {DataWalker} dw
     */
    constructor(dw) {
        this.#dw = dw
    }
    /**
     *
     * @returns {string | undefined | null}
     */
    try() {
        const nnx = new BitView(this.#dw.uint8())

        switch(nnx.pre) {
            case 0b00: {
                if(nnx.a3 == hlIndirect && nnx.b3 == hlIndirect) {
                    const d = this.#dw.int8()
                    const n = this.#dw.uint8()
                    return `LD (${this.offsetRegister}+${d.toString(16)}), ${n.toString(16)}`
                } else if((nnx.b3 & 0b110) == 0b100) {
                    const op = (nnx.b3 & 1) ? "DEC" : "INC"
                    const d = this.#dw.int8()
                    return `${op} (${this.offsetRegister}+${d.toString(16)})`
                }
                break
            }
            case 0b01: {
                if(nnx.a3 == hlIndirect && nnx.b3 != hlIndirect) {
                    const r = nnx.b3
                    const d = this.#dw.int8()
                    return `LD (${this.offsetRegister}+${d}), ${r}`
                } else if(nnx.a3 != hlIndirect && nnx.b3 == hlIndirect) {
                    const r = nnx.b3
                    const d = this.#dw.int8()
                    return `LD ${r}, (${this.offsetRegister}+${d})`
                }
                break
            }
            case 0b10: {
                if(nnx.b3 == hlIndirect) {
                    const op = opR[nnx.a3]
                    const d = this.#dw.int8()

                    return `${op} (${this.offsetRegister}+${d.toString(16)})`
                }
                break
            }
            case 0b11: {
                if(nnx.rest == 0b00_1011) { // 0xcb
                    // Bit manipulation
                    const a = this.#dw.uint8()
                    const e = new BitView(this.#dw.uint8())
                    if(e.pre != 0b00 && e.b3 == hlIndirect) {
                        return `${bitR[e.pre]} ${e.a3} (${this.offsetRegister} + ${a.toString(16)})`
                    } else if(e.pre == 0b00 && e.a3 != 0b110) {
                        // Rotate / shift
                        return `${rsR[e.a3]} (${this.offsetRegister} + ${a.toString(16)})`
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
class DecompileWalker {
    #dw

    /**
     *
     */
    #finished = false

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
     * @param {DataWalker} dw
     */
    constructor(dw) {
        this.#dw = dw
    }

    /**
     *
     * @param {number} n
     */
    addTarget(n) {
        if(!this.#seen.has(n)) {
            this.#targets.add(n)
        }
    }

    /**
     *
     * @returns {string | null | undefined}
     */
    decode() {
        const startPoint = this.#dw.offset
        const n = this.semanticDecode(new BitView(this.#dw.uint8()))
        if(n) {
            this.#seen.set(startPoint, n)
            if(this.#seen.has(this.#dw.offset)) {
                for(const t of this.#targets) {
                    if(!this.#seen.has(t)) {
                        console.log(`-- jumping to previously seen offset ${t.toString(16)}`)
                        this.#dw.offset = t
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
            case 0b00: {
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
                } else if(n.rest == 0b01_1000) { // 0x18
                    const d = this.#dw.int8()
                    this.#dw.offset += d - 2
                    return `JR ${d}`
                } else if(n.rest == 0b11_0010) { // 0x32
                    const s = this.#dw.uint16()
                    return `LD (${s.toString(16)}), A`
                } else if(n.rest == 0b11_0110) { // 0x36
                    const a = this.#dw.uint8()
                    return `LD (HL), ${a.toString(16)}`
                } else if(n.rest == 0b11_1010) { // 0x3a
                    const s = this.#dw.uint16()
                    return `LD A, (${s.toString(16)})`
                } else if(n.b4 == 0b0001) {
                    const s = this.#dw.uint16()
                    return `LD ${rpR[n.a2]}, ${s.toString(16)}`
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

                    const a = this.#dw.int8()
                    this.addTarget(this.#dw.offset - 2 + a)
                    return `JR ${fR[n.a3]} ${a}`
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
                    const a = this.#dw.uint8()
                    return `LD ${d}, ${a.toString(16)}`
                }
                break
            }
            case 0b01: {
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
            case 0b10: {
                const op = opR[n.a3]
                const r = register(n.b3)

                return `${op} ${r}`
            }
            case 0b11: {
                if(n.b4 == 0b0001) { // 0xc1
                    return `POP ${rpR[n.a2]}`
                } else if(n.b4 == 0b0101) {
                    return `PUSH ${rpR[n.a2]}`
                } else if(n.rest == 0b00_0011) { // 0xc3
                    const to = this.#dw.uint16()
                    this.#dw.offset = to - loadPoint
                    return `JP ${to.toString(16)}`
                } else if(n.rest == 0b00_1011) { // 0xcb
                    // Bit manipulation
                    const e = new BitView(this.#dw.uint8())
                    const r = register(e.b3)
                    if(e.pre != 0b00 && e.b3 == hlIndirect) {
                        return `${bitR[e.pre]} ${e.a3} ${r}`
                    }

                    // Rotate / shift
                    if(e.pre == 0b00 && e.a3 != 0b110) {
                        return `${rsR[e.a3]} ${r}`
                    }
                } else if(n.rest == 0b00_1101) { // 0xcd
                    const to = this.#dw.uint16()
                    this.addTarget(to - loadPoint)
                    return `CALL ${to.toString(16)}`
                } else if(n.rest == 0b01_0011) { // 0xd3
                    const n = this.#dw.uint8()
                    return `OUT (${n.toString(16)}), A`
                } else if(n.rest == 0b01_1101) { // 0xdd
                    return new DD(this.#dw).try()
                } else if(n.rest == 0b10_1101) { // 0xed
                    const nn = this.#dw.uint8()
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
                    return new FD(this.#dw).try()
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
                        const a = this.#dw.uint16()
                        this.addTarget(a - loadPoint)
                        return `${jcrR[n.b3]} ${fR[n.a3]} ${a.toString(16)}`
                    }
                } else if(n.b3 == hlIndirect) {
                    // 8-bit arithmetic & logic
                    const op = opR[n.a3]
                    const a = this.#dw.uint8()
                    return `${op} ${a.toString(16)}`
                }
                break
            }
        }

        return null
    }
}

/**
 *
 * @param {string} filename
 */
function decode(filename) {

    const contents = fs.readFileSync(filename)

    const dw = new DataWalker(contents)
    dw.offset = 1
    const decompile = new DecompileWalker(dw)

    for(let i = 0; i < 1_000; i++) {
        const startPoint = dw.offset
        const n = decompile.decode()
        if(!n) {
            dw.offset = startPoint
            throw new Error(`Cannot decode value: ${dw.inspect()} after ${i} points mapped`)
        }
        console.log(`${startPoint.toString(16).padStart(4, "0")}: ${n}`)
        if(decompile.finished) {
            console.log(`Stop after ${i} with next offset at ${(dw.offset + loadPoint).toString(16)} (${dw.offset.toString(16)})`)
            break
        }
    }
}

decode(filename)

// See DECOMPILER.md