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
     * @param {Record<number, string>} labels
     * @param {boolean} [bracketExpressions]
     * @returns {string}
     */
    toString(labels = {}, bracketExpressions = false) {
        let aLabel = UnknownValue.str(this.a, labels, !bracketExpressions)
        let bLabel = UnknownValue.str(this.b, labels, !bracketExpressions)
        /**
         * @type {string}
         */
        let op = this.op

        if(op == "*") {
            if((typeof this.b == "number") && (Math.log2(this.b) % 1 == 0)) {
                op = "<<"
                bLabel = "" + Math.log2(this.b)
            } else if((typeof this.a == "number") && (Math.log2(this.a) % 1 == 0)) {
                op = "<<"
                aLabel = bLabel
                bLabel = "" + Math.log2(this.a)
            }
        }
        const expr = `${aLabel} ${op} ${bLabel}`
        if(bracketExpressions && this.op != "*") {
            return `(${expr})`
        } else {
            return expr
        }
    }
}