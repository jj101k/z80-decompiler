export enum Z80Registers8B {
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

export enum Z80Registers16B {
    BC = "BC",
    DE = "DE",
    HL = "HL",
    IX = "IX",
    IY = "IY",
    SP = "SP",
}

export type Z80AtomicRegister = Z80Registers8B | Z80Registers16B.IX | Z80Registers16B.IX | Z80Registers16B.SP

export declare const Z80CompoundRegisters: (Z80Registers16B | Z80Registers8B)[]