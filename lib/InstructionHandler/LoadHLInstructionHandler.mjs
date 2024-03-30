import { Z80Registers16B } from "../Z80Registers.mjs"
import { TrivialInstructionHandler } from "./TrivialInstructionHandler.mjs"

/**
 *
 */
export class LoadHLInstructionHandler extends TrivialInstructionHandler {
    /**
     * @protected
     * @param {import("../DataWalker.mjs").DataWalker} dw
     * @param {import("../DecompileWalker.mjs").DecompileWalker} context
     * @returns
     */
    get(dw, context) {
        const di = super.get(dw, context)
        if(di) {
            context.addMemoryLocation(+di.arguments[0])
        }
        context.s16.storeRegisterValue(Z80Registers16B.HL, di ? +di.arguments[0] : null)
        return di
    }
}