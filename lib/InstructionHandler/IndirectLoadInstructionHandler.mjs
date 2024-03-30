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
     * @param {import("../DataWalker.mjs").DataWalker} dw
     * @param {import("../DecompileContext.mjs").DecompileContext} context
     * @returns
     */
    get(dw, context) {
        const di = super.get(dw, context)
        /**
         * @type {number | null}
         */
        let v = null
        if(this.#withOffset) {
            v = di ? context.s8.getIndirectMemoryValue(this.#indirectRegister, +di?.arguments[0]) : null
        } else {
            v = context.s8.getIndirectMemoryValue(this.#indirectRegister)
        }
        context.s8.storeRegisterValue(this.#register, v)
        return di
    }

    /**
     *
     * @param {import("../Z80Registers.d.mts").Z80Registers8B} register
     * @param {import("../Z80Registers.d.mts").Z80Registers16B} indirectRegister
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