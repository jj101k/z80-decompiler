import { OptHelpExit } from "./OptHelpExit"
import { OptError } from "./OptError"
import { OptExit } from "./OptExit"
import { LongOption } from "./LongOption"
import { ShortOptions } from "./ShortOptions"
import { AbortProcessingSymbol } from "./AbortProcessingSymbol"
import { LiteralArgument } from "./LiteralArgument"

/**
 *
 */
export type F<T> = ((name: string, o: Record<string, any>) => T) & {alias: string[], def?: any, many: boolean, required: boolean, type: string}

/**
 *
 */
export class OptHandler<T extends Record<string, F<any>>> {
    /**
     *
     */
    private extendedOptions
    /**
     *
     */
    private options

    /**
     *
     * @param arg
     * @returns
     */
    private parseArg(arg: string) {
        let md: RegExpMatchArray | null
        if(md = arg.match(/^--([\w-]+)(=(.*))?/)) {
            // Long opt.
            const [name, value] = [md[1], md[2] ?? null]
            return new LongOption(name, value, arg)
        } else if(md = arg.match(/^-(\w.*)/)) {
            // Short opts.
            const shortOpts = md[1]
            return new ShortOptions(shortOpts, arg)
        } else if(arg == "--") {
            // Stop processing
            return new AbortProcessingSymbol(arg)
        } else {
            return new LiteralArgument(arg)
        }
    }

    /**
     *
     * @param k eg. "getAll"
     * @returns eg. "--get-all"
     */
    private toCliArg(k: string): string {
        return "--" + k.replace(/(?<=.)([\p{Lu}]+[\d_\p{Ll}]*)/gu, (a, $1) => `-${$1.toLowerCase()}`)
    }

    /**
     * @readonly
     */
    name

    /**
     *
     */
    get helpMessage() {
        const {positional, positionalOptional, positionalVar} = this.extendedOptions

        const argComponents = Object.entries(this.options).sort(([a, ac], [b, bc]) => (+!!ac.required - +!!bc.required) || a.localeCompare(b)).map(([s, config]) => {
            let o: string
            const cliArg = this.toCliArg(s)
            o = [
                ...config.alias.map(a => `-${a}`),
                cliArg
            ].join("|")
            if (config.type != "boolean") {
                if (config.def) {
                    o += ` <${config.type} = ${config.def}>`
                } else {
                    o += ` <${config.type}>`
                }
            }
            if (config.required) {
                return config.many ? `${o} [${o}]...` : o
            } else {
                return config.many ? `[${o}]...` : `[${o}]`
            }
        })
        const components = [
            this.name,
            ...argComponents,
            ...(positional ?? []).map(p => `<${p}>`),
            ...(positionalOptional ?? []).map(p => `[<${p}>]`),
        ]
        if(positionalVar) {
            components.push(`[<${positionalVar}>]...`)
        }
        return `Usage: ${components.join(" ")}`
    }

    /**
     *
     * @param options
     * @param extendedOptions
     * @param name
     */
    constructor(options: T, extendedOptions: {positional?: string[], positionalOptional?: string[], positionalVar?: string, help?: string}, name: string) {
        this.extendedOptions = extendedOptions
        this.name = name

        this.options = options
    }
    /**
     *
     * @param argv
     * @returns
     */
    fromArgv(argv: string[]): {[k in keyof T]: ReturnType<T[k]>} {
        return this.fromProgramArgs(argv.slice(2))
    }

    /**
     *
     * @returns
     */
    fromArgvOrExit() {
        try {
            return this.fromArgv(process.argv)
        } catch(e) {
            if(e instanceof OptExit) {
                e.outputAndExit()
            }
            throw e
        }
    }

    /**
     *
     * @param args
     * @returns
     */
    fromProgramArgs(args: string[]): {[k in keyof T]: ReturnType<T[k]>} {
        const canonicalNameOf: Record<string, string> = {}
        const knownShortOpts: Record<string, F<any>> = {}
        for(const [k, v] of Object.entries(this.options)) {
            for(const a of v.alias) {
                knownShortOpts[a] = v
                canonicalNameOf[a] = k
            }
        }

        const opts: Record<string, any> = {}
        const positional: string[] = []
        const mArgs = args.slice()

        const cNames = Object.fromEntries(
            Object.keys(this.options).map(k => [this.toCliArg(k), k])
        )

        let arg: string | undefined
        while((arg = mArgs.shift()) !== undefined) {
            const parsed = this.parseArg(arg)
            if(parsed instanceof LongOption) {
                // Long opt.
                const cName = cNames[parsed.key]
                const opt = this.options[cName]
                if(!opt) {
                    throw new OptError(`Error: Unrecognised long option ${parsed.key}`, 5)
                }
                if(opt.type == "boolean") {
                    if(parsed.value !== null) {
                        throw new OptError(`Error: Argument supplied for boolean option ${parsed.key}`, 6)
                    }
                    opts[cName] = true
                } else if(parsed.value !== null) {
                    opts[cName] = parsed.value
                } else {
                    const value = mArgs.shift()
                    if(value === undefined) {
                        throw new OptError(`Error: Option ${parsed.key} required an argument`, 7)
                    }
                    opts[cName] = value
                }
            } else if(parsed instanceof ShortOptions) {
                // Short opts.
                let optionCode: string | undefined
                while(optionCode = parsed.next()) {
                    const opt = knownShortOpts[optionCode]
                    if(!opt) {
                        throw new OptError(`Error: Unrecognised short option ${parsed.prevOption} in ${parsed.literalArgument}`, 3)
                    }
                    const cName = canonicalNameOf[optionCode]
                    if(opt.type == "boolean") {
                        opts[cName] = true
                    } else {
                        const value = parsed.rest
                        if(value.length) {
                            opts[cName] = value
                        } else {
                            const value = mArgs.shift()
                            if(value === undefined) {
                                throw new OptError(`Error: Option ${parsed.prevOption} required an argument`, 7)
                            }
                            opts[cName] = value
                        }
                        break
                    }
                }
            } else if(parsed instanceof AbortProcessingSymbol) {
                // Stop processing
                positional.push(...mArgs)
                break
            } else {
                positional.push(parsed.literalArgument)
            }
        }

        const helpOption = this.extendedOptions.help
        if(helpOption && opts[helpOption]) {
            throw new OptHelpExit(this.helpMessage)
        }
        const positionalMin = (this.extendedOptions.positional?.length ?? 0)
        const positionalMax = this.extendedOptions.positionalVar ? Infinity :
            (positionalMin + (this.extendedOptions.positionalOptional?.length ?? 0))

        if(positional.length < positionalMin) {
            throw new OptError(`Too few arguments (${positional.length} < ${positionalMin}).\n${this.helpMessage}`, 1)
        }
        if(positional.length > positionalMax) {
            throw new OptError(`Too many arguments (${positional.length} > ${positionalMax}).\n${this.helpMessage}`, 2)
        }

        return Object.fromEntries([
            ...Object.entries(this.options).map(([k, o]) => {
                const v = o(k, opts)
                if(o.many) {
                    if(Array.isArray(v)) {
                        if(o.type == "number") {
                            return [k, v.map(vi => +vi)]
                        } else {
                            // string is native.
                            return [k, v]
                        }
                    } else {
                        if(v === undefined) {
                            return [k, []]
                        } else {
                            if(o.type == "number") {
                                return [k, [+v]]
                            } else {
                                // string is native
                                return [k, [v]]
                            }
                        }
                    }
                } else {
                    if(o.type == "number") {
                        return [k, +v]
                    } else {
                        // boolean, string are native.
                        return [k, v]
                    }
                }
            }),
            ["_", positional],
        ])
    }

    /**
     *
     * @param alias
     * @param type
     * @returns Value extractor (optional, many)
     */
    static om(alias: string[], type: "number"): F<number[]>
    static om(alias: string[], type: "string"): F<string[]>
    static om(alias: string[], type: "number" | "string"): F<number[] | string[]> {
        /**
         *
         * @param name
         * @param o
         * @returns
         */
        const h = (name: string, o: Record<string, any>) => o[name]
        h.alias = alias
        h.many = true
        h.required = false
        h.type = type
        return h
    }

    /**
     *
     * @param alias
     * @param type
     * @returns Value extractor (optional, single)
     */
    static os(alias: string[], type: "boolean"): F<boolean>
    static os(alias: string[], type: "number"): F<number | undefined>
    static os(alias: string[], type: "number", def: number): F<number>
    static os(alias: string[], type: "string"): F<string | undefined>
    static os(alias: string[], type: "string", def: string): F<string>
    static os(alias: string[], type: "boolean" | "number" | "string", def?: number | string): F<boolean | number | string | undefined> {
        /**
         *
         * @param name
         * @param o
         * @returns
         */
        const h = (name: string, o: Record<string, any>) => o[name]
        h.alias = alias
        h.def = def
        h.many = false
        h.required = false
        h.type = type
        return h
    }

    /**
     *
     * @param alias
     * @param type
     * @returns Value extractor (required, many)
     */
    static rm(alias: string[], type: "number"): F<number[]>
    static rm(alias: string[], type: "string"): F<string[]>
    static rm(alias: string[], type: "number" | "string"): F<number[] | string[]> {
        /**
         *
         * @param name
         * @param o
         * @returns
         */
        const h = (name: string, o: Record<string, any>) => o[name]
        h.alias = alias
        h.many = true
        h.required = true
        h.type = type
        return h
    }

    /**
     *
     * @param alias
     * @param type
     * @returns Value extractor (required, single)
     */
    static rs(alias: string[], type: "number"): F<number>
    static rs(alias: string[], type: "string"): F<string>
    static rs(alias: string[], type: "number" | "string"): F<number | string> {
        /**
         *
         * @param name
         * @param o
         * @returns
         */
        const h = (name: string, o: Record<string, any>) => o[name]
        h.alias = alias
        h.many = false
        h.required = true
        h.type = type
        return h
    }
}