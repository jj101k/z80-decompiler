import { DecomposedInstructionParsing } from "../DecomposedInstruction/DecomposedInstructionParsing.mjs"
import { InstructionHandler } from "./InstructionHandler.mjs"

/**
 * @abstract
 * @extends {InstructionHandler<import("../DecomposedInstruction/DecomposedInstructionParsing.mjs").DecomposedInstructionParsing>}
 */
export class ParsingInstructionHandler extends InstructionHandler {
    /**
     * @type {import("../UtilityTypes.d.mts").actionHandler<import("../DecomposedInstruction/DecomposedInstructionParsing.mjs").DecomposedInstructionParsing> | undefined}
     */
    #action

    /**
     * @protected
     * @param {import("../DataWalker.mjs").DataWalker} dw
     * @param {import("../DecompileContext.mjs").DecompileContext} context
     * @returns {DecomposedInstructionParsing}
     */
    get(dw, context) {
        return new DecomposedInstructionParsing(this.name, dw, context.startPoint)
    }

    /**
     *
     */
    name

    /**
     *
     * @param {string} name
     * @param {import("../UtilityTypes.d.mts").actionHandler<import("../DecomposedInstruction/DecomposedInstructionParsing.mjs").DecomposedInstructionParsing>} [withAction]
     */
    constructor(name, withAction) {
        super()
        this.name = name
        this.#action = withAction
    }

    /**
     * @abstract
     * @param {import("../DataWalker.mjs").DataWalker} dw
     * @param {import("../DecompileContext.mjs").DecompileContext} context
     * @returns {import("../DecomposedInstruction/DecomposedInstruction.mjs").DecomposedInstruction | undefined | null}
     */
    resolve(dw, context) {
        const di = this.get(dw, context)
        this.#action?.(dw, context, di)
        return di
    }
}