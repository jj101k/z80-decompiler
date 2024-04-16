import { MachineState } from "../MachineState.mjs"
import { UnknownValue } from "../UnknownValue.mjs"
import { Z80Registers16b } from "../Z80Registers.mjs"

describe("Machine state tests", () => {
    it("has an HL value initially", () => {
        const ms = new MachineState()
        expect(ms.getWideRegisterValue(Z80Registers16b.HL)).toBeInstanceOf(UnknownValue)
    })
    it("can track stores to unknown locations", () => {
        const ms = new MachineState()
        const hl = ms.getWideRegisterValue(Z80Registers16b.HL)
        ms.storeMemoryBytes(hl, 1, 1)
        const result = ms.getMemoryBytes(hl, 1)
        expect(result).toEqual(1)
    })
})