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
     */
    get isAtomic() {
        return false
    }

    /**
     *
     * @param {UnknownValue | number} a
     * @param {UnknownValue | number} b
     * @param {"+" | "-" | "&" | "^" | "|" | "*" | "/"} op
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
     * @returns {string}
     */
    toString(labels = {}) {
        /**
         *
         * @param {number | UnknownValue} v
         * @param {boolean} onLeft
         */
        const canCombine = (v, onLeft) => {
            if(typeof v == "number" || v.isAtomic) {
                return true
            }
            if(!(v instanceof UnknownExpressionValue)) {
                return false
            }
            switch(this.op) {
                case "-":
                    if(v.op == "*" || v.op == "/") {
                        return true
                    } else if(onLeft && (v.op == "-" || v.op == "+")) {
                        return true
                    }
                    return false
                case "+":
                    return (v.op == "*" || v.op == "/" || v.op == "+" || v.op == "-")
                case "/":
                    return onLeft && (v.op == "*" || v.op == "/")
                default:
                    return false
            }
        }
        let aLabel = UnknownValue.str(this.a, labels)
        if(!canCombine(this.a, true)) {
            aLabel = `(${aLabel})`
        }
        let bLabel = UnknownValue.str(this.b, labels)
        if(!canCombine(this.b, false)) {
            bLabel = `(${bLabel})`
        }
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
        } else if(op == "/") {
            if((typeof this.b == "number") && (Math.log2(this.b) % 1 == 0)) {
                op = ">>"
                bLabel = "" + Math.log2(this.b)
            } else if((typeof this.a == "number") && (Math.log2(this.a) % 1 == 0)) {
                op = ">>"
                aLabel = bLabel
                bLabel = "" + Math.log2(this.a)
            }
        }
        return `${aLabel} ${op} ${bLabel}`
    }
}