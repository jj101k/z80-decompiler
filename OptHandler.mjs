import getopts from "getopts"
import { OptHelpExit } from "./OptHelpExit.mjs"
import { OptError } from "./OptError.mjs"

/**
 *
 */
export class OptHandler {
    /**
     *
     */
    #extendedOptions
    /**
     *
     */
    #optionConfig

    /**
     * @readonly
     */
    name

    /**
     *
     */
    get helpMessage() {
        /**
         * @typedef {{alias: string[], default?: string, hint: string | undefined, many: boolean,
         * required: boolean}} f
         */

        const {numbers, manyKeys, requiredKeys, positional, positionalOptional, positionalVar} = this.#extendedOptions
        const optionConfig = this.#optionConfig

        /**
         * @type {Record<string, f>}
         */
        const options = {}

        /**
         * @type {Record<string, string[]>}
         */
        const aliases = {}
        /**
         * @type {Record<string, string>}
         */
        const canonicalNameOf = {}
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
         * @param {string} k
         * @param {string | undefined} [hint]
         */
        const addOption = (k, hint) => {
            if(!canonicalNameOf[k]) {
                canonicalNameOf[k] = k
                aliases[k] = []
            }
            const canonicalName = canonicalNameOf[k]
            const allNames = [canonicalName, ...aliases[k]]
            /**
             * @type {f}
             */
            const c = {
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
            /**
             * @type {string}
             */
            let o
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
     * @param {import("getopts").Options} optionConfig
     * @param {{requiredKeys: string[], manyKeys: string[], numbers: string[],
     * positional?: string[], positionalOptional?: string[], positionalVar?:
     * string, help?: string}} extendedOptions
     * @param {string} name
     */
    constructor(optionConfig, extendedOptions, name) {
        this.#extendedOptions = extendedOptions
        this.#optionConfig = optionConfig
        this.name = name
    }
    /**
     *
     * @param {string[]} argv
     * @returns
     */
    fromArgv(argv) {
        const opts = getopts(argv.slice(2), this.#optionConfig)
        const helpOption = this.#extendedOptions.help
        if(helpOption && opts[helpOption]) {
            throw new OptHelpExit(this.helpMessage)
        }
        const positionalMin = (this.#extendedOptions.positional?.length ?? 0)
        const positionalMax = this.#extendedOptions.positionalVar ? Infinity :
            (positionalMin + (this.#extendedOptions.positionalOptional?.length ?? 0))

        if(opts._.length < positionalMin) {
            throw new OptError(`Too few arguments.\n${this.helpMessage}`, 1)
        }
        if(opts._.length > positionalMax) {
            throw new OptError(`Too many arguments.\n${this.helpMessage}`, 2)
        }

        return opts
    }
}
