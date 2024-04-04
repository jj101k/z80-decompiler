/**
 * @type {typeof import("./Z80Registers.d.mts").Z80Registers8b}
 */
export const Z80Registers8b = Object.freeze({
    A: "A",
    Aa: "A'",
    B: "B",
    Ba: "B'",
    C: "C",
    Ca: "C'",
    D: "D",
    Da: "D'",
    E: "E",
    Ea: "E'",
    F: "F",
    Fa: "F'",
    H: "H",
    Ha: "H'",
    I: "I",
    L: "L",
    La: "L'",
    R: "R",
})

/**
 * @type {typeof import("./Z80Registers.d.mts").Z80Registers16b}
 */
export const Z80Registers16b = Object.freeze({
    AF: "AF",
    AFa: "AF'",
    BC: "BC",
    BCa: "BC'",
    DE: "DE",
    DEa: "DE'",
    HL: "HL",
    HLa: "HL'",
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
    [Z80Registers16b.BCa]: [Z80Registers8b.Ba, Z80Registers8b.Ca],
    [Z80Registers16b.DEa]: [Z80Registers8b.Da, Z80Registers8b.Ea],
    [Z80Registers16b.HLa]: [Z80Registers8b.Ha, Z80Registers8b.La],
})