import { UnknownValue } from "./UnknownValue.mjs"

/**
 *
 */
export class UnknownExpressionValue extends UnknownValue {
    /**
     *
     */
    a
    /**
     *
     */
    b
    /**
     *
     */
    op
    /**
     *
     * @param {UnknownValue | number} a
     * @param {UnknownValue | number} b
     * @param {"+" | "-" | "&" | "^" | "|" | "*"} op
     */
    constructor(a, b, op) {
        super()
        this.a = a
        this.b = b
        this.op = op
    }

    /**
     *
     * @returns
     */
    toString() {
        return `(${this.a} ${this.op} ${this.b})`
    }
}