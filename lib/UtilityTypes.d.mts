import { DataWalker } from "./DataWalker.mjs"
import { DecompileContext } from "./DecompileContext.mjs"
import { DecomposedInstruction } from "./DecomposedInstruction/DecomposedInstruction.mjs"
import { UnknownClampedValue } from "./UnknownClampedValue.mjs"
import { UnknownExpressionValue } from "./UnknownExpressionValue.mjs"
import { UnknownMemoryValue } from "./UnknownMemoryValue.mjs"
import { UnknownRegisterValue } from "./UnknownRegisterValue.mjs"
import { UnknownValue } from "./UnknownValue.mjs"

/**
 *
 */
export type actionHandler<DI extends DecomposedInstruction = DecomposedInstruction> = (dw: DataWalker, context: DecompileContext, di: DI) => any

/**
 *
 */
export type anyValue = number | UnknownMemoryValue | UnknownRegisterValue | UnknownExpressionValue | UnknownClampedValue | UnknownValue