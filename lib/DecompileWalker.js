

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
const { CallInstructionHandler } = require("./InstructionHandler/CallInstructionHandler")
const { ED } = require("./InstructionHandler/ED")
const { DecomposedInstruction } = require("./InstructionHandler/DecomposedInstruction")

/**
 * @typedef {"fn" | "j"} jumpType
 */

/**
 *
 */
class DecompileWalker extends CodeDecompiler {
    /**
     *
     */
    #finished = false

    /**
     * @type {Record<number, {rel: number[], direct: number[], type: jumpType}}
     */
    #jumps = {}

    /**
     * @type {number | null}
     */
    #jumpTo = null

    /**
     *
     */
    #lastEndPoint = 0

    /**
     * @type {Map<number, [DecomposedInstruction | undefined, number]>}
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
     * Set to true during instruction parsing if it jumps to an unknown location
     */
    #unknownJump = false

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
            [0xc3]: new UncondJumpInstructionHandler(`JP a`, this),
            [0xc9]: new CustomInstructionHandler("RET", () => {
                this.#unknownJump = true
                return `RET`
            }),
            [0xcb]: new CB(),
            [0xcd]: new CallInstructionHandler("CALL a", this),
            [0xd3]: new Uint8InstructionHandler("OUT (n), A"),
            [0xd9]: new TrivialInstructionHandler("EXX"),
            [0xdb]: new Uint8InstructionHandler("IN A, (n)"),
            [0xdd]: new DD(),
            [0xe3]: new TrivialInstructionHandler("EX (SP), HL"),
            [0xe9]: new CustomInstructionHandler("JP (HL)", () => {
                this.#unknownJump = true
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
        this.#jumpTo = this.addTarget(n)
    }

    /**
     *
     * @param {number} n
     */
    addJumpToRel(n) {
        this.#jumpTo = this.addTargetRel(n)
    }

    /**
     *
     * @param {number} n
     * @param {jumpType} [type]
     */
    addTarget(n, type = "j") {
        if(!this.#jumps[n]) {
            this.#jumps[n] = {rel: [], direct: [], type}
        }
        this.#jumps[n].direct.push(this.#startPoint + this.loadPoint)

        const fn = this.#memoryAddress(n)
        this.#addTargetFile(fn)
        return fn
    }

    /**
     *
     * @param {number} n
     */
    addTargetRel(n) {
        const address = this.#relativeAddress(n) + this.loadPoint
        if(!this.#jumps[address]) {
            this.#jumps[address] = {rel: [], direct: [], type: "j"}
        }
        this.#jumps[address].rel.push(this.#startPoint + this.loadPoint)

        const fn = this.#relativeAddress(n)
        this.#addTargetFile(fn)
        return fn
    }

    /**
     *
     * @returns {DecomposedInstruction | null | undefined}
     */
    decode() {
        this.#startPoint = this.dw.offset
        this.#jumpTo = null
        this.#unknownJump = false
        let n
        try {
            n = this.semanticDecode(new BitView(this.dw.uint8()))
        } catch(e) {
            if(!(e instanceof RangeError)) {
                console.log(e)
            }
            this.#seen.set(this.#startPoint, [undefined, this.dw.offset - this.#startPoint])
            for(const t of this.#targets) {
                if(!this.#seen.has(t) && t >= 0 && t < this.dw.length) {
                    this.dw.offset = t
                    return this.decode()
                }
            }
            this.#finished = true
        }
        if(n) {
            this.#lastEndPoint = this.dw.offset
            this.#seen.set(this.#startPoint, [n, this.#lastEndPoint - this.#startPoint])
            if(this.#jumpTo) {
                this.dw.offset = this.#jumpTo
            }
            if(this.#unknownJump || this.#seen.has(this.dw.offset)) {
                for(const t of this.#targets) {
                    if(!this.#seen.has(t) && t >= 0 && t < this.dw.length) {
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
        const functions = Object.entries(this.#jumps).filter(([n, j]) => j.type == "fn").sort(([na], [nb]) => +na - +nb)
        const jumps = Object.entries(this.#jumps).filter(([n, j]) => j.type == "j").sort(([na], [nb]) => +na - +nb)
        const relJumps = jumps.filter(([n, j]) => j.direct.length == 0)
        const directJumps = jumps.filter(([n, j]) => j.direct.length > 0)

        const directJumpsInRange = directJumps.filter(([n]) => +n > this.loadPoint && +n <= this.dw.length + this.loadPoint)
        const functionsInRange = functions.filter(([n]) => +n > this.loadPoint && +n <= this.dw.length + this.loadPoint)
        const relJumpsInRange = relJumps.filter(([n]) => +n > this.loadPoint && +n <= this.dw.length + this.loadPoint)

        const dl = (directJumpsInRange.length - 1).toString().length
        const fl = (functionsInRange.length - 1).toString().length
        const rl = (relJumpsInRange.length - 1).toString().length
        const labels = Object.fromEntries([
            ...functionsInRange.map(([n], i) => [n, `fn${i.toString().padStart(fl, "0")}`]),
            ...directJumpsInRange.map(([n], i) => [n, `jp${i.toString().padStart(dl, "0")}`]),
            ...relJumpsInRange.map(([n], i) => [n, `re${i.toString().padStart(rl, "0")}`]),
        ])

        const startPoints = [...this.#seen.entries()].filter(([k, [di]]) => !!di).map(([k]) => k).sort((a, b) => a - b)
        yield `        ORG ${this.addr(startPoints[0] + this.loadPoint)}`
        let offset = 0
        for(const startPoint of startPoints) {
            if(startPoint < 0 || startPoint >= this.dw.length) {
                continue
            }
            if(startPoint > offset + 1) {
                yield `        ; (${startPoint-offset} bytes...)`
                yield `        ORG ${this.addr(startPoint + this.loadPoint)}`
                offset = startPoint
            }
            const [n, l] = this.#seen.get(startPoint)
            const bytes = this.u8r(...this.dw.inspectAt(startPoint, l))
            if(labels[startPoint + this.loadPoint]) {
                yield `${labels[startPoint + this.loadPoint].padEnd(7, " ")} ${n.toString(labels)}`.padEnd(40, " ") + `; ${bytes}`
            } else {
                yield `        ${n.toString(labels)}`.padEnd(40, " ") + `; ${bytes}`
            }

            offset = startPoint + l
        }
    }

    /**
     * This decodes based on rules
     *
     * @param {BitView} n
     * @returns {DecomposedInstruction | undefined | null}
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
                    return new DecomposedInstruction(`LD ${rpR[n.a2]}, nn`, s)
                } else if((n.b3 & 0b110) == 0b100) {
                    const op = (n.b3 & 1) ? "DEC" : "INC"
                    const r = this.reg(n.a3)
                    return new DecomposedInstruction(`${op} ${r}`)
                } else if((n.b3 & 0b101) == 0b001) {
                    // 16-bit arithmetic
                    const rp = rpR[n.a2]
                    const arithmeticOpR = {
                        [0b1001]: "ADD HL,",
                        [0b0011]: "INC",
                        [0b1011]: "DEC",
                    }
                    if(arithmeticOpR[n.b4]) {
                        return new DecomposedInstruction(`${arithmeticOpR[n.b4]} ${rp}`)
                    }
                } else if(n.a3 != hlIndirect && n.b3 == hlIndirect) {
                    const d = this.reg(n.a3)
                    return new DecomposedInstruction(`LD ${d}, n`, this.dw.uint8())
                }
                break
            }
            case 0b01: { // 0x4-0x7
                if(n.a3 != hlIndirect && n.b3 == hlIndirect) {
                    const d = this.reg(n.a3)
                    return new DecomposedInstruction(`LD ${d}, (HL)`)
                } else if(n.a3 == hlIndirect && n.b3 != hlIndirect) {
                    const s = this.reg(n.b3)
                    return new DecomposedInstruction(`LD (HL), ${s}`)
                } else if(!(n.a3 == hlIndirect && n.b3 == hlIndirect)) {
                    const s = this.reg(n.b3)
                    const d = this.reg(n.a3)
                    return new DecomposedInstruction(`LD ${d}, ${s}`)
                }
                break
            }
            case 0b10: { // 0x8-0xb
                const op = arOpR[n.a3]
                const r = this.reg(n.b3)

                return new DecomposedInstruction(`${op} ${r}`)
            }
            case 0b11: { // 0xc-0xf
                if(n.b4 == 0b0001) { // 0xc1
                    return new DecomposedInstruction(`POP ${rpR[n.a2]}`)
                } else if(n.b4 == 0b0101) {
                    return new DecomposedInstruction(`PUSH ${rpR[n.a2]}`)
                } else if(n.b3 == 0b111) { // 0x[c-f]f; 0[c-f]7
                    return new DecomposedInstruction(`RST ${n.a3 << 3}h`)
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

                if(n.b3 == 0b000) {
                    return new DecomposedInstruction(`RET ${fR[n.a3]}`)
                } else if(n.b3 == 0b010) {
                    const a = this.dw.uint16()
                    this.addTarget(a)
                    return new DecomposedInstruction(`JP ${fR[n.a3]} a`, a)
                } else if(n.b3 == 0b100) {
                    const a = this.dw.uint16()
                    this.addTarget(a, "fn")
                    return new DecomposedInstruction(`CALL ${fR[n.a3]} a`, a)
                } else if(n.b3 == hlIndirect) {
                    // 8-bit arithmetic & logic
                    const op = arOpR[n.a3]
                    return new DecomposedInstruction(`${op} n`, this.dw.uint8())
                }
                break
            }
        }

        return null
    }
}

module.exports = DecompileWalker