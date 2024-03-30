import { BitView } from "../BitView.mjs"
import { addHlIxIy, arOpR } from "../CodeDecompiler.mjs"
import { Z80Registers16b, Z80Registers8b } from "../Z80Registers.mjs"
import { hlR, rpR } from "../rpR.mjs"
import { CB } from "./CB.mjs"
import { CallInstructionHandler } from "./CallInstructionHandler.mjs"
import { CopyRegisterInstructionHandler } from "./CopyRegisterInstructionHandler.mjs"
import { DD } from "./DD.mjs"
import { DecomposedInstruction } from "./DecomposedInstruction.mjs"
import { DecomposedInstructionParsing } from "./DecomposedInstructionParsing.mjs"
import { ED } from "./ED.mjs"
import { FD } from "./FD.mjs"
import { ImportRegisterInstructionHandler } from "./ImportRegisterInstructionHandler.mjs"
import { IndirectLoadInstructionHandler } from "./IndirectLoadInstructionHandler.mjs"
import { InstructionHandler } from "./InstructionHandler.mjs"
import { LoadHLInstructionHandler } from "./LoadHLInstructionHandler.mjs"
import { LoadInstructionHandler } from "./LoadInstructionHandler.mjs"
import { RelCondJumpInstructionHandler } from "./RelCondJumpInstructionHandler.mjs"
import { RelUncondJumpInstructionHandler } from "./RelUncondJumpInstructionHandler.mjs"
import { SaveInstructionHandler } from "./SaveInstructionHandler.mjs"
import { TrivialInstructionHandler } from "./TrivialInstructionHandler.mjs"
import { UncondJumpInstructionHandler } from "./UncondJumpInstructionHandler.mjs"
import { UpdateRegisterInstructionHandler } from "./UpdateRegisterInstructionHandler.mjs"

/**
 *
 */
export class Initial extends InstructionHandler {
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
            [0x0a]: new IndirectLoadInstructionHandler(Z80Registers8b.A, Z80Registers16b.BC),
            [0x0f]: new TrivialInstructionHandler("RRCA"),
            [0x10]: new RelCondJumpInstructionHandler("DJNZ e").withAction((dw, context) => {
                // True after this finishes
                context.s8.storeRegisterValue(Z80Registers8b.A, 0)
            }),
            [0x12]: new TrivialInstructionHandler("LD (DE), A"),
            [0x17]: new TrivialInstructionHandler("RLA"),
            [0x18]: new RelUncondJumpInstructionHandler("JR e"),
            [0x1a]: new IndirectLoadInstructionHandler(Z80Registers8b.A, Z80Registers16b.DE),
            [0x1f]: new TrivialInstructionHandler("RRA"),
            [0x20]: new RelCondJumpInstructionHandler("JR NZ, e"),
            [0x21]: new UpdateRegisterInstructionHandler("LD HL, nn", Z80Registers16b.HL),
            [0x22]: new SaveInstructionHandler("LD (nn), HL", Z80Registers16b.HL),
            [0x27]: new TrivialInstructionHandler("DAA"),
            [0x28]: new RelCondJumpInstructionHandler("JR Z, e"),
            [0x2a]: new LoadHLInstructionHandler("LD HL, (nn)"),
            [0x2f]: new TrivialInstructionHandler("CPL"),
            [0x30]: new RelCondJumpInstructionHandler("JR NC, e"),
            [0x31]: new UpdateRegisterInstructionHandler("LD SP, nn", Z80Registers16b.SP),
            [0x32]: new SaveInstructionHandler("LD (nn), A", Z80Registers8b.A),
            [0x36]: new TrivialInstructionHandler("LD (HL), n"),
            [0x37]: new TrivialInstructionHandler("SCF"),
            [0x38]: new RelCondJumpInstructionHandler("JR C, e"),
            [0x3a]: new LoadInstructionHandler("LD A, (nn)", Z80Registers8b.A),
            [0x3f]: new TrivialInstructionHandler("CCF"),
            [0xc3]: new UncondJumpInstructionHandler("JP a"),
            [0xc9]: new TrivialInstructionHandler("RET").withAction((dw, context) => {
                context.unknownJump = true
            }),
            [0xcb]: new CB(),
            [0xcd]: new CallInstructionHandler("CALL a"),
            [0xd3]: new TrivialInstructionHandler("OUT (n), A"),
            [0xd9]: new TrivialInstructionHandler("EXX"),
            [0xdb]: new TrivialInstructionHandler("IN A, (n)"),
            [0xdd]: new DD(),
            [0xe1]: new ImportRegisterInstructionHandler("POP HL", Z80Registers16b.HL),
            [0xe3]: new TrivialInstructionHandler("EX (SP), HL"),
            [0xe9]: new TrivialInstructionHandler("JP (HL)").withAction((dw, context) => {
                context.addJumpToHL()
            }),
            [0xeb]: new TrivialInstructionHandler("EX DE, HL"),
            [0xed]: new ED(),
            [0xf3]: new TrivialInstructionHandler("DI"),
            [0xf9]: new CopyRegisterInstructionHandler(Z80Registers16b.SP, Z80Registers16b.HL),
            [0xfb]: new TrivialInstructionHandler("EI"),
            [0xfd]: new FD(),
        }
    }

    /**
     * This decodes based on rules
     *
     * @protected
     * @param {import("../DataWalker.mjs").DataWalker} dw
     * @param {import("../DecompileContext.mjs").DecompileContext} context
     * @returns {DecomposedInstruction | undefined | null}
     */
    get(dw, context) {
        const n = new BitView(dw.uint8())
        if(this.simpleOpcodes[n.n]) {
            return this.simpleOpcodes[n.n].resolve(dw, context)
        }

        /**
         * @type {import("../Z80Registers.mjs").Z80Registers8b | null | undefined}
         */
        let register

        switch(n.pre) {
            case 0b00: { // 0x0-0x3
                const r = addHlIxIy(n, Z80Registers16b.HL)
                if(r) {
                    return r
                }

                if(n.b4 == 0b0001) { // 0x01 11 [21] 31
                    const register = rpR[n.a2]
                    return new UpdateRegisterInstructionHandler(`LD ${register}, nn`, register).resolve(dw, context)
                } else if((n.b3 & 0b110) == 0b100) {
                    const op = (n.b3 & 1) ? "DEC" : "INC"
                    const r = this.regOrIndirect(n.a3)
                    return new DecomposedInstruction(`${op} ${r}`)
                } else if(n.b3 == 0b011) {
                    // 16-bit arithmetic
                    const rp = rpR[n.a2]
                    switch(n.b4) {
                        case 0b0011: { // INC
                            const v = context.s16.getRegisterValue(rp)
                            if(v !== null) {
                                context.s16.storeRegisterValue(rp, v + 1)
                            }
                            return new DecomposedInstruction(`INC ${rp}`)
                        }
                        case 0b1011: { // DEC
                            const v = context.s16.getRegisterValue(rp)
                            if(v !== null) {
                                context.s16.storeRegisterValue(rp, v - 1)
                            }
                            return new DecomposedInstruction(`DEC ${rp}`)
                        }
                        default: {
                            throw new Error(`Internal error: cannot parse arithmetic op ${n.b4}`)
                        }
                    }
                } else if((register = this.targetRegister(n))) {
                    return new UpdateRegisterInstructionHandler(`LD ${register}, n`, register).resolve(dw, context)
                }
                break
            }
            case 0b01: { // 0x4-0x7
                if((register = this.targetRegister(n))) {
                    const activeHLValue = context.s16.getRegisterValue(Z80Registers16b.HL)
                    if(activeHLValue) {
                        context.addMemoryLocation(activeHLValue)
                    }
                    return new IndirectLoadInstructionHandler(register, Z80Registers16b.HL).resolve(dw, context)
                } else if((register = this.sourceRegister(n))) {
                    const activeHLValue = context.s16.getRegisterValue(Z80Registers16b.HL)
                    if(activeHLValue) {
                        context.addMemoryLocation(activeHLValue)
                    }
                    return new DecomposedInstruction(`LD (HL), ${register}`)
                } else {
                    const cr = this.copyRegisters(n)
                    if(cr) {
                        const {d, s} = cr
                        return new CopyRegisterInstructionHandler(d, s).resolve(dw, context)
                    }
                }
                break
            }
            case 0b10: { // 0x8-0xb
                const op = arOpR[n.a3]
                const r = this.regOrIndirect(n.b3)
                context.s8.updateRegisterValue(Z80Registers8b.A, op, context.s8.getValue(r))

                return new DecomposedInstruction(`${op.name} ${r}`)
            }
            case 0b11: { // 0xc-0xf
                if(n.b4 == 0b0001 && n.a2 != hlR) { // 0xc1, d1, [e1], f1
                    return new ImportRegisterInstructionHandler(`POP ${rpR[n.a2]}`, rpR[n.a2]).resolve(dw, context)
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

                switch(n.b3) {
                    case 0b000: {
                        return new DecomposedInstruction(`RET ${fR[n.a3]}`)
                    }
                    case 0b010: {
                        const di = new DecomposedInstructionParsing(`JP ${fR[n.a3]} a`, dw, context.startPoint)
                        context.addTarget(di.arguments[0])
                        return di
                    }
                    case 0b100: {
                        const di = new DecomposedInstructionParsing(`CALL ${fR[n.a3]} a`, dw, context.startPoint)
                        context.addTarget(di.arguments[0], "fn")
                        return di
                    }
                    case 0b110: {
                        // 8-bit arithmetic & logic
                        const op = arOpR[n.a3]
                        const di = new DecomposedInstructionParsing(`${op.name} n`, dw, context.startPoint)
                        context.s8.updateRegisterValue(Z80Registers8b.A, op, +di.arguments[0])
                        return di
                    }
                }
                break
            }
        }

        return null
    }
}