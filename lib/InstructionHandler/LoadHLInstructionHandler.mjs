import { Z80Registers16b } from "../Z80Registers.mjs"
import { ParsingInstructionHandler } from "./ParsingInstructionHandler.mjs"

/**
 *
 */
export class LoadHLInstructionHandler extends ParsingInstructionHandler {
    /**
     * @protected
     * @param {import("../DataWalker.mjs").DataWalker} dw
     * @param {import("../DecompileContext.mjs").DecompileContext} context
     * @returns
     */
    get(dw, context) {
        const di = super.get(dw, context)
        const address = +di.arguments[0]
        context.addMemoryLocation(address)
        context.s16.storeRegisterValue(Z80Registers16b.HL, address)
        return di
    }

    /**
     *
     * @param {string} name
     */
    constructor(name) {
        super(name)
    }
}