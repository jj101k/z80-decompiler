import { DecomposedInstructionParsing } from "../DecomposedInstruction/DecomposedInstructionParsing.mjs"
import { ParsingInstructionHandler } from "./ParsingInstructionHandler.mjs"

/**
 * @abstract
 */
export class RelJumpInstructionHandler extends ParsingInstructionHandler {
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
     * @param {import("../UtilityTypes.d.mts").actionHandler<import("../DecomposedInstruction/DecomposedInstructionParsing.mjs").DecomposedInstructionParsing>} [withAction]
     */
    constructor(name, withAction) {
        super(withAction)
        this.name = name
    }
}