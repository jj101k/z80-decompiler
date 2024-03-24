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
     * @readonly The point in memory at which the file is loaded
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

/**
 * @type {{name: string, update?: (a: number, b: number) => number}[]}
 */
export const arOpR = {
    [0b000]: {name: "ADD", update: (a, b) => a & b},
    [0b001]: {name: "ADC"},
    [0b010]: {name: "SUB", update: (a, b) => (256 + a - b) & 0xff},
    [0b011]: {name: "SBC"},
    [0b100]: {name: "AND", update: (a, b) => a & b},
    [0b101]: {name: "XOR", update: (a, b) => a ^ b},
    [0b110]: {name: "OR", update: (a, b) => a | b},
    [0b111]: {name: "CP"},
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