import { Z80Registers8b } from "./Z80Registers.mjs"
import { Z80Registers16b } from "./Z80Registers.mjs"

/**
 *
 */
export class Z80Machine {
    /**
     * @type {Record<string, number>}
     */
    static #registerBits
    /**
     *
     */
    static get registerBits() {
        if(!this.#registerBits) {
            this.#registerBits = Object.fromEntries([
                ...Object.values(Z80Registers16b).map(v => [v, 16]),
                ...Object.values(Z80Registers8b).map(v => [v, 8]),
            ])
        }
        return this.#registerBits
    }
    /**
     *
     * @param {string} register
     * @throws
     * @returns {number}
     */
    static assertRegister(register) {
        const length = this.registerBits[register]
        if(!length) {
            throw new Error(`Internal error: assertion failed: '${register}' is not a register`)
        }
        return length / 8
    }
}