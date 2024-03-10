import {DataWalker} from "../DataWalker.mjs"
import {DecompileWalker} from "../DecompileWalker.mjs"
import {DecomposedInstruction} from "./DecomposedInstruction.mjs"
import {InstructionHandler} from "./InstructionHandler.mjs"

/**
 * @abstract
 */
export class JumpInstructionHandler extends InstructionHandler {
    /**
     *
     */
    name

    /**
     *
     * @protected
     * @param {DataWalker} dw
     * @param {DecompileWalker} context
     * @returns
     */
    get(dw, context) {
        const di = new DecomposedInstruction(this.name, dw)
        this.handle(context, +di.arguments[0])
        return di
    }

    /**
     * @abstract
     * @protected
     * @param {DecompileWalker} decompile
     * @param {number} nn
     */
    handle(decompile, nn) {
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