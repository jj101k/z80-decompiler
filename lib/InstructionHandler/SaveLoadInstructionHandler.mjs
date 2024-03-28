import { DataWalker } from "../DataWalker.mjs"
import { DecompileWalker } from "../DecompileWalker.mjs"
import { TrivialInstructionHandler } from "./TrivialInstructionHandler.mjs"

/**
 * @abstract
 */
export class SaveLoadInstructionHandler extends TrivialInstructionHandler {
    /**
     * @protected
     */
    length
    /**
     * @protected
     */
    register

    /**
     *
     * @param {DataWalker} dw
     * @param {DecompileWalker} context
     * @returns
     */
    get(dw, context) {
        const di = super.get(dw, context)
        context.addMemoryLocation(+di.arguments[0])
        return di
    }

    /**
     *
     * @param {string} name
     * @param {string} register
     * @param {number} length
     */
    constructor(name, register, length) {
        super(name)
        this.length = length
        this.register = register
    }
}