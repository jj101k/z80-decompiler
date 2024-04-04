import { ParsingInstructionHandler } from "./ParsingInstructionHandler.mjs"

/**
 * @abstract
 */
export class RelJumpInstructionHandler extends ParsingInstructionHandler {
    /**
     * @protected
     * @param {import("../DataWalker.mjs").DataWalker} dw
     * @param {import("../DecompileContext.mjs").DecompileContext} context
     * @returns
     */
    get(dw, context) {
        const di = super.get(dw, context)
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
        super(name)
    }
}