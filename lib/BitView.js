/**
 *
 */
class BitView {
    #n
    /**
     * **nn ****
     */
    get a2() {
        return (this.#n >> 4) & 3
    }
    /**
     * **nn n***
     */
    get a3() {
        return (this.#n >> 3) & 7
    }
    /**
     * **** *nnn
     */
    get b3() {
        return this.#n & 7
    }
    /**
     * **** nnnn
     */
    get b4() {
        return this.#n & 15
    }
    /**
     * nnnn nnnn
     */
    get n() {
        return this.#n
    }
    /**
     * nn** ****
     */
    get pre() {
        return this.#n >> 6
    }
    /**
     * **nn nnnn
     */
    get rest() {
        return this.#n & 63
    }
    /**
     *
     * @param {number} n
     */
    constructor(n) {
        this.#n = n
    }
}

exports.BitView = BitView