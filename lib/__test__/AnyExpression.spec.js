import { AnyExpression } from "../AnyExpression.mjs"
import { MachineState } from "../MachineState.mjs"
import { UnknownExpressionValue } from "../UnknownExpressionValue.mjs"
import { Z80Registers16b } from "../Z80Registers.mjs"

describe("Expression tests", () => {
    it("correctly collapses common add conditions", () => {
        const ms = new MachineState()
        const a = ms.getWideRegisterValue(Z80Registers16b.HL)
        const b = ms.getWideRegisterValue(Z80Registers16b.HL)
        const aPa = AnyExpression.add(a, b)
        expect(aPa).toBeInstanceOf(UnknownExpressionValue)
        expect(aPa.op).toEqual("*")
        const aPaPa = AnyExpression.add(aPa, a)
        expect(aPaPa).toBeInstanceOf(UnknownExpressionValue)
        expect(aPaPa.op).toEqual("*")
        const aPaPa2 = AnyExpression.add(a, aPa)
        expect(aPaPa2).toBeInstanceOf(UnknownExpressionValue)
        expect(aPaPa2.op).toEqual("*")
    })
})