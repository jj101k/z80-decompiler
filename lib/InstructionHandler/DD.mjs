import { Z80Registers } from "../Z80Registers.mjs"
import {XD} from "./XD.mjs"

/**
 * @extends {XD<typeof Z80Registers.IX>}
 */
export class DD extends XD {
    offsetRegister = Z80Registers.IX
}