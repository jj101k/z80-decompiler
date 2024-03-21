import { DataWalker } from "../DataWalker.mjs"
import { DecompileWalker } from "../DecompileWalker.mjs"
import { DecomposedMemoryRegisterInstruction } from "./DecomposedMemoryRegisterInstruction.mjs"
import { TrivialInstructionHandler } from "./TrivialInstructionHandler.mjs"

/**
 * Handles storing literal values in registers
 */
export class UpdateRegisterInstructionHandler extends TrivialInstructionHandler {
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
        const di = new DecomposedMemoryRegisterInstruction(this.name, dw)
        context.storeRegisterValue(this.#register, +di.arguments[0])
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