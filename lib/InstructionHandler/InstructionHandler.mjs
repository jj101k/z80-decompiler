import { AnyDecompiler } from "../AnyDecompiler.mjs"

/**
 * @typedef {(dw: import("../DataWalker.mjs").DataWalker, context: import("../DecompileContext.mjs").DecompileContext) => any} actionHandler
 */

/**
 * @abstract
 */
export class InstructionHandler extends AnyDecompiler {
    /**
     * @type {actionHandler[]}
     */
    #actions = []

    /**
     * @protected
     * @abstract
     * @param {import("../DataWalker.mjs").DataWalker} dw
     * @param {import("../DecompileContext.mjs").DecompileContext} context
     * @returns {import("./DecomposedInstruction.mjs").DecomposedInstruction | undefined | null}
     */
    get(dw, context) {
        throw new Error("Not implemented")
    }

    /**
     * @abstract
     * @param {import("../DataWalker.mjs").DataWalker} dw
     * @param {import("../DecompileContext.mjs").DecompileContext} context
     * @returns {import("./DecomposedInstruction.mjs").DecomposedInstruction | undefined | null}
     */
    resolve(dw, context) {
        const di = this.get(dw, context)
        for(const action of this.#actions) {
            action(dw, context)
        }
        return di
    }

    /**
     *
     * @param {actionHandler} a
     * @returns {this}
     */
    withAction(a) {
        this.#actions.push(a)
        return this
    }
}