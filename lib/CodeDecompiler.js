const DataWalker = require("./DataWalker")
const {AnyDecompiler} = require("./AnyDecompiler")
const { hlR, rpR } = require("./rpR")
const { InstructionHandler } = require("./InstructionHandler/InstructionHandler")

/**
 *
 */
class CodeDecompiler extends AnyDecompiler {
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

exports.CodeDecompiler = CodeDecompiler

const bitR = {
    [0b01]: "BIT",
    [0b10]: "RES",
    [0b11]: "SET",
}
exports.bitR = bitR

const arOpR = {
    [0b000]: "ADD",
    [0b001]: "ADC",
    [0b010]: "SUB",
    [0b011]: "SBC",
    [0b100]: "AND",
    [0b101]: "XOR",
    [0b110]: "OR",
    [0b111]: "CP",
}
exports.arOpR = arOpR


const rsR = {
    [0b000]: "RCL",
    [0b001]: "RRC",
    [0b010]: "RL",
    [0b011]: "RR",
    [0b100]: "SLA",
    [0b101]: "SRA",
    // Note: no 110
    [0b111]: "SRL",
}
exports.rsR = rsR

/**
 *
 * @param {import("./BitView").BitView} nx
 * @param {string} reg
 */
const addHlIxIy = (nx, reg) => {
    if(nx.b4 == 0b1001) {
        const r = nx.a2 == hlR ? reg : rpR[nx.a2]
        return `ADD ${r}`
    }
    return undefined
}
exports.addHlIxIy = addHlIxIy