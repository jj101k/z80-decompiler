import { DecomposedInstruction } from "./DecomposedInstruction.mjs"

/**
 *
 */
export class DecomposedInstructionParsing extends DecomposedInstruction {
    /**
     * @protected
     * @param {string} code
     * @param {import("../DataWalker.mjs").DataWalker} dw
     * @param {number} startPoint
     * @returns {number | undefined}
     */
    extractNumber(code, dw, startPoint) {
        switch(code) {
            case "a": return dw.uint16()
            case "d": return dw.int8()
            case "e": return dw.int8() - startPoint + dw.offset
            case "n": return dw.uint8()
            case "nn": return dw.uint16()
            default:
                return undefined
        }
    }
    /**
     * @protected
     *
     * @param {number} v
     * @param {string} code
     * @param {Record<number, string> | undefined} labels
     * @param {number | undefined} point
     * @returns
     */
    numberToString(v, code, labels = undefined, point = undefined) {
        switch(code) {
            case "+d": return this.rel(v)
            case "a": return labels?.[v] ?? this.addr(v)
            case "d": return this.rel(v)
            case "e": {
                if(point !== undefined) {
                    return labels?.[point + v] ?? "$" + this.rel(v)
                } else {
                    return "$" + this.rel(v)
                }
            }
            case "n": return this.u8(v)
            case "nn": return this.u16(v)
            case "(nn)": return labels?.[v] ?? `(${this.addr(v)})`
            default: return "" + v
        }
    }
    /**
     * @readonly
     */
    arguments
    /**
     *
     * @param {string} name
     * @param {import("../DataWalker.mjs").DataWalker} dw
     * @param {number} startPoint
     */
    constructor(name, dw, startPoint) {
        super(name)
        this.arguments = []
        for(const m of name.matchAll(/([a-z]+)/g)) {
            const v = this.extractNumber(m[1], dw, startPoint)
            if(v === undefined) {
                throw new Error(`Internal error: Unknown type code ${m[1]}`)
            }
            this.arguments.push(v)
        }
    }
    /**
     *
     * @param {Record<number, string>} [labels]
     * @param {number} [point]
     * @returns
     */
    toString(labels = undefined, point = undefined) {
        let i = 0
        return this.name.replace(/(\(nn\)|[+]d|[a-z]+)/g, (a, $1) => this.numberToString(this.arguments[i++], $1, labels, point))
    }
}