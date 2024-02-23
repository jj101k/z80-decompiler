import getopts from "getopts"
import { DataWalker } from "./lib/DataWalker.mjs"
import { DecompileWalker } from "./lib/DecompileWalker.mjs"
import fs from "fs"

const opts = getopts(process.argv, {
    boolean: ["h"],
    number: ["l", "s"],
    alias: {
        "load-point": ["l"],
        "start-point": ["s"],
        "help": ["h"],
    }
})

const usage = () => `Usage: ${process.argv[1]} [-h|--help] [-l|--load-point <number>] [-s|--start-point <number>] <filename>`

if(opts.h) {
    console.log(usage())
    process.exit(0)
}

const [filename] = opts._

if(!filename) {
    console.error(usage())
    process.exit(1)
}

/**
 * @type {number | null}
 */
const loadPoint = opts.l

/**
 * @type {number | null}
 */
const startOffset = opts.s

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
    let bytesParsed = 0

    /**
     *
     */
    const traceLength = 10
    /**
     * @type {number[]}
     */
    const trace = []

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
                for (const l of decompile.dump()) {
                    console.log(l)
                }
                console.log(`Stop after ${i} - nothing left to examine`)
                break
            }
        }
    } catch (e) {
        try {
            for (const l of decompile.dump()) {
                console.log(l)
            }
        } finally {
            console.error(e)
        }
    }
}

decode(filename, +loadPoint, startOffset ? +startOffset : 1)

// See DECOMPILER.md