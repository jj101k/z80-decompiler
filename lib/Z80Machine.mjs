import { Z80Registers8B } from "./Z80Registers.mjs"
import { Z80Registers16B } from "./Z80Registers.mjs"

/**
 *
 */
export class Z80Machine {
    /**
     * @type {Record<string, number>}
     */
    static #registerLengths
    /**
     *
     */
    static get registerLengths() {
        if(!this.#registerLengths) {
            this.#registerLengths = Object.fromEntries([
                ...Object.values(Z80Registers16B).map(v => [v, 2]),
                ...Object.values(Z80Registers8B).map(v => [v, 1]),
            ])
        }
        return this.#registerLengths
    }
    /**
     *
     * @param {string} register
     * @throws
     * @returns {number}
     */
    static assertRegister(register) {
        const length = this.registerLengths[register]
        if(!length) {
            throw new Error(`Internal error: assertion failed: '${register}' is not a register`)
        }
        return length
    }
}