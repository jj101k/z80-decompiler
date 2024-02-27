import { OptHelpExit } from "./OptHelpExit"
import { OptError } from "./OptError"
import { OptExit } from "./OptExit"
import { LongOption } from "./LongOption"
import { ShortOptions } from "./ShortOptions"
import { AbortProcessingSymbol } from "./AbortProcessingSymbol"
import { LiteralArgument } from "./LiteralArgument"
import { OptWrapperMany } from "./OptWrapperMany"
import { OptWrapper } from "./OptWrapper"

/**
 *
 */
export class OptHandler<T extends Record<string, OptWrapper<any>>, P extends Record<string, OptWrapper<any>>> {
    /**
     *
     */
    private helpOption?: string
    /**
     *
     */
    private options: T

    /**
     *
     */
    private positional: P

    /**
     *
     * @param key
     * @param opt
     * @param getExplicitValue
     * @param value
     * @returns
     */
    private getArgValue(key: string, opt: OptWrapper<any>, getExplicitValue: () => string | undefined, value?: string) {
        /**
         *
         * @returns
         */
        const getExplicitValueOrThrow = () => {
            const value = getExplicitValue()
            if (value === undefined) {
                throw new OptError(`Error: Option ${key} required an argument`, 7)
            }
            return value
        }
        switch (opt.type) {
            case "boolean":
                if (value !== undefined) {
                    throw new OptError(`Error: Argument supplied for boolean option ${key}`, 6)
                }
                return true
            case "number": {
                const v = value ?? getExplicitValueOrThrow()
                if (Number.isNaN(v)) {
                    throw new OptError(`Error: Argument must be numeric for ${key}`, 6)
                }
                return +v
            }
            case "string":
                return value ?? getExplicitValueOrThrow()
        }
    }

    /**
     *
     * @param key
     * @param opt
     * @param value
     * @returns
     */
    private getPositionArgValue(key: string, opt: OptWrapper<any>, value: string) {
        switch (opt.type) {
            case "boolean":
                if(value?.match(/^(0|false)$/)) {
                    return false
                } else if(value?.match(/^(1|true)$/)) {
                    return true
                } else {
                    throw new OptError(`Error: Only 0, 1, true or false are supported for boolean ${key} (${value})`, 9)
                }
            case "number": {
                if (Number.isNaN(value)) {
                    throw new OptError(`Error: Argument must be numeric for ${key}`, 6)
                }
                return +value
            }
            case "string":
                return value
        }
    }

    /**
     *
     * @param arg
     * @returns
     */
    private parseArg(arg: string) {
        let md: RegExpMatchArray | null
        if (md = arg.match(/^--([\w-]+)(=(.*))?/)) {
            // Long opt.
            const [name, value] = [md[1], md[2] ?? undefined]
            return new LongOption(name, value, arg)
        } else if (md = arg.match(/^-(\w.*)/)) {
            // Short opts.
            const shortOpts = md[1]
            return new ShortOptions(shortOpts, arg)
        } else if (arg == "--") {
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
     *
     */
    get helpMessage() {
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

        const positional = Object.entries(this.positional).map(([s, config]) => {
            const o = `<${s}>`
            if (config.required) {
                return config.many ? `${o} [${o}]...` : o
            } else {
                return config.many ? `[${o}]...` : `[${o}]`
            }
        })
        const components = [
            this.name,
            ...argComponents,
            ...positional
        ]
        return `Usage: ${components.join(" ")}`
    }

    /**
     *
     * @param options
     * @param positional
     * @param extendedOptions
     * @param name
     */
    constructor(options: {options: T, positional: P, help?: string }, private name: string) {
        this.helpOption = options.help
        this.options = options.options
        this.positional = options.positional
    }
    /**
     *
     * @param argv
     * @returns
     */
    fromArgv(argv: string[]) {
        return this.fromProgramArgs(argv.slice(2))
    }

    /**
     *
     * @returns
     */
    fromArgvOrExit() {
        try {
            return this.fromArgv(process.argv)
        } catch (e) {
            if (e instanceof OptExit) {
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
    fromProgramArgs(args: string[]): { [k in keyof T]: T[k]["initialValue"] } & { [k in keyof P]: P[k]["initialValue"] } {
        const canonicalNameOf: Record<string, string> = {}
        const knownShortOpts: Record<string, OptWrapper<any>> = {}
        for (const [k, v] of Object.entries(this.options)) {
            for (const a of v.alias) {
                knownShortOpts[a] = v
                canonicalNameOf[a] = k
            }
        }

        const opts = Object.fromEntries([
            ...Object.entries(this.options).map(([k, o]) => [k, o.initialValue]),
            ...Object.entries(this.positional).map(([k, o]) => [k, o.initialValue])
        ])
        const positional: string[] = []
        const mArgs = args.slice()

        const cNames = Object.fromEntries(
            Object.keys(this.options).map(k => [this.toCliArg(k), k])
        )

        /**
         *
         * @param name
         * @param value
         */
        const addArg = (name: string, value: any) => {
            const existing = opts[name]
            if (Array.isArray(existing)) {
                existing.push(value)
            } else {
                opts[name] = value
            }
        }

        let arg: string | undefined
        while ((arg = mArgs.shift()) !== undefined) {
            const parsed = this.parseArg(arg)
            if (parsed instanceof LongOption) {
                // Long opt.
                const cName = cNames[parsed.key]
                const opt = this.options[cName]
                if (!opt) {
                    throw new OptError(`Error: Unrecognised long option ${parsed.key}`, 5)
                }
                addArg(cName, this.getArgValue(parsed.key, opt, () => mArgs.shift(), parsed.value))
            } else if (parsed instanceof ShortOptions) {
                // Short opts.
                let optionCode: string | undefined
                while (optionCode = parsed.next()) {
                    const opt = knownShortOpts[optionCode]
                    if (!opt) {
                        throw new OptError(`Error: Unrecognised short option ${parsed.prevOption} in ${parsed.literalArgument}`, 3)
                    }
                    const cName = canonicalNameOf[optionCode]
                    addArg(cName, this.getArgValue(parsed.prevOption!, opt, () => parsed.rest.length ? parsed.rest : mArgs.shift()))
                }
            } else if (parsed instanceof AbortProcessingSymbol) {
                // Stop processing
                positional.push(...mArgs)
                break
            } else {
                positional.push(parsed.literalArgument)
            }
        }

        const helpOption = this.helpOption
        if (helpOption && opts[helpOption]) {
            throw new OptHelpExit(this.helpMessage)
        }

        for(const [k, o] of Object.entries(this.positional)) {
            const v = positional.shift()
            if(v === undefined && o.required) {
                throw new OptError(`Argument <${k}> is required.\n${this.helpMessage}`, 1)
            }
            if(v !== undefined) {
                addArg(k, this.getPositionArgValue(k, o, v))
                if(o.many) {
                    for(const nv of positional) {
                        addArg(k, this.getPositionArgValue(k, o, nv))
                    }
                    positional.splice(0) // Empties
                }
            }
        }

        if (positional.length) {
            throw new OptError(`Too many arguments at: ${positional[0]}.\n${this.helpMessage}`, 2)
        }

        return opts
    }
}