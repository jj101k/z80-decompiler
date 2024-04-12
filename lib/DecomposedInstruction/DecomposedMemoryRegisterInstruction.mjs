import { DecomposedInstructionParsing } from "./DecomposedInstructionParsing.mjs"

/**
 *
 */
export class DecomposedMemoryRegisterInstruction extends DecomposedInstructionParsing {
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
            case "nn": return labels?.[v]?.replace(/^/, "&") ?? this.$addr(v)
            default: return super.numberToString(v, code, labels, point)
        }
    }
}