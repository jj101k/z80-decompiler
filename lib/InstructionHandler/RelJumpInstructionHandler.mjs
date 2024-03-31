import { DecomposedInstructionParsing } from "../DecomposedInstruction/DecomposedInstructionParsing.mjs"
import { InstructionHandler } from "./InstructionHandler.mjs"

/**
 * @abstract
 * @extends {InstructionHandler<import("../DecomposedInstruction/DecomposedInstructionParsing.mjs").DecomposedInstructionParsing>}
 */
export class RelJumpInstructionHandler extends InstructionHandler {
    /**
     * @protected
     */
    name

    /**
     * @protected
     * @param {import("../DataWalker.mjs").DataWalker} dw
     * @param {import("../DecompileContext.mjs").DecompileContext} context
     * @returns
     */
    get(dw, context) {
        const di = new DecomposedInstructionParsing(this.name, dw, context.startPoint)
        this.handle(context, +di.arguments[0])
        return di
    }

    /**
     * @abstract
     * @protected
     * @param {import("../DecompileContext.mjs").DecompileContext} context
     * @param {number} e
     */
    handle(context, e) {
        throw new Error("Not implemented")
    }

    /**
     *
     * @param {string} name
     */
    constructor(name) {
        super()
        this.name = name
    }
}