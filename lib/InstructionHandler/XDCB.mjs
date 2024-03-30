import { CBAny } from "./CBAny.mjs"

/**
 *
 */
export class XDCB extends CBAny {
    #offsetRegister

    /**
     * @protected
     * @param {import("../BitView.mjs").BitView} e
     * @param {import("../DataWalker.mjs").DataWalker} dw
     * @returns {string}
     */
    expression(e, dw) {
        const a = dw.uint8()
        return this.#offsetRegister + this.rel(a)
    }

    /**
     * @protected
     * @param {import("../BitView.mjs").BitView} e
     * @param {import("../DataWalker.mjs").DataWalker} dw
     * @returns {string}
     */
    getBitOp(e, dw) {
        if(this.isFromMemory(e)) {
            return super.getBitOp(e, dw)
        } else {
            throw new Error(`Internal error: ${e.n} is not a valid bit op`)
        }
    }

    /**
     *
     * @param {string} offsetRegister
     */
    constructor(offsetRegister) {
        super()
        this.#offsetRegister = offsetRegister
    }
}