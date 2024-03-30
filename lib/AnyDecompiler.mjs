import { Z80Registers8b } from "./Z80Registers.mjs"

/**
 *
 */
const hlIndirect = 0b110

/**
 *
 */
export const register = {
    [0b111]: Z80Registers8b.A,
    [0b000]: Z80Registers8b.B,
    [0b001]: Z80Registers8b.C,
    [0b010]: Z80Registers8b.D,
    [0b011]: Z80Registers8b.E,
    [0b100]: Z80Registers8b.H,
    [0b101]: Z80Registers8b.L,
}

/**
 *
 */
export const registerOrIndirect = Object.freeze({
    ...register,
    [hlIndirect]: "(HL)",
})

/**
 *
 */
export class AnyDecompiler {
    /**
     *
     * @param {number} bits
     * @param {number[]} ns
     * @returns
     */
    #data(bits, ...ns) {
        const hexChars = bits * 2 / 8
        return ns.map(n => n.toString(16).padStart(hexChars, "0")).join(" ")
    }

    /**
     * a3 != hlIndirect && b3 != hlIndirect
     *
     * @protected
     * @param {import("./BitView.mjs").BitView} n
     * @returns
     */
    copyRegisters(n) {
        if(n.a3 != hlIndirect && n.b3 != hlIndirect) {
            const s = this.reg(n.b3)
            const d = this.reg(n.a3)
            return {d, s}
        } else {
            return null
        }
    }

    /**
     * b3 == hlIndirect
     *
     * @protected
     * @param {import("./BitView.mjs").BitView} n
     * @returns
     */
    isFromMemory(n) {
        return n.b3 == hlIndirect
    }

    /**
     * a3 == hlIndirect
     *
     * @protected
     * @param {import("./BitView.mjs").BitView} n
     * @returns
     */
    isToMemory(n) {
        return n.a3 == hlIndirect
    }

    /**
     * @protected
     * @param {import("./Types.mjs").IntRange<0, 8>} n
     * @returns A register name, or (HL).
     */
    regOrIndirect(n) {
        return registerOrIndirect[n]
    }

    /**
     * @protected
     * @param {import("./Types.mjs").IntRange<0, 6> | 7} n
     * @returns
     */
    reg(n) {
        return register[n]
    }

    /**
     * a3 == hlIndirect && b3 != hlIndirect
     *
     * @protected
     * @param {import("./BitView.mjs").BitView} n
     * @returns
     */
    sourceRegister(n) {
        if(n.a3 == hlIndirect && n.b3 != hlIndirect) {
            return this.reg(n.b3)
        } else {
            return null
        }
    }

    /**
     * a3 != hlIndirect && b3 == hlIndirect
     *
     * @protected
     * @param {import("./BitView.mjs").BitView} n
     * @returns
     */
    targetRegister(n) {
        if(n.a3 != hlIndirect && n.b3 == hlIndirect) {
            return this.reg(n.a3)
        } else {
            return null
        }
    }

    /**
     * @param {number} n
     * @returns
     */
    addr(n) {
        return "$" + this.#data(16, n)
    }

    /**
     *
     * @param {number} n
     * @returns -n (n) if negative, +n otherwise
     */
    rel(n) {
        if (n >= 0) {
            return `+${n}`
        } else {
            return `${n}`
        }
    }

    /**
     *
     * @param {number[]} ns
     * @returns
     */
    u8(...ns) {
        return "$" + this.u8r(...ns)
    }

    /**
     *
     * @param {number[]} ns
     * @returns
     */
    u8r(...ns) {
        return this.#data(8, ...ns)
    }

    /**
     *
     * @param {number[]} ns
     * @returns
     */
    u16(...ns) {
        return "$" + this.u16r(...ns)
    }

    /**
     *
     * @param {number[]} ns
     * @returns
     */
    u16r(...ns) {
        return this.#data(16, ...ns)
    }
}