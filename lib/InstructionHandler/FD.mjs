import { Z80Registers } from "../Z80Registers.mjs"
import {XD} from "./XD.mjs"

/**
 * @extends {XD<typeof Z80Registers.IY>}
 */
export class FD extends XD {
    offsetRegister = Z80Registers.IY
}