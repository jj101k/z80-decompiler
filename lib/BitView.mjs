/**
 *
 */
export class BitView {
    #n
    /**
     * **nn ****
     *
     * @type {import("./Types.mjs").IntRange<0, 4>}
     */
    get a2() {
        return (this.#n >> 4) & 3
    }
    /**
     * **nn n***
     *
     * @type {import("./Types.mjs").IntRange<0, 8>}
     */
    get a3() {
        return (this.#n >> 3) & 7
    }
    /**
     * **** *nnn
     * @type {import("./Types.mjs").IntRange<0, 8>}
     */
    get b3() {
        return this.#n & 7
    }
    /**
     * **** nnnn
     * @type {import("./Types.mjs").IntRange<0, 16>}
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
     *
     * @type {import("./Types.mjs").IntRange<0, 4>}
     */
    get pre() {
        return this.#n >> 6
    }
    /**
     * **nn nnnn
     *
     * @type {import("./Types.mjs").IntRange<0, 64>}
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