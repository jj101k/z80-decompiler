const fs = require("fs")
const [filename, startOffset] = process.argv.slice(2)

console.log(`Reading ${filename}`)

const DataWalker = require("./lib/DataWalker")

const defaultOffset = 104 // This was from looking at the data only.

/**
 *
 * @param {string} filename
 * @param {number} startOffset
 */
function decode(filename, startOffset) {
    // https://en.wikipedia.org/wiki/ZX_Spectrum_character_set
    // https://dotneteer.github.io/spectnetide/spectrum/basic-appa#article
    // See also https://zxspectrumvault.github.io/Manuals/Hardware/SpectrumPlus3Manual.html#introduction
    // Should be A5 and above
    const contents = fs.readFileSync(filename)
    const dw = new DataWalker(contents)
    dw.offset = startOffset

    const c = {
        [0xaf]: {name: "CODE"},
        [0xc0]: {name: "USR"},
        [0xef]: {name: "LOAD"},
        [0xf9]: {name: "RANDOMIZE"},
    }

    /**
     * @type {(string | {name: string} | {value: number})[]}
     */
    const s = []

    while(dw.offset < contents.byteLength) {
        const v = dw.uint8()
        if(v >= 0xa5) {
            if(!(v in c)) {
                throw new Error("Missing code value for " + v.toString(16))
            }
            s.push(" " + c[v].name + " ")
        } else if(v == 0x0d) {
            s.push("\n")
        } else if(v == 0x0e) {
            // https://worldofspectrum.org/ZXBasicManual/zxmanchap24.html
            const exponent = dw.uint8()
            let value
            if(exponent == 0) {
                const sign = dw.uint8()
                const int = dw.uint16()
                if(sign != 0 && sign != 0xff) {
                    throw new Error("Invalid sign: " + sign)
                }
                const last = dw.uint8()
                if(last != 0) {
                    throw new Error("Invalid last byte: " + last)
                }
                value = sign ? -int : int
            } else {
                const mantissa1 = dw.uint8()
                const mantissa =
                    ((mantissa1 | 0x80) / Math.pow(2, 7)) +
                    (dw.uint8() / Math.pow(2, 15)) +
                    (dw.uint8() / Math.pow(2, 23)) +
                    (dw.uint8() / Math.pow(2, 31))

                const sign = mantissa1 & 0x80

                console.log({exponent: exponent - 128, mantissa})
                value = sign ?
                    (-Math.pow(2, exponent - 128) * mantissa) :
                    (Math.pow(2, exponent - 128) * mantissa)
            }
            s.push(" " + JSON.stringify({value}) + " ")
        } else if(v >= 0x20) {
            s.push(String.fromCharCode(v))
        } else {
            throw new Error(`Unhandled code: ${v}`)
        }
    }
    console.log(s.join(""))
}

decode(filename, startOffset ? +startOffset : defaultOffset)