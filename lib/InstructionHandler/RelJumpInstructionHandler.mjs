import {DataWalker} from "../DataWalker.mjs"
import {DecompileWalker} from "../DecompileWalker.mjs"
import {DecomposedInstruction} from "./DecomposedInstruction.mjs"
import {InstructionHandler} from "./InstructionHandler.mjs"

/**
 * @abstract
 */
export class RelJumpInstructionHandler extends InstructionHandler {
    /**
     *
     */
    name

    /**
     * @abstract
     * @protected
     * @param {DecompileWalker} context
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

    /**
     *
     * @param {DataWalker} dw
     * @param {DecompileWalker} context
     * @returns
     */
    get(dw, context) {
        const di = new DecomposedInstruction(this.name, dw, context.startPoint)
        this.handle(context, +di.arguments[0])
        return di
    }
}