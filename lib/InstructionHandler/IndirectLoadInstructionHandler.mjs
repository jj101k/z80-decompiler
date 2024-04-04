import { ParsingInstructionHandler } from "./ParsingInstructionHandler.mjs"

/**
 *
 */
export class IndirectLoadInstructionHandler extends ParsingInstructionHandler {
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
     * @protected
     * @param {import("../DataWalker.mjs").DataWalker} dw
     * @param {import("../DecompileContext.mjs").DecompileContext} context
     * @returns
     */
    get(dw, context) {
        const di = super.get(dw, context)
        const v = context.s8.getIndirectMemoryValue(this.#indirectRegister)
        context.s8.storeRegisterValue(this.#register, v)
        return di
    }

    /**
     *
     * @param {import("../Z80Registers.d.mts").Z80Registers8b} register
     * @param {import("../Z80Registers.d.mts").Z80Registers16b} indirectRegister
     */
    constructor(register, indirectRegister) {
        super(`LD ${register}, (${indirectRegister})`)
        this.#register = register
        this.#indirectRegister = indirectRegister
    }
}