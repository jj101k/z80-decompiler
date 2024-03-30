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

/**
 * @type {Partial<Record<import("./Z80Registers.d.mts").Z80Registers16b, import("./Z80Registers.d.mts").Z80AtomicRegister[]>>}
 */
export const Z80CompoundRegisters = Object.freeze({
    [Z80Registers16b.BC]: [Z80Registers8b.B, Z80Registers8b.C],
    [Z80Registers16b.DE]: [Z80Registers8b.D, Z80Registers8b.E],
    [Z80Registers16b.HL]: [Z80Registers8b.H, Z80Registers8b.L],
})