/**
 * @type {typeof import("./Z80Registers.d.mts").Z80Registers8b}
 */
export const Z80Registers8b = Object.freeze({
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
 * @type {typeof import("./Z80Registers.d.mts").Z80Registers16b}
 */
export const Z80Registers16b = Object.freeze({
    BC: "BC",
    DE: "DE",
    HL: "HL",
    IX: "IX",
    IY: "IY",
    SP: "SP",
})

export const Z80CompoundRegisters = Object.freeze([
    Z80Registers16b.BC,
    Z80Registers16b.DE,
    Z80Registers16b.HL,
])