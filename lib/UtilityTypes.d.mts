import { DataWalker } from "./DataWalker.mjs"
import { DecompileContext } from "./DecompileContext.mjs"
import { DecomposedInstruction } from "./DecomposedInstruction/DecomposedInstruction.mjs"
import { UnknownMemoryValue } from "./UnknownMemoryValue.mjs"
import { UnknownRegisterValue } from "./UnknownRegisterValue.mjs"

/**
 *
 */
export type actionHandler<DI extends DecomposedInstruction = DecomposedInstruction> = (dw: DataWalker, context: DecompileContext, di: DI | null | undefined) => any

/**
 *
 */
export type anyValue = number | UnknownMemoryValue | UnknownRegisterValue