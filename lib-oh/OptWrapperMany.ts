import { OptWrapper } from "./OptWrapper"

/**
 *
 */
export class OptWrapperMany<T> extends OptWrapper<T[]> {
    public readonly many = true

    get initialValue(): T[] {
        return []
    }

    /**
     *
     * @param alias
     * @param type
     * @param required
     */
    constructor(public readonly alias: string[], public readonly type: "boolean" | "number" | "string", public readonly required: boolean) {
        super(alias, type, required)
    }
}