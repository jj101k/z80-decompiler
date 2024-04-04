export enum Z80Registers8b {
    A = "A",
    Aa = "A'",
    B = "B",
    Ba = "B'",
    C = "C",
    Ca = "C'",
    D = "D",
    Da = "D'",
    E = "E",
    Ea = "E'",
    F = "F",
    Fa = "F'",
    H = "H",
    Ha = "H'",
    I = "I",
    L = "L",
    La = "L'",
    R = "R",
}

export enum Z80Registers16b {
    AF = "AF",
    AFa = "AF'",
    BC = "BC",
    BCa = "BC'",
    DE = "DE",
    DEa = "DE'",
    HL = "HL",
    HLa = "HL'",
    IX = "IX",
    IY = "IY",
    SP = "SP",
}

export type Z80AtomicRegister = Z80Registers8b | Z80Registers16b.IX | Z80Registers16b.IX | Z80Registers16b.SP

export declare const Z80CompoundRegisters: Partial<Record<Z80Registers16b, Z80AtomicRegister[]>>