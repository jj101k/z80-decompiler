import { BitView } from "../BitView.mjs"
import { InstructionHandler } from "./InstructionHandler.mjs"

/**
 * For instructions which are not yet fully specified
 *
 * @abstract
 * @extends {InstructionHandler<import("../DecomposedInstruction/DecomposedInstruction.mjs").DecomposedInstruction>}
 */
export class IncompleteInstructionHandler extends InstructionHandler {
    /**
     * These don't require further decoding but may take args
     *
     * @protected
     * @readonly
     * @type {Record<number, InstructionHandler<import("../DecomposedInstruction/DecomposedInstruction.mjs").DecomposedInstruction>>}
     */
    get simpleOpcodes() {
        return {}
    }
    /**
     * @protected
     * @param {import("../DataWalker.mjs").DataWalker} dw
     * @param {import("../DecompileContext.mjs").DecompileContext} context
     * @returns {import("../DecomposedInstruction/DecomposedInstruction.mjs").DecomposedInstruction | undefined | null}
     */
    get(dw, context) {
        const n = new BitView(dw.uint8())
        if(this.simpleOpcodes[n.n]) {
            return this.simpleOpcodes[n.n].resolve(dw, context)
        }
        const i = this.getNext(n)
        if(!i) {
            return i
        }
        return i.resolve(dw, context)
    }
    /**
     * @protected
     * @abstract
     * @param {BitView} n
     * @returns {InstructionHandler<import("../DecomposedInstruction/DecomposedInstruction.mjs").DecomposedInstruction> | undefined | null}
     */
    getNext(n) {
        throw new Error("Not implemented")
    }
}