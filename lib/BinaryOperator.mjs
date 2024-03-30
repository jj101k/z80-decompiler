/**
 *
 */
export class BinaryOperator {
    /**
     *
     */
    name
    /**
     * The static result when operating on self, if applicable
     */
    staticResultOnSelf
    /**
     * Handle the operation
     */
    update
    /**
     *
     * @param {string} name
     * @param {(a: number, b: number) => number} [update]
     * @param {number} [staticResultOnSelf]
     */
    constructor(name, update, staticResultOnSelf) {
        this.name = name
        this.staticResultOnSelf = staticResultOnSelf
        this.update = update
    }
}
