import { BitView } from "../BitView.mjs"
import { bitR, rsR } from "../CodeDecompiler.mjs"
import { DecomposedInstruction } from "./DecomposedInstruction.mjs"
import { InstructionHandler } from "./InstructionHandler.mjs"

/**
 *
 */
export class CBAny extends InstructionHandler {
    /**
     * @protected
     * @param {import("../DataWalker.mjs").DataWalker} dw
     * @returns {DecomposedInstruction | undefined}
     */
    get(dw) {
        const e = new BitView(dw.uint8())
        if(e.pre == 0b00) {
            return new DecomposedInstruction(this.getRotateOp(e, dw))
        } else {
            return new DecomposedInstruction(this.getBitOp(e, dw))
        }
    }

    /**
     * @protected
     * @param {BitView} e
     * @param {import("../DataWalker.mjs").DataWalker} dw
     * @returns {string | undefined}
     */
    getBitOp(e, dw) {
        const r = this.register(e, dw)
        return `${bitR[e.pre]} ${e.a3}, ${r}`
    }

    /**
     * @protected
     * @param {BitView} e
     * @param {import("../DataWalker.mjs").DataWalker} dw
     * @returns {string | undefined}
     */
    getRotateOp(e, dw) {
        // Rotate / shift
        if(e.a3 != 0b110) {
            const r = this.register(e, dw)
            return `${rsR[e.a3]} ${r}`
        }
    }

    /**
     * @protected
     * @abstract
     * @param {BitView} e
     * @param {import("../DataWalker.mjs").DataWalker} dw
     * @returns {import("../Z80Registers.mjs").Z80Registers | "(HL)"}
     */
    register(e, dw) {
        throw new Error("Not implemented")
    }
}