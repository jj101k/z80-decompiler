import { AnyExpression } from "../AnyExpression.mjs"
import { Utilities } from "../Utilities.mjs"
import { Z80Registers16b, Z80Registers8b } from "../Z80Registers.mjs"
import { hlR, rpR } from "../rpR.mjs"
import { AdHocParsingInstructionHandler } from "./AdHocParsingInstructionHandler.mjs"
import { CopyRegisterInstructionHandler } from "./CopyRegisterInstructionHandler.mjs"
import { IncompleteInstructionHandler } from "./IncompleteInstructionHandler.mjs"
import { LoadInstructionHandler } from "./LoadInstructionHandler.mjs"
import { SaveInstructionHandler } from "./SaveInstructionHandler.mjs"

/**
 *
 */
export class EDInstructionHandler extends IncompleteInstructionHandler {
    /**
     * These don't require further decoding but may take args
     *
     * @protected
     * @readonly
     * @type {Record<number, import("./InstructionHandler.mjs").InstructionHandler<import("../DecomposedInstruction/DecomposedInstruction.mjs").DecomposedInstruction>>}
     */
    get simpleOpcodes() {
        return {
            [0x44]: new AdHocParsingInstructionHandler("NEG", (dw, context) => {
                const v = context.s8.getRegisterValue(Z80Registers8b.A)
                context.s8.storeRegisterValue(Z80Registers8b.A, AnyExpression.subtract(0, v))
            }),
            [0x47]: new CopyRegisterInstructionHandler(Z80Registers8b.I, Z80Registers8b.A),
            [0x4f]: new CopyRegisterInstructionHandler(Z80Registers8b.R, Z80Registers8b.A),
            [0x57]: new CopyRegisterInstructionHandler(Z80Registers8b.A, Z80Registers8b.I),
            [0x5f]: new CopyRegisterInstructionHandler(Z80Registers8b.A, Z80Registers8b.R),
            [0xb0]: new AdHocParsingInstructionHandler("LDIR", (dw, context) => {
                // Immediately not so trivial
                let de = context.s16.getRegisterValue(Z80Registers16b.DE)
                let hl = context.s16.getRegisterValue(Z80Registers16b.HL)
                let bc = context.s16.getRegisterValue(Z80Registers16b.BC)
                if(!Utilities.isNumber(bc)) {
                    context.s16.storeRegisterValue(Z80Registers16b.HL, AnyExpression.add16(hl, bc))
                    context.s16.storeRegisterValue(Z80Registers16b.DE, AnyExpression.add16(de, bc))
                } else {
                    bc = bc || 65536
                    if(Utilities.isNumber(hl) && Utilities.isNumber(de)) {
                        for(let i = 0; i < bc; i++) {
                            const v = context.s8.getMemoryValue(hl)
                            context.s8.storeMemoryValue(de, v)
                            hl++
                            de++
                        }
                        context.s16.storeRegisterValue(Z80Registers16b.HL, hl)
                        context.s16.storeRegisterValue(Z80Registers16b.DE, de)
                    } else {
                        context.s16.storeRegisterValue(Z80Registers16b.HL, AnyExpression.add16(hl, bc))
                        context.s16.storeRegisterValue(Z80Registers16b.DE, AnyExpression.add16(de, bc))
                    }
                }
                context.s16.storeRegisterValue(Z80Registers16b.BC, 0)
            }),
            [0xb8]: new AdHocParsingInstructionHandler("LDDR", (dw, context) => {
                // Immediately not so trivial
                let de = context.s16.getRegisterValue(Z80Registers16b.DE)
                let hl = context.s16.getRegisterValue(Z80Registers16b.HL)
                let bc = context.s16.getRegisterValue(Z80Registers16b.BC)
                if(!Utilities.isNumber(bc)) {
                    context.s16.storeRegisterValue(Z80Registers16b.HL, AnyExpression.subtract(hl, bc))
                    context.s16.storeRegisterValue(Z80Registers16b.DE, AnyExpression.subtract(de, bc))
                } else {
                    bc = bc || 65536
                    if(Utilities.isNumber(hl) && Utilities.isNumber(de)) {
                        for(let i = 0; i < bc; i++) {
                            const v = context.s8.getMemoryValue(hl)
                            context.s8.storeMemoryValue(de, v)
                            hl--
                            de--
                        }
                        context.s16.storeRegisterValue(Z80Registers16b.HL, hl)
                        context.s16.storeRegisterValue(Z80Registers16b.DE, de)
                    } else {
                        context.s16.storeRegisterValue(Z80Registers16b.HL, AnyExpression.subtract(hl, bc))
                        context.s16.storeRegisterValue(Z80Registers16b.DE, AnyExpression.subtract(de, bc))
                    }
                }
                context.s16.storeRegisterValue(Z80Registers16b.BC, 0)
            }),
        }
    }

    /**
     *
     * @protected
     * @param {import("../BitView.mjs").BitView} n
     * @returns {import("./InstructionHandler.mjs").InstructionHandler<import("../DecomposedInstruction/DecomposedInstruction.mjs").DecomposedInstruction> | undefined | null}
     */
    getNext(n) {
        switch(n.pre) {
            case 0x01: { // 0x4-0x7
                if(n.b3 == 0b010) {
                    // 4a 42 5a 52 6a 62 7a 72
                    // 16-bit arithmetic
                    const op = (n.a3 & 0b1) ? "ADC" : "SBC"
                    /**
                     * @type {import("../Types.mjs").IntRange<0, 3>}
                     */
                    ///@ts-expect-error
                    const rpRef = n.a3 >> 1 // Top 2 bits of a3
                    const rp = rpR[rpRef]
                    if(op == "ADC") {
                        return new AdHocParsingInstructionHandler(`${op} HL, ${rp}`, (dw, context) => {
                            const a = context.s16.getRegisterValue(Z80Registers16b.HL)
                            const b = context.s16.getRegisterValue(rp)
                            context.s16.storeRegisterValue(Z80Registers16b.HL, AnyExpression.add16(a, b))
                        })
                    } else {
                        return new AdHocParsingInstructionHandler(`${op} HL, ${rp}`, (dw, context) => {
                            const a = context.s16.getRegisterValue(Z80Registers16b.HL)
                            const b = context.s16.getRegisterValue(rp)
                            context.s16.storeRegisterValue(Z80Registers16b.HL, AnyExpression.subtract(a, b))
                        })
                    }
                } else if(n.a2 != hlR && n.b4 == 0b0011) {
                    // 43 53 73
                    // 16-bit load
                    const rp = rpR[n.a2]
                    return new SaveInstructionHandler(`LD (a), ${rp}`, rp)
                } else if(n.a2 != hlR && n.b4 == 0b1011) {
                    // 4B 5B 7B
                    // 16-bit load
                    // Not 0x6B (non-standard)
                    const rp = rpR[n.a2]
                    return new LoadInstructionHandler(`LD ${rp}, (a)`, rp)
                }
            }
        }

        return null
    }
}