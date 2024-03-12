import { BitView } from "../BitView.mjs"
import { CBAny } from "./CBAny.mjs"

/**
 *
 */
export class XDCB extends CBAny {
    #offsetRegister
    /**
     * @protected
     * @param {BitView} e
     * @param {import("../DataWalker.mjs").DataWalker} dw
     * @returns {string | undefined}
     */
    getBitOp(e, dw) {
        if(this.isFromMemory(e)) {
            return super.getBitOp(e, dw)
        } else {
            return undefined
        }
    }
    /**
     * @protected
     * @param {BitView} e
     * @param {import("../DataWalker.mjs").DataWalker} dw
     * @returns {string}
     */
    register(e, dw) {
        const a = dw.uint8()
        return this.#offsetRegister + this.rel(a)
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