/**
 * @typedef {{alias: string[], default?: string, hint: string | undefined, many: boolean,
 * required: boolean}} f
 */
/**
 *
 * @param {import("getopts").Options} optionConfig
 * @param {{requiredKeys: string[], manyKeys: string[], numbers: string[]}} extendedOptions
 * @returns
 */
export const combineOptions = (optionConfig, {requiredKeys, manyKeys, numbers}) => {
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

    return Object.entries(options).sort(([a, ac], [b, bc]) => (+!!ac.required - +!!bc.required) || a.localeCompare(b)).map(([s, config]) => {
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
    }).join(" ")
}
