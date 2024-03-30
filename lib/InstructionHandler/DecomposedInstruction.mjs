import { AnyDecompiler } from "../AnyDecompiler.mjs"

/**
 *
 */
export class DecomposedInstruction extends AnyDecompiler {
    /**
     *
     */
    get uid() {
        return this.name
    }

    /**
     * @readonly
     */
    name

    /**
     *
     * @param {string} name
     */
    constructor(name) {
        super()
        this.name = name
    }

    /**
     *
     * @param {Record<number, string>} [labels]
     * @param {number} [point]
     * @returns
     */
    toString(labels = undefined, point = undefined) {
        return this.name
    }
}