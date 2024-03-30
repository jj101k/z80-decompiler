import { CBAny } from "./CBAny.mjs"

/**
 *
 */
export class CB extends CBAny {
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