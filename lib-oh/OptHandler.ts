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
     */
    private get optionConfig() {
        const options = this.options
        return {
            boolean: Object.entries(options).filter(([, c]) => c.type == "boolean").map(([k]) => this.convert(k)),
            string: Object.entries(options).filter(([, c]) => c.type == "string").map(([k]) => this.convert(k)),
            alias: Object.fromEntries(
                Object.entries(options).filter(([, c]) => c.alias.length).map(([k, c]) => [this.convert(k), c.alias])
            ),
            default: Object.fromEntries(
                Object.entries(options).filter(([, c]) => c.def !== undefined).map(([k, c]) => [this.convert(k), c.def])
            ),
        }
    }

    /**
     *
     * @param s
     * @returns
     */
    private convert(s: string) {
        return s.replace(/([A-Z]+)/g, (_, $1) => "-" + $1.toLowerCase())
    }

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
     * @readonly
     */
    name

    /**
     *
     */
    get helpMessage() {
        type f = {alias: string[], default?: string, hint: string | undefined, many: boolean, required: boolean}

        const {positional, positionalOptional, positionalVar} = this.extendedOptions

        const numbers = [...Object.entries(this.options).filter(([, c]) => c.type == "number").map(([k]) => k)]
        const requiredKeys = [...Object.entries(this.options).filter(([, c]) => c.required).map(([k]) => k)]
        const manyKeys = [...Object.entries(this.options).filter(([, c]) => c.many).map(([k]) => k)]

        const optionConfig = this.optionConfig

        const options: Record<string, f> = {}

        const aliases: Record<string, string[]> = {}

        const canonicalNameOf: Record<string, string> = {}
        for (const [long, short] of Object.entries(optionConfig.alias)) {
            const shortA = Array.isArray(short) ? short : [short]
            for (const s of shortA) {
                canonicalNameOf[s] = long
            }
            canonicalNameOf[long] = long
            aliases[long] = shortA
        }

        /**
         *
         * @param k
         * @param hint
         */
        const addOption = (k: string, hint?: string) => {
            if(!canonicalNameOf[k]) {
                canonicalNameOf[k] = k
                aliases[k] = []
            }
            const canonicalName = canonicalNameOf[k]
            const allNames = [canonicalName, ...aliases[k]]

            const c: f = {
                alias: aliases[canonicalName],
                hint: numbers.includes(canonicalName) ? "number" : hint,
                many: manyKeys.includes(canonicalName),
                required: requiredKeys.includes(canonicalName),
            }
            for(const n of allNames) {
                if (n in optionConfig.default) {
                    c.default = optionConfig.default[n]
                }
            }

            options[canonicalName] = c
        }
        for (const k of optionConfig.boolean) {
            addOption(k)
        }
        for (const k of optionConfig.string) {
            addOption(k, "string")
        }

        const argComponents = Object.entries(options).sort(([a, ac], [b, bc]) => (+!!ac.required - +!!bc.required) || a.localeCompare(b)).map(([s, config]) => {
            let o: string
            if (config.alias) {
                o = [
                    ...config.alias.map(a => `-${a}`),
                    `--${s}`
                ].join("|")
            } else {
                o = `-${s}`
            }
            if (config.hint) {
                if (config.default) {
                    o += ` <${config.hint} = ${config.default}>`
                } else {
                    o += ` <${config.hint}>`
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

        let arg: string | undefined
        while((arg = mArgs.shift()) !== undefined) {
            const parsed = this.parseArg(arg)
            if(parsed instanceof LongOption) {
                // Long opt.
                const {name, value} = parsed
                const opt = this.options[name]
                if(!opt) {
                    throw new OptError(`Error: Unrecognised long option ${parsed.key}`, 5)
                }
                if(opt.type == "boolean") {
                    if(value !== null) {
                        throw new OptError(`Error: Argument supplied for boolean option ${parsed.key}`, 6)
                    }
                    opts[name] = true
                } else if(value !== null) {
                    opts[name] = value
                } else {
                    const value = mArgs.shift()
                    if(value === undefined) {
                        throw new OptError(`Error: Option ${parsed.key} required an argument`, 7)
                    }
                    opts[name] = value
                }
            } else if(parsed instanceof ShortOptions) {
                // Short opts.
                let optionCode: string | undefined
                while(optionCode = parsed.next()) {
                    const opt = knownShortOpts[optionCode]
                    if(!opt) {
                        throw new OptError(`Error: Unrecognised short option ${parsed.prevOption} in ${parsed.literalArgument}`, 3)
                    }
                    const name = canonicalNameOf[optionCode]
                    if(opt.type == "boolean") {
                        opts[name] = true
                    } else {
                        const value = parsed.rest
                        if(value.length) {
                            opts[name] = value
                        } else {
                            const value = mArgs.shift()
                            if(value === undefined) {
                                throw new OptError(`Error: Option ${parsed.prevOption} required an argument`, 7)
                            }
                            opts[name] = value
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