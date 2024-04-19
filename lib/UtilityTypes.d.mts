import { DecompileContext } from "./DecompileContext.mjs"
import { DecomposedInstruction } from "./DecomposedInstruction/DecomposedInstruction.mjs"
import { UnknownClampedValue, UnknownExpressionValue, UnknownMemoryValue, UnknownRegisterValue, UnknownValue } from "./Value/index.mjs"

/**
 *
 */
export type actionHandler<DI extends DecomposedInstruction = DecomposedInstruction> = (context: DecompileContext, di: DI) => any

/**
 *
 */
export type anyValue = number | UnknownMemoryValue | UnknownRegisterValue | UnknownExpressionValue | UnknownClampedValue | UnknownValue