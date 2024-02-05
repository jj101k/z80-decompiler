//@ts-check

const { BitView } = require("./BitView")
const DataWalker = require("./DataWalker")

/**
 *
 */
class Decompiler {
    /**
     * @protected
     * @readonly
     */
    dw

    /**
     * @readonly
     */
    loadPoint

    /**
     *
     * @param {number} l
     * @param {number[]} ns
     * @returns
     */
    #data(l, ...ns) {
        const lo = l * 2 / 8
        return ns.map(n => n.toString(16).padStart(lo, "0")).join(" ")
    }

    /**
     * @protected
     * @param {number} n
     * @returns
     */
    register(n) {
        return registerRef[n]
    }

    /**
     *
     * @param {DataWalker} dw
     * @param {number} loadPoint
     */
    constructor(dw, loadPoint) {
        this.dw = dw
        this.loadPoint = loadPoint
    }

    /**
     *
     * @param {BitView} e
     * @param {string | null} [replaceHlIndirect]
     * @returns
     */
    cb(e, replaceHlIndirect = null) {
        if(e.pre == 0b00) {
            // Rotate / shift
            if(e.a3 != 0b110) {
                if(replaceHlIndirect) {
                    return `${rsR[e.a3]} (${replaceHlIndirect})`
                } else {
                    const r = this.register(e.b3)
                    return `${rsR[e.a3]} ${r}`
                }
            }
        } else {
            if(replaceHlIndirect) {
                if (e.b3 == hlIndirect) {
                    return `${bitR[e.pre]} ${e.a3} (${replaceHlIndirect})`
                }
            } else {
                const r = this.register(e.b3)
                return `${bitR[e.pre]} ${e.a3}, ${r}`
            }
        }
    }

    /**
     * @param {number} n
     * @returns
     */
    addr(n) {
        return this.#data(16, n)
    }

    /**
     *
     * @param {number[]} ns
     * @returns
     */
    u8(...ns) {
        return this.#data(8, ...ns)
    }

    /**
     *
     * @param {number[]} ns
     * @returns
     */
    u16(...ns) {
        return this.#data(16, ...ns)
    }

    /**
     *
     * @param {number} n
     * @returns
     */
    rel(n) {
        if (n >= 0) {
            return `+${n}`
        } else {
            return `${n}`
        }
    }
}

exports.Decompiler = Decompiler

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
const hlR = 0b10

const rpR = {
    [0b00]: "BC",
    [0b01]: "DE",
    [hlR]: "HL",
    [0b11]: "SP",
}
exports.rpR = rpR

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

/**
 *
 */
const hlIndirect = 0b110
exports.hlIndirect = hlIndirect

const registerRef = {
    [0b111]: "A",
    [0b000]: "B",
    [0b001]: "C",
    [0b010]: "D",
    [0b011]: "E",
    [0b100]: "F",
    [0b101]: "L",
    [hlIndirect]: "(HL)",
}

exports.registerRef = registerRef