import { DecomposedInstructionParsing } from "../DecomposedInstruction/DecomposedInstructionParsing.mjs"
import { InstructionHandler } from "./InstructionHandler.mjs"

/**
 * @abstract
 * @extends {InstructionHandler<import("../DecomposedInstruction/DecomposedInstructionParsing.mjs").DecomposedInstructionParsing>}
 */
export class ParsingInstructionHandler extends InstructionHandler {
    /**
     * @protected
     * @param {import("../DataWalker.mjs").DataWalker} dw
     * @param {import("../DecompileContext.mjs").DecompileContext} context
     * @returns {DecomposedInstructionParsing}
     */
    get(dw, context) {
        return new DecomposedInstructionParsing(this.name, dw, context.volatileState.startPoint)
    }

    /**
     *
     */
    name

    /**
     * @protected
     *
     * @param {string} name
     */
    constructor(name) {
        super()
        this.name = name
    }

    /**
     * @abstract
     * @param {import("../DataWalker.mjs").DataWalker} dw
     * @param {import("../DecompileContext.mjs").DecompileContext} context
     * @returns {import("../DecomposedInstruction/DecomposedInstruction.mjs").DecomposedInstruction | undefined | null}
     */
    resolve(dw, context) {
        return this.get(dw, context)
    }
}