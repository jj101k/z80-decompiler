import { OptExit } from "./OptExit.mjs"

/**
 *
 */
export class OptError extends OptExit {
    /**
     *
     * @param {string} message
     * @param {number} exitCode
     */
    constructor(message, exitCode) {
        super(message)
        this.exitCode = exitCode
    }
}