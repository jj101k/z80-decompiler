import { MachineState } from "../MachineState.mjs"
import { MachineStateView8b } from "../MachineStateView8b.mjs"
import { Z80Registers8b } from "../Z80Registers.mjs"

describe("Machine state view tests", () => {
    it("does not clobber a peer register when the compound register becomes non-simple", () => {
        const ms = new MachineState
        const view = new MachineStateView8b(ms)
        view.storeRegisterValue(Z80Registers8b.C, 0x7)
        expect(view.getRegisterValue(Z80Registers8b.B)).toBeTruthy()
    })
})