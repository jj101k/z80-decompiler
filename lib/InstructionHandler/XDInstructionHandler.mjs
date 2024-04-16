import { AnyExpression } from "../AnyExpression.mjs"
import { addHlIxIy, arOpR } from "../CodeDecompiler.mjs"
import { Utilities } from "../Utilities.mjs"
import { Z80Registers16b, Z80Registers8b } from "../Z80Registers.mjs"
import { AdHocParsingInstructionHandler } from "./AdHocParsingInstructionHandler.mjs"
import { PopRegisterInstructionHandler } from "./PopRegisterInstructionHandler.mjs"
import { IncompleteInstructionHandler } from "./IncompleteInstructionHandler.mjs"
import { IndirectLoadInstructionHandlerWithOffset } from "./IndirectLoadInstructionHandlerWithOffset.mjs"
import { LoadInstructionHandler } from "./LoadInstructionHandler.mjs"
import { SaveInstructionHandler } from "./SaveInstructionHandler.mjs"
import { UpdateRegisterInstructionHandler } from "./UpdateRegisterInstructionHandler.mjs"
import { XDCBInstructionHandler } from "./XDCBInstructionHandler.mjs"

/**
 * @abstract
 */
export class XDInstructionHandler extends IncompleteInstructionHandler {
    /**
     * @abstract
     * @protected
     * @type {import("../Z80Registers.mjs").Z80Registers16b}
     */
    ///@ts-expect-error
    offsetRegister

    /**
     * These don't require further decoding but may take args
     *
     * @protected
     * @readonly
     * @type {Record<number, import("./InstructionHandler.mjs").InstructionHandler<import("../DecomposedInstruction/DecomposedInstruction.mjs").DecomposedInstruction>>}
     */
    get simpleOpcodes() {
        return {
            [0x21]: new UpdateRegisterInstructionHandler(`LD ${this.offsetRegister}, nn`, this.offsetRegister),
            [0x22]: new SaveInstructionHandler(`LD (nn), ${this.offsetRegister}`, this.offsetRegister),
            [0x23]: new AdHocParsingInstructionHandler(`INC ${this.offsetRegister}`, (context) => {
                const v = context.s16.getRegisterValue(this.offsetRegister)
                context.s16.storeRegisterValue(this.offsetRegister, AnyExpression.add16(v, 1))
            }),
            [0x2a]: new LoadInstructionHandler(`LD ${this.offsetRegister}, (nn)`, this.offsetRegister),
            [0x36]: new AdHocParsingInstructionHandler(`LD (${this.offsetRegister}+d), n`, (context, di) => {
                context.s8.storeIndirectMemoryValue(this.offsetRegister, +di.arguments[1], +di.arguments[0])
            }),
            [0xb0]: new AdHocParsingInstructionHandler("OR B", (context) => {
                const a = context.s8.getRegisterValue(Z80Registers8b.A)
                const b = context.s8.getRegisterValue(Z80Registers8b.B)
                context.s8.storeRegisterValue(Z80Registers8b.A, AnyExpression.or(a, b))
            }),
            [0xcb]: new XDCBInstructionHandler(this.offsetRegister),
            [0xe1]: new PopRegisterInstructionHandler(`POP ${this.offsetRegister}`, this.offsetRegister),
            [0xe5]: new AdHocParsingInstructionHandler(`PUSH ${this.offsetRegister}`, (context) => {
                context.state.pushRegisterValue(this.offsetRegister)
            }),
            [0xe3]: new AdHocParsingInstructionHandler(`EX (SP), ${this.offsetRegister}`, (context) => {
                const v = context.s16.getRegisterValue(this.offsetRegister)
                const sp = context.s16.getRegisterValue(Z80Registers16b.SP)
                if(Utilities.isNumber(sp)) {
                    const spm = context.s16.getMemoryValue(sp)
                    context.s16.storeRegisterValue(this.offsetRegister, spm)
                    context.s16.storeMemoryValue(sp, v)
                } else {
                    context.s16.storeRegisterValue(this.offsetRegister, null)
                }
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
        /**
         * @type {import("../Z80Registers.mjs").Z80Registers8b | null}
         */
        let register

        switch (n.pre) {
            case 0b00: { // 0x0-3
                const r = addHlIxIy(n, this.offsetRegister)
                if (r) {
                    return r
                }

                if (this.isToMemory(n) && (n.b3 & 0b110) == 0b100) { // 0x *d 34/ 0x *d 35
                    // Increments/decrements memory
                    const op = (n.b3 & 1) ? "DEC" : "INC"
                    return new AdHocParsingInstructionHandler(`${op} (${this.offsetRegister}+d)`, (context, di) => {
                        context.s8.updateIndirectMemoryValue(this.offsetRegister,
                            v => (op == "INC") ? AnyExpression.add8(v, 1) : AnyExpression.subtract(v, 1), +di.arguments[0])
                    })
                }

                break
            }
            case 0b01: { // 0x4-7
                if ((register = this.sourceRegister(n))) {
                    const r = register
                    return new AdHocParsingInstructionHandler(`LD (${this.offsetRegister}+d), ${r}`, (context, di) => {
                        const address = context.s16.getRegisterValue(this.offsetRegister)
                        if(Utilities.isNumber(address)) {
                            context.s8.storeMemoryValue(address + +di.arguments[0], context.s8.getRegisterValue(r))
                        }
                    })
                } else if ((register = this.targetRegister(n))) {
                    return new IndirectLoadInstructionHandlerWithOffset(register, this.offsetRegister)
                }
                break
            }
            case 0b10: { // 0x8-b
                if (this.isFromMemory(n)) { // 0x?e, 0x?6
                    const op = arOpR[n.a3]
                    return new AdHocParsingInstructionHandler(`${op.name} (${this.offsetRegister}+d)`, (context, di) => {
                        context.s8.updateRegisterValue(Z80Registers8b.A, op, context.s8.getIndirectMemoryValue(
                            this.offsetRegister, +di.arguments[0]))
                    })
                }
                break
            }
            case 0b11: { // 0x.d c-f
                // Nothing here currently
                break
            }
        }

        return undefined
    }
}