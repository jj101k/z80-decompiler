"use strict"

class GridMap {
    /**
     * 
     * @param {number} w 
     * @param {number} l 
     */
    constructor(w, l) {        
        this.w = w
        this.l = l
        /** @type {?PositionedNode[]} */
        this.nodes = Array(l * l)
    }
    get cw() {
        return this.w / this.l
    }
    /**
     * 
     * @param {PositionedNode} n 
     */
    addNode(n) {
        this.nodes[n.x + n.y * this.l] = n
        n.map = this
    }
    display(ctx) {
        ctx.scale(this.cw, this.cw)
        for(let x = 1; x < 10; x++) {
            ctx.moveTo(x, 0)
            ctx.lineTo(x, this.l)
        }
        for(let y = 1; y < 10; y++) {
            ctx.moveTo(0, y)
            ctx.lineTo(this.l, y)
        }
        ctx.lineWidth = 2 / this.cw
        ctx.stroke()
    }
    /**
     * 
     * @param {number} x 
     * @param {number} y 
     * @returns {?PositionedNode}
     */
    nodeAt(x, y) {
        return this.nodes[x + y * this.l]
    }
    /**
     * 
     * @param {number} x 
     * @param {number} y 
     * @returns {?boolean}
     */
    validAddress(x, y) {
        return x >= 0 && y >= 0 && x < this.l && y < this.l
    }
}

class PositionedNode {
    /**
     * 
     * @param {number} x 
     * @param {number} y 
     * @param {?string} [colour]
     */
    constructor(x, y, colour = null) {
        this.x = x
        this.y = y
        this.colour = colour
        /** @type {GridMap} */
        this.map = null
    }
    display(ctx) {
        ctx.save()
        ctx.translate(this.x, this.y)
        ctx.fillStyle = this.colour
        ctx.fillRect(0.1, 0.1, 0.8, 0.8)
        ctx.restore()
    }
    /**
     * 
     * @param {*} ctx 
     * @returns {number}
     */
    stepOut(ctx) {
        if(!this.routes) {
            this.routes = [this]
        }
        let new_routes = []
        let steps_taken = 0
        let route_found = this.routes.some(path => {
            let next_steps = [1, -1].map(x => ({x: x + path.x, y: path.y})).concat(
                [1, -1].map(y => ({x: path.x, y: y + path.y}))
            )
            return next_steps.some(step => {
                if(this.map.validAddress(step.x, step.y)) {
                    let existing_node = this.map.nodeAt(step.x, step.y)
                    if(!existing_node) {
                        steps_taken++
                        let p = new PathNode(step.x, step.y, path)
                        this.map.addNode(p)
                        p.display(ctx)
                        new_routes.push(p)
                    } else if(
                        existing_node instanceof PathNode && (
                            (this instanceof PathNode && existing_node.ownedBy !== this.ownedBy) ||
                            (!(this instanceof PathNode) && existing_node.ownedBy !== this)
                        )
                    ) {
                        return true
                    }
                }
                return false
            })
        })
        this.routes = new_routes
        if(route_found) {
            console.log("Route found")
            return -1000000
        } else {
            return steps_taken
        }
    }
}

class PathNode extends PositionedNode {
    /**
     * 
     * @param {number} x 
     * @param {number} y 
     * @param {PositionedNode} from_node
     */
    constructor(x, y, from_node) {
        super(x, y, "black")
        this.from = from_node
        if(this.from instanceof PathNode) {
            this.ownedBy = this.from.ownedBy
        } else {
            this.ownedBy = this.from
        }
    }
}

class GridTest {
    init() {
        let c = document.getElementById("grid")
        if(c instanceof HTMLCanvasElement) {
            var ctx = c.getContext("2d")

            let map = new GridMap(500, 10)
            map.display(ctx)

            let obstructions = []
            for(let i = 0; i < 31; i++) {
                obstructions.push(new PositionedNode(
                    Math.floor(Math.random() * 10),
                    Math.floor(Math.random() * 10),
                    "red"
                ))
            }

            let start = new PositionedNode(
                Math.floor(Math.random() * 10),
                Math.floor(Math.random() * 10),
                "green"
            )
            let finish = new PositionedNode(
                Math.floor(Math.random() * 10),
                Math.floor(Math.random() * 10),
                "blue"
            )
            obstructions.forEach(o => map.addNode(o))
            map.addNode(start) 
            map.addNode(finish) 
            obstructions.forEach(o => o.display(ctx))    
            start.display(ctx)
            finish.display(ctx)

            start.stepOut(ctx)
            finish.stepOut(ctx)

            let i = setInterval(() => {
                if(start.stepOut(ctx) <= 0 || finish.stepOut(ctx) <= 0) {
                    clearTimeout(i)
                    console.log("done")
                }
            }, 100)

            this.map = map
        } else {
            console.log("Well, that's the wrong element type")
        }
    }
}