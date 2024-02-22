const { AnyDecompiler } = require("../AnyDecompiler")
const DataWalker = require("../DataWalker")

/**
 *
 */
class DecomposedInstruction extends AnyDecompiler {
    /**
     *
     */
    get uid() {
        return this.name
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
     * @readonly
     */
    name
    /**
     *
     * @param {string} name
     * @param {DataWalker | undefined} dw
     * @param {number | undefined} startPoint
     */
    constructor(name, dw = undefined, startPoint = undefined) {
        super()
        this.name = name
        this.arguments = []
        if(dw) {
            for(const m of name.matchAll(/([a-z]+)/g)) {
                /**
                 * @type {number}
                 */
                let v
                switch(m[1]) {
                    case "a": {v = dw.uint16(); break}
                    case "d": {v = dw.int8(); break}
                    case "e": {v = dw.int8() - startPoint + dw.offset; break}
                    case "n": {v = dw.uint8(); break}
                    case "nn": {v = dw.uint16(); break}
                }
                this.arguments.push(v)
            }
        }
    }
    /**
     *
     * @param {Record<number, string>} [labels]
     * @param {number} point
     * @returns
     */
    toString(labels = undefined, point = undefined) {
        let i = 0
        return this.name.replace(/(\(nn\)|[a-z]+)/g, (a, $1) => this.numberToString(this.arguments[i++], $1, labels, point))
    }
}

exports.DecomposedInstruction = DecomposedInstruction