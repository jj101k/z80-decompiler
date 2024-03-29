
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
     * @type {Record<string, number | null>}
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
     *
     * @param {import("./Z80Registers.d.mts").Z80Registers16B} register
     * @returns The lowest-level registers
     */
    #expandRegisterReference(register) {
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
     * @param {import("./Z80Registers.d.mts").Z80Registers16B} register
     */
    clearRegisterValue(register) {
        for(const sr of this.#expandRegisterReference(register)) {
            this.#activeRegisterValues[sr] = null
        }
    }

    /**
     *
     * @param {number | null} address
     * @param {number} length
     * @param {number} offset
     * @returns {number | null}
     */
    getMemoryValue(address, length = 1, offset = 0) {
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
     * @param {string} register
     * @returns {number | null}
     */
    getRegisterValue(register) {
        const p = this.#expandRegisterReference(register).map(r => this.#activeRegisterValues[r] ?? null)
        let vOut = 0
        for(const [i, v] of p.entries()) {
            if(v === null) {
                return null
            }
            vOut += v * Math.pow(256, p.length - i - 1)
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
     * @param {number} location
     * @param {number | null} n
     * @param {number} length
     */
    storeMemoryValue(location, n, length = 1) {
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
     * @param {string} register
     * @param {number | null} n
     */
    storeRegisterValue(register, n) {
        const srs = this.#expandRegisterReference(register)
        for(const [i, sr] of srs.entries()) {
            this.#activeRegisterValues[sr] = (n >> ((srs.length - i - 1) * 8)) & 0xff
        }
        this.#emit("storedRegisterValue", {register, value: n})
    }
}