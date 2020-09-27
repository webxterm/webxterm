"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const LineBuffer_1 = require("./LineBuffer");
class Buffer {
    constructor(rows, columns, scrollBack, type = "") {
        this._x = 0;
        this._y = 0;
        this._high_water = 0;
        this._rows = 0;
        this._columns = 0;
        this._savedX = 0;
        this._savedY = 0;
        this._scrollTop = 0;
        this._scrollBottom = 0;
        this.scrollBack = false;
        this._maxScrollBack = -1;
        this._resize_wait = false;
        this._rows = rows;
        this._columns = columns;
        this.type = type;
        this.scrollBack = scrollBack;
        this.scrollTop = 1;
        this.scrollBottom = this._rows;
        this.y = 1;
        this.x = 1;
        this._high_water = 1;
        this._change_buffer = new LineBuffer_1.LineBuffer(rows, "change_buffer");
        this._saved_buffer = new LineBuffer_1.LineBuffer(0, "saved_buffer");
        this._display_buffer = new LineBuffer_1.LineBuffer(0, "display_buffer");
        this._undo_buffer = new LineBuffer_1.LineBuffer(0, "undo_buffer");
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
        if (this._high_water < value) {
            this._high_water = value;
        }
    }
    get high_water() {
        return this._high_water;
    }
    resetHighWater() {
        this._high_water = 1;
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
    get resize_wait() {
        return this._resize_wait;
    }
    set resize_wait(value) {
        this._resize_wait = value;
    }
    reset() {
        this._change_buffer.reset();
        this._saved_buffer.reset();
        this._display_buffer.reset();
    }
    get size() {
        return this._change_buffer.lines.length;
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
    get rows() {
        return this._rows;
    }
    get columns() {
        return this._columns;
    }
    get change_buffer() {
        return this._change_buffer;
    }
    get saved_buffer() {
        return this._saved_buffer;
    }
    get display_buffer() {
        return this._display_buffer;
    }
    get undo_buffer() {
        return this._undo_buffer;
    }
    resize(newRows, newCols) {
        this._scrollBottom = newRows;
        const currentRows = this.size;
        const currentCols = this.columns;
        if (currentRows != newRows) {
            this._change_buffer.moveAllLineTo(this._saved_buffer);
            let start = this._saved_buffer.lines.length - newRows;
            this._saved_buffer.moveLineTo(this._change_buffer, start < 0 ? 0 : start, newRows);
            const cur_buf_row_count = this._change_buffer.lines.length;
            if (currentRows < newRows) {
                this._y += cur_buf_row_count - currentRows;
                const appendRowCount = newRows - cur_buf_row_count;
                if (appendRowCount > 0) {
                    this.appendLine(appendRowCount);
                }
            }
            else if (currentRows > newRows) {
                this._y -= (currentRows - newRows);
            }
        }
        if (currentCols > newCols) {
            for (let i = 0; i < this._rows; i++) {
                this.remove(i, newCols, currentCols - newCols);
            }
        }
        else if (currentCols < newCols) {
            for (let i = 0; i < this._rows; i++) {
                this.append(i, newCols - currentCols);
            }
        }
        this._columns = newCols;
        this._rows = newRows;
    }
    clear() {
        this.y = 1;
        this.x = 1;
        this.scrollTop = 1;
        this.scrollBottom = this._rows;
    }
    insertLine(start, count) {
        for (let i = 0; i < count; i++) {
            this._change_buffer.insertLine(start + i, this.columns);
        }
    }
    appendLine(count = 1) {
        for (let i = 0; i < count; i++) {
            this._change_buffer.appendLine(this._columns);
        }
    }
    removeLine(start, count, scroll_back = false) {
        if (scroll_back && this.scrollBack) {
            this._change_buffer.moveLineTo(this._saved_buffer, start, count);
            if (this._saved_buffer.lines.length > this.maxScrollBack) {
                this._saved_buffer.removeLine(0, 1);
            }
        }
        else {
            this._change_buffer.removeLine(start, count);
        }
    }
    eraseLine(y, blockAttr) {
        if (!this._change_buffer.lines[y - 1]) {
            console.info("eraseLine:this._lines[y - 1]" + this._change_buffer.lines[y - 1]);
            return;
        }
        for (let xIndex = 0, len = this._change_buffer.lines[y - 1].length; xIndex < len; xIndex++) {
            this.replace(y - 1, xIndex, 1, blockAttr, " ");
        }
    }
    fillRows() {
        if (!this._rows) {
            throw new Error("this._rows is " + this._rows);
        }
        else {
            for (let y = 0; y < this._rows; y++) {
                this._change_buffer.replaceLine(y, this.columns);
            }
        }
    }
    remove(yIndex, start, deleteCount) {
        this._change_buffer.remove(yIndex, start, deleteCount);
    }
    append(yIndex, count) {
        this._change_buffer.append(yIndex, count);
    }
    replace(yIndex, xIndex, charWidth = 1, dataAttr, ...blocksData) {
        for (let i = 0, len = blocksData.length; i < len; i++) {
            this._change_buffer.replace(yIndex, xIndex + i, charWidth, dataAttr, blocksData[i]);
        }
    }
    erase(yIndex, xIndex, blockAttr) {
        const block = this._change_buffer.lines[yIndex][xIndex];
        if (!block && block.length == 0) {
            try {
                this.replace(yIndex, xIndex - 1, 1, blockAttr, " ");
            }
            catch (e) {
            }
        }
        this.replace(yIndex, xIndex, 1, blockAttr, " ");
    }
    copy_change_buffer_to_undo_buffer(yIndex) {
        this.change_buffer.checkLine(yIndex);
        for (let i = 0, len = this._undo_buffer.line_ids.length; i < len; i++) {
            if (this._undo_buffer.line_ids[i] == this._change_buffer.line_ids[yIndex]) {
                this._undo_buffer.removeLine(i, 1);
                break;
            }
        }
        this._undo_buffer.copyLineFrom(this._change_buffer, yIndex);
    }
    rollback() {
        if (this._undo_buffer.size == 0)
            return;
        const count = this._change_buffer.line_ids.length;
        for (let i = 0, len = this._undo_buffer.line_ids.length; i < len; i++) {
            for (let j = 0; j < count; j++) {
                if (this._undo_buffer.line_ids[i] == this._change_buffer.line_ids[j]) {
                    this._change_buffer.replaceLineFrom(this._undo_buffer, j);
                }
            }
        }
    }
}
exports.Buffer = Buffer;
