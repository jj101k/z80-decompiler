/**
 *
 */
export const Z80Registers8B = Object.freeze({
    A: "A",
    B: "B",
    C: "C",
    D: "D",
    E: "E",
    H: "H",
    I: "I",
    L: "L",
    R: "R",
})

/**
 *
 */
export const Z80Registers16B = Object.freeze({
    BC: "BC",
    DE: "DE",
    HL: "HL",
    IX: "IX",
    IY: "IY",
    SP: "SP",
})

export const Z80CompoundRegisters = Object.freeze([
    Z80Registers16B.BC,
    Z80Registers16B.DE,
    Z80Registers16B.HL,
])