import { DataWalker } from "../DataWalker.mjs"
import { DecompileWalker } from "../DecompileWalker.mjs"
import { DecomposedInstruction } from "./DecomposedInstruction.mjs"
import { Uint16InstructionHandler } from "./Uint16InstructionHandler.mjs"

/**
 *
 */
export class ImportRegisterInstructionHandler extends Uint16InstructionHandler {
    /**
     *
     */
    #register

    /**
     *
     * @protected
     * @param {DataWalker} dw
     * @param {DecompileWalker} context
     * @returns
     */
    get(dw, context) {
        const di = new DecomposedInstruction(this.name, dw)
        context.clearRegisterValue(this.#register)
        return di
    }
    /**
     *
     * @param {string} name
     * @param {string} register
     */
    constructor(name, register) {
        super(name)
        this.#register = register
    }
}