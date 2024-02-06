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
            for(const l of decompile.dump()) {
                console.log(l)
            }
            throw new Error(`Cannot decode value at offset ${decompile.addr(startPoint)} after ${i} points mapped (${bytesParsed}B): ${decompile.u8(...dw.inspect())}`)
        }
        const byteLength = decompile.lastEndPoint - startPoint
        bytesParsed += byteLength
        if(decompile.finished) {
            for(const l of decompile.dump()) {
                console.log(l)
            }
            console.log(`Stop after ${i} with next offset at ${decompile.addr(dw.offset + loadPoint)} (${decompile.addr(dw.offset)})`)
            break
        }
    }
}

decode(filename)

// See DECOMPILER.md