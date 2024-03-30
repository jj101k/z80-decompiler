import { MachineStateView } from "./MachineStateView.mjs"

/**
 * @extends {MachineStateView<import("./Z80Registers.mjs").Z80Registers8B>}
 */
export class MachineStateView8b extends MachineStateView {
    /**
     * @protected
     * @param {string} register
     * @throws
     * @returns {number | null}
     */
    assertRegisterValue(register) {
        return this.state.assertAtomicRegisterValue(register)
    }

    /**
     *
     * @param {import("./Z80Registers.mjs").Z80Registers8B} register
     */
    clearRegisterValue(register) {
        this.state.clearAtomicRegisterValue(register)
    }

    /**
     *
     * @param {number | null} address
     * @param {number} offset
     * @returns {number | null}
     */
    getMemoryValue(address, offset = 0) {
        return this.state.getMemoryBytes(address, 1, offset)
    }

    /**
     *
     * @param {import("./Z80Registers.mjs").Z80Registers8B} register
     * @returns {number | null}
     */
    getRegisterValue(register) {
        return this.state.getAtomicRegisterValue(register)
    }

    /**
     *
     * @param {number} location
     * @param {number | null} n
     */
    storeMemoryValue(location, n) {
        return this.state.storeMemoryBytes(location, n, 1)
    }

    /**
     *
     * @param {import("./Z80Registers.mjs").Z80Registers8B} register
     * @param {number | null} n
     */
    storeRegisterValue(register, n) {
        return this.state.storeAtomicRegisterValue(register, n)
    }
}