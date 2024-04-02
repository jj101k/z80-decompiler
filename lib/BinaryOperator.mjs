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
    resultOnSelf
    /**
     * Handle the operation
     */
    update
    /**
     *
     * @param {string} name
     * @param {(a: import("./UtilityTypes.mjs").anyValue | null, b: import("./UtilityTypes.mjs").anyValue | null) => import("./UtilityTypes.mjs").anyValue | null} [update]
     * @param {(a: import("./UtilityTypes.mjs").anyValue | null) =>
     * import("./UtilityTypes.mjs").anyValue | null} [resultOnSelf]
     */
    constructor(name, update, resultOnSelf) {
        this.name = name
        this.resultOnSelf = resultOnSelf
        this.update = update
    }
}
