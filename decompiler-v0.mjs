import { DataWalker } from "./lib/DataWalker.mjs"
import { DecompileWalker } from "./lib/DecompileWalker.mjs"
import fs from "fs"
import path from "path"
import { OptHandler } from "./OptHandler.mjs"
import { OptExit } from "./OptExit.mjs"

const optHandler = new OptHandler({
    boolean: ["help", "include-version"],
    string: ["write-file", "entry-point", "load-point", "start-point"],
    alias: {
        "entry-point": ["e"],
        "help": ["h"],
        "include-version": ["v"],
        "load-point": ["l"],
        "start-point": ["s"],
        "write-file": ["w"],
    },
    default: {
        "start-point": 1,
    }
}, {
    requiredKeys: ["load-point"],
    manyKeys: ["entry-point"],
    numbers: ["entry-point", "load-point", "start-point"],
    positional: ["filename"],
    help: "help",
}, process.argv[1])

let opts
try {
    opts = optHandler.fromArgv(process.argv)
} catch(e) {
    if(e instanceof OptExit) {
        e.outputAndExit()
    }
    throw e
}

/**
 * @type {string | undefined}
 */
const [filename] = opts._

/**
 * @type {number[]}
 */
const entryPoints = []
const entryPointIn = opts["entry-point"]
if(entryPointIn) {
    if(entryPointIn instanceof Array) {
        entryPoints.push(...entryPointIn)
    } else {
        entryPoints.push(entryPointIn)
    }
}

/**
 * @type {number}
 */
const loadPoint = opts["load-point"]

/**
 * @type {number}
 */
const startOffset = opts["start-offset"]

/**
 * @type {string | undefined}
 */
const writeFilenameSpec = opts["write-file"]

/**
 * @type {boolean}
 */
const includeVersion = opts["include-version"]

/**
 *
 */
const decompilerVersion = 2

/**
 * @type {string | undefined}
 */
let writeFilename
if(writeFilenameSpec) {
    if(writeFilenameSpec.endsWith("/") || (fs.existsSync(writeFilenameSpec) && fs.statSync(writeFilenameSpec).isDirectory())) {
        const fileInBaseRoot = path.basename(filename).replace(/[.]tap$/, "")
        let fileOutBase

        if(includeVersion) {
            fileOutBase = fileInBaseRoot + ".v" + decompilerVersion + ".txt"
        } else {
            fileOutBase = fileInBaseRoot + ".txt"
        }
        writeFilename = path.resolve(writeFilenameSpec, fileOutBase)
    } else {
        writeFilename = writeFilenameSpec
    }
}

console.warn(`Reading ${filename}`)
if(writeFilename) {
    console.log(`Writing ${writeFilename}`)
}

/**
 *
 * @param {string} filename
 * @param {number} loadPoint
 * @param {number} startOffset
 */
function decode(filename, loadPoint, startOffset) {
    if(!filename.match(/[.]tap$/)) {
        console.warn(`WARNING: this is only for .tap files, not: ${filename}`)
    }
    const size = fs.statSync(filename).size
    if(size > 65536) {
        console.warn(`WARNING: this is designed for a 16-bit address space, but ${filename} is larger (${size})`)
    }
    const contents = fs.readFileSync(filename)

    const dw = new DataWalker(contents.subarray(startOffset))
    const decompile = new DecompileWalker(dw, loadPoint)

    for(const entryPoint of entryPoints) {
        decompile.addTarget(entryPoint, "fn")
    }
    let bytesParsed = 0

    /**
     *
     */
    const traceLength = 10
    /**
     * @type {number[]}
     */
    const trace = []

    /**
     *
     */
    const writeToConsole = () => {
        if(includeVersion) {
            console.log("; v" + decompilerVersion)
        }
        for (const l of decompile.dump()) {
            console.log(l)
        }
    }

    const writeOut = () => {
        if(writeFilename) {
            const fh = fs.openSync(writeFilename, "wx")
            for (const l of decompile.dump()) {
                fs.writeSync(fh, l + "\n")
            }
            fs.closeSync(fh)
        } else {
            writeToConsole()
        }
    }

    try {
        for (let i = 0; i < 10_000; i++) {
            const startPoint = dw.offset

            if(i >= traceLength) {
                trace.shift()
            }
            trace.push(startPoint)
            const n = decompile.decode()
            if (!n) {
                console.warn(`Last ${traceLength} PC values:`)
                for(const o of trace) {
                    console.warn(decompile.addr(o + loadPoint))
                }
                dw.offset = startPoint
                throw new Error(`Cannot decode value at offset ${decompile.addr(startPoint + loadPoint)} after ${i} points (${bytesParsed} bytes) mapped: ${decompile.u8(...dw.inspect())}`)
            }
            const byteLength = decompile.lastEndPoint - startPoint
            bytesParsed += byteLength
            if (decompile.finished) {
                writeOut()
                console.warn(`Stop after ${i} - nothing left to examine`)
                break
            }
        }
    } catch (e) {
        try {
            writeToConsole()
        } finally {
            console.error(e)
        }
    }
}

decode(filename, +loadPoint, +startOffset)

// See DECOMPILER.md