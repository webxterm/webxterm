"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ScrollingRegion {
    constructor() {
        this._top = 1;
        this._bottom = 1;
    }
    get top() {
        return this._top;
    }
    set top(value) {
        this._top = value;
    }
    get bottom() {
        return this._bottom;
    }
    set bottom(value) {
        this._bottom = value;
    }
    get top_index() {
        return this._top - 1;
    }
    get bottom_index() {
        return this._bottom - 1;
    }
}
exports.ScrollingRegion = ScrollingRegion;
