/**
 *
 */
const hlR = 0b10
exports.hlR = hlR

/**
 *
 */
const spR = 0b11
exports.spR = spR
/**
 * Register pairs
 */
const rpR = {
    [0b00]: "BC",
    [0b01]: "DE",
    [hlR]: "HL",
    [spR]: "SP",
}
exports.rpR = rpR
