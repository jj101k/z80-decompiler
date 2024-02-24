/**
 * @abstract
 */
export class OptExit {
    /**
     * @abstract
     * @type {number}
     * @readonly
     */
    // @ts-ignore
    exitCode

    /**
     * @readonly
     */
    message

    /**
     *
     * @param {string} message
     */
    constructor(message) {
        this.message = message
    }

    /**
     * Outputs the message only
     */
    output() {
        if(this.exitCode) {
            console.error(this.message)
        } else {
            console.log(this.message)
        }
    }

    /**
     * Outputs the message, then exits
     */
    outputAndExit() {
        this.output()
        process.exit(this.exitCode)
    }
}