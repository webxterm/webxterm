"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Counter {
    constructor() {
        this._count = 0;
    }
    get instance() {
        return Counter._instance;
    }
}
exports.Counter = Counter;
Counter._instance = new Counter();
