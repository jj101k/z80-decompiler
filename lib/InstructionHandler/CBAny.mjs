import { BitView } from "../BitView.mjs"
import { bitR, rsR } from "../CodeDecompiler.mjs"
import { DecomposedInstruction } from "../DecomposedInstruction/DecomposedInstruction.mjs"
import { InstructionHandler } from "./InstructionHandler.mjs"

/**
 *
 */
export class CBAny extends InstructionHandler {
    /**
     * @param {BitView} e
     * @param {import("../DataWalker.mjs").DataWalker} dw
     * @returns {string}
     */
    #getRotateOp(e, dw) {
        // Rotate / shift
        if(e.a3 != 0b110) {
            return `${rsR[e.a3]} ${this.expression(e, dw)}`
        } else {
            throw new Error(`Internal error: ${e.n} is not a rotate op`)
        }
    }

    /**
     * @protected
     * @abstract
     * @param {BitView} e
     * @param {import("../DataWalker.mjs").DataWalker} dw
     * @returns {string}
     */
    expression(e, dw) {
        throw new Error("Not implemented")
    }

    /**
     * @protected
     * @param {import("../DataWalker.mjs").DataWalker} dw
     * @returns {DecomposedInstruction | undefined}
     */
    get(dw) {
        const e = new BitView(dw.uint8())
        if(e.pre == 0b00) {
            return new DecomposedInstruction(this.#getRotateOp(e, dw))
        } else {
            return new DecomposedInstruction(this.getBitOp(e, dw))
        }
    }

    /**
     * @protected
     * @param {BitView} e
     * @param {import("../DataWalker.mjs").DataWalker} dw
     * @returns {string}
     */
    getBitOp(e, dw) {
        const pre = e.pre
        if(pre === 0) {
            throw new Error("Internal error: Invalid prefix value 0")
        }
        return `${bitR[pre]} ${e.a3}, ${this.expression(e, dw)}`
    }
}