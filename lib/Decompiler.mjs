import * as fs from "fs"
import path from "path"
import { DataWalker } from "./DataWalker.mjs"
import { DecompileWalker } from "./DecompileWalker.mjs"

/**
 *
 */
export class Decompiler {
    /**
     * @readonly
     */
    static decompilerVersion = 2

    /**
     *
     */
    static includeVersion = false

    /**
     *
     * @param {string} writeFilenameSpec
     * @param {string} filename
     */
    static getWriteFilename(writeFilenameSpec, filename) {
        if(writeFilenameSpec.endsWith("/") || (fs.existsSync(writeFilenameSpec) && fs.statSync(writeFilenameSpec).isDirectory())) {
            const fileInBaseRoot = path.basename(filename).replace(/[.]tap$/, "")
            let fileOutBase

            if(this.includeVersion) {
                fileOutBase = `${fileInBaseRoot}.v${this.decompilerVersion}.txt`
            } else {
                fileOutBase = `${fileInBaseRoot}.txt`
            }
            return path.resolve(writeFilenameSpec, fileOutBase)
        } else {
            return writeFilenameSpec
        }
    }

    /**
     *
     */
    #filename

    /**
     *
     */
    #startOffset

    /**
     * @type {{dw: DataWalker, decompile: DecompileWalker} | null}
     */
    #state = null

    /**
     *
     * @returns
     */
    #getContents() {
        if (!this.#filename.match(/[.]tap$/)) {
            console.warn(`WARNING: this is only for .tap files, not: ${this.#filename}`)
        }
        const size = fs.statSync(this.#filename).size
        if (size > 65536) {
            console.warn(`WARNING: this is designed for a 16-bit address space, but ${this.#filename} is larger (${size})`)
        }
        const contents = fs.readFileSync(this.#filename)
        return contents
    }

    /**
     *
     */
    #writeOut() {
        if(this.writeFilename && this.#state) {
            const fh = fs.openSync(this.writeFilename, "wx")
            for (const l of this.#state.decompile.dump()) {
                fs.writeSync(fh, l + "\n")
            }
            fs.closeSync(fh)
        } else {
            this.#writeToConsole()
        }
    }

    /**
     *
     */
    #writeToConsole() {
        if(Decompiler.includeVersion) {
            console.log("; v" + Decompiler.decompilerVersion)
        }
        if(this.#state) {
            for (const l of this.#state.decompile.dump()) {
                console.log(l)
            }
        }
    }

    /**
     * @readonly
     */
    loadPoint

    /**
     *
     */
    writeFilename

    /**
     *
     */
    get state() {
        if(!this.#state) {
            const contents = this.#getContents()
            const dw = new DataWalker(contents.subarray(this.#startOffset))
            const decompile = new DecompileWalker(dw, this.loadPoint)

            this.#state = {dw, decompile}
        }
        return this.#state
    }

    /**
     *
     * @param {string} filename
     * @param {number} loadPoint
     * @param {number} startOffset
     * @param {string | undefined} [writeFilenameSpec]
     */
    constructor(filename, loadPoint, startOffset, writeFilenameSpec) {
        this.writeFilename = writeFilenameSpec ?
            Decompiler.getWriteFilename(writeFilenameSpec, filename) : undefined
        this.#filename = filename
        this.loadPoint = loadPoint
        this.#startOffset = startOffset
    }

    /**
     *
     * @param {number[]} entryPoints
     */
    decode(entryPoints) {
        const {decompile, dw} = this.state
        for(const entryPoint of entryPoints) {
            decompile.addTarget(entryPoint, "fn")
        }
        let bytesParsed = 0

        /**
         *
         */
        let i = 0

        /**
         *
         */
        const traceLength = 10
        /**
         * @type {number[]}
         */
        const trace = []

        for (i = 0; i < 10_000; i++) {
            const startPoint = dw.offset

            if(i >= traceLength) {
                trace.shift()
            }
            trace.push(startPoint)
            const n = decompile.decode()
            if (!n) {
                console.warn(`Last ${traceLength} PC values:`)
                for(const o of trace) {
                    console.warn(decompile.addr(o + this.loadPoint))
                }
                dw.offset = startPoint
                throw new Error(`Cannot decode value at offset ${decompile.addr(startPoint + this.loadPoint)} after ${i} points (${bytesParsed} bytes) mapped: ${decompile.u8(...dw.inspect())}`)
            }
            const byteLength = decompile.lastEndPoint - startPoint
            bytesParsed += byteLength
            if (decompile.finished) {
                return i
            }
        }

        return null
    }

    /**
     *
     */
    onError() {
        this.#writeToConsole()
    }

    /**
     *
     */
    write() {
        if (this.#state?.decompile.finished) {
            this.#writeOut()
        }
    }
}