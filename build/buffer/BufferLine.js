"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DataBlock_1 = require("./DataBlock");
class BufferLine {
    constructor(cols) {
        this._blocks = [];
        this._dirty = false;
        this._used = false;
        this._element = document.createElement("div");
        this._element.className = "viewport-row";
        this._cols = cols;
        for (let i = 0; i < cols; i++) {
            this._blocks.push(DataBlock_1.DataBlock.newEmptyBlock());
        }
    }
    get element() {
        return this._element;
    }
    get dirty() {
        return this._dirty;
    }
    set dirty(value) {
        this._dirty = value;
    }
    get blocks() {
        return this._blocks;
    }
    get used() {
        return this._used;
    }
    set used(value) {
        this._used = value;
    }
    get cols() {
        return this._cols;
    }
    set cols(value) {
        this._cols = value;
    }
    get(x) {
        return this._blocks[x - 1];
    }
    insert(x, ...blocks) {
        for (let i = 0; i < blocks.length; i++) {
            this.blocks.splice(x - 1 + i, 0, blocks[i]);
        }
        const deleteCount = this.blocks.length - this.cols;
        if (0 < deleteCount) {
            this.blocks.splice(this.cols, deleteCount);
        }
    }
    replace(x, ...blocks) {
        for (let i = 0; i < blocks.length; i++) {
            this.blocks.splice(x - 1 + i, 1, blocks[i]);
        }
    }
    delete(x, deleteCount = 1) {
        return this.blocks.splice(x - 1, deleteCount);
    }
    erase(blockAttr) {
        let dirty = false;
        for (let block of this._blocks) {
            dirty = block.erase(" ", blockAttr);
            if (dirty) {
                this._dirty = true;
            }
        }
    }
}
exports.BufferLine = BufferLine;
