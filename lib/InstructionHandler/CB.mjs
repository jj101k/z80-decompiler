import {BitView} from "../BitView.mjs"
import {CBAny} from "./CBAny.mjs"

/**
 *
 */
export class CB extends CBAny {
    /**
     * @protected
     * @param {BitView} e
     * @param {import("../DataWalker.mjs").DataWalker} dw
     * @returns {string}
     */
    register(e, dw) {
        return this.regOrIndirect(e.b3)
    }
}