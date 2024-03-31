import { DataWalker } from "./DataWalker.mjs"
import { DecompileContext } from "./DecompileContext.mjs"
import { DecomposedInstruction } from "./DecomposedInstruction/DecomposedInstruction.mjs"

/**
 *
 */
export type actionHandler<DI extends DecomposedInstruction = DecomposedInstruction> = (dw: DataWalker, context: DecompileContext, di: DI | null | undefined) => any