import { Z80Registers16B } from "../Z80Registers.mjs"
import { XD } from "./XD.mjs"

/**
 *
 */
export class FD extends XD {
    offsetRegister = Z80Registers16B.IY
}