import { TrivialInstructionHandler } from "./TrivialInstructionHandler.mjs"

/**
 * @abstract
 */
export class JumpInstructionHandler extends TrivialInstructionHandler {
    /**
     *
     * @protected
     * @param {import("../DataWalker.mjs").DataWalker} dw
     * @param {import("../DecompileContext.mjs").DecompileContext} context
     * @returns
     */
    get(dw, context) {
        const di = super.get(dw, context)
        if(di) {
            this.handle(context, +di.arguments[0])
        }
        return di
    }

    /**
     * @abstract
     * @protected
     * @param {import("../DecompileContext.mjs").DecompileContext} decompile
     * @param {number} nn
     */
    handle(decompile, nn) {
        throw new Error("Not implemented")
    }
}