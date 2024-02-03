//@ts-check
const fs = require("fs")
const [filename] = process.argv.slice(2)

const bitR = {
    [0b01]: "BIT",
    [0b10]: "RES",
    [0b11]: "SET",
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
class Wn {
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
     *
     * @param {number} n
     */
    constructor(n) {
        this.#n = n
    }
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
        const nn = this.#dw.uint8()

        if(nn == 0x36) {
            const d = this.#dw.int8()
            const n = this.#dw.uint8()
            return `LD (${this.offsetRegister}+${d.toString(16)}), ${n.toString(16)}`
        } else if(nn == 0xcb) {
            // Bit manipulation
            const a = this.#dw.uint8()
            const e = new Wn(this.#dw.uint8())
            if(e.pre != 0b00 && e.b3 == hlIndirect) {
                return `${bitR[e.pre]} ${e.a3} (${this.offsetRegister} + ${a.toString(16)})`
            }
        }

        const nnx = new Wn(nn)

        switch(nnx.pre) {
            case 0b00: {
                if((nnx.b3 & 0b110) == 0b100) {
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
                // Nothing here (yet)
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
     * @type {Set<number> | undefined}
     */
    #extendedCodes

    /**
     *
     * @param {number} next
     * @returns {string | null | undefined}
     */
    #decodeInner(next) {
        const r = this.semanticDecode(next)
        if(r) {
            return r
        }
        if(this.extendedCodes.has(next)) {
            let then = this.#dw.uint8()
            return this.#decodeInner((next << 8) + then)
        }
        // This is based on a flat map
        const c = this.codes[next]
        if(c) {
            return this.handleCode(c)
        }
        return undefined
    }

    /**
     *
     */
    codes = {
        [0x00]: {n: "NOP"},
        [0x01]: {a: "s", n: "LD BC, nn"},
        [0x02]: {n: "LD (BC), A"},
        [0x06]: {a: "c", n: "LD B, n"},
        [0x0a]: {n: "LD A, (BC)"},
        [0x11]: {a: "s", n: "LD DE, nn"},
        [0x12]: {n: "LD (DE), A"},
        [0x16]: {a: "c", n: "LD D, n"},
        [0x1a]: {n: "LD A, (DE)"},
        [0x20]: {a: "d", n: "JR NZ, d"},
        [0x21]: {a: "s", n: "LD HL, nn"},
        [0x31]: {a: "s", n: "LD SP, nn"},
        [0x32]: {a: "s", n: "LD (nn), A"},
        [0x36]: {a: "c", n: "LD (HL), n"},
        [0x3a]: {a: "s", n: "LD A, (nn)"},
        [0x3e]: {a: "c", n: "LD A, n"},
        [0xc1]: {n: "POP BC"},
        [0xc3]: {a: "s", n: "JP nn", o: 1},
        [0xc5]: {n: "PUSH BC"},
        [0xcd]: {a: "s", n: "CALL nn"},
        [0xd3]: {a: "c", n: "OUT (n), A"},
        [0xed47]: {n: "LD I, A"},
        [0xed4f]: {n: "LD R, A"},
        [0xed57]: {n: "LD A, I"},
        [0xed5f]: {n: "LD A, R"},
        [0xedb0]: {n: "LDIR"},
        [0xf3]: {n: "DI"},
        [0xf5]: {n: "PUSH AF"},
    }

    /**
     *
     */
    get extendedCodes() {
        if(!this.#extendedCodes) {
            this.#extendedCodes = new Set()
            for(const code of Object.keys(this.codes)) {
                let c = (+code) >> 8
                // Optimisation note: no compound codes start with 00.
                while(c) {
                    this.#extendedCodes.add(c)
                    c >>= 8
                }
            }
        }
        return this.#extendedCodes
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
     * @returns {string | null | undefined}
     */
    decode() {
        return this.#decodeInner(this.#dw.uint8())
    }

    /**
     *
     * @param {{o: any, n: string, a: any}} c
     * @returns
     */
    handleCode(c) {
        let n
        if(c.a) {
            switch(c.a) {
                case "c": {
                    const a = this.#dw.uint8()
                    n = c.n.replace(/n/, a.toString(16))
                    break
                }
                case "d": {
                    const a = this.#dw.int8()
                    n = c.n.replace(/d/, a.toString(16))
                    break
                }
                case "s": {
                    const a = this.#dw.uint16()
                    if(c.o) {
                        this.#dw.offset = a - loadPoint
                    }
                    n = c.n.replace(/nn/, a.toString(16))
                    break
                }
            }
        } else {
            n = c.n
        }
        return n
    }

    /**
     * This decodes based on rules
     *
     * @param {number} n
     * @returns {string | undefined | null}
     */
    semanticDecode(n) {
        const nx = new Wn(n)

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

        if(n == 0xfd) {
            return new FD(this.#dw).try()
        } else if(n == 0xdd) {
            return new DD(this.#dw).try()
        } else if(n == 0xcb) {
            // Bit manipulation
            const e = new Wn(this.#dw.uint8())
            const r = register(e.b3)
            if(e.pre != 0b00 && e.b3 == hlIndirect) {
                return `${bitR[e.pre]} ${e.a3} ${r}`
            }

            // Rotate / shift
            if(e.pre == 0b00 && e.a3 != 0b110) {
                const rsR = {
                    [0b000]: "RCL",
                    [0b001]: "RRC",
                    [0b010]: "RL",
                    [0b011]: "RR",
                    [0b100]: "SLA",
                    [0b101]: "SRA",
                    // Note: no 110
                    [0b111]: "RCL",
                }
                return `${rsR[e.a3]} ${r}`
            }
        }

        switch(nx.pre) {
            case 0b00: {
                if((nx.a3 & 0b100) == 0b100 && nx.b3 == 0b000) {
                    const fR = {
                        [0b100]: "NZ",
                        [0b101]: "Z",
                        [0b110]: "NC",
                        [0b111]: "C",
                    }

                    const a = this.#dw.int8()
                    return `JR ${fR[nx.a3]} ${a}`
                } else if((nx.b3 & 0b110) == 0b100) {
                    const op = (nx.b3 & 1) ? "DEC" : "INC"
                    const r = register(nx.a3)
                    return `${op} ${r}`
                } else if((nx.b3 & 0b101) == 0b001) {
                    // 16-bit arithmetic
                    const rpR = {
                        [0b00]: "BC",
                        [0b01]: "DE",
                        [0b10]: "HL",
                        [0b11]: "SP",
                    }
                    const rp = rpR[nx.a2]
                    const x = {
                        [0b1001]: "ADD HL,",
                        [0b0011]: "INC",
                        [0b1011]: "DEC",
                    }
                    if(x[nx.b4]) {
                        return `${x[nx.b4]} ${rp}`
                    }
                } else if(nx.a3 != hlIndirect && nx.b3 == hlIndirect) {
                    const d = register(nx.a3)
                    const a = this.#dw.uint8()
                    return `LD ${d}, ${a.toString(16)}`
                }
                break
            }
            case 0b01: {
                if(nx.a3 != hlIndirect && nx.b3 == hlIndirect) {
                    const d = register(nx.a3)
                    return `LD ${d}, (HL)`
                } else if(nx.a3 == hlIndirect && nx.b3 != hlIndirect) {
                    const s = register(nx.b3)
                    return `LD (HL), ${s}`
                } else if(!(nx.a3 == hlIndirect && nx.b3 == hlIndirect)) {
                    const s = register(nx.b3)
                    const d = register(nx.a3)
                    return `LD ${d}, ${s}`
                }
                break
            }
            case 0b10: {
                const op = opR[nx.a3]
                const r = register(nx.b3)

                return `${op} ${r}`
            }
            case 0b11: {
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

                if(jcrR[nx.b3]) {
                    if(jcrR[nx.b3] == "RET") {
                        return `${jcrR[nx.b3]} ${fR[nx.a3]}`
                    } else {
                        const a = this.#dw.uint16()
                        return `${jcrR[nx.b3]} ${fR[nx.a3]} ${a}`
                    }
                } else if(nx.b3 == hlIndirect) {
                    // 8-bit arithmetic & logic
                    const op = opR[nx.a3]
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
            throw new Error(`Cannot decode value: ${dw.inspect()}`)
        }
        console.log(`${startPoint.toString(16).padStart(4, "0")}: ${n}`)
    }
}

decode(filename)

// See DECOMPILER.md