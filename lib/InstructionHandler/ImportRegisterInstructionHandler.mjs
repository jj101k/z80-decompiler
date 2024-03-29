import { DataWalker } from "../DataWalker.mjs"
import { DecompileWalker } from "../DecompileWalker.mjs"
import { TrivialInstructionHandler } from "./TrivialInstructionHandler.mjs"

/**
 * This handles setting a register from any unknown source
 */
export class ImportRegisterInstructionHandler extends TrivialInstructionHandler {
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
        const di = super.get(dw, context)
        context.s16.clearRegisterValue(this.#register)
        return di
    }
    /**
     *
     * @param {string} name
     * @param {import("../Z80Registers.d.mts").Z80Registers16B} register
     */
    constructor(name, register) {
        super(name)
        this.#register = register
    }
}