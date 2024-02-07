"use strict"
/**
 *
 */
class MapInstance {
    /**
     * @type {?ArrayBuffer}
     */
    _chunk = null
    /**
     * @type {?number}
     */
    deathFrameCount = null
    /**
     * @type {?number}
     */
    rotationFrameCount = null
    /**
     * @type {?number}
     */
    spriteCount = null
    /**
     * @type {?number}
     */
    stringsHunkLength = null
    /**
     * @type {?number}
     */
    stringsHunkStart = null
    /**
     * @type {?number}
     */
    tileCount = null

    /**
     *
     */
    get chunk() {
        return this._chunk
    }

    set chunk(v) {
        this._chunk = v
        const wdv = new WalkableDataView(new DataView(v, v.byteLength))
        wdv.seek(this.stringsHunkStart)
        const rotation_frames = wdv.buffer(this.rotationFrameCount * 8)
        const death_frames = wdv.buffer(this.deathFrameCount * 4)
        const strings_hunk = wdv.buffer(this.stringsHunkLength)
        wdv.seek(0x1d7e)
        const units = wdv.buffer(20 * 40)
        this.unitData = units
        this.units = []
        for(let i = 0; i < 20; i++) {
            this.units.push(new MapUnit(this, i))
        }
        this.map = wdv.buffer(80 * 50)
        const sprite_indices_main = new DataView(wdv.buffer(this.tileCount * 2))
        const sprite_indices_alt = new DataView(wdv.buffer(this.tileCount * 2))
        this.spriteContents = wdv.buffer(32 * this.spriteCount)
        /** @type {string} */
        const s = String.fromCharCode.apply(null, new Uint8Array(strings_hunk))
        const sd = s.split(/[|]/)
        sd.shift()
        this.indices = sd.slice(0, 162)
        this.strings = sd.slice(162, sd.length+1)
        /** @type {{[x: number]: MapSprite}} */
        const sprite_for = {}
        /** @type {{[x: number]: MapSprite}} */
        const alt_sprite_for = {}
        for(let i = 0; i < this.tileCount; i++) {
            sprite_for[i] = new MapSprite(
                this,
                sprite_indices_main.getUint8(i * 2 + 0),
                sprite_indices_main.getUint8(i * 2 + 1),
            )
            alt_sprite_for[i] = new MapSprite(
                this,
                sprite_indices_alt.getUint8(i * 2 + 0),
                sprite_indices_alt.getUint8(i * 2 + 1),
            )
        }
        this.spriteFor = sprite_for
        this.altSpriteFor = alt_sprite_for
    }
    /**
     *
     */
    get tiles() {
        return this.indices.map((_, i) => new MapTile(this, i))
    }
    /**
     *
     */
    get tileSpriteData() {
        const tile_sprite_data = []
        for(let i = 0; i < this.spriteCount; i++) {
            tile_sprite_data.push(
                this.spriteContents.slice(i * 32, (i + 1) * 32)
            )
        }
        return tile_sprite_data
    }
}

/**
 *
 */
class WalkableDataView {
    #dataview
    /**
     *
     */
    #offset = 0

    /**
     *
     */
    get eob() {
        return this.#offset >= this.#dataview.byteLength
    }
    /**
     *
     */
    get offset() {
        return this.#offset
    }
    /**
     *
     * @param {DataView} dataview
     */
    constructor(dataview) {
        this.#dataview = dataview
    }
    /**
     *
     * @param {number} length
     * @returns
     */
    buffer(length) {
        try {
            return this.#dataview.buffer.slice(this.#offset, this.#offset + length)
        } finally {
            this.#offset += length
        }
    }
    /**
     *
     * @param {number} pos
     */
    seek(pos) {
        this.#offset = pos
    }
    /**
     *
     * @param {number} length
     */
    skip(length) {
        this.#offset += length
    }
    /**
     *
     * @param {number} length
     * @returns
     */
    text(length) {
        return String.fromCharCode.apply(
            null,
            new Uint8Array(this.buffer(length), 0, length)
        )
    }
    /**
     *
     * @returns
     */
    uint16() {
        try {
            return this.#dataview.getUint16(this.#offset, true)
        } finally {
            this.#offset += 2
        }
    }
    /**
     *
     * @returns
     */
    uint8() {
        try {
            return this.#dataview.getUint8(this.#offset)
        } finally {
            this.#offset += 1
        }
    }
}

/**
 *
 */
class MapReader {
    /**
     * @private
     * @param {WalkableDataView} wdv
     * @param {number} length
     * @returns
     */
    decodeTapHeader(wdv, length) {
        const contentType = {
            program: 0,
            number: 1,
            string: 2,
            memory: 3,
        }
        const type = wdv.uint8()
        const filename = wdv.text(10)
        const innerLength = wdv.uint16()
        switch (type) {
            case contentType.program: {
                const autoStart = wdv.uint16().toString(16).padStart(4, "0")
                const programLength = wdv.uint16()
                return { type, filename, innerLength, autoStart, programLength }
            }
            case contentType.number: {
                const varname = wdv.text(4)
                return { type, filename, innerLength, varname }
            }
            case contentType.string: {
                const varname = wdv.text(4)
                return { type, filename, innerLength, varname }
            }
            case contentType.memory: {
                const startAddress = wdv.uint16().toString(16).padStart(4, "0")
                wdv.skip(2)
                return { type, filename, innerLength, startAddress }
            }
        }
        throw new Error(`Invalid content type: ${type}`)
    }

    /**
     * @type {?{header?: ReturnType<MapReader["decodeTapHeader"]>, data: ArrayBuffer}[]}
     */
    tapeChunks = null
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
            const selections_element = document.querySelector(selections_ref)
            this.in.onchange = () => {
                const files = this.in.files
                const reader = new FileReader()
                reader.onload = e => {
                    this.data = reader.result
                    while(selections_element.firstChild) {
                        selections_element.removeChild(selections_element.firstChild)
                    }
                    this.parse()
                    let i = 0
                    for(const chunk of this.tapeChunks) {
                        const input = document.createElement("input")
                        input.type = "radio"
                        input.name = "chunk"
                        input.value = "" + i
                        input.onclick = () => this.analyseChunk(chunk.data)
                        const label = document.createElement("label")
                        label.appendChild(input)
                        label.appendChild(
                            document.createTextNode(` chunk ${i} (${chunk.data.byteLength})`)
                        )
                        selections_element.appendChild(label)
                        i++
                    }
                }
                reader.readAsArrayBuffer(files[0])
            }
        } else {
            this.in.onchange = () => {
                const files = this.in.files
                const reader = new FileReader()
                reader.onload = e => {
                    this.data = reader.result
                    this.analyse()
                }
                reader.readAsArrayBuffer(files[0])
            }
        }
    }
    /**
     * Analyses the first hunk in the file, whatever it is. Suitable for
     * single-scenario tapes.
     */
    analyse() {
        this.parse()
        this.analyseChunk(this.tapeChunks[0].data)
    }
    /**
     * Analyses a specific TAP chunk. This can't be a whole TZX file, just an
     * 0x10 chunk.
     *
     * @param {ArrayBuffer} chunk
     */
    analyseChunk(chunk) {
        const map_instance = new MapInstance()
        map_instance.tileCount = 0xa0 // 160
        map_instance.stringsHunkStart = 0xcff //0xd00 //0xe51
        map_instance.rotationFrameCount = 4 // 11
        map_instance.deathFrameCount = 3
        map_instance.stringsHunkLength = 0x3f3 // 0x3aa // 0x182 + 0x226
        map_instance.spriteCount = 185 // 0xb0 // 176

        map_instance.chunk = chunk
        this.mapOut.width = this.mapOut.clientWidth * window.devicePixelRatio
        this.mapOut.height = this.mapOut.clientHeight * window.devicePixelRatio
        const ctx = this.mapOut.getContext("2d")
        const sprite_for = this.altMap ?
            map_instance.altSpriteFor :
            map_instance.spriteFor
        ctx.fillStyle = "white"
        ctx.fillRect(0, 0, 80 * 16, 50 * 16)
        if(this.dump) {
            ctx.font = "12px sans-serif"
            for(let i = 0; i < map_instance.spriteCount; i++) {
                ctx.putImageData(
                    new MapSprite(
                        map_instance,
                        7,
                        i
                    ).colouredImageData(ctx),
                    (i % 80) * 16 * window.devicePixelRatio,
                    Math.floor(i / 80) * 32 * window.devicePixelRatio
                )
                ctx.fillStyle = "red"
                ctx.fillText(
                    i.toString(16),
                    (i % 80) * 16,
                    Math.floor(i / 80) * 32 + 30,
                    16
                )
            }
        } else {
            const w = 80
            const h = 50
            for(let y = 0; y < h; y++) {
                const dv = new DataView(map_instance.map, w * y, w)
                for(let x = 0; x < w; x++) {
                    ctx.putImageData(
                        sprite_for[dv.getUint8(x)].colouredImageData(ctx),
                        x * 16 * window.devicePixelRatio,
                        y * 16 * window.devicePixelRatio
                    )
                }
            }
        }
        const df = document.createDocumentFragment()
        let header = document.createElement("h2")
        header.appendChild(document.createTextNode("Tiles"))
        df.appendChild(header)
        let n = 0
        for(const tile of map_instance.tiles) {
            const line = document.createElement("div")
            line.appendChild(document.createTextNode(tile.dump))
            if(sprite_for[n]) {
                const canvas = document.createElement("canvas")
                canvas.width = 16 * window.devicePixelRatio
                canvas.height = 16 * window.devicePixelRatio
                canvas.style.height = "16px"
                canvas.style.width = "16px"
                line.appendChild(canvas)
                const ctx = canvas.getContext("2d")
                ctx.putImageData(
                    sprite_for[n].colouredImageData(ctx),
                    0,
                    0
                )
            }
            df.appendChild(line)
            n++
        }
        header = document.createElement("h2")
        header.appendChild(document.createTextNode("Units"))
        df.appendChild(header)
        map_instance.units.forEach(unit => {
            const line = document.createElement("div")
            line.appendChild(document.createTextNode(unit.dump))
            df.appendChild(line)
        })
        while(this.out.firstChild) this.out.removeChild(this.out.firstChild)
        this.out.appendChild(df)
    }
    /**
     * Parses the file into tape chunks.
     */
    parse() {
        this.tapeChunks = []
        let lastHeader
        const wdv = new WalkableDataView(new DataView(this.data, 0, this.data.byteLength))
        wdv.skip(10)
        while(!wdv.eob) {
            const type = wdv.uint8()
            switch(type) {
                case 0x10:
                    // 10 <dd dd> <ll ll> [<..>*]
                    const delay = wdv.uint16()
                    const length = wdv.uint16()
                    const flag = wdv.uint8()
                    console.log(`Normal hunk with delay ${delay} and length ${length} at offset ${wdv.offset}, flag=${flag}`)

                    if(flag == 0) {
                        // .bas decode
                        lastHeader = this.decodeTapHeader(wdv, length - 2)
                        console.log("Header block", lastHeader)
                    } else if(flag == 0xff) {
                        this.tapeChunks.push({header: lastHeader, data: wdv.buffer(length - 2)})
                    } else {
                        console.warn(`Assuming that block flag ${flag} is application-driven`)
                        this.tapeChunks.push({data: wdv.buffer(length - 2)})
                    }
                    wdv.skip(1) // checksum
                    break
                case 0x30:
                    // 30 <ll> [<..>*]
                    const len = wdv.uint8()
                    const text = wdv.text(len)
                    console.log(`Text hunk: ${text}`)
                    break
                default:
                    throw new Error(`Cannot parse hunk ${type}`)
            }
        }
    }
}
class MapSprite {
    /**
     * @type {?ImageData}
     */
    cachedImageData = null
    colour
    map
    sprite
    /**
     *
     * @param {MapInstance} map
     * @param {number} colour
     * @param {number} n
     */
    constructor(map, colour, n) {
        this.map = map
        this.sprite = n
        this.colour = colour
        /** @type {?ImageData} */
        this.cachedImageData = null
    }
    get colours() {
        return {
            fg: [this.colour & 2, this.colour & 4, this.colour & 1].map(v => v ? 255 : 0),
            bg: [this.colour & 16, this.colour & 32, this.colour & 8].map(v => v ? 255 : 0)
        }
    }
    get dump() {
        return `${this.sprite} ${this.colour}`
    }
    get imageData() {
        return this.map.spriteContents.slice(this.sprite * 32, (this.sprite + 1) * 32)
    }
    /**
     *
     * @param {CanvasRenderingContext2D} ctx
     */
    colouredImageData(ctx) {
        if(!this.cachedImageData) {
            const d = ctx.createImageData(16 * window.devicePixelRatio, 16 * window.devicePixelRatio)
            // 64 = Deployment?
            // 128 = ?
            const colours = this.colours
            const id = new DataView(this.imageData)
            function bit(n, j) {
                return (n >> (7-j)) & 1
            }
            function pixel(x, y) {
                return (x + y * 16 * window.devicePixelRatio) * 4
            }
            // Each output row is 16 pixels wide at 4 bytes per pixel = 64 bytes
            // There are 16 of those = 1024 bytes
            //
            // Input is four 8x8 mini-sprites
            const S = 8 // The size of a mini-sprite
            for(let i = 0; i < 2; i++) {
                for(let r = 0; r < S; r++) {
                    const ao = id.getUint8(r + i * S * 2)
                    const bo = id.getUint8(r + i * S * 2 + S)
                    for(let j = 0; j < S; j++) {
                        const a = (bit(ao, j) ? colours.fg : colours.bg).concat([255])
                        const b = (bit(bo, j) ? colours.fg : colours.bg).concat([255])

                        let a_w = []
                        let b_w = []
                        for(let ox = 0; ox < window.devicePixelRatio; ox++) {
                            a_w = a_w.concat(a)
                            b_w = b_w.concat(b)
                        }
                        const x1 = j * window.devicePixelRatio
                        const x2 = (j + S) * window.devicePixelRatio

                        for(let oy = 0; oy < window.devicePixelRatio; oy++) {
                            const y = (i * S + r) * window.devicePixelRatio + oy
                            d.data.set(a_w, pixel(x1, y))
                            d.data.set(b_w, pixel(x2, y))
                        }
                    }
                }
            }
            this.cachedImageData = d
        }
        return this.cachedImageData
    }
}
class MapTile {
    /**
     *
     * @param {MapInstance} map
     * @param {number} n
     */
    constructor(map, n) {
        this.map = map
        this.n = n
    }
    get altSprite() {
        return this.map.altSpriteFor[this.n]
    }
    get dump() {
        if(this.sprite) {
            return `${this.n} 0x${this.n.toString(16)} (${this.sprite.sprite} ${this.sprite.colour} / ${this.altSprite.sprite} ${this.altSprite.colour}) ${this.name}`
        } else {
            return `${this.n} 0x${this.n.toString(16)} (no sprite) ${this.name}`
        }
    }
    get name() {
        return this.map.indices[this.n].replace(/([^])/g, s => (this.map.strings[s.charCodeAt(0)] || " "))
    }
    get sprite() {
        return this.map.spriteFor[this.n]
    }
}

class MapUnit {
    /**
     *
     * @param {MapInstance} map
     * @param {number} n
     */
    constructor(map, n) {
        this.map = map
        this.n = n
    }
    get actionPoints() {
        return this.data.getUint8(27) // Possibly including 28
    }
    get agility() {
        return this.data.getUint8(21)
    }
    get closeCombat() {
        return this.data.getUint8(19)
    }
    get constitution() {
        return this.data.getUint8(7) // and 8
    }
    get data() {
        return new DataView(this.map.unitData.slice(
            this.n * 40,
            (this.n + 1) * 40
        ))
    }
    get deathSprite() {
        return this.data.getUint8(3)
    }
    get dump() {
        return [
            "actionPoints",
            "agility",
            "closeCombat",
            "constitution",
            "deathSprite",
            "morale",
            "stamina",
            "strength",
            "weaponEntity",
            "weaponSkill"
        ].map(k => `${k} = ${this[k]}`).join("; ") + `; ${this.data}`
    }
    get morale() {
        return this.data.getUint8(11) // and 12
    }
    get stamina() {
        return this.data.getUint8(9) // and 10
    }
    get strength() {
        return this.data.getUint8(20)
    }
    get weaponEntity() {
        return this.data.getUint8(35)
    }
    get weaponSkill() {
        return this.data.getUint8(18)
    }
}
