/**
 * @abstract
 * @template {string} T
 */
export class MachineStateView {
    /**
     *
     * @param {import("./BinaryOperator.mjs").BinaryOperator} op
     * @param {number | null} a
     * @param {number | null} b
     * @param {boolean} operatingOnSelf
     * @returns
     */
    #opResult(op, a, b, operatingOnSelf = false) {
        if(operatingOnSelf && op.staticResultOnSelf !== undefined) {
            return op.staticResultOnSelf
        } else if(a !== null && b !== null) {
            return op.update?.(a, b) ?? null
        } else {
            return null
        }
    }

    /**
     * @protected
     */
    state

    /**
     *
     * @param {import("./MachineState.mjs").MachineState} state
     */
    constructor(state) {
        this.state = state
    }

    /**
     * @protected
     * @param {string} register
     * @throws
     * @returns {number | null}
     */
    assertRegisterValue(register) {
        throw new Error("Not implemented")
    }

    /**
     * @abstract
     * @param {T} register
     */
    clearRegisterValue(register) {
        throw new Error("Not implemented")
    }

    /**
     *
     * @param {import("./Z80Registers.d.mts").Z80Registers16b} register
     * @param {number} offset
     * @returns
     */
    getIndirectMemoryValue(register, offset = 0) {
        return this.getMemoryValue(this.state.getWideRegisterValue(register), offset)
    }

    /**
     * @abstract
     *
     * @param {number | null} address
     * @param {number} offset
     * @returns {number | null}
     */
    getMemoryValue(address, offset = 0) {
        throw new Error("Not implemented")
    }

    /**
     *
     * @param {T} register
     * @returns {number | null}
     */
    getRegisterValue(register) {
        throw new Error("Not implemented")
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
            const registerValue = this.state.assertWideRegisterValue(md[1])
            if(!registerValue) {
                return null
            }
            return this.getMemoryValue(registerValue)
        } else {
            return this.assertRegisterValue(expression)
        }
    }

    /**
     * @abstract
     * @param {number} location
     * @param {number | null} n
     */
    storeMemoryValue(location, n) {
        throw new Error("Not implemented")
    }

    /**
     * @abstract
     * @param {T} register
     * @param {number | null} n
     */
    storeRegisterValue(register, n) {
        throw new Error("Not implemented")
    }

    /**
     *
     * @param {T} register
     * @param {import("./BinaryOperator.mjs").BinaryOperator} op
     * @param {number | null} value
     */
    updateRegisterValue(register, op, value) {
        this.storeRegisterValue(register, this.#opResult(op, this.getRegisterValue(register), value, false))
    }

    /**
     *
     * @param {T} register
     * @param {import("./BinaryOperator.mjs").BinaryOperator} op
     * @param {T} fromRegister
     */
    updateRegisterValueFromRegister(register, op, fromRegister) {
        this.storeRegisterValue(register, this.#opResult(op, this.getRegisterValue(register),
            this.getRegisterValue(fromRegister), register == fromRegister))
    }
}