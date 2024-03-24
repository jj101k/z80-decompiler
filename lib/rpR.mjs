import { Z80Registers16B } from "./Z80Registers.mjs"

/**
 *
 */
export const hlR = 0b10

/**
 *
 */
export const spR = 0b11
/**
 * Register pairs
 */
export const rpR = {
    [0b00]: Z80Registers16B.BC,
    [0b01]: Z80Registers16B.DE,
    [hlR]: Z80Registers16B.HL,
    [spR]: Z80Registers16B.SP,
}