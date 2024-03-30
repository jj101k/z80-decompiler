import { Z80Registers16b } from "../Z80Registers.mjs"
import { XDInstructionHandler } from "./XDInstructionHandler.mjs"

/**
 *
 */
export class DDInstructionHandler extends XDInstructionHandler {
    offsetRegister = Z80Registers16b.IX
}