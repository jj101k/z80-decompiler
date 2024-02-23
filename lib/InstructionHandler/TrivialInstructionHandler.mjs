import {DecomposedInstruction} from "./DecomposedInstruction.mjs"
import {InstructionHandler} from "./InstructionHandler.mjs"

/**
 *
 */
export class TrivialInstructionHandler extends InstructionHandler {
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
    get() {
        return new DecomposedInstruction(this.name)
    }
}