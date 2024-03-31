import { MachineStateView } from "./MachineStateView.mjs"

/**
 * @extends {MachineStateView<import("./Z80Registers.mjs").Z80Registers8b>}
 */
export class MachineStateView8b extends MachineStateView {
    /**
     * @protected
     * @param {string} register
     * @throws
     * @returns {import("./UtilityTypes.mjs").anyValue | null}
     */
    assertRegisterValue(register) {
        return this.state.assertAtomicRegisterValue(register)
    }

    /**
     *
     * @param {import("./Z80Registers.mjs").Z80Registers8b} register
     */
    clearRegisterValue(register) {
        this.state.clearAtomicRegisterValue(register)
    }

    /**
     *
     * @param {number | null} address
     * @param {number} offset
     * @returns {import("./UtilityTypes.mjs").anyValue | null}
     */
    getMemoryValue(address, offset = 0) {
        return this.state.getMemoryBytes(address, 8 / 8, offset)
    }

    /**
     *
     * @param {import("./Z80Registers.mjs").Z80Registers8b} register
     * @returns {import("./UtilityTypes.mjs").anyValue | null}
     */
    getRegisterValue(register) {
        return this.state.getAtomicRegisterValue(register)
    }

    /**
     *
     * @param {number} location
     * @param {import("./UtilityTypes.mjs").anyValue | null} n
     */
    storeMemoryValue(location, n) {
        return this.state.storeMemoryBytes(location, n, 8 / 8)
    }

    /**
     *
     * @param {import("./Z80Registers.mjs").Z80Registers8b} register
     * @param {import("./UtilityTypes.mjs").anyValue | null} n
     */
    storeRegisterValue(register, n) {
        return this.state.storeAtomicRegisterValue(register, n)
    }
}