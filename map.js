"use strict"
class MapReader {
    /**
     *
     * @param {string} input_ref
     * @param {string} output_ref
     * @param {string} map_ref
     */
    constructor(input_ref, output_ref, map_ref) {
        /** @type {HTMLInputElement} */
        this.in = document.querySelector(input_ref)
        /** @type {HTMLCanvasElement} */
        this.mapOut = document.querySelector(map_ref)
        this.out = document.querySelector(output_ref)
        /** @type {ArrayBuffer} */
        this.data = null
        this.in.onchange = () => {
            let files = this.in.files
            let reader = new FileReader()
            reader.onload = e => {
                this.data = reader.result
                this.analyse()
            }
            reader.readAsArrayBuffer(files[0])
        }
    }
    analyse() {
        let content = ""
        /** @type {string} */
        let s = String.fromCharCode.apply(
            null,
            new Uint8Array(this.data, 3794, 938)
        )
        let sd = s.split(/[|]/)
        sd.shift()
        let indices = sd.slice(0, 161)
        let strings = sd.slice(162, sd.length)
        for(let i = 0; i < indices.length; i++) {
            let ind = indices[i]
            content += i + " " + ind.replace(/([^])/g, s => (strings[s.charCodeAt(0)] || " ")) + "\n"
        }
        let M = [
            "",
            "  ",
            "[ ",
            " ]",
            '""',
            '__',
            '/"',
            '"\\',
            "\\_",
            "_/",
            "< ",
            "  ",
            " >",
            "~~",
            "##",
            ",,",
            null,
            "--",
            "\\-",
            "-/",
            null,
            null,
            null,
            "==",
            null,
            "||",
            "||",
            "vv",
            ",,",
            "  ",
            "  ",
            "==",
            "HH",
            "vv",
            "**",
            "''",
            "=>",
            "{}",
            null,
            null,
            null,
            null,
            null,
            "_]",
            "[_",
            "oo",
            "O_",
            ": ",
            "()",
            "()",
            "XX",
            "YY",
        ]
        for(let i = 0; i < 50; i++) {
            let row = new Uint8Array(this.data, 8396 + 80 * i, 80)
            row.forEach(n => {
                content += M[n]
            })
            content += "\n"
        }
        let ctx = this.mapOut.getContext("2d")
        let bit = (n, j) => {
            return (n >> (7-j)) & 1
        }
        let sprite16 = (o, p) => {
            let d = ctx.createImageData(16, 16)
            for(let i = 0; i < 2; i++) {
                let x = new Uint8Array(this.data, o + i * 16, 16)
                for(let r = 0; r < 8; r++) {
                    for(let j = 0; j < 8; j++) {
                        d.data[i * 512 + r * 64 + j * 4 + 0] = 255 * bit(x[r], j)
                        d.data[i * 512 + r * 64 + j * 4 + 1] = 255 * bit(x[r], j)
                        d.data[i * 512 + r * 64 + j * 4 + 2] = 255 * bit(x[r], j)
                        d.data[i * 512 + r * 64 + j * 4 + 3] = 255
                        d.data[i * 512 + r * 64 + 32 + j * 4 + 0] = 255 * bit(x[r + 8], j)
                        d.data[i * 512 + r * 64 + 32 + j * 4 + 1] = 255 * bit(x[r + 8], j)
                        d.data[i * 512 + r * 64 + 32 + j * 4 + 2] = 255 * bit(x[r + 8], j)
                        d.data[i * 512 + r * 64 + 32 + j * 4 + 3] = 255
                    }
                }
            }
            ctx.putImageData(d, 0 + p % 1280, 100 + Math.floor(p / 1280) * 16)
        }
        for(let i = 0; i < 176; i++) {
            sprite16(0x32ec + i * 32, i * 16)
        }

        let sprite8 = (o, p) => {
            let d = ctx.createImageData(8, 8)
            let x = new Uint8Array(this.data, o, 8)
            for(let r = 0; r < 8; r++) {
                for(let j = 0; j < 8; j++) {
                    d.data[r * 8 * 4 + j * 4 + 0] = 255 * bit(x[r], j)
                    d.data[r * 8 * 4 + j * 4 + 1] = 255 * bit(x[r], j)
                    d.data[r * 8 * 4 + j * 4 + 2] = 255 * bit(x[r], j)
                    d.data[r * 8 * 4 + j * 4 + 3] = 255
                }
            }
            ctx.putImageData(d, 100 + p, 200)
        }
        for(let i = 0; i < 21; i++) {
            sprite8(0x4965 + i * 8, i * 8)
        }
        this.out.textContent = content
    }
}
