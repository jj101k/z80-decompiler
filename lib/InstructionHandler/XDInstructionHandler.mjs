import { addHlIxIy, arOpR } from "../CodeDecompiler.mjs"
import { Utilities } from "../Utilities.mjs"
import { Z80Registers8b } from "../Z80Registers.mjs"
import { ImportRegisterInstructionHandler } from "./ImportRegisterInstructionHandler.mjs"
import { IncompleteInstructionHandler } from "./IncompleteInstructionHandler.mjs"
import { IndirectLoadInstructionHandlerWithOffset } from "./IndirectLoadInstructionHandlerWithOffset.mjs"
import { LoadInstructionHandler } from "./LoadInstructionHandler.mjs"
import { SaveInstructionHandler } from "./SaveInstructionHandler.mjs"
import { TrivialInstructionHandler } from "./TrivialInstructionHandler.mjs"
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
            [0x23]: new TrivialInstructionHandler(`INC ${this.offsetRegister}`, (dw, context) => {
                const v = context.s16.getRegisterValue(this.offsetRegister)
                if(Utilities.isNumber(v)) {
                    context.s16.storeRegisterValue(this.offsetRegister, v + 1)
                }
            }),
            [0x2a]: new LoadInstructionHandler(`LD ${this.offsetRegister}, (nn)`, this.offsetRegister),
            [0x36]: new TrivialInstructionHandler(`LD (${this.offsetRegister}+d), n`),
            [0xb0]: new TrivialInstructionHandler("OR B"),
            [0xcb]: new XDCBInstructionHandler(this.offsetRegister),
            [0xe1]: new ImportRegisterInstructionHandler(`POP ${this.offsetRegister}`, this.offsetRegister),
            [0xe5]: new TrivialInstructionHandler(`PUSH ${this.offsetRegister}`),
            [0xe3]: new TrivialInstructionHandler(`EX (SP), ${this.offsetRegister}`),
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
                    return new TrivialInstructionHandler(`${op} (${this.offsetRegister}+d)`)
                }

                break
            }
            case 0b01: { // 0x4-7
                if ((register = this.sourceRegister(n))) {
                    return new TrivialInstructionHandler(`LD (${this.offsetRegister}+d), ${register}`)
                } else if ((register = this.targetRegister(n))) {
                    return new IndirectLoadInstructionHandlerWithOffset(register, this.offsetRegister)
                }
                break
            }
            case 0b10: { // 0x8-b
                if (this.isFromMemory(n)) { // 0x?e, 0x?6
                    const op = arOpR[n.a3]
                    return new TrivialInstructionHandler(`${op.name} (${this.offsetRegister}+d)`, (dw, context, di) => {
                        if(di) {
                            context.s8.updateRegisterValue(Z80Registers8b.A, op, context.s8.getIndirectMemoryValue(
                                this.offsetRegister, +di.arguments[0]))
                        }
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