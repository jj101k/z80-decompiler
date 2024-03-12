import { AnyDecompiler } from "../AnyDecompiler.mjs"
import { DataWalker } from "../DataWalker.mjs"
import { DecompileWalker } from "../DecompileWalker.mjs"
import { DecomposedInstruction } from "./DecomposedInstruction.mjs"

/**
 * @typedef {(dw: DataWalker, context: DecompileWalker) => any} actionHandler
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
     * @param {DataWalker} dw
     * @param {DecompileWalker} context
     * @returns {DecomposedInstruction | undefined | null}
     */
    get(dw, context) {
        throw new Error("Not implemented")
    }

    /**
     * @abstract
     * @param {DataWalker} dw
     * @param {DecompileWalker} context
     * @returns {DecomposedInstruction | undefined | null}
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