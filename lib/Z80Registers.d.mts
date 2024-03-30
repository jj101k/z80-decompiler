export enum Z80Registers8b {
    A = "A",
    B = "B",
    C = "C",
    D = "D",
    E = "E",
    H = "H",
    I = "I",
    L = "L",
    R = "R",
}

export enum Z80Registers16b {
    BC = "BC",
    DE = "DE",
    HL = "HL",
    IX = "IX",
    IY = "IY",
    SP = "SP",
}

export type Z80AtomicRegister = Z80Registers8b | Z80Registers16b.IX | Z80Registers16b.IX | Z80Registers16b.SP

export declare const Z80CompoundRegisters: (Z80Registers16b | Z80Registers8b)[]