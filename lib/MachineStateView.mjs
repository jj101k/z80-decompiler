import { MachineState } from "./MachineState.mjs"

/**
 * @template {string} T
 */
export class MachineStateView {
    /**
     *
     */
    #length
    /**
     *
     */
    #state

    /**
     *
     * @param {{name: string, update?: (a: number, b: number) => number}} op
     * @param {number | null} a
     * @param {number | null} b
     * @returns
     */
    #opResult(op, a, b) {
        if(a !== null && b !== null) {
            return op.update?.(a, b) ?? null
        } else {
            return null
        }
    }

    /**
     *
     * @param {MachineState} state
     * @param {number} length
     */
    constructor(state, length) {
        this.#length = length
        this.#state = state
    }

    /**
     *
     * @param {T} register
     */
    clearRegisterValue(register) {
        this.#state.clearRegisterValue(register)
    }

    /**
     *
     * @param {import("./Z80Registers.d.mts").Z80Registers16B} register
     * @param {number} offset
     * @returns
     */
    getIndirectMemoryValue(register, offset = 0) {
        return this.getMemoryValue(this.getRegisterValue(register), offset)
    }

    /**
     *
     * @param {number | null} address
     * @param {number} offset
     * @returns {number | null}
     */
    getMemoryValue(address, offset = 0) {
        return this.#state.getMemoryValue(address, this.#length, offset)
    }

    /**
     *
     * @param {T} register
     * @returns {number | null}
     */
    getRegisterValue(register) {
        return this.#state.getRegisterValue(register)
    }

    /**
     * This is only for 8-bit values.
     *
     * @param {string} expression
     * @returns {number | null}
     */
    getValue(expression) {
        let md
        if((md = expression.match(/^\([$](.*)\)$/))) {
            // This exists for completeness only - you would normally just use getMemoryValue().
            return this.getMemoryValue(Number.parseInt(md[1], 16))
        } else if((md = expression.match(/^\((.*)\)$/))) {
            const registerValue = this.getRegisterValue(md[1])
            if(!registerValue) {
                return null
            }
            return this.getMemoryValue(registerValue)
        } else {
            return this.getRegisterValue(expression)
        }
    }

    /**
     *
     * @param {number} location
     * @param {number | null} n
     */
    storeMemoryValue(location, n) {
        return this.#state.storeMemoryValue(location, n, this.#length)
    }

    /**
     *
     * @param {T} register
     * @param {number | null} n
     */
    storeRegisterValue(register, n) {
        return this.#state.storeRegisterValue(register, n)
    }

    /**
     *
     * @param {T} register
     * @param {{name: string, update?: (a: number, b: number) => number}} op
     * @param {number | null} value
     */
    updateRegisterValue(register, op, value) {
        this.storeRegisterValue(register, this.#opResult(op, this.getRegisterValue(register), value))
    }
}