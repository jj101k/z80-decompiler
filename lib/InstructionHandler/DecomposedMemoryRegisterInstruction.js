const { DecomposedInstruction } = require("./DecomposedInstruction")

/**
 *
 */
class DecomposedMemoryRegisterInstruction extends DecomposedInstruction {
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
            case "nn": return labels?.[v] ?? this.addr(v)
            default: return super.numberToString(v, code, labels, point)
        }
    }
}

exports.DecomposedMemoryRegisterInstruction = DecomposedMemoryRegisterInstruction