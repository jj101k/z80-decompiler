import { DataWalker } from "../DataWalker.mjs"
import { DecompileWalker } from "../DecompileWalker.mjs"
import { TrivialInstructionHandler } from "./TrivialInstructionHandler.mjs"

/**
 *
 */
export class IndirectLoadInstructionHandler extends TrivialInstructionHandler {
    /**
     *
     */
    #indirectRegister
    /**
     *
     */
    #register
    /**
     *
     */
    #withOffset

    /**
     *
     * @protected
     * @param {DataWalker} dw
     * @param {DecompileWalker} context
     * @returns
     */
    get(dw, context) {
        const di = super.get(dw, context)
        /**
         * @type {number | null}
         */
        let v = null
        if(this.#withOffset) {
            v = di ? context.getIndirectMemoryValue(this.#indirectRegister, 1, +di?.arguments[0]) : null
        } else {
            v = context.getIndirectMemoryValue(this.#indirectRegister)
        }
        context.storeRegisterValue(this.#register, v)
        return di
    }

    /**
     *
     * @param {string} register
     * @param {string} indirectRegister
     * @param {boolean} withOffset
     */
    constructor(register, indirectRegister, withOffset = false) {
        if(withOffset) {
            super(`LD ${register} (${indirectRegister}+d)`)
        } else {
            super(`LD ${register} (${indirectRegister})`)
        }
        this.#register = register
        this.#indirectRegister = indirectRegister
        this.#withOffset = withOffset
    }
}