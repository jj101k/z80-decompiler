import { Z80Registers } from "./Z80Registers.mjs"

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
    [0b00]: Z80Registers.BC,
    [0b01]: Z80Registers.DE,
    [hlR]: Z80Registers.HL,
    [spR]: Z80Registers.SP,
}