import { MachineState } from "../MachineState.mjs"
import { UnknownValue } from "../UnknownValue.mjs"
import { Z80Registers16b } from "../Z80Registers.mjs"

describe("Machine state tests", () => {
    it("has an HL value initially", () => {
        const ms = new MachineState()
        expect(ms.getWideRegisterValue(Z80Registers16b.HL)).toBeInstanceOf(UnknownValue)
    })
})