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

export const Z80CompoundRegisters = Object.freeze([
    Z80Registers16B.BC,
    Z80Registers16B.DE,
    Z80Registers16B.HL,
])