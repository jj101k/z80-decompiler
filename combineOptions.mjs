/**
 * @typedef {{hint?: string, alias?: string[], default?: string, many?: boolean,
 * required?: boolean}} f
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
     * @type {Record<string, string>}
     */
    const invAlias = {}
    for (const [long, short] of Object.entries(optionConfig.alias)) {
        const shortA = Array.isArray(short) ? short : [short]
        for (const s of shortA) {
            invAlias[s] = long
        }
    }

    /**
     *
     * @param {string} k
     * @param {string | undefined} [hint]
     */
    const addOption = (k, hint) => {
        /**
         * @type {f}
         */
        const c = {}
        if (hint) c.hint = hint
        if (k in optionConfig.default) {
            c.default = optionConfig.default[k]
        }
        if (invAlias[k]) {
            const short = optionConfig.alias[invAlias[k]]
            const shortA = Array.isArray(short) ? short : [short]
            c.alias = shortA
        }
        const canonicalName = invAlias[k] ?? k

        c.required = requiredKeys.includes(canonicalName)
        c.many = manyKeys.includes(canonicalName)

        options[canonicalName] = c
    }
    for (const k of optionConfig.boolean) {
        addOption(k)
    }
    for (const k of optionConfig.string) {
        const canonicalName = invAlias[k] ?? k
        addOption(k, numbers.includes(canonicalName) ? "number" : "string")
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
