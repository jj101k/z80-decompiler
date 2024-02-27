/**
 *
 */
export class OptWrapper<T> {
    /**
     *
     */
    public readonly many: boolean = false

    /**
     * This is mistyped for convenience
     */
    get initialValue(): T {
        return this.def as T
    }

    /**
     *
     * @param alias
     * @param type
     * @param required
     * @param def
     */
    constructor(public readonly alias: string[], public readonly type: "boolean" | "number" | "string", public readonly required: boolean, public readonly def?: T) {
    }

    /**
     *
     * @param name
     * @param o
     * @returns
     */
    get(name: string, o: Record<string, any>): T {
        return o[name]
    }
}