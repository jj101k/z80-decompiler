const { BitView } = require("../BitView")
const { bitR, rsR } = require("../CodeDecompiler")
const { InstructionHandler } = require("./InstructionHandler")

/**
 *
 */
class CBAny extends InstructionHandler {
    /**
     * @protected
     * @param {BitView} e
     * @param {import("../DataWalker")} dw
     * @returns {string | undefined}
     */
    getBitOp(e, dw) {
        const r = this.register(e, dw)
        return `${bitR[e.pre]} ${e.a3}, ${r}`
    }

    /**
     * @protected
     * @param {BitView} e
     * @param {import("../DataWalker")} dw
     * @returns {string | undefined}
     */
    getRotateOp(e, dw) {
        // Rotate / shift
        if(e.a3 != 0b110) {
            const r = this.register(e, dw)
            return `${rsR[e.a3]} ${r}`
        }
    }

    /**
     * @protected
     * @abstract
     * @param {BitView} e
     * @param {import("../DataWalker")} dw
     * @returns {string}
     */
    register(e, dw) {
        throw new Error("Not implemented")
    }

    /**
     * @param {import("../DataWalker")} dw
     * @returns {string | undefined}
     */
    get(dw) {
        const e = new BitView(dw.uint8())
        if(e.pre == 0b00) {
            return this.getRotateOp(e, dw)
        } else {
            return this.getBitOp(e, dw)
        }
    }
}

exports.CBAny = CBAny