import { ParsingInstructionHandler } from "./ParsingInstructionHandler.mjs"

/**
 *
 */
export class AdHocParsingInstructionHandler extends ParsingInstructionHandler {
    /**
     * @type {import("../UtilityTypes.mjs").actionHandler<import("../DecomposedInstruction/DecomposedInstructionParsing.mjs").DecomposedInstructionParsing> | undefined}
     */
    #action

    /**
     *
     * @param {string} name
     * @param {import("../UtilityTypes.mjs").actionHandler<import("../DecomposedInstruction/DecomposedInstructionParsing.mjs").DecomposedInstructionParsing>} withAction
     */
    constructor(name, withAction) {
        super(name)
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