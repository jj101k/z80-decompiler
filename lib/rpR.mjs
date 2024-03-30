import { Z80Registers16b } from "./Z80Registers.mjs"

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
    [0b00]: Z80Registers16b.BC,
    [0b01]: Z80Registers16b.DE,
    [hlR]: Z80Registers16b.HL,
    [spR]: Z80Registers16b.SP,
}