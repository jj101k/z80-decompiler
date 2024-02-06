const { registerRef } = require("./registerRef")

/**
 *
 */
class AnyDecompiler {
    /**
     *
     * @param {number} l
     * @param {number[]} ns
     * @returns
     */
    #data(l, ...ns) {
        const lo = l * 2 / 8
        return ns.map(n => n.toString(16).padStart(lo, "0")).join(" ")
    }

    /**
     * @protected
     * @param {number} n
     * @returns
     */
    reg(n) {
        return registerRef[n]
    }

    /**
     * @param {number} n
     * @returns
     */
    addr(n) {
        return this.#data(16, n)
    }

    /**
     * @param {number} n
     * @returns
     */
    rel(n) {
        if (n >= 0) {
            return `+${n}`
        } else {
            return `${n}`
        }
    }

    /**
     *
     * @param {number[]} ns
     * @returns
     */
    u8(...ns) {
        return this.#data(8, ...ns)
    }

    /**
     *
     * @param {number[]} ns
     * @returns
     */
    u16(...ns) {
        return this.#data(16, ...ns)
    }
}

exports.AnyDecompiler = AnyDecompiler