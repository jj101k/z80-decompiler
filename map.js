"use strict"
class MapReader {
    /**
     *
     * @param {string} input_ref
     * @param {string} output_ref
     * @param {string} map_ref
     * @param {boolean} dump
     */
    constructor(input_ref, output_ref, map_ref, dump) {
        this.dump = dump
        this.altMap = false
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
        let indices = sd.slice(0, 162)
        let strings = sd.slice(162, sd.length+1)
        for(let i = 0; i < indices.length; i++) {
            let ind = indices[i]
            content += i + " " + ind.replace(/([^])/g, s => (strings[s.charCodeAt(0)] || " ")) + "\n"
        }
        let tiles = 160
        let sprite_indices = new Uint8Array(this.data, 0x306c+ (this.altMap ? 320 : 0), tiles * 2)
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
            // ??rgBRG
            let colour_map = {
                2: {
                    fg: [255, 0, 0],
                    bg: [0, 0, 0],
                },
                3: {
                    fg: [255, 0, 255],
                    bg: [0, 0, 0],
                },
                4: {
                    fg: [0, 255, 0],
                    bg: [0, 0, 0],
                },
                5: {
                    fg: [0, 255, 255],
                    bg: [0, 0, 0],
                },
                6: {
                    fg: [255, 255, 0],
                    bg: [0, 0, 0],
                },
                12: {
                    fg: [0, 255, 0],
                    bg: [0, 0, 255],
                },
                13: {
                    fg: [0, 255, 255],
                    bg: [0, 0, 255],
                },
                23: {
                    fg: [255, 255, 255],
                    bg: [255, 0, 0],
                },
            }
            let colours = colour_map[colour % 32] || {
                fg: [255, 255, 255],
                bg: [0, 0, 0],
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
                new Uint8Array(this.data, 0x32ec + i * 32, 32)
            )
        }

        let sprite8 = (o) => {
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
            return d
        }
        let letter_sprites = []
        for(let i = 0; i < 21; i++) {
            letter_sprites.push(sprite8(0x4965 + i * 8))
        }
        if(!this.dump) {
            for(let i = 0; i < 50; i++) {
                let row = new Uint8Array(this.data, 8396 + 80 * i, 80)
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
        } else {
            tile_sprites.forEach((sprite, i) => {
                ctx.putImageData(sprite, (i % 80) * 16, Math.floor(i / 80) * 16)
            })
        }
        this.out.textContent = content
    }
}
