import { AnyDecompiler } from "./AnyDecompiler.mjs"
import { AnyExpression } from "./AnyExpression.mjs"
import { BinaryOperator } from "./BinaryOperator.mjs"
import { AdHocParsingInstructionHandler } from "./InstructionHandler/AdHocParsingInstructionHandler.mjs"
import { hlR, rpR } from "./rpR.mjs"

/**
 *
 */
export class CodeDecompiler extends AnyDecompiler {
    /**
     * @protected
     * @readonly
     */
    dw

    /**
     * @readonly The point in memory at which the file is loaded
     */
    loadPoint

    /**
     *
     * @param {import("./DataWalker.mjs").DataWalker} dw
     * @param {number} loadPoint
     */
    constructor(dw, loadPoint) {
        super()
        this.dw = dw
        this.loadPoint = loadPoint
    }
}

export const bitR = {
    [0b01]: "BIT",
    [0b10]: "RES",
    [0b11]: "SET",
}

/**
 * @type {Record<number, BinaryOperator>}
 */
export const arOpR = {
    [0b000]: new BinaryOperator("ADD", (a, b) => AnyExpression.add8(a, b)),
    [0b001]: new BinaryOperator("ADC", (a, b) => AnyExpression.add8(a, b)),
    [0b010]: new BinaryOperator("SUB", (a, b) => AnyExpression.subtract(a, b), () => 0),
    [0b011]: new BinaryOperator("SBC", (a, b) => AnyExpression.subtract(a, b), () => 0),
    [0b100]: new BinaryOperator("AND", (a, b) => AnyExpression.and(a, b)),
    [0b101]: new BinaryOperator("XOR", (a, b) => AnyExpression.xor(a, b), () => 0),
    [0b110]: new BinaryOperator("OR", (a, b) => AnyExpression.or(a, b), v => v),
    [0b111]: new BinaryOperator("CP", (a) => a),
}

export const rsR = {
    [0b000]: "RCL",
    [0b001]: "RRC",
    [0b010]: "RL",
    [0b011]: "RR",
    [0b100]: "SLA",
    [0b101]: "SRA",
    // Note: no 110
    [0b111]: "SRL",
}

/**
 * This handles 16-bit adds
 *
 * @param {import("./BitView.mjs").BitView} nx
 * @param {import("./Z80Registers.d.mts").Z80Registers16b} reg
 */
export const addHlIxIy = (nx, reg) => {
    if(nx.b4 == 0b1001) {
        const r = nx.a2 == hlR ? reg : rpR[nx.a2]
        return new AdHocParsingInstructionHandler(`ADD ${reg}, ${r}`, (dw, context) => {
            const o = context.s16.getRegisterValue(reg)
            const v = context.s16.getRegisterValue(r)
            context.s16.storeRegisterValue(reg, AnyExpression.add16(o, v))
        })
    }
    return undefined
}