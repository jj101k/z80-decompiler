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
     *
     * @param {import("../UtilityTypes.d.mts").actionHandler<import("../DecomposedInstruction/DecomposedInstructionParsing.mjs").DecomposedInstructionParsing>} [withAction]
     */
    constructor(withAction) {
        super()
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