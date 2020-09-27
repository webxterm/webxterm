"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SelectionPoint {
    constructor(x = 0, y = 0) {
        this._x = 0;
        this._y = 0;
        this._x = x;
        this._y = y;
    }
    get x() {
        return this._x;
    }
    get y() {
        return this._y;
    }
    reset() {
        this._x = 0;
        this._y = 0;
    }
}
exports.SelectionPoint = SelectionPoint;
class SelectionRange {
    constructor(startX, startY, stopX, stopY, selectedContent, unused = false) {
        this._collapsed = false;
        this._selectedContent = "";
        this._unused = false;
        this._startPoint = new SelectionPoint(startX, startY);
        this._stopPoint = new SelectionPoint(stopX, startY);
        if (this._startPoint.x == this._stopPoint.x
            && this._startPoint.y == this._stopPoint.y) {
            this._collapsed = true;
        }
        this._unused = unused;
        this._selectedContent = selectedContent;
    }
    get selectedContent() {
        return this._selectedContent;
    }
    get collapsed() {
        return this._collapsed;
    }
    get startPoint() {
        return this._startPoint;
    }
    get stopPoint() {
        return this._stopPoint;
    }
    get unused() {
        return this._unused;
    }
}
exports.SelectionRange = SelectionRange;
class SelectionPosition {
    constructor(row = 1, column = 1) {
        this._row = 1;
        this._column = 1;
        this._row = row;
        this._column = column;
    }
    get row() {
        return this._row;
    }
    get column() {
        return this._column;
    }
    reset() {
        this._row = 1;
        this._column = 1;
    }
}
exports.SelectionPosition = SelectionPosition;
class CanvasSelection {
    constructor() {
        this._offsetTop = 0;
        this._anchorPoint = new SelectionPoint();
        this._focusPoint = new SelectionPoint();
        this._ranges = [];
        this._running = false;
        this._enable = true;
        this._selectAll = false;
    }
    get anchorPoint() {
        return this._anchorPoint;
    }
    start(x, y, offsetTop = -1) {
        this._anchorPoint = new SelectionPoint(x, y);
        if (offsetTop != -1)
            this._offsetTop = offsetTop;
    }
    stop(x, y, offsetTop = -1) {
        this._focusPoint = new SelectionPoint(x, y);
        if (offsetTop != -1)
            this._offsetTop = offsetTop;
    }
    get offsetTop() {
        return this._offsetTop;
    }
    get focusPoint() {
        return this._focusPoint;
    }
    get running() {
        return this._running;
    }
    set running(value) {
        this._running = value;
    }
    get enable() {
        return this._enable;
    }
    set enable(value) {
        this._enable = value;
    }
    clearRanges() {
        this._ranges = [];
    }
    get ranges() {
        return this._ranges;
    }
    get selectAll() {
        return this._selectAll;
    }
    set selectAll(value) {
        this._selectAll = value;
    }
    get rangeCount() {
        return this._ranges.length;
    }
    get selectedContent() {
        let content = [];
        for (let range of this._ranges) {
            if (range.unused)
                continue;
            content.push(range.selectedContent);
        }
        return content.join("\r\n");
    }
}
exports.CanvasSelection = CanvasSelection;
