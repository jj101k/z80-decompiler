const hlR = 0b10
exports.hlR = hlR
/**
 * Register pairs
 */
const rpR = {
    [0b00]: "BC",
    [0b01]: "DE",
    [hlR]: "HL",
    [0b11]: "SP",
}
exports.rpR = rpR
