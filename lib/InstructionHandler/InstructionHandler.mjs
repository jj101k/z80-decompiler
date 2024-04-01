import { AnyDecompiler } from "../AnyDecompiler.mjs"

/**
 * @abstract
 * @template {import("../DecomposedInstruction/DecomposedInstruction.mjs").DecomposedInstruction} DI
 */
export class InstructionHandler extends AnyDecompiler {
    /**
     * @protected
     * @abstract
     * @param {import("../DataWalker.mjs").DataWalker} dw
     * @param {import("../DecompileContext.mjs").DecompileContext} context
     * @returns {DI | undefined | null}
     */
    get(dw, context) {
        throw new Error("Not implemented")
    }

    /**
     * @abstract
     * @param {import("../DataWalker.mjs").DataWalker} dw
     * @param {import("../DecompileContext.mjs").DecompileContext} context
     * @returns {import("../DecomposedInstruction/DecomposedInstruction.mjs").DecomposedInstruction | undefined | null}
     */
    resolve(dw, context) {
        return this.get(dw, context)
    }
}