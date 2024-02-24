import getopts from "getopts"
import { DataWalker } from "./lib/DataWalker.mjs"
import { DecompileWalker } from "./lib/DecompileWalker.mjs"
import fs from "fs"

const opts = getopts(process.argv.slice(2), {
    boolean: ["h"],
    number: ["e", "l", "s"],
    string: ["w"],
    alias: {
        "entry-point": ["e"],
        "help": ["h"],
        "load-point": ["l"],
        "start-point": ["s"],
        "write-file": ["w"],
    }
})

const usage = () => `Usage: ${process.argv[1]} [-h|--help] [-e|--entry-point <number> [-e <number>] ...] [-l|--load-point <number>] [-s|--start-point <number>] [-w|--write-file <filename>] <filename>`

if(opts.h) {
    console.log(usage())
    process.exit(0)
}

if(opts._.length > 1) {
    console.error(usage())
    process.exit(2)
}

const [filename] = opts._

if(!filename) {
    console.error(usage())
    process.exit(1)
}

const entryPoints = []
if(opts.e) {
    if(opts.e instanceof Array) {
        entryPoints.push(...opts.e)
    } else {
        entryPoints.push(opts.e)
    }
}

/**
 * @type {number | null}
 */
const loadPoint = opts.l

/**
 * @type {number | null}
 */
const startOffset = opts.s

/**
 * @type {string | undefined}
 */
const writeFilename = opts.w

console.warn(`Reading ${filename}`)

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

decode(filename, +loadPoint, startOffset ? +startOffset : 1)

// See DECOMPILER.md