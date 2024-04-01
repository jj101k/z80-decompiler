import { DecomposedInstructionParsing } from "../DecomposedInstruction/DecomposedInstructionParsing.mjs"
import { ParsingInstructionHandler } from "./ParsingInstructionHandler.mjs"

/**
 *
 */
export class TrivialInstructionHandler extends ParsingInstructionHandler {
    /**
     * @protected
     * @param {import("../DataWalker.mjs").DataWalker} dw
     * @param {import("../DecompileContext.mjs").DecompileContext} context
     * @returns {DecomposedInstructionParsing | undefined | null}
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
        super(withAction)
        this.name = name
    }
}