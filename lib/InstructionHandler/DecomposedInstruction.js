const { AnyDecompiler } = require("../AnyDecompiler")

/**
 *
 */
class DecomposedInstruction extends AnyDecompiler {
    /**
     *
     */
    #arguments
    /**
     * @readonly
     */
    name
    /**
     *
     * @param {string} name
     * @param  {...number} args
     */
    constructor(name, ...args) {
        super()
        this.name = name
        this.#arguments = args
    }
    /**
     *
     * @param {Record<number, string>} [labels]
     * @param {number} point
     * @returns
     */
    toString(labels = undefined, point = undefined) {
        let i = -1
        return this.name.replace(/([a-z]+)/g, (a, $1) => {
            i++
            const v = this.#arguments[i]
            switch($1) {
                case "a": return labels?.[v] ?? this.addr(v)
                case "d": return this.rel(v)
                case "e": {
                    if(point !== undefined) {
                        return labels?.[point + v + 2] ?? "$" + this.rel(v + 2)
                    } else {
                        return "$" + this.rel(v + 2)
                    }
                }
                case "n": return this.u8(v)
                case "nn": return this.u16(v)
                default: return "" + v
            }
        })
    }
}

exports.DecomposedInstruction = DecomposedInstruction