"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BufferLine_1 = require("./BufferLine");
const DataBlock_1 = require("./DataBlock");
class Buffer {
    constructor(rows, columns, scrollBack, type = "") {
        this._lines = [];
        this._x = 0;
        this._y = 0;
        this._rows = 0;
        this._columns = 0;
        this._savedX = 0;
        this._savedY = 0;
        this._savedLineNum = 0;
        this._scrollTop = 0;
        this._scrollBottom = 0;
        this.lineNum = 0;
        this.scrollBack = false;
        this._savedLines = [];
        this._maxScrollBack = 1024;
        this._rows = rows;
        this._columns = columns;
        this.type = type;
        this.scrollBack = scrollBack;
        this.scrollTop = 1;
        this.scrollBottom = this._rows;
        this.y = 1;
        this.x = 1;
    }
    get x() {
        return this._x;
    }
    set x(value) {
        this._x = value;
    }
    get y() {
        return this._y;
    }
    set y(value) {
        this._y = value;
        let line = this.get(this._y);
        if (line && !line.used) {
            line.used = true;
        }
    }
    get savedX() {
        return this._savedX;
    }
    set savedX(value) {
        this._savedX = value;
    }
    get savedY() {
        return this._savedY;
    }
    set savedY(value) {
        this._savedY = value;
    }
    get maxScrollBack() {
        return this._maxScrollBack;
    }
    set maxScrollBack(value) {
        this._maxScrollBack = value;
    }
    get lines() {
        return this._lines;
    }
    reset() {
        this._lines = [];
    }
    get size() {
        return this._lines.length;
    }
    get activeBufferLine() {
        return this._lines[this._y - 1];
    }
    get scrollTop() {
        return this._scrollTop;
    }
    set scrollTop(value) {
        this._scrollTop = value;
    }
    get scrollBottom() {
        return this._scrollBottom;
    }
    set scrollBottom(value) {
        this._scrollBottom = value;
    }
    get nextLineNum() {
        this.lineNum += 1;
        return this.lineNum;
    }
    get currentLineNum() {
        return this.lineNum;
    }
    get rows() {
        return this._rows;
    }
    get columns() {
        return this._columns;
    }
    get savedLines() {
        return this._savedLines;
    }
    get(y) {
        return this._lines[y - 1];
    }
    insert(y, ...lines) {
        let result = [];
        for (let i = 0; i < lines.length; i++) {
            let element = lines[i].element;
            if (element) {
                let afterNode = this._lines[y - 1 + i].element;
                let line = lines[i];
                result.push(afterNode);
                this._lines.splice(y - 1 + i, 0, line);
            }
        }
        return result;
    }
    append(...lines) {
        for (let i = 0; i < lines.length; i++) {
            this._lines.push(lines[i]);
        }
    }
    delete(y, deleteCount = 1, saveLines) {
        let lines = this._lines.splice(y - 1, deleteCount);
        for (let i = 0; i < lines.length; i++) {
            if (saveLines && this.scrollBack) {
                this._savedLines.push(lines[i]);
                if (this._savedLines.length > this._maxScrollBack) {
                    this._savedLines.splice(0, 1)[0].element.remove();
                }
            }
            else {
                lines[i].element.remove();
                lines = [];
            }
        }
        return lines;
    }
    resize(newRows, newCols) {
        this._scrollBottom = newRows;
        const rows = this.lines.length;
        const fragment = document.createDocumentFragment();
        if (rows < newRows) {
            for (let i = rows; i < newRows; i++) {
                let line = new BufferLine_1.BufferLine(newRows);
                this._lines.push(line);
                fragment.appendChild(line.element);
            }
        }
        else if (rows > newRows) {
            let len = rows;
            for (let i = newRows; i < len; i++) {
                let deletedLine = this._lines.splice(i, 1);
                if (deletedLine.length > 0)
                    deletedLine[0].element.remove();
                i -= 1;
                len -= 1;
            }
        }
        if (this._columns > newCols) {
            for (let i = 0; i < this._rows; i++) {
                let line = this._lines[i];
                if (!line)
                    continue;
                let len = line.blocks.length - newCols;
                line.blocks.splice(newCols, len);
                line.cols = newCols;
            }
        }
        else if (this._columns < newCols) {
            for (let i = 0; i < this._rows; i++) {
                let line = this._lines[i];
                if (!line)
                    continue;
                let len = newCols - line.blocks.length;
                for (let j = 0; j < len; j++) {
                    line.blocks.push(DataBlock_1.DataBlock.newEmptyBlock());
                }
                line.cols = newCols;
            }
        }
        this._columns = newCols;
        this._rows = newRows;
        return fragment;
    }
    clear() {
        this.y = 1;
        this.x = 1;
        this.lineNum = 0;
        this.scrollTop = 1;
        this.scrollBottom = this._rows;
    }
    fillRows() {
        let fragment = document.createDocumentFragment();
        for (let y = 0; y < this._rows; y++) {
            let line = new BufferLine_1.BufferLine(this._columns);
            this.setDataId(line.element);
            fragment.appendChild(line.element);
            this._lines.push(line);
        }
        return fragment;
    }
    getBlankLine() {
        let line = new BufferLine_1.BufferLine(this._columns);
        this.setDataId(line.element);
        line.used = true;
        return line;
    }
    setDataId(element) {
        element.setAttribute("line-num", this.nextLineNum + "");
    }
    clearSavedLines() {
        let deletedLines = this.savedLines.splice(0, this.savedLines.length);
        for (let i = 0, len = deletedLines.length; i < len; i++) {
            deletedLines[i].element.remove();
        }
    }
}
exports.Buffer = Buffer;
