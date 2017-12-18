"use strict"
class MapReader {
    /**
     * Builds the object
     *
     * @param {string} input_ref eg. "input#file"
     * @param {string} output_ref eg. "pre#output"
     * @param {string} map_ref eg. "canvas#map"
     * @param {string} selections_ref eg. "fieldset#selections"
     */
    constructor(input_ref, output_ref, map_ref, selections_ref = null) {
        this.dump = false
        this.altMap = false
        /** @type {HTMLInputElement} */
        this.in = document.querySelector(input_ref)
        /** @type {HTMLCanvasElement} */
        this.mapOut = document.querySelector(map_ref)
        this.out = document.querySelector(output_ref)
        /** @type {ArrayBuffer} */
        this.data = null
        if(selections_ref) {
            let selections_element = document.querySelector(selections_ref)
            this.in.onchange = () => {
                let files = this.in.files
                let reader = new FileReader()
                reader.onload = e => {
                    this.data = reader.result
                    while(selections_element.firstChild) {
                        selections_element.removeChild(selections_element.firstChild)
                    }
                    this.parse()
                    this.tapeChunks.forEach((chunk, i) => {
                        let input = document.createElement("input")
                        input.type = "radio"
                        input.name = "chunk"
                        input.value = "" + i
                        input.onclick = () => this.analyseChunk(chunk)
                        let label = document.createElement("label")
                        label.appendChild(input)
                        label.appendChild(
                            document.createTextNode(` chunk ${i}`)
                        )
                        selections_element.appendChild(label)
                    })
                }
                reader.readAsArrayBuffer(files[0])
            }
        } else {
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
        /** @type {?ArrayBuffer[]} */
        this.tapeChunks = null
    }
    /**
     * Analyses the first hunk in the file, whatever it is. Suitable for
     * single-scenario tapes.
     */
    analyse() {
        this.parse()
        this.analyseChunk(this.tapeChunks[0])
    }
    /**
     * Analyses a specific TAP chunk. This can't be a whole TZX file, just an
     * 0x10 chunk.
     *
     * @param {ArrayBuffer} chunk
     */
    analyseChunk(chunk) {
        let content = ""
        let tiles = 0xa0 // 160
        let rotation_frames = new Uint8Array(
            chunk,
            0xe51,
            11 * 8
        )
        let death_frames = new Uint8Array(
            chunk,
            0xe99,
            4 * 3
        )
        let strings_hunk = new Uint8Array(
            chunk,
            0xea5,
            0x3aa // 0x182 + 0x226
        )
        let o = 0x1d7f
        let units = new Uint8Array(
            chunk,
            0x1d7f,
            20 * 40
        )
        o += units.length
        let map = new Uint8Array(
            chunk,
            o,
            80 * 50
        )
        o += map.byteLength
        let sprite_indices_main = new Uint8Array(
            chunk,
            o,
            tiles * 2
        )
        o += sprite_indices_main.byteLength
        let sprite_indices_alt = new Uint8Array(
            chunk,
            o,
            tiles * 2
        )
        o += sprite_indices_alt.byteLength
        let sprite_contents = new Uint8Array(
            chunk,
            o,
            32 * 0xb0 // 176
        )
        o += sprite_contents.byteLength
        let letter_sprite_chunk = new Uint8Array(
            chunk,
            o + 0x5b, // 91
            8 * 0x15 // 21
        )
        /** @type {string} */
        let s = String.fromCharCode.apply(null, strings_hunk)
        let sd = s.split(/[|]/)
        sd.shift()
        let indices = sd.slice(0, 162)
        let strings = sd.slice(162, sd.length+1)
        let sprite_indices = this.altMap ?
            sprite_indices_alt :
            sprite_indices_main
        let sprite_for = {}
        for(let i = 0; i < tiles; i++) {
            sprite_for[i] = {
                colour: sprite_indices[i * 2 + 0],
                sprite: sprite_indices[i * 2 + 1],
            }
        }
        let ctx = this.mapOut.getContext("2d")
        let bit = (n, j) => {
            return (n >> (7-j)) & 1
        }
        let sprite16 = (x, colour) => {
            let d = ctx.createImageData(16, 16)
            // 64 = Deployment?
            // 128 = ?
            let colours = {
                fg: [colour & 2, colour & 4, colour & 1].map(v => v ? 255 : 0),
                bg: [colour & 16, colour & 32, colour & 8].map(v => v ? 255 : 0)
            }
            for(let i = 0; i < 2; i++) {
                for(let r = 0; r < 8; r++) {
                    for(let j = 0; j < 8; j++) {
                        let a = bit(x[r + i * 16], j)
                        let b = bit(x[r + i * 16 + 8], j)
                        d.data[i * 512 + r * 64 + j * 4 + 0] = colours.fg[0] * a + colours.bg[0] * (1 - a)
                        d.data[i * 512 + r * 64 + j * 4 + 1] = colours.fg[1] * a + colours.bg[1] * (1 - a)
                        d.data[i * 512 + r * 64 + j * 4 + 2] = colours.fg[2] * a + colours.bg[2] * (1 - a)
                        d.data[i * 512 + r * 64 + j * 4 + 3] = 255
                        d.data[i * 512 + r * 64 + 32 + j * 4 + 0] = colours.fg[0] * b + colours.bg[0] * (1 - b)
                        d.data[i * 512 + r * 64 + 32 + j * 4 + 1] = colours.fg[1] * b + colours.bg[1] * (1 - b)
                        d.data[i * 512 + r * 64 + 32 + j * 4 + 2] = colours.fg[2] * b + colours.bg[2] * (1 - b)
                        d.data[i * 512 + r * 64 + 32 + j * 4 + 3] = 255
                    }
                }
            }
            return d
        }
        let tile_sprite_data = []
        for(let i = 0; i < 176; i++) {
            tile_sprite_data.push(
                sprite_contents.slice(i * 32, (i + 1) * 32)
            )
        }

        let sprite8 = (x) => {
            let d = ctx.createImageData(8, 8)
            for(let r = 0; r < 8; r++) {
                for(let j = 0; j < 8; j++) {
                    d.data[r * 8 * 4 + j * 4 + 0] = 255 * bit(x[r], j)
                    d.data[r * 8 * 4 + j * 4 + 1] = 255 * bit(x[r], j)
                    d.data[r * 8 * 4 + j * 4 + 2] = 255 * bit(x[r], j)
                    d.data[r * 8 * 4 + j * 4 + 3] = 255
                }
            }
            return d
        }
        let letter_sprites = []
        for(let i = 0; i < 21; i++) {
            let x = letter_sprite_chunk.slice(i * 8, (i + 1) * 8)
            letter_sprites.push(sprite8(x))
        }
        if(this.dump) {
            ctx.font = "12px sans-serif"
            tile_sprite_data.forEach((sprite, i) => {
                ctx.putImageData(
                    sprite16(
                        sprite,
                        7
                    ),
                    (i % 80) * 16,
                    Math.floor(i / 80) * 32
                )
                ctx.fillStyle = "red"
                ctx.fillText(
                    i.toString(16),
                    (i % 80) * 16,
                    Math.floor(i / 80) * 32 + 30,
                    16
                )
            })
        } else {
            for(let i = 0; i < 50; i++) {
                let row = map.slice(80 * i, 80 * (i + 1))
                row.forEach((n, x) => {
                    ctx.putImageData(
                        sprite16(
                            tile_sprite_data[sprite_for[n].sprite],
                            sprite_for[n].colour
                        ),
                        x * 16,
                        i * 16
                    )
                })
            }
        }
        for(let i = 0; i < indices.length; i++) {
            let ind = indices[i]
            let name = ind.replace(/([^])/g, s => (strings[s.charCodeAt(0)] || " "))
            let sprite = sprite_for[i]
            if(sprite) {
                content += `${i} 0x${i.toString(16)} (${sprite.sprite} ${sprite.colour}) ${name}\n`
            } else {
                content += `${i} 0x${i.toString(16)} (no sprite) ${name}\n`
            }
        }
        this.out.textContent = content
    }
    /**
     * Parses the file into tape chunks.
     */
    parse() {
        this.tapeChunks = []
        let i = 10;
        while(i < this.data.byteLength - 1) {
            let [type] = new Uint8Array(this.data, i, 1)
            switch(type) {
                case 0x10:
                    let dv = new DataView(this.data, i + 1, 4)
                    let delay = dv.getUint16(0, true)
                    let length = dv.getUint16(2, true)
                    console.log(`Normal hunk with delay ${delay}`)
                    this.tapeChunks.push(
                        this.data.slice(i + 1 + 4, i + 1 + 4 + length)
                    )
                    i += 1 + 4 + length
                    break
                case 0x30:
                    let [len] = new Uint8Array(this.data, i + 1, 1)
                    let text = String.fromCharCode.apply(
                        null,
                        new Uint8Array(this.data, i + 1 + 1, len)
                    )
                    console.log(`Text hunk: ${text}`)
                    i += 1 + 1 + len
                    break
                default:
                    throw new Error(`Cannot parse hunk ${type}`)
            }
        }
    }
}
