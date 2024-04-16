import { ParsingInstructionHandler } from "./ParsingInstructionHandler.mjs"

/**
 * This handles setting a register by popping it
 */
export class PopRegisterInstructionHandler extends ParsingInstructionHandler {
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
        context.state.popRegisterValue(this.#register)
        return di
    }
    /**
     *
     * @param {string} name
     * @param {import("../Z80Registers.mjs").Z80Registers16b} register
     */
    constructor(name, register) {
        super(name)
        this.#register = register
    }
}