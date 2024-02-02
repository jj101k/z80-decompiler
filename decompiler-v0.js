//@ts-check
const fs = require("fs")
const [filename] = process.argv.slice(2)
const contents = fs.readFileSync(filename)

const loadPoint = 0x5e27 // From previous file

const codes = {
    [0x00]: {n: "NOP"},
    [0x01]: {a: "s", n: "LD BC, nn"},
    [0x06]: {a: "c", n: "LD B, n"},
    [0x11]: {a: "s", n: "LD DE, nn"},
    [0x16]: {a: "c", n: "LD D, n"},
    [0x20]: {a: "d", n: "JR NZ, d"},
    [0x21]: {a: "s", n: "LD HL, nn"},
    [0x31]: {a: "s", n: "LD SP, nn"},
    [0x32]: {a: "s", n: "LD (nn), A"},
    [0x34]: {n: "INC (HL)"},
    [0x36]: {a: "c", n: "LD (HL), n"},
    [0x3a]: {a: "s", n: "LD A, (nn)"},
    [0x3e]: {a: "c", n: "LD A, n"},
    [0x47]: {n: "LD B, A"},
    [0x5f]: {n: "LD E, A"},
    [0x78]: {n: "LD A, B"},
    [0x90]: {n: "SUB B"},
    [0xaf]: {n: "XOR A"},
    [0xb7]: {n: "OR A"},
    [0xc1]: {n: "POP BC"},
    [0xc2]: {a: "s", n: "JP NZ nn"},
    [0xc3]: {a: "s", n: "JP nn", o: 1},
    [0xc5]: {n: "PUSH BC"},
    [0xc6]: {a: "c", n: "ADD A, n"},
    [0xcd]: {a: "s", n: "CALL nn"},
    [0xd3]: {a: "c", n: "OUT (n), A"},
    [0xd6]: {a: "c", n: "SUB n"},
    [0xedb0]: {n: "LDIR"},
    [0xf3]: {n: "DI"},
    [0xf5]: {n: "PUSH AF"},
    [0xfe]: {a: "c", n: "CP n"},
}

const tryCodes = {
    [0xed]: [0xb0],
}

const handleCode = (c, o, o2) => {
    if(c.a) {
        switch(c.a) {
            case "c": {
                const a = contents[o]
                o ++
                console.log(`${o2}: ` + c.n.replace(/n/, a.toString(16)))
                break
            }
            case "d": {
                let dv = new DataView(contents.buffer, o, 2)
                const a = dv.getInt8(0)
                o ++
                console.log(`${o2}: ` + c.n.replace(/d/, a.toString(16)))
                break
            }
            case "s": {
                let dv = new DataView(contents.buffer, o, 2)
                const a = dv.getUint16(0, true)
                if(c.o) {
                    o = a - loadPoint
                } else {
                    o += 2
                }
                console.log(`${o2}: ` + c.n.replace(/nn/, a.toString(16)))
                break
            }
        }
    } else {
        console.log(`${o2}: ` + c.n)
    }
    return o
}

const decode = (o) => {
    const c = codes[contents[o]]
    if(c) {
        return handleCode(c, o + 1, o)
    }
    if(tryCodes[contents[o]]) {
        if(tryCodes[contents[o]].includes(contents[o+1])) {
            const c = codes[(contents[o] << 8) + contents[o+1]]
            if(c) {
                return handleCode(c, o + 2, o)
            } else {
                throw new Error("internal error")
            }
        }
    }
    const bytes = [...contents.subarray(o, o + 3)].map(i => (+i).toString(16).padStart(2, "0"))
    throw new Error(`Cannot decode value: ` + bytes.join(" "))
}
let o = 1
for(let i = 0; i < 100; i++) {
    o = decode(o)
}

// See DECOMPILER.md