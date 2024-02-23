import {DataWalker} from "../DataWalker.mjs"
import {DecompileWalker} from "../DecompileWalker.mjs"
import {DecomposedInstruction} from "./DecomposedInstruction.mjs"
import {InstructionHandler} from "./InstructionHandler.mjs"

/**
 *
 */
export class Uint16InstructionHandler extends InstructionHandler {
    /**
     *
     */
    name
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
        return new DecomposedInstruction(this.name, dw)
    }
}