import { AnyExpression } from "../Value/index.mjs"
import { addHlIxIy, arOpR } from "../CodeDecompiler.mjs"
import { Utilities } from "../Utilities.mjs"
import { Z80Registers16b, Z80Registers8b } from "../Z80Registers.mjs"
import { hlR, rpR } from "../rpR.mjs"
import { AdHocParsingInstructionHandler } from "./AdHocParsingInstructionHandler.mjs"
import { CBInstructionHandler } from "./CBInstructionHandler.mjs"
import { CallInstructionHandler } from "./CallInstructionHandler.mjs"
import { CopyRegisterInstructionHandler } from "./CopyRegisterInstructionHandler.mjs"
import { DDInstructionHandler } from "./DDInstructionHandler.mjs"
import { EDInstructionHandler } from "./EDInstructionHandler.mjs"
import { FDInstructionHandler } from "./FDInstructionHandler.mjs"
import { PopRegisterInstructionHandler } from "./PopRegisterInstructionHandler.mjs"
import { IncompleteInstructionHandler } from "./IncompleteInstructionHandler.mjs"
import { IndirectLoadInstructionHandler } from "./IndirectLoadInstructionHandler.mjs"
import { LoadHLInstructionHandler } from "./LoadHLInstructionHandler.mjs"
import { LoadInstructionHandler } from "./LoadInstructionHandler.mjs"
import { RelCondJumpInstructionHandler } from "./RelCondJumpInstructionHandler.mjs"
import { RelUncondJumpInstructionHandler } from "./RelUncondJumpInstructionHandler.mjs"
import { SaveInstructionHandler } from "./SaveInstructionHandler.mjs"
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
            [0x00]: new AdHocParsingInstructionHandler("NOP", () => {
                // Literally no operation
            }),
            [0x02]: new AdHocParsingInstructionHandler("LD (BC), A", (context) => {
                context.s8.storeIndirectMemoryValue(Z80Registers16b.BC, context.s8.getRegisterValue(Z80Registers8b.A))
            }),
            [0x07]: new AdHocParsingInstructionHandler("RLCA", (context) => {
                const v = context.s8.getRegisterValue(Z80Registers8b.A)

                if(Utilities.isNumber(v)) {
                    const vm = v << 1
                    context.s8.storeRegisterValue(Z80Registers8b.A, vm + ((vm & 0x100) ? 1 : 0))
                } else {
                    // Can't really express this currently
                    context.s8.storeRegisterValue(Z80Registers8b.A, null)
                }
            }),
            [0x08]: new AdHocParsingInstructionHandler("EX AF, AF'", (context) => {
                const a = context.s16.getRegisterValue(Z80Registers16b.AF)
                const b = context.s16.getRegisterValue(Z80Registers16b.AFa)
                context.s16.storeRegisterValue(Z80Registers16b.AFa, a)
                context.s16.storeRegisterValue(Z80Registers16b.AF, b)
            }),
            [0x0a]: new IndirectLoadInstructionHandler(Z80Registers8b.A, Z80Registers16b.BC),
            [0x0f]: new AdHocParsingInstructionHandler("RRCA", (context) => {
                const v = context.s8.getRegisterValue(Z80Registers8b.A)

                if(Utilities.isNumber(v)) {
                    const vm = v >> 1
                    context.s8.storeRegisterValue(Z80Registers8b.A, vm + ((v & 0x1) ? 0x80 : 0))
                } else {
                    // Can't really express this currently
                    context.s8.storeRegisterValue(Z80Registers8b.A, null)
                }
            }),
            [0x10]: new AdHocParsingInstructionHandler("DJNZ e", (context, di) => {
                // True after this finishes
                context.addTargetRel(+di.arguments[0])
                context.s8.storeRegisterValue(Z80Registers8b.A, 0)
            }),
            [0x12]: new AdHocParsingInstructionHandler("LD (DE), A", (context) => {
                context.s8.storeIndirectMemoryValue(Z80Registers16b.DE, context.s8.getRegisterValue(Z80Registers8b.A))
            }),
            [0x17]: new AdHocParsingInstructionHandler("RLA", (context) => {
                // @todo
                context.s8.storeRegisterValue(Z80Registers8b.A, null)
            }),
            [0x18]: new RelUncondJumpInstructionHandler("JR e"),
            [0x1a]: new IndirectLoadInstructionHandler(Z80Registers8b.A, Z80Registers16b.DE),
            [0x1f]: new AdHocParsingInstructionHandler("RRA", (context) => {
                // @todo
                context.s8.storeRegisterValue(Z80Registers8b.A, null)
            }),
            [0x20]: new RelCondJumpInstructionHandler("JR NZ, e"),
            [0x21]: new UpdateRegisterInstructionHandler("LD HL, nn", Z80Registers16b.HL),
            [0x22]: new SaveInstructionHandler("LD (nn), HL", Z80Registers16b.HL),
            [0x28]: new RelCondJumpInstructionHandler("JR Z, e"),
            [0x2a]: new LoadHLInstructionHandler("LD HL, (nn)"),
            [0x30]: new RelCondJumpInstructionHandler("JR NC, e"),
            [0x31]: new UpdateRegisterInstructionHandler("LD SP, nn", Z80Registers16b.SP),
            [0x32]: new SaveInstructionHandler("LD (nn), A", Z80Registers8b.A),
            [0x36]: new AdHocParsingInstructionHandler("LD (HL), n", (context, di) => {
                context.s8.storeIndirectMemoryValue(Z80Registers16b.HL, +di.arguments[0])
            }),
            [0x37]: new AdHocParsingInstructionHandler("SCF", () => {
                // @todo
            }),
            [0x38]: new RelCondJumpInstructionHandler("JR C, e"),
            [0x3a]: new LoadInstructionHandler("LD A, (nn)", Z80Registers8b.A),
            [0x3f]: new AdHocParsingInstructionHandler("CCF", () => {
                // @todo
            }),
            [0xc3]: new UncondJumpInstructionHandler("JP a"),
            [0xc9]: new AdHocParsingInstructionHandler("RET", (context) => {
                context.unknownJump = true
            }),
            [0xcb]: new CBInstructionHandler(),
            [0xcd]: new CallInstructionHandler("CALL a"),
            [0xd3]: new AdHocParsingInstructionHandler("OUT (n), A", () => {
                // No-op currently
            }),
            [0xdb]: new AdHocParsingInstructionHandler("IN A, (n)", (context) => {
                // Not known
                context.s8.storeRegisterValue(Z80Registers8b.A, null)
            }),
            [0xdd]: new DDInstructionHandler(),
            [0xe1]: new PopRegisterInstructionHandler("POP HL", Z80Registers16b.HL),
            [0xe3]: new AdHocParsingInstructionHandler("EX (SP), HL", (context) => {
                const a = context.s16.getIndirectMemoryValue(Z80Registers16b.SP)
                const b = context.s16.getRegisterValue(Z80Registers16b.HL)
                context.s16.storeRegisterValue(Z80Registers16b.HL, a)
                context.s16.storeIndirectMemoryValue(Z80Registers16b.SP, b)
            }),
            [0xe9]: new AdHocParsingInstructionHandler("JP (HL)", (context) => {
                context.addJumpToHL()
            }),
            [0xeb]: new AdHocParsingInstructionHandler("EX DE, HL", (context) => {
                const a = context.s16.getRegisterValue(Z80Registers16b.DE)
                const b = context.s16.getRegisterValue(Z80Registers16b.HL)
                context.s16.storeRegisterValue(Z80Registers16b.HL, a)
                context.s16.storeRegisterValue(Z80Registers16b.DE, b)
            }),
            [0xed]: new EDInstructionHandler(),
            [0xf3]: new AdHocParsingInstructionHandler("DI", () => {
                // No-op
            }),
            [0xf9]: new CopyRegisterInstructionHandler(Z80Registers16b.SP, Z80Registers16b.HL),
            [0xfb]: new AdHocParsingInstructionHandler("EI", () => {
                // No-op
            }),
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
                        return new AdHocParsingInstructionHandler(`${op} ${r}`, (context) => {
                            context.s8.updateIndirectMemoryValue(Z80Registers16b.HL,
                                v => (op === "INC") ? AnyExpression.add16(v, 1) : AnyExpression.subtract(v, 1))
                        })
                    } else {
                        return new AdHocParsingInstructionHandler(`${op} ${r}`, (context) => {
                            const v = context.s8.getRegisterValue(r)
                            const vm = (op === "INC") ? AnyExpression.add8(v, 1) : AnyExpression.subtract(v, 1)
                            context.s8.storeRegisterValue(r, vm)
                        })
                    }
                } else if(n.b3 == 0b011) {
                    // 16-bit arithmetic
                    const rp = rpR[n.a2]
                    switch(n.b4) {
                        case 0b0011: { // INC
                            return new AdHocParsingInstructionHandler(`INC ${rp}`, (context) => {
                                const v = context.s16.getRegisterValue(rp)
                                context.s16.storeRegisterValue(rp, AnyExpression.add16(v, 1))
                            })
                        }
                        case 0b1011: { // DEC
                            return new AdHocParsingInstructionHandler(`DEC ${rp}`, (context) => {
                                const v = context.s16.getRegisterValue(rp)
                                context.s16.storeRegisterValue(rp, AnyExpression.subtract(v, 1))
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
                    return new IndirectLoadInstructionHandler(register, Z80Registers16b.HL)
                } else if((register = this.sourceRegister(n))) {
                    const r = register
                    return new AdHocParsingInstructionHandler(`LD (HL), ${r}`, (context) => {
                        context.s8.storeIndirectMemoryValue(Z80Registers16b.HL, context.s8.getRegisterValue(r))
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
                    return new AdHocParsingInstructionHandler(`${op.name} ${r}`, (context) => {
                        context.s8.updateRegisterValue(Z80Registers8b.A, op, context.s8.getValue(r))
                    })
                } else {
                    return new AdHocParsingInstructionHandler(`${op.name} ${r}`, (context) => {
                        context.s8.updateRegisterValueFromRegister(Z80Registers8b.A, op, r)
                    })
                }
            }
            case 0b11: { // 0xc-0xf
                if(n.b4 == 0b0001 && n.a2 != hlR) { // 0xc1, d1, [e1], f1
                    return new PopRegisterInstructionHandler(`POP ${rpR[n.a2]}`, rpR[n.a2])
                } else if(n.b4 == 0b0101) {
                    return new AdHocParsingInstructionHandler(`PUSH ${rpR[n.a2]}`, (context) => {
                        context.state.pushRegisterValue(rpR[n.a2])
                    })
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
                        return new AdHocParsingInstructionHandler(`RET ${fR[n.a3]}`, () => {
                            // No deterministic action to take here.
                        })
                    }
                    case 0b010: {
                        return new AdHocParsingInstructionHandler(`JP ${fR[n.a3]} a`, (context, di) => {
                            context.addTarget(di.arguments[0])
                        })
                    }
                    case 0b100: {
                        return new AdHocParsingInstructionHandler(`CALL ${fR[n.a3]} a`, (context, di) => {
                            context.addTarget(di.arguments[0], "fn")
                        })
                    }
                    case 0b110: {
                        // 8-bit arithmetic & logic
                        const op = arOpR[n.a3]
                        return new AdHocParsingInstructionHandler(`${op.name} n`, (context, di) => {
                            context.s8.updateRegisterValue(Z80Registers8b.A, op, +di.arguments[0])
                        })
                    }
                }
                break
            }
        }

        return null
    }
}