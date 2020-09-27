"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DataBlockAttribute_1 = require("./DataBlockAttribute");
class LineBuffer {
    constructor(init_line_size = 0, type = "") {
        this._init_line_size = 0;
        this._current_id = 0;
        this.type = "";
        this._init_line_size = init_line_size;
        this._lines = new Array(init_line_size);
        this._line_char_widths = new Array(init_line_size);
        this._line_attrs = new Array(init_line_size);
        this._line_colors = new Array(init_line_size);
        this._line_bg_colors = new Array(init_line_size);
        this._line_soft_wraps = new Array(init_line_size);
        this._line_ids = new Array(init_line_size);
        this.type = type;
    }
    reset() {
        this._lines = new Array(this._init_line_size);
        this._line_char_widths = new Array(this._init_line_size);
        this._line_attrs = new Array(this._init_line_size);
        this._line_colors = new Array(this._init_line_size);
        this._line_bg_colors = new Array(this._init_line_size);
        this._line_soft_wraps = new Array(this._init_line_size);
        this._line_ids = new Array(this._init_line_size);
    }
    get current_id() {
        return ++this._current_id;
    }
    get lines() {
        return this._lines;
    }
    get line_char_widths() {
        return this._line_char_widths;
    }
    get line_attrs() {
        return this._line_attrs;
    }
    get line_colors() {
        return this._line_colors;
    }
    get line_bg_colors() {
        return this._line_bg_colors;
    }
    get line_soft_wraps() {
        return this._line_soft_wraps;
    }
    get line_ids() {
        return this._line_ids;
    }
    get size() {
        return this._lines.length;
    }
    get init_line_size() {
        return this._init_line_size;
    }
    newItems(initVal, columns = 0) {
        return Array.from({ length: columns }, () => initVal);
    }
    replace(yIndex, xIndex, charWidth = 1, dataAttr, data) {
        this.checkLine(yIndex);
        this._lines[yIndex][xIndex] = data;
        this._line_attrs[yIndex][xIndex] = dataAttr.sum;
        this._line_char_widths[yIndex][xIndex] = charWidth;
        this._line_colors[yIndex][xIndex] = dataAttr.colorClass;
        this._line_bg_colors[yIndex][xIndex] = dataAttr.backgroundColorClass;
    }
    replace_more(yIndex, xIndex, charWidth = 1, dataAttr, ...blocksData) {
        for (let i = 0, len = blocksData.length; i < len; i++) {
            this.replace(yIndex, xIndex + i, charWidth, dataAttr, blocksData[i]);
        }
    }
    append(yIndex, count, charWidth = 1) {
        this.checkLine(yIndex);
        this._lines[yIndex].push(...this.newItems(" ", count));
        this._line_attrs[yIndex].push(...this.newItems(DataBlockAttribute_1.ATTR_MODE_NONE, count));
        this._line_char_widths[yIndex].push(...this.newItems(charWidth, count));
        this._line_colors[yIndex].push(...this.newItems("", count));
        this._line_bg_colors[yIndex].push(...this.newItems("", count));
    }
    remove(yIndex, start, deleteCount) {
        this.checkLine(yIndex);
        this._lines[yIndex].splice(start, deleteCount);
        this._line_attrs[yIndex].splice(start, deleteCount);
        this._line_char_widths[yIndex].splice(start, deleteCount);
        this._line_colors[yIndex].splice(start, deleteCount);
        this._line_bg_colors[yIndex].splice(start, deleteCount);
    }
    checkLine(yIndex) {
        if (!this._lines[yIndex])
            throw new Error("LineBuffer._lines: rownum=" + yIndex + " is not exists");
        if (!this._line_attrs[yIndex])
            throw new Error("LineBuffer._line_attrs: rownum=" + yIndex + " is not exists");
        if (!this._line_char_widths[yIndex])
            throw new Error("LineBuffer._line_char_widths: rownum=" + yIndex + " is not exists");
        if (!this._line_colors[yIndex])
            throw new Error("LineBuffer._line_colors: rownum=" + yIndex + " is not exists");
        if (!this._line_bg_colors[yIndex])
            throw new Error("LineBuffer._line_bg_colors: rownum=" + yIndex + " is not exists");
        return true;
    }
    insertLine(start, columns, charWidth = 1) {
        this._lines.splice(start, 0, this.newItems(" ", columns));
        this._line_attrs.splice(start, 0, this.newItems(DataBlockAttribute_1.ATTR_MODE_NONE, columns));
        this._line_char_widths.splice(start, 0, this.newItems(charWidth, columns));
        this._line_colors.splice(start, 0, this.newItems("", columns));
        this._line_bg_colors.splice(start, 0, this.newItems("", columns));
        this._line_soft_wraps.splice(start, 0, 0);
        this._line_ids.splice(start, 0, this.current_id);
    }
    appendLine(columns, charWidth = 1) {
        this._lines.push(this.newItems(" ", columns));
        this._line_attrs.push(this.newItems(DataBlockAttribute_1.ATTR_MODE_NONE, columns));
        this._line_char_widths.push(this.newItems(charWidth, columns));
        this._line_colors.push(this.newItems("", columns));
        this._line_bg_colors.push(this.newItems("", columns));
        this._line_soft_wraps.push(0);
        this._line_ids.push(this.current_id);
    }
    replaceLine(yIndex, columns, charWidth = 1) {
        this._lines[yIndex] = this.newItems(" ", columns);
        this._line_attrs[yIndex] = this.newItems(DataBlockAttribute_1.ATTR_MODE_NONE, columns);
        this._line_char_widths[yIndex] = this.newItems(charWidth, columns);
        this._line_colors[yIndex] = this.newItems("", columns);
        this._line_bg_colors[yIndex] = this.newItems("", columns);
        this._line_soft_wraps[yIndex] = 0;
        this._line_ids[yIndex] = this.current_id;
    }
    removeLine(start, deleteCount) {
        this._lines.splice(start, deleteCount);
        this._line_attrs.splice(start, deleteCount);
        this._line_char_widths.splice(start, deleteCount);
        this._line_colors.splice(start, deleteCount);
        this._line_bg_colors.splice(start, deleteCount);
        this._line_soft_wraps.splice(start, deleteCount);
        this._line_ids.splice(start, deleteCount);
    }
    moveLineTo(to, start, deleteCount) {
        to.lines.push(...this._lines.splice(start, deleteCount));
        to.line_attrs.push(...this._line_attrs.splice(start, deleteCount));
        to.line_char_widths.push(...this._line_char_widths.splice(start, deleteCount));
        to.line_colors.push(...this._line_colors.splice(start, deleteCount));
        to.line_bg_colors.push(...this._line_bg_colors.splice(start, deleteCount));
        to.line_soft_wraps.push(...this.line_soft_wraps.splice(start, deleteCount));
        to.line_ids.push(...this.line_ids.splice(start, deleteCount));
    }
    moveAllLineTo(to) {
        this.moveLineTo(to, 0, this._lines.length);
    }
    copyFrom(from, start, end) {
        this._lines.push(...from.lines.slice(start, end));
        this._line_attrs.push(...from.line_attrs.slice(start, end));
        this._line_char_widths.push(...from.line_char_widths.slice(start, end));
        this._line_bg_colors.push(...from.line_bg_colors.slice(start, end));
        this._line_colors.push(...from.line_colors.slice(start, end));
        this._line_soft_wraps.push(...from.line_soft_wraps.slice(start, end));
        this._line_ids.push(...from.line_ids.slice(start, end));
    }
    copyLineFrom(from, yIndex, start = 0, end = -1) {
        if (end == -1) {
            end = from._lines[yIndex].length;
        }
        this._lines.push(from._lines[yIndex].slice(start, end));
        this._line_attrs.push(from._line_attrs[yIndex].slice(start, end));
        this._line_char_widths.push(from._line_char_widths[yIndex].slice(start, end));
        this._line_bg_colors.push(from._line_bg_colors[yIndex].slice(start, end));
        this._line_colors.push(from._line_colors[yIndex].slice(start, end));
        this._line_soft_wraps.push(from.line_soft_wraps[yIndex]);
        this._line_ids.push(from.line_ids[yIndex]);
    }
    replaceLineFrom(from, yIndex) {
        this._lines[yIndex] = from.lines[yIndex];
        this._line_attrs[yIndex] = from.line_attrs[yIndex];
        this._line_char_widths[yIndex] = from.line_char_widths[yIndex];
        this._line_colors[yIndex] = from.line_colors[yIndex];
        this._line_bg_colors[yIndex] = from.line_bg_colors[yIndex];
        this._line_soft_wraps[yIndex] = from.line_soft_wraps[yIndex];
        this._line_ids[yIndex] = from.line_ids[yIndex];
    }
}
exports.LineBuffer = LineBuffer;
