

const { BitView } = require("./BitView")
const { DD } = require("./InstructionHandler/DD")
const { CodeDecompiler, addHlIxIy, arOpR } = require("./CodeDecompiler")
const { FD } = require("./InstructionHandler/FD")
const { InstructionHandler } = require("./InstructionHandler/InstructionHandler")
const { TrivialInstructionHandler } = require("./InstructionHandler/TrivialInstructionHandler")
const { rpR } = require("./rpR")
const { hlIndirect } = require("./registerRef")
const { Uint8InstructionHandler } = require("./InstructionHandler/Uint8InstructionHandler")
const { RelUncondJumpInstructionHandler } = require("./InstructionHandler/RelUncondJumpInstructionHandler")
const { CustomInstructionHandler } = require("./InstructionHandler/CustomInstructionHandler")
const { Uint16InstructionHandler } = require("./InstructionHandler/Uint16InstructionHandler")
const { CB } = require("./InstructionHandler/CB")
const { RelCondJumpInstructionHandler } = require("./InstructionHandler/RelCondJumpInstructionHandler")
const { UncondJumpInstructionHandler } = require("./InstructionHandler/UncondJumpInstructionHandler")
const { CondJumpInstructionHandler } = require("./InstructionHandler/CondJumpInstructionHandler")
const { ED } = require("./InstructionHandler/ED")

/**
 *
 */
class DecompileWalker extends CodeDecompiler {
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
     * @type {Map<number, [string, number]>}
     */
    #seen = new Map()

    /**
     *
     */
    #startPoint = 0

    /**
     * @type {Set<number>} This can include targets outside the range
     */
    #targets = new Set()

    /**
     *
     * @param {number} n
     */
    #addJumpToFile(n) {
        if(!this.#targets.has(n)) {
            if(n < 0 || n >= this.dw.length) {
                console.warn(`Jump target ${this.addr(n)} (${this.addr(n + this.loadPoint)}) is out of range, ignoring`)
            }
            this.#targets.add(n)
            this.#jumpTo = this.#startPoint
        } else {
            this.#addTargetFile(n)
            this.#jumpTo = n
        }
    }

    /**
     *
     * @param {number} n
     */
    #addTargetFile(n) {
        if(!this.#targets.has(n)) {
            if(n < 0 || n >= this.dw.length) {
                console.warn(`Jump target ${this.addr(n)} (${this.addr(n + this.loadPoint)}) is out of range`)
            }
            this.#targets.add(n)
        }
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
     * These don't require further decoding but may take args
     *
     * @protected
     * @readonly
     * @type {Record<number, InstructionHandler>}
     */
    get simpleOpcodes() {
        return {
            [0x00]: new TrivialInstructionHandler("NOP"),
            [0x02]: new TrivialInstructionHandler("LD (BC), A"),
            [0x07]: new TrivialInstructionHandler("RLCA"),
            [0x08]: new TrivialInstructionHandler("EX AF, AF'"),
            [0x0a]: new TrivialInstructionHandler("LD A, (BC)"),
            [0x0f]: new TrivialInstructionHandler("RRCA"),
            [0x10]: new RelCondJumpInstructionHandler("DJNZ e", this),
            [0x12]: new TrivialInstructionHandler("LD (DE), A"),
            [0x17]: new TrivialInstructionHandler("RLA"),
            [0x18]: new RelUncondJumpInstructionHandler("JR e", this),
            [0x1a]: new TrivialInstructionHandler("LD A, (DE)"),
            [0x1f]: new TrivialInstructionHandler("RRA"),
            [0x20]: new RelCondJumpInstructionHandler("JR NZ, e", this),
            [0x22]: new Uint16InstructionHandler("LD (nn), HL"),
            [0x27]: new TrivialInstructionHandler("DAA"),
            [0x28]: new RelCondJumpInstructionHandler("JR Z, e", this),
            [0x2a]: new Uint16InstructionHandler("LD HL, (nn)"),
            [0x2f]: new TrivialInstructionHandler("CPL"),
            [0x30]: new RelCondJumpInstructionHandler("JR NC, e", this),
            [0x32]: new Uint16InstructionHandler("LD (nn), A"),
            [0x36]: new Uint8InstructionHandler("LD (HL), n"),
            [0x37]: new TrivialInstructionHandler("SCF"),
            [0x38]: new RelCondJumpInstructionHandler("JR C, e", this),
            [0x3a]: new Uint16InstructionHandler("LD A, (nn)"),
            [0x3f]: new TrivialInstructionHandler("CCF"),
            [0xc3]: new UncondJumpInstructionHandler(`JP nn`, this),
            [0xc9]: new CustomInstructionHandler("RET", () => {
                this.addJumpToRel(-1) // TODO IMPROVE This is a hack to trigger the "seen" response
                return `RET`
            }),
            [0xcb]: new CB(),
            [0xcd]: new CondJumpInstructionHandler("CALL nn", this),
            [0xd3]: new Uint8InstructionHandler("OUT (n), A"),
            [0xd9]: new TrivialInstructionHandler("EXX"),
            [0xdd]: new DD(),
            [0xe3]: new TrivialInstructionHandler("EX (SP), HL"),
            [0xe9]: new CustomInstructionHandler("JP (HL)", () => {
                this.addJumpToRel(-1) // TODO IMPROVE This is a hack to trigger the "seen" response
                return "JP (HL)"
            }),
            [0xeb]: new TrivialInstructionHandler("EX DE, HL"),
            [0xed]: new ED(),
            [0xf3]: new TrivialInstructionHandler("DI"),
            [0xfd]: new FD(),
        }
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
        console.log(`-- jumping from ${this.addr(this.#startPoint)} to ${this.addr(this.#memoryAddress(n))} (${this.addr(n)})`)
        return this.#addJumpToFile(this.#memoryAddress(n))
    }

    /**
     *
     * @param {number} n
     */
    addJumpToRel(n) {
        console.log(`-- jumping from ${this.addr(this.#startPoint)} to ${this.addr(this.#relativeAddress(n))} (${this.rel(n + 2)})`)
        return this.#addJumpToFile(this.#relativeAddress(n))
    }

    /**
     *
     * @param {number} n
     */
    addTarget(n) {
        console.log(`-- noting jump from ${this.addr(this.#startPoint)} to ${this.addr(this.#memoryAddress(n))} (${this.addr(n)})`)
        this.#targets.add(this.#memoryAddress(n))
    }

    /**
     *
     * @param {number} n
     */
    addTargetRel(n) {
        console.log(`-- noting jump from ${this.addr(this.#startPoint)} to ${this.addr(this.#relativeAddress(n))} (${this.rel(n + 2)})`)
        this.#targets.add(this.#relativeAddress(n))
    }

    /**
     *
     * @returns {string | null | undefined}
     */
    decode() {
        this.#startPoint = this.dw.offset
        this.#jumpTo = null
        const n = this.semanticDecode(new BitView(this.dw.uint8()))
        if(n) {
            this.#lastEndPoint = this.dw.offset
            this.#seen.set(this.#startPoint, [n, this.#lastEndPoint - this.#startPoint])
            if(this.#jumpTo) {
                this.dw.offset = this.#jumpTo
            }
            if(this.#seen.has(this.dw.offset)) {
                for(const t of this.#targets) {
                    if(!this.#seen.has(t) && t >= 0 && t < this.dw.length) {
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
     *
     */
    *dump() {
        const startPoints = [...this.#seen.keys()].sort((a, b) => a - b)
        let offset = 0
        for(const startPoint of startPoints) {
            if(startPoint > offset + 1) {
                yield `${this.addr(offset)}: (?)`.padEnd(40, " ") + `## (${startPoint-offset} bytes...)`
                offset = startPoint
            }
            const [n, l] = this.#seen.get(startPoint)
            const bytes = this.u8(...this.dw.inspectAt(startPoint, l))
            yield `${this.addr(startPoint)}: ${n}`.padEnd(40, " ") + `## ${bytes}`
            offset = startPoint + l
        }
    }

    /**
     * This decodes based on rules
     *
     * @param {BitView} n
     * @returns {string | undefined | null}
     */
    semanticDecode(n) {
        if(this.simpleOpcodes[n.n]) {
            return this.simpleOpcodes[n.n].get(this.dw)
        }

        switch(n.pre) {
            case 0b00: { // 0x0-0x3
                const r = addHlIxIy(n, "HL")
                if(r) {
                    return r
                }

                if(n.b4 == 0b0001) {
                    const s = this.dw.uint16()
                    return `LD ${rpR[n.a2]}, ${this.u16(s)}`
                } else if((n.b3 & 0b110) == 0b100) {
                    const op = (n.b3 & 1) ? "DEC" : "INC"
                    const r = this.reg(n.a3)
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
                    const d = this.reg(n.a3)
                    const a = this.dw.uint8()
                    return `LD ${d}, ${this.u8(a)}`
                }
                break
            }
            case 0b01: { // 0x4-0x7
                if(n.a3 != hlIndirect && n.b3 == hlIndirect) {
                    const d = this.reg(n.a3)
                    return `LD ${d}, (HL)`
                } else if(n.a3 == hlIndirect && n.b3 != hlIndirect) {
                    const s = this.reg(n.b3)
                    return `LD (HL), ${s}`
                } else if(!(n.a3 == hlIndirect && n.b3 == hlIndirect)) {
                    const s = this.reg(n.b3)
                    const d = this.reg(n.a3)
                    return `LD ${d}, ${s}`
                }
                break
            }
            case 0b10: { // 0x8-0xb
                const op = arOpR[n.a3]
                const r = this.reg(n.b3)

                return `${op} ${r}`
            }
            case 0b11: { // 0xc-0xf
                if(n.b4 == 0b0001) { // 0xc1
                    return `POP ${rpR[n.a2]}`
                } else if(n.b4 == 0b0101) {
                    return `PUSH ${rpR[n.a2]}`
                } else if(n.b3 == 0b111) { // 0x[c-f]f; 0[c-f]7
                    return `RST ${n.a3 << 3}h`
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