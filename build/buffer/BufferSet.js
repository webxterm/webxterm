"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Buffer_1 = require("./Buffer");
class BufferSet {
    init(rows, columns) {
        this._normal = new Buffer_1.Buffer(rows, columns, true, "normal");
        this._normal.fillRows();
        this._alt = new Buffer_1.Buffer(rows, columns, false, "alt");
        this._activeBuffer = this._normal;
    }
    get normal() {
        return this._normal;
    }
    get alt() {
        return this._alt;
    }
    get activeBuffer() {
        return this._activeBuffer;
    }
    get absY() {
        return this.activeBuffer.y + this.normal.saved_buffer.size;
    }
    get size() {
        if (!this._activeBuffer) {
            throw new Error("_activeBuffer is " + this._activeBuffer);
        }
        return this._activeBuffer.size;
    }
    activateNormalBuffer() {
        if (this._activeBuffer === this._normal)
            return;
        this._activeBuffer = this._normal;
    }
    activateAltBuffer() {
        if (this._activeBuffer === this._alt)
            return;
        if (!this._normal) {
            throw new Error("_normal is " + this._normal);
        }
        if (!this._alt) {
            throw new Error("_alt is " + this._alt);
        }
        this._alt.clear();
        this._alt.reset();
        this._activeBuffer = this._alt;
    }
    resize(newRows, newCols) {
        if (this.isNormal) {
            if (this._normal)
                this._normal.resize(newRows, newCols);
            if (this._alt)
                this._alt.resize_wait = true;
        }
        else {
            if (this._normal)
                this._normal.resize_wait = true;
            if (this._alt)
                this._alt.resize(newRows, newCols);
        }
    }
    get isAlt() {
        return this._activeBuffer === this._alt;
    }
    get isNormal() {
        return this._activeBuffer === this._normal;
    }
    clearSavedLines() {
    }
    printAllLines() {
    }
}
exports.BufferSet = BufferSet;
