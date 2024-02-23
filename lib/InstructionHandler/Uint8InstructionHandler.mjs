import {DataWalker} from "../DataWalker.mjs"
import {DecomposedInstruction} from "./DecomposedInstruction.mjs"
import {InstructionHandler} from "./InstructionHandler.mjs"

/**
 *
 */
export class Uint8InstructionHandler extends InstructionHandler {
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
     * @returns
     */
    get(dw) {
        return new DecomposedInstruction(this.name, dw)
    }
}