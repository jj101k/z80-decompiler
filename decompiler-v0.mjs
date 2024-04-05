import { OptHandler, OptWrappers } from "opt-handler"
import { Decompiler } from "./lib/Decompiler.mjs"
import { UnknownEntryValue } from "./lib/UnknownEntryValue.mjs"

const optHandler = new OptHandler({
    options: {
        entryPoint: OptWrappers.opt("number[]", "e"),
        help: OptWrappers.opt("boolean", "h"),
        includeVersion: OptWrappers.opt("boolean", "v"),
        limit: OptWrappers.optDefault("number", 10_000),
        loadPoint: OptWrappers.opt("number", "l"),
        showEntryPoints: OptWrappers.opt("boolean"),
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

const entryPoints = new Set(opts.entryPoint)
const limit = opts.limit
const loadPoint = opts.loadPoint
const startOffset = opts.startPoint
const writeFilenameSpec = opts.writeFile
Decompiler.includeVersion = opts.includeVersion
UnknownEntryValue.showEntryPoints = opts.showEntryPoints

/**
 * @type {Decompiler[]}
 */
const decompilers = []
for(const filenameSpec of filenames) {
    /**
     * @type {string}
     */
    let filename
    let loadPointCurrent
    let startOffsetCurrent
    let md
    if((md = filenameSpec.match(/(.+)@(0x([a-f0-9]+)|([0-9]+))(?:[+](\d+))?$/))) {
        filename = md[1]
        if(md[2]) {
            loadPointCurrent = Number.parseInt(md[2], 16)
        } else {
            loadPointCurrent = +md[3]
        }
        if(md[4]) {
            startOffsetCurrent = +md[4]
        } else {
            startOffsetCurrent = startOffset
        }
    } else {
        filename = filenameSpec
        if(!loadPoint) {
            throw new Error(`No load point supplied for ${filenameSpec}`)
        }
        loadPointCurrent = loadPoint
        startOffsetCurrent = startOffset
    }
    console.warn(`Reading ${filename}`)

    const d = new Decompiler(filename, loadPointCurrent, startOffsetCurrent, writeFilenameSpec)
    if(d.writeFilename) {
        console.log(`Writing ${d.writeFilename}`)
    }
    d.limit = limit
    decompilers.push(d)
}
let totalIterations = 0
/**
 * @type {Set<number>}
 */
const memoryLocations = new Set()

/**
 * @type {number}
 */
let mlSize
/**
 * @type {number}
 */
let epSize
do {
    mlSize = memoryLocations.size
    epSize = entryPoints.size
    for(const decompiler of decompilers) {
        /**
         * @type {number | undefined | null}
         */
        let i
        try {
            i = decompiler.decode(entryPoints, memoryLocations)
        } catch (e) {
            try {
                decompiler.onError()
            } finally {
                console.error(e)
            }
        }

        if (i === null) {
            decompiler.write(true)
            console.warn("Stop - iterations exceeded")
            process.exit(126)
        } else if(i === undefined) {
            process.exit(127)
        } else {
            totalIterations += i
        }
    }
} while(mlSize != memoryLocations.size || epSize != entryPoints.size)

decompilers.sort((a, b) => a.loadPoint - b.loadPoint)

for(const decompiler of decompilers) {
    decompiler.write()
}
console.warn(`Stop after a total of ${totalIterations} iterations - nothing left to examine`)
// See DECOMPILER.md