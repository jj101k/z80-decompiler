import { OptHandler, OptWrappers } from "opt-handler"
import { Decompiler } from "./lib/Decompiler.mjs"

const optHandler = new OptHandler({
    options: {
        entryPoint: OptWrappers.opt("number[]", "e"),
        help: OptWrappers.opt("boolean", "h"),
        includeVersion: OptWrappers.opt("boolean", "v"),
        loadPoint: OptWrappers.req("number", "l"),
        startPoint: OptWrappers.optDefault("number", 1, "s"),
        writeFile: OptWrappers.opt("string", "w"),
    },
    positional: {
        filenames: OptWrappers.req("string[]"),
    },
    help: "help",
}, process.argv[1])

const opts = optHandler.fromArgvOrExit(process)

const filenames = opts.filenames

const entryPoints = opts.entryPoint
const loadPoint = opts.loadPoint
const startOffset = opts.startPoint
const writeFilenameSpec = opts.writeFile
Decompiler.includeVersion = opts.includeVersion

/**
 * @type {Decompiler[]}
 */
const decompilers = []
for(const filename of filenames) {
    console.warn(`Reading ${filename}`)

    const d = new Decompiler(filename, +loadPoint, +startOffset, writeFilenameSpec)
    if(d.writeFilename) {
        console.log(`Writing ${d.writeFilename}`)
    }
    decompilers.push(d)
}
for(const decompiler of decompilers) {
    /**
     * @type {number | undefined | null}
     */
    let i
    try {
        i = decompiler.decode(entryPoints)
    } catch (e) {
        try {
            decompiler.onError()
        } finally {
            console.error(e)
        }
    }

    if ((i ?? null) !== null) {
        decompiler.write()
        console.warn(`Stop after ${i} - nothing left to examine`)
    }
}
// See DECOMPILER.md