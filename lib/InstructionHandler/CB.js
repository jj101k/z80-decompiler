const { BitView } = require("../BitView")
const { CBAny } = require("./CBAny")

/**
 *
 */
class CB extends CBAny {
    /**
     * @protected
     * @param {BitView} e
     * @param {import("../DataWalker")} dw
     * @returns {string}
     */
    register(e, dw) {
        return this.reg(e.b3)
    }
}

exports.CB = CB