"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DataBlockAttribute_1 = require("./DataBlockAttribute");
class DataBlock {
    constructor() {
        this._data = " ";
        this._attribute = new DataBlockAttribute_1.DataBlockAttribute();
        this._version = 0;
        this._href = "";
        this._empty = false;
    }
    static newBlock(data, attr) {
        let block = new DataBlock();
        block.data = data;
        block.copyValue(attr);
        return block;
    }
    static newEmptyBlock() {
        return new DataBlock();
    }
    get data() {
        return this._data;
    }
    set data(value) {
        this._data = value;
        this._version++;
    }
    get attribute() {
        return this._attribute;
    }
    set attribute(value) {
        this._attribute = value;
    }
    get version() {
        return this._version;
    }
    set version(value) {
        this._version = value;
    }
    get href() {
        return this._href;
    }
    set href(value) {
        this._href = value;
    }
    get empty() {
        return this._empty;
    }
    set empty(value) {
        this._empty = value;
    }
    erase(data = "", attr) {
        let dirty = this.copyValue(attr);
        if (data != this.data) {
            this.data = data;
            this.empty = false;
            this.attribute.len2 = false;
            if (!dirty)
                dirty = true;
        }
        else {
            this._version++;
        }
        return dirty;
    }
    copyValue(attr) {
        const version = this._attribute.version;
        this._attribute.backgroundColorClass = attr.backgroundColorClass;
        this._attribute.colorClass = attr.colorClass;
        this._attribute.bold = attr.bold;
        this._attribute.crossedOut = attr.crossedOut;
        this._attribute.inverse = attr.inverse;
        this._attribute.inverse = attr.inverse;
        this._attribute.invisible = attr.invisible;
        this._attribute.italic = attr.italic;
        this._attribute.len2 = attr.len2;
        this._attribute.rapidBlink = attr.rapidBlink;
        this._attribute.slowBlink = attr.slowBlink;
        this._attribute.underline = attr.underline;
        return version != this._attribute.version;
    }
    getClassName() {
        let value = [
            this._attribute.backgroundColorClass,
            this._attribute.colorClass
        ];
        if (this._attribute.bold)
            value.push("bold");
        if (this._attribute.crossedOut)
            value.push("crossed-out");
        if (this._attribute.inverse)
            value.push("inverse");
        if (this._attribute.invisible)
            value.push("invisible");
        if (this._attribute.italic)
            value.push("italic");
        if (this._attribute.len2)
            value.push("len2");
        if (this._attribute.rapidBlink)
            value.push("rapid-blink");
        if (this._attribute.slowBlink)
            value.push("slow-blink");
        if (this._attribute.underline)
            value.push("underline");
        if (this._attribute.faint)
            value.push("faint");
        return value.join(" ").trim();
    }
}
exports.DataBlock = DataBlock;
