
import { Z80Registers8b } from "./Z80Registers.mjs"
import { Z80Registers16b } from "./Z80Registers.mjs"
import { Z80CompoundRegisters } from "./Z80Registers.mjs"

/**
 *
 */
export class MachineState {
    /**
     * @type {Record<number, number>}
     */
    #activeMemoryValues = {}

    /**
     * @type {Partial<Record<import("./Z80Registers.d.mts").Z80AtomicRegister, number | null>>}
     */
    #activeRegisterValues = {}

    /**
     * @type {Record<string, Array<(content: any) => any>>}
     */
    #eventHandlers = {}

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
     * Expands a wide register into its underlying register references.
     *
     * @param {import("./Z80Registers.d.mts").Z80Registers16b} register
     * @returns {import("./Z80Registers.d.mts").Z80AtomicRegister[]} The lowest-level registers
     */
    #expandWideRegister(register) {
        if(Z80CompoundRegisters.includes(register)) {
            return register.split("") // Just the 8080 style; in H-L order
        } else {
            return [register]
        }
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
     * @param {string} register
     * @throws
     * @returns
     */
    assertAtomicRegisterValue(register) {
        if(
            Z80CompoundRegisters.includes(register) ||
            ![Object.values(Z80Registers16b), ...Object.values(Z80Registers8b)].includes(register)
        ) {
            throw new Error(`${register} is not a valid wide register`)
        }
        return this.getAtomicRegisterValue(register)
    }

    /**
     *
     * @param {string} register
     * @throws
     * @returns
     */
    assertWideRegisterValue(register) {
        if(!Object.values(Z80Registers16b).includes(register)) {
            throw new Error(`${register} is not a valid wide register`)
        }
        return this.getWideRegisterValue(register)
    }

    /**
     *
     * @param {import("./Z80Registers.d.mts").Z80AtomicRegister} register
     */
    clearAtomicRegisterValue(register) {
        this.#activeRegisterValues[register] = null
        this.#emit("storedRegisterValue", {register, value: null})
    }

    /**
     *
     * @param {import("./Z80Registers.mjs").Z80Registers16b} register
     */
    clearWideRegisterValue(register) {
        for(const sr of this.#expandWideRegister(register)) {
            this.clearAtomicRegisterValue(sr)
        }
        this.#emit("storedRegisterValue", {register, value: null})
    }

    /**
     *
     * @param {import("./Z80Registers.mjs").Z80AtomicRegister} register
     * @returns {number | null}
     */
    getAtomicRegisterValue(register) {
        return this.#activeRegisterValues[register] ?? null
    }

    /**
     *
     * @param {number | null} address
     * @param {number} length
     * @param {number} offset
     * @returns {number | null}
     */
    getMemoryBytes(address, length, offset = 0) {
        if(address === null) {
            return null
        }
        let v = 0
        for(let i = 0; i < length; i++) {
            const vi = this.#activeMemoryValues[address + offset + i]
            if(vi === null) {
                return null
            }
            v += vi >> i
        }
        return v
    }

    /**
     *
     * @param {import("./Z80Registers.mjs").Z80Registers16b} register
     * @returns {number | null}
     */
    getWideRegisterValue(register) {
        const srs = this.#expandWideRegister(register)
        let vOut = 0
        for(const [i, sr] of srs.entries()) {
            const v = this.getAtomicRegisterValue(sr)
            if(v === null) {
                return null
            }
            vOut += v * Math.pow(256, srs.length - i - 1)
        }
        return vOut
    }

    /**
     *
     * @param {string} event
     * @param {(content: any) => any} handler
     */
    removeEventListener(event, handler) {
        if(this.#eventHandlers[event]) {
            this.#eventHandlers[event] = this.#eventHandlers[event].filter(h => h !== handler)
        }
    }

    /**
     *
     * @param {import("./Z80Registers.mjs").Z80AtomicRegister} register
     * @param {number | null} n
     */
    storeAtomicRegisterValue(register, n) {
        this.#activeRegisterValues[register] = n
        this.#emit("storedRegisterValue", {register, value: n})
    }

    /**
     *
     * @param {number} location
     * @param {number | null} n
     * @param {number} length
     */
    storeMemoryBytes(location, n, length) {
        if(n === null) {
            for(let i = 0; i < length; i++) {
                delete this.#activeMemoryValues[location + i]
            }
        } else {
            for(let i = 0; i < length; i++) {
                this.#activeMemoryValues[location + i] = (n >> i) & 0xff
            }
        }
    }

    /**
     *
     * @param {import("./Z80Registers.mjs").Z80Registers16b} register
     * @param {number | null} n
     */
    storeWideRegisterValue(register, n) {
        const srs = this.#expandWideRegister(register)
        if(n === null) {
            for(const sr of srs) {
                this.#activeRegisterValues[sr] = null
            }
        } else {
            for(const [i, sr] of srs.entries()) {
                this.#activeRegisterValues[sr] = (n >> ((srs.length - i - 1) * 8)) & 0xff
            }
        }
        this.#emit("storedRegisterValue", {register, value: n})
    }
}