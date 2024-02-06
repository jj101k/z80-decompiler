const fs = require("fs")
const [filename] = process.argv.slice(2)

const DataWalker = require("./lib/DataWalker")
const DecompileWalker = require("./lib/DecompileWalker")

const loadPoint = 0x5e27 // From previous file

/**
 *
 * @param {string} filename
 */
function decode(filename) {

    const contents = fs.readFileSync(filename)

    const dw = new DataWalker(contents)
    dw.offset = 1
    const decompile = new DecompileWalker(dw, loadPoint)
    let bytesParsed = 0

    for(let i = 0; i < 1_000; i++) {
        const startPoint = dw.offset
        const n = decompile.decode()
        if(!n) {
            dw.offset = startPoint
            throw new Error(`Cannot decode value: ${decompile.u8(...dw.inspect())} after ${i} points mapped (${bytesParsed}B)`)
        }
        const byteLength = decompile.lastEndPoint - startPoint
        bytesParsed += byteLength
        const bytes = decompile.u8(...dw.inspectAt(startPoint, decompile.lastEndPoint - startPoint))
        console.log(`${decompile.addr(startPoint)}: ${n}`.padEnd(40, " ") + `## ${bytes}`)
        if(decompile.finished) {
            console.log(`Stop after ${i} with next offset at ${decompile.addr(dw.offset + loadPoint)} (${decompile.addr(dw.offset)})`)
            break
        }
    }
}

decode(filename)

// See DECOMPILER.md