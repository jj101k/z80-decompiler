import { BitView } from "../BitView.mjs"
import { addHlIxIy, arOpR } from "../CodeDecompiler.mjs"
import { Z80Registers8b } from "../Z80Registers.mjs"
import { DecomposedInstructionParsing } from "../DecomposedInstruction/DecomposedInstructionParsing.mjs"
import { ImportRegisterInstructionHandler } from "./ImportRegisterInstructionHandler.mjs"
import { IndirectLoadInstructionHandler } from "./IndirectLoadInstructionHandler.mjs"
import { InstructionHandler } from "./InstructionHandler.mjs"
import { LoadInstructionHandler } from "./LoadInstructionHandler.mjs"
import { SaveInstructionHandler } from "./SaveInstructionHandler.mjs"
import { TrivialInstructionHandler } from "./TrivialInstructionHandler.mjs"
import { UpdateRegisterInstructionHandler } from "./UpdateRegisterInstructionHandler.mjs"
import { XDCBInstructionHandler } from "./XDCBInstructionHandler.mjs"

/**
 * @abstract
 */
export class XDInstructionHandler extends InstructionHandler {
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
     * @type {Record<number, InstructionHandler>}
     */
    get simpleOpcodes() {
        return {
            [0x21]: new UpdateRegisterInstructionHandler(`LD ${this.offsetRegister}, nn`, this.offsetRegister),
            [0x22]: new SaveInstructionHandler(`LD (nn), ${this.offsetRegister}`, this.offsetRegister),
            [0x23]: new TrivialInstructionHandler(`INC ${this.offsetRegister}`).withAction((dw, context) => {
                const v = context.s16.getRegisterValue(this.offsetRegister)
                if(v !== null) {
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
     * @protected
     * @param {import("../DataWalker.mjs").DataWalker} dw
     * @param {import("../DecompileContext.mjs").DecompileContext} context
     * @returns {import("../DecomposedInstruction/DecomposedInstruction.mjs").DecomposedInstruction | undefined | null}
     */
    get(dw, context) {
        const nnx = new BitView(dw.uint8())

        if(this.simpleOpcodes[nnx.n]) {
            return this.simpleOpcodes[nnx.n].resolve(dw, context)
        }

        /**
         * @type {import("../Z80Registers.mjs").Z80Registers8b | null}
         */
        let register

        switch (nnx.pre) {
            case 0: { // 0x0-3
                const r = addHlIxIy(nnx, this.offsetRegister)
                if (r) {
                    return r
                }

                if (this.isToMemory(nnx) && (nnx.b3 & 0b110) == 0b100) { // 0x *d 34/ 0x *d 35
                    // Increments/decrements memory
                    const op = (nnx.b3 & 1) ? "DEC" : "INC"
                    return new DecomposedInstructionParsing(`${op} (${this.offsetRegister}+d)`, dw, context.startPoint)
                }

                break
            }
            case 1: { // 0x4-7
                if ((register = this.sourceRegister(nnx))) {
                    return new DecomposedInstructionParsing(`LD (${this.offsetRegister}+d), ${register}`, dw, context.startPoint)
                } else if ((register = this.targetRegister(nnx))) {
                    return new IndirectLoadInstructionHandler(register, this.offsetRegister, true).resolve(dw, context)
                }
                break
            }
            case 2: { // 0x8-b
                if (this.isFromMemory(nnx)) { // 0x?e, 0x?6
                    const op = arOpR[nnx.a3]
                    const di = new DecomposedInstructionParsing(`${op.name} (${this.offsetRegister}+d)`, dw, context.startPoint)
                    context.s8.updateRegisterValue(Z80Registers8b.A, op, context.s8.getIndirectMemoryValue(
                        this.offsetRegister, +di.arguments[0]))
                    return di
                }
                break
            }
            case 3: { // 0x.d c-f
                // Nothing here currently
                break
            }
        }

        return undefined
    }
}