/**
 *
 */
const hlIndirect = 0b110
exports.hlIndirect = hlIndirect

const registerRef = {
    [0b111]: "A",
    [0b000]: "B",
    [0b001]: "C",
    [0b010]: "D",
    [0b011]: "E",
    [0b100]: "H",
    [0b101]: "L",
    [hlIndirect]: "(HL)",
}

exports.registerRef = registerRef