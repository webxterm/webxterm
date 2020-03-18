"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Composition {
    constructor() {
        this.events = false;
        this.state = 0;
        this.update = "";
        this.done = false;
        this.running = false;
        this.end = "";
    }
    reset() {
        this.events = false;
        this.state = 0;
        this.update = "";
        this.done = false;
        this.running = false;
        this.end = "";
    }
}
exports.Composition = Composition;
