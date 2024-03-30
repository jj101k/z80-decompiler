import { CBAnyInstructionHandler } from "./CBAnyInstructionHandler.mjs"

/**
 *
 */
export class CBInstructionHandler extends CBAnyInstructionHandler {
    /**
     * @protected
     * @param {import("../BitView.mjs").BitView} e
     * @param {import("../DataWalker.mjs").DataWalker} dw
     * @returns
     */
    expression(e, dw) {
        return this.regOrIndirect(e.b3)
    }
}