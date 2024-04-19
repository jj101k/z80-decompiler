import { MachineState } from "./MachineState/MachineState.mjs"

/**
 * This represents state which may be set during a compile activity and may be
 * overwritten by other compile activity.
 */
export class DecompileVolatileState {
    /**
     * Where the last linear decompile run started
     */
    #entryPoint

    /**
     * @type {Record<string, Array<(content: any) => any>>}
     */
    #eventHandlers = {}

    /**
     * @type {number | null}
     */
    #jumpTo = null

    /**
     * The file offset at which the currently decoded instruction started
     */
    #startPoint = 0

    /**
     * @type {MachineState}
     */
    #storedState

    /**
     * @type {MachineState | undefined}
     */
    #workingState


    /**
     *
     * @param {number} fileOffset
     */
    addJumpTo(fileOffset) {
        this.#jumpTo = fileOffset
    }

    /**
     * Clears all state which might be present before a jump
     *
     * @returns
     */
    #clearState() {
        const state = new MachineState()
        state.clearedAt = this.#entryPoint
        state.addEventListener("storedRegisterValue", (e) => {
            this.#emit("storedRegisterValue", e)
        })

        state.addEventListener("readMemory", (location) => {
            this.#emit("readMemory", location)
        })
        state.addEventListener("storedMemory", (location) => {
            this.#emit("storedMemory", location)
        })

        return state
    }

    /**
     *
     * @param {string} event
     * @param {any} content
     */
    #emit(event, content) {
        const handlers = this.#eventHandlers[event] ?? []
        for(const handler of handlers) {
            handler(content)
        }
    }

    /**
     * Set to true during instruction parsing if it jumps to an unknown location
     */
    unknownJump = false

    /**
     *
     */
    get jumpTo() {
        return this.#jumpTo
    }

    /**
     *
     */
    get startPoint() {
        return this.#startPoint
    }

    /**
     *
     */
    get state() {
        return this.#workingState ?? this.#storedState
    }

    /**
     *
     * @param {number} loadPoint
     */
    constructor(loadPoint) {
        this.#storedState = this.#clearState()
        this.#entryPoint = loadPoint
    }

    /**
     *
     * @param {string} event
     * @param {(content: any) => any} handler
     */
    addEventListener(event, handler) {
        if(this.#eventHandlers[event]) {
            this.#eventHandlers[event].push(handler)
        }
    }

    /**
     *
     * @param {boolean} clear
     * @param {number} startPoint
     */
    initWorkingState(clear, startPoint) {
        this.#jumpTo = null
        this.#workingState = new MachineState(clear ? undefined : this.state)
        this.#startPoint = startPoint
        this.unknownJump = false
    }

    /**
     *
     * @param {number} n
     * @returns The file offset
     */
    relativeAddress(n) {
        return this.#startPoint + n
    }

    /**
     *
     * @returns A state object if changed
     */
    resolveWorkingState() {
        const workingState = this.#workingState
        this.#workingState = undefined
        if(workingState?.different) {
            workingState.different = false // Reset the flag and keep it
            this.#storedState = workingState
            return workingState
        } else {
            return null
        }
    }
}