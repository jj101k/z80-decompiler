import {DataWalker} from "./DataWalker.mjs"
import {AnyDecompiler} from "./AnyDecompiler.mjs"
import { hlR, rpR } from "./rpR.mjs"
import {InstructionHandler} from "./InstructionHandler/InstructionHandler.mjs"
import {DecomposedInstruction} from "./InstructionHandler/DecomposedInstruction.mjs"

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
     * @type {Record<number, InstructionHandler>}
     */
    get simpleOpcodes() {
        throw new Error("Not implemented")
    }

    /**
     * @readonly
     */
    loadPoint

    /**
     *
     * @param {DataWalker} dw
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

export const arOpR = {
    [0b000]: "ADD",
    [0b001]: "ADC",
    [0b010]: "SUB",
    [0b011]: "SBC",
    [0b100]: "AND",
    [0b101]: "XOR",
    [0b110]: "OR",
    [0b111]: "CP",
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