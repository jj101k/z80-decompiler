import { DataWalker } from "./lib/DataWalker.mjs"
import { DecompileWalker } from "./lib/DecompileWalker.mjs"
import fs from "fs"

const [filename, loadPoint, startOffset] = process.argv.slice(2)

console.log(`Reading ${filename}`)

/**
 *
 * @param {string} filename
 * @param {number} loadPoint
 * @param {number} startOffset
 */
function decode(filename, loadPoint, startOffset) {

    const contents = fs.readFileSync(filename)

    const dw = new DataWalker(contents.subarray(startOffset))
    const decompile = new DecompileWalker(dw, loadPoint)
    let bytesParsed = 0

    try {
        for (let i = 0; i < 10_000; i++) {
            const startPoint = dw.offset
            const n = decompile.decode()
            if (!n) {
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