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
    get activeBufferLine() {
        if (!this._activeBuffer) {
            throw new Error("_activeBuffer is " + this._activeBuffer);
        }
        return this._activeBuffer.get(this._activeBuffer.y);
    }
    get size() {
        if (!this._activeBuffer) {
            throw new Error("_activeBuffer is " + this._activeBuffer);
        }
        return this._activeBuffer.lines.length;
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
        for (let i = 0; i < this._normal.size; i++) {
            let line = this._normal.lines[i];
            if (line && !line.used) {
                line.element.remove();
            }
        }
        this._alt.clear();
        this._alt.reset();
        this._alt.fillRows();
        this._activeBuffer = this._alt;
    }
    resize(newRows, newCols) {
        if (this.isNormal) {
            if (this._alt)
                this._alt.resize(newRows, newCols);
            if (this._normal)
                return this._normal.resize(newRows, newCols);
        }
        else {
            if (this._normal)
                this._normal.resize(newRows, newCols);
            if (this._alt)
                return this._alt.resize(newRows, newCols);
        }
    }
    get isAlt() {
        return this._activeBuffer === this._alt;
    }
    get isNormal() {
        return this._activeBuffer === this._normal;
    }
    clearSavedLines() {
        if (this._normal)
            this._normal.clearSavedLines();
    }
    printAllLines() {
        let strings = "";
        function printLine(line) {
            let str = "";
            for (let block of line.blocks) {
                str += block.data;
            }
            return str + "\r\n";
        }
        if (!this._normal) {
            throw new Error("_normal is " + this._normal);
        }
        for (let savedLine of this._normal.savedLines) {
            strings += printLine(savedLine);
        }
        if (this.isAlt) {
            for (let bufferLine of this._normal.lines) {
                strings += printLine(bufferLine);
            }
        }
        for (let bufferLine of this.activeBuffer.lines) {
            strings += printLine(bufferLine);
        }
        return strings;
    }
}
exports.BufferSet = BufferSet;
