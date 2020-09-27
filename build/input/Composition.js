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
        this.flag = false;
        this.isSafari = false;
        this.isPC = true;
        this.isProcess = false;
    }
    reset() {
        this.events = false;
        this.state = 0;
        this.update = "";
        this.done = false;
        this.running = false;
        this.end = "";
        this.flag = false;
        this.isPC = false;
        this.isProcess = false;
    }
}
exports.Composition = Composition;
