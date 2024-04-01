import { addHlIxIy, arOpR } from "../CodeDecompiler.mjs"
import { Utilities } from "../Utilities.mjs"
import { Z80Registers16b, Z80Registers8b } from "../Z80Registers.mjs"
import { hlR, rpR } from "../rpR.mjs"
import { CBInstructionHandler } from "./CBInstructionHandler.mjs"
import { CallInstructionHandler } from "./CallInstructionHandler.mjs"
import { CopyRegisterInstructionHandler } from "./CopyRegisterInstructionHandler.mjs"
import { DDInstructionHandler } from "./DDInstructionHandler.mjs"
import { EDInstructionHandler } from "./EDInstructionHandler.mjs"
import { FDInstructionHandler } from "./FDInstructionHandler.mjs"
import { ImportRegisterInstructionHandler } from "./ImportRegisterInstructionHandler.mjs"
import { IncompleteInstructionHandler } from "./IncompleteInstructionHandler.mjs"
import { IndirectLoadInstructionHandler } from "./IndirectLoadInstructionHandler.mjs"
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
export class InitialInstructionHandler extends IncompleteInstructionHandler {
    /**
     * These don't require further decoding but may take args
     *
     * @protected
     * @readonly
     * @type {Record<number, import("./InstructionHandler.mjs").InstructionHandler<import("../DecomposedInstruction/DecomposedInstruction.mjs").DecomposedInstruction>>}
     */
    get simpleOpcodes() {
        return {
            [0x00]: new TrivialInstructionHandler("NOP"),
            [0x02]: new TrivialInstructionHandler("LD (BC), A"),
            [0x07]: new TrivialInstructionHandler("RLCA"),
            [0x08]: new TrivialInstructionHandler("EX AF, AF'"),
            [0x0a]: new IndirectLoadInstructionHandler(Z80Registers8b.A, Z80Registers16b.BC),
            [0x0f]: new TrivialInstructionHandler("RRCA"),
            [0x10]: new RelCondJumpInstructionHandler("DJNZ e", (dw, context) => {
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
            [0x36]: new TrivialInstructionHandler("LD (HL), n", (dw, context, di) => {
                const address = context.s16.getRegisterValue(Z80Registers16b.HL)
                if(di && Utilities.isNumber(address)) {
                    context.s8.storeMemoryValue(address, +di.arguments[0])
                }
            }),
            [0x37]: new TrivialInstructionHandler("SCF"),
            [0x38]: new RelCondJumpInstructionHandler("JR C, e"),
            [0x3a]: new LoadInstructionHandler("LD A, (nn)", Z80Registers8b.A),
            [0x3f]: new TrivialInstructionHandler("CCF"),
            [0xc3]: new UncondJumpInstructionHandler("JP a"),
            [0xc9]: new TrivialInstructionHandler("RET", (dw, context) => {
                context.unknownJump = true
            }),
            [0xcb]: new CBInstructionHandler(),
            [0xcd]: new CallInstructionHandler("CALL a"),
            [0xd3]: new TrivialInstructionHandler("OUT (n), A"),
            [0xd9]: new TrivialInstructionHandler("EXX"),
            [0xdb]: new TrivialInstructionHandler("IN A, (n)"),
            [0xdd]: new DDInstructionHandler(),
            [0xe1]: new ImportRegisterInstructionHandler("POP HL", Z80Registers16b.HL),
            [0xe3]: new TrivialInstructionHandler("EX (SP), HL"),
            [0xe9]: new TrivialInstructionHandler("JP (HL)", (dw, context) => {
                context.addJumpToHL()
            }),
            [0xeb]: new TrivialInstructionHandler("EX DE, HL"),
            [0xed]: new EDInstructionHandler(),
            [0xf3]: new TrivialInstructionHandler("DI"),
            [0xf9]: new CopyRegisterInstructionHandler(Z80Registers16b.SP, Z80Registers16b.HL),
            [0xfb]: new TrivialInstructionHandler("EI"),
            [0xfd]: new FDInstructionHandler(),
        }
    }

    /**
     *
     * @protected
     * @param {import("../BitView.mjs").BitView} n
     * @returns {import("./InstructionHandler.mjs").InstructionHandler<import("../DecomposedInstruction/DecomposedInstruction.mjs").DecomposedInstruction> | undefined | null}
     */
    getNext(n) {
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
                    return new UpdateRegisterInstructionHandler(`LD ${register}, nn`, register)
                } else if((n.b3 & 0b110) == 0b100) {
                    const op = (n.b3 & 1) ? "DEC" : "INC"
                    const r = this.regOrIndirect(n.a3)
                    if(r == "(HL)") {
                        return new TrivialInstructionHandler(`${op} ${r}`, (dw, context) => {
                            const address = context.s16.getRegisterValue(Z80Registers16b.HL)
                            if(Utilities.isNumber(address)) {
                                const v = context.s8.getMemoryValue(address)
                                if(Utilities.isNumber(v)) {
                                    context.s8.storeMemoryValue(address, (op === "INC") ? (v + 1) : (v - 1))
                                } else {
                                    context.s8.storeMemoryValue(address, null)
                                }
                            } else {
                                // Address not known - something has changed but we
                                // don't know what
                            }
                        })
                    } else {
                        return new TrivialInstructionHandler(`${op} ${r}`, (dw, context) => {
                            const v = context.s8.getRegisterValue(r)
                            if(Utilities.isNumber(v)) {
                                context.s8.storeRegisterValue(r, (op === "INC") ? (v + 1) : (v - 1))
                            } else {
                                context.s8.storeRegisterValue(r, null)
                            }
                        })
                    }
                } else if(n.b3 == 0b011) {
                    // 16-bit arithmetic
                    const rp = rpR[n.a2]
                    switch(n.b4) {
                        case 0b0011: { // INC
                            return new TrivialInstructionHandler(`INC ${rp}`, (dw, context) => {
                                const v = context.s16.getRegisterValue(rp)
                                if(Utilities.isNumber(v)) {
                                    context.s16.storeRegisterValue(rp, v + 1)
                                } else {
                                    context.s16.storeRegisterValue(rp, null)
                                }
                            })
                        }
                        case 0b1011: { // DEC
                            return new TrivialInstructionHandler(`DEC ${rp}`, (dw, context) => {
                                const v = context.s16.getRegisterValue(rp)
                                if(Utilities.isNumber(v)) {
                                    context.s16.storeRegisterValue(rp, v - 1)
                                } else {
                                    context.s16.storeRegisterValue(rp, null)
                                }
                            })
                        }
                        default: {
                            throw new Error(`Internal error: cannot parse arithmetic op ${n.b4}`)
                        }
                    }
                } else if((register = this.targetRegister(n))) {
                    return new UpdateRegisterInstructionHandler(`LD ${register}, n`, register)
                }
                break
            }
            case 0b01: { // 0x4-0x7
                if((register = this.targetRegister(n))) {
                    return new IndirectLoadInstructionHandler(register, Z80Registers16b.HL, (dw, context) => {
                        const activeHLValue = context.s16.getRegisterValue(Z80Registers16b.HL)
                        if(Utilities.isNumber(activeHLValue) && activeHLValue) {
                            context.addMemoryLocation(activeHLValue)
                        }
                    })
                } else if((register = this.sourceRegister(n))) {
                    return new TrivialInstructionHandler(`LD (HL), ${register}`, (dw, context) => {
                        const activeHLValue = context.s16.getRegisterValue(Z80Registers16b.HL)
                        if(Utilities.isNumber(activeHLValue) && activeHLValue) {
                            context.addMemoryLocation(activeHLValue)
                        }
                    })
                } else {
                    const cr = this.copyRegisters(n)
                    if(cr) {
                        const {d, s} = cr
                        return new CopyRegisterInstructionHandler(d, s)
                    }
                }
                break
            }
            case 0b10: { // 0x8-0xb
                const op = arOpR[n.a3]
                const r = this.regOrIndirect(n.b3)
                if(r == "(HL)") {
                    return new TrivialInstructionHandler(`${op.name} ${r}`, (dw, context) => {
                        context.s8.updateRegisterValue(Z80Registers8b.A, op, context.s8.getValue(r))
                    })
                } else {
                    return new TrivialInstructionHandler(`${op.name} ${r}`, (dw, context) => {
                        context.s8.updateRegisterValueFromRegister(Z80Registers8b.A, op, r)
                    })
                }
            }
            case 0b11: { // 0xc-0xf
                if(n.b4 == 0b0001 && n.a2 != hlR) { // 0xc1, d1, [e1], f1
                    return new ImportRegisterInstructionHandler(`POP ${rpR[n.a2]}`, rpR[n.a2])
                } else if(n.b4 == 0b0101) {
                    return new TrivialInstructionHandler(`PUSH ${rpR[n.a2]}`)
                } else if(n.b3 == 0b111) { // 0x[c-f]f; 0[c-f]7
                    return new TrivialInstructionHandler(`RST ${n.a3 << 3}h`)
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
                        return new TrivialInstructionHandler(`RET ${fR[n.a3]}`)
                    }
                    case 0b010: {
                        return new TrivialInstructionHandler(`JP ${fR[n.a3]} a`, (dw, context, di) => {
                            if(di) {
                                context.addTarget(di.arguments[0])
                            }
                        })
                    }
                    case 0b100: {
                        return new TrivialInstructionHandler(`CALL ${fR[n.a3]} a`, (dw, context, di) => {
                            if(di) {
                                context.addTarget(di.arguments[0], "fn")
                            }
                        })
                    }
                    case 0b110: {
                        // 8-bit arithmetic & logic
                        const op = arOpR[n.a3]
                        return new TrivialInstructionHandler(`${op.name} n`, (dw, context, di) => {
                            if(di) {
                                context.s8.updateRegisterValue(Z80Registers8b.A, op, +di.arguments[0])
                            }
                        })
                    }
                }
                break
            }
        }

        return null
    }
}