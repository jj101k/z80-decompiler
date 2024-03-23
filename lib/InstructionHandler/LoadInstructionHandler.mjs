import { DataWalker } from "../DataWalker.mjs"
import { DecompileWalker } from "../DecompileWalker.mjs"
import { SaveLoadInstructionHandler } from "./SaveLoadInstructionHandler.mjs"

/**
 *
 */
export class LoadInstructionHandler extends SaveLoadInstructionHandler {
    /**
     *
     */
    #register

    /**
     *
     * @param {DataWalker} dw
     * @param {DecompileWalker} context
     * @returns
     */
    get(dw, context) {
        const di = super.get(dw, context)
        context.storeRegisterValue(this.#register, context.getMemoryValue(di ? +di.arguments[0] : null))
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