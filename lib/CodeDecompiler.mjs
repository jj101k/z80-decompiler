import { AnyDecompiler } from "./AnyDecompiler.mjs"
import { BinaryOperator } from "./BinaryOperator.mjs"
import { DecomposedInstruction } from "./DecomposedInstruction/DecomposedInstruction.mjs"
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
     * These don't require further decoding but may take args
     *
     * @abstract
     * @protected
     * @readonly
     * @type {Record<number, import("./InstructionHandler/InstructionHandler.mjs").InstructionHandler>}
     */
    get simpleOpcodes() {
        throw new Error("Not implemented")
    }

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
    [0b000]: new BinaryOperator("ADD", (a, b) => (a + b) & 0xff),
    [0b001]: new BinaryOperator("ADC", (a, b) => (a + b) & 0xff),
    [0b010]: new BinaryOperator("SUB", (a, b) => (256 + a - b) & 0xff, 0),
    [0b011]: new BinaryOperator("SBC", (a, b) => (256 + a - b) & 0xff, 0),
    [0b100]: new BinaryOperator("AND", (a, b) => a & b),
    [0b101]: new BinaryOperator("XOR", (a, b) => a ^ b, 0),
    [0b110]: new BinaryOperator("OR", (a, b) => a | b),
    [0b111]: new BinaryOperator("CP"),
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
 *
 * @param {import("./BitView.mjs").BitView} nx
 * @param {string} reg
 */
export const addHlIxIy = (nx, reg) => {
    if(nx.b4 == 0b1001) {
        const r = nx.a2 == hlR ? reg : rpR[nx.a2]
        return new DecomposedInstruction(`ADD ${reg}, ${r}`)
    }
    return undefined
}