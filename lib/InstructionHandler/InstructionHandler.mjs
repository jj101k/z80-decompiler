import { AnyDecompiler } from "../AnyDecompiler.mjs"

/**
 * @abstract
 * @template {import("../DecomposedInstruction/DecomposedInstruction.mjs").DecomposedInstruction} DI
 */
export class InstructionHandler extends AnyDecompiler {
    /**
     * @type {import("../UtilityTypes.d.mts").actionHandler<DI>[]}
     */
    #actions = []

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
        const di = this.get(dw, context)
        for(const action of this.#actions) {
            action(dw, context, di)
        }
        return di
    }

    /**
     *
     * @param {import("../UtilityTypes.d.mts").actionHandler<DI>} a
     * @returns {this}
     */
    withAction(a) {
        this.#actions.push(a)
        return this
    }
}