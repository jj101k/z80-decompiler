"use strict"
class MapReader {
    /**
     *
     * @param {string} input_ref
     * @param {string} output_ref
     */
    constructor(input_ref, output_ref) {
        /** @type {HTMLInputElement} */
        this.in = document.querySelector(input_ref)
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
        let sprite16 = (o) => {
            for(let i = 0; i < 2; i++) {
                let x = new Uint8Array(this.data, o + i * 16, 16)
                for(let r = 0; r < 8; r++) {
                    let s = x[r].toString(2).padStart(8, 0) + x[r+8].toString(2).padStart(8, 0)
                    content += s.replace(/0/g, "  ").replace(/1/g, "##") + "\n"
                }
            }
        }
        for(let i = 0; i < 176; i++) {
            sprite16(0x32ec + i * 32)
        }
        let sprite8 = (o) => {
            let x = new Uint8Array(this.data, o, 8)
            for(let r = 0; r < 8; r++) {
                let s = x[r].toString(2).padStart(8, 0)
                content += s.replace(/0/g, "  ").replace(/1/g, "##") + "\n"
            }
        }
        for(let i = 0; i < 21; i++) {
            sprite8(0x4965 + i * 8)
        }
        this.out.textContent = content
    }
}
