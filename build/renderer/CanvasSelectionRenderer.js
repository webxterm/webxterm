"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CanvasSelection_1 = require("../CanvasSelection");
const CommonUtils_1 = require("../common/CommonUtils");
const CanvasTextRenderer_1 = require("./CanvasTextRenderer");
class CanvasSelectionRenderer extends CanvasTextRenderer_1.CanvasTextRenderer {
    constructor(term) {
        super(term);
        this.isReverseSelect = false;
        this.lastAnchorPoint = new CanvasSelection_1.SelectionPoint(0, 0);
        this.lastFocusPoint = new CanvasSelection_1.SelectionPoint(0, 0);
    }
    getView() {
        return this._term.selectionView;
    }
    select(selection) {
        if (this.ctx) {
            const width = this.measuredTextWidth, height = this.height, fullWidth = this._term.columns * width;
            const anchorX = selection.anchorPoint.x, anchorY = selection.anchorPoint.y, focusX = selection.focusPoint.x, focusY = selection.focusPoint.y;
            if (CommonUtils_1.CommonUtils.isSamePoint(this.lastAnchorPoint, selection.anchorPoint)
                && CommonUtils_1.CommonUtils.isSamePoint(this.lastFocusPoint, selection.focusPoint)) {
                console.info("位置相同，不用处理。");
                return;
            }
            if (CommonUtils_1.CommonUtils.indexPoint(selection.anchorPoint, selection.focusPoint)) {
                if (this.isReverseSelect) {
                    this.clearSelected(selection);
                }
                this.isReverseSelect = false;
                let ranges = selection.ranges;
                selection.clearRanges();
                for (let y = anchorY, x = 0, w = 0, yIndex = 0, startIndex = 0, end = -1, i = 0; y <= focusY; y += height, i++) {
                    if (y == anchorY) {
                        if (y == focusY) {
                            startIndex = Math.floor(anchorX / width);
                            end = Math.floor(focusX / width);
                            w = focusX - anchorX;
                        }
                        else {
                            startIndex = Math.floor(anchorX / width);
                            end = -1;
                            w = fullWidth - anchorX;
                        }
                        x = anchorX;
                    }
                    else if (y == focusY) {
                        x = 0;
                        w = focusX;
                        startIndex = 0;
                        end = Math.floor(focusX / width);
                    }
                    else {
                        x = 0;
                        w = fullWidth;
                        startIndex = 0;
                        end = -1;
                    }
                    if (ranges[i]
                        && CommonUtils_1.CommonUtils.isSamePoint(ranges[i].startPoint, new CanvasSelection_1.SelectionPoint(x, y))
                        && CommonUtils_1.CommonUtils.isSamePoint(ranges[i].stopPoint, new CanvasSelection_1.SelectionPoint(w + x, y))) {
                        selection.ranges[i] = ranges[i];
                        continue;
                    }
                    yIndex = Math.floor(y / height);
                    let data_arr = this._display_buffer.lines[yIndex];
                    if (end == -1)
                        end = data_arr.length;
                    if (yIndex > this._term.rows - 1) {
                        continue;
                    }
                    let selectTextArray = data_arr.slice(startIndex, end);
                    let selectedContent = this.handleSelectedContent(selectTextArray);
                    let textLength = selectedContent.length;
                    if (y == anchorY && textLength == 0) {
                        selection.ranges[i] = new CanvasSelection_1.SelectionRange(0, 0, 0, 0, "");
                        continue;
                    }
                    if (textLength > 0) {
                        if (selectedContent[0] === "") {
                            selectTextArray = data_arr.slice(startIndex + 1, end);
                            w = w - width;
                            x = x + width;
                        }
                    }
                    this.drawLine(Math.floor(x / width), yIndex, this._active_buffer.display_buffer, end, true);
                    selection.ranges[i] = new CanvasSelection_1.SelectionRange(x, y, w + x, y, selectedContent.join(""));
                }
                if (selection.ranges.length < ranges.length) {
                    for (let i = selection.ranges.length, len = ranges.length; i < len; i++) {
                        if (this.ctx) {
                            this.ctx.clearRect(ranges[i].startPoint.x, ranges[i].startPoint.y, ranges[i].stopPoint.x - ranges[i].startPoint.x, this.height);
                        }
                    }
                }
            }
            else if (CommonUtils_1.CommonUtils.reverseIndexPoint(selection.anchorPoint, selection.focusPoint)) {
                if (!this.isReverseSelect) {
                    this.clearSelected(selection);
                }
                this.isReverseSelect = true;
                let ranges = selection.ranges;
                selection.clearRanges();
                for (let y = 0, x = 0, w = 0, yIndex = 0, startIndex = 0, end = 0; y <= anchorY; y += height, yIndex++) {
                    if (y < focusY) {
                        selection.ranges[yIndex] = new CanvasSelection_1.SelectionRange(0, y, 0, y, "", true);
                        if (!ranges[yIndex] || (ranges[yIndex].startPoint.x == 0 && ranges[yIndex].stopPoint.x == 0)) {
                            continue;
                        }
                        else {
                            this.clearLine(yIndex);
                        }
                        continue;
                    }
                    if (y == focusY) {
                        if (y == anchorY) {
                            startIndex = Math.floor(focusX / width);
                            end = Math.floor(anchorX / width);
                            w = anchorX - focusX;
                        }
                        else {
                            startIndex = Math.floor(focusX / width);
                            end = -1;
                            w = fullWidth - focusX;
                        }
                        x = focusX;
                        this.clearLine(yIndex);
                    }
                    else if (y == anchorY) {
                        x = 0;
                        w = anchorX;
                        startIndex = 0;
                        end = Math.floor(anchorX / width);
                    }
                    else {
                        x = 0;
                        w = fullWidth;
                        startIndex = 0;
                        end = -1;
                    }
                    if (ranges[yIndex]
                        && CommonUtils_1.CommonUtils.isSamePoint(ranges[yIndex].startPoint, new CanvasSelection_1.SelectionPoint(x, y))
                        && CommonUtils_1.CommonUtils.isSamePoint(ranges[yIndex].stopPoint, new CanvasSelection_1.SelectionPoint(w + x, y))) {
                        selection.ranges[yIndex] = ranges[yIndex];
                        continue;
                    }
                    let data_arr = this._display_buffer.lines[yIndex];
                    if (end == -1)
                        end = data_arr.length;
                    if (yIndex > this._term.rows - 1) {
                        continue;
                    }
                    let selectTextArray = data_arr.slice(startIndex, end);
                    let selectedContent = this.handleSelectedContent(selectTextArray);
                    if (selectedContent.length > 0) {
                        if (selectedContent[0] === "") {
                            selectTextArray = data_arr.slice(startIndex - 1, end);
                            w = w + width;
                            x = x - width;
                        }
                    }
                    console.info("x:" + Math.floor(x / width));
                    this.drawLine(Math.floor(x / width), yIndex, this._active_buffer.display_buffer, end, true);
                    selection.ranges[yIndex] = new CanvasSelection_1.SelectionRange(x, y, w + x, y, selectedContent.join(""));
                }
            }
            else {
            }
            selection.running = true;
            this.lastAnchorPoint = selection.anchorPoint;
            this.lastFocusPoint = selection.focusPoint;
            this._term.clipboard.value = selection.selectedContent;
            this._term.clipboard.select();
            console.info("select:selectedContent:\"" + selection.selectedContent + "\"");
        }
    }
    handleSelectedContent(selectTextArray) {
        let validIndex = -1, result = [];
        for (let i = 0, len = selectTextArray.length; i < len; i++) {
            if (selectTextArray[i] != " ") {
                validIndex = i;
            }
            result[i] = selectTextArray[i];
        }
        if (validIndex == -1) {
            return [];
        }
        return result.slice(0, validIndex + 1);
    }
    clearRect(selection) {
        this.clear();
    }
    clearSelected(selection) {
        if (!selection.running)
            return;
        if (this.ctx) {
            console.info(selection);
            this.clearRect(selection);
            selection.clearRanges();
            selection.running = false;
            let sel = window.getSelection();
            if (sel) {
                sel.removeAllRanges();
            }
            this._term.clipboard.value = "";
        }
    }
    handleSelectBlock(index, blocks, flag) {
        let chr = blocks[index];
        if (flag == 1) {
            if (CommonUtils_1.CommonUtils.isNumberLetter(chr)) {
                return index;
            }
            else {
                return -1;
            }
        }
        else if (flag == 2) {
            if (CommonUtils_1.CommonUtils.isSymbol(chr)) {
                return index;
            }
            else {
                return -1;
            }
        }
        else if (flag == 3) {
            if (CommonUtils_1.CommonUtils.isChinese(chr)
                || (chr == "" && CommonUtils_1.CommonUtils.isChinese(blocks[index - 1]))) {
                return index;
            }
            else {
                return -1;
            }
        }
        else if (flag == 4) {
            if (CommonUtils_1.CommonUtils.isChineseSymbol(chr)
                || (chr == "" && CommonUtils_1.CommonUtils.isChineseSymbol(blocks[index - 1]))) {
                return index;
            }
            else {
                return -1;
            }
        }
        else if (flag == 10) {
            if (/[)}\]>）】」》]/gi.test(chr)) {
                return index;
            }
            else {
                return -1;
            }
        }
        else if (flag == 11) {
            if (/[({\[<（【「《]/gi.test(chr)) {
                return index;
            }
            else {
                return -1;
            }
        }
        return -1;
    }
    selectBlock(selection) {
        if (this.ctx) {
            const width = this.measuredTextWidth, height = this.height, startYIndex = Math.floor(selection.anchorPoint.y / height), blocks = this._display_buffer.lines[startYIndex];
            let startXIndex = Math.floor(selection.anchorPoint.x / width);
            let selectedChar = blocks[startXIndex];
            if (selectedChar == "") {
                startXIndex -= 1;
                selectedChar = blocks[startXIndex];
            }
            let flag = 0;
            if (CommonUtils_1.CommonUtils.isNumberLetter(selectedChar)) {
                flag = 1;
            }
            else if (/[({\[<（【「《]/gi.test(selectedChar)) {
                flag = 10;
            }
            else if (/[)}\]>）】」》]/gi.test(selectedChar)) {
                flag = 11;
            }
            else if (CommonUtils_1.CommonUtils.isSymbol(selectedChar)) {
                flag = 2;
            }
            else if (CommonUtils_1.CommonUtils.isChinese(selectedChar)) {
                flag = 3;
            }
            else if (CommonUtils_1.CommonUtils.isChineseSymbol(selectedChar)) {
                flag = 4;
            }
            let leftIndex = startXIndex;
            if (flag != 10) {
                let ret_index = leftIndex;
                for (let i = startXIndex - 1; 0 <= i; i--) {
                    ret_index = this.handleSelectBlock(i, blocks, flag);
                    if (flag == 11) {
                        if (ret_index == -1)
                            continue;
                        break;
                    }
                    if (ret_index == -1)
                        break;
                    leftIndex = ret_index;
                }
                if (ret_index != -1)
                    leftIndex = ret_index;
            }
            let rightIndex = startXIndex;
            if (flag != 11) {
                let ret_index = rightIndex;
                for (let i = startXIndex + 1, len = blocks.length; i < len; i++) {
                    ret_index = this.handleSelectBlock(i, blocks, flag);
                    if (flag == 10) {
                        if (ret_index == -1)
                            continue;
                        break;
                    }
                    if (ret_index == -1)
                        break;
                    rightIndex = ret_index;
                }
                if (ret_index != -1)
                    rightIndex = ret_index;
            }
            console.info("leftIndex:" + leftIndex + ", rightIndex:" + rightIndex);
            const selectedContent = blocks.slice(leftIndex, rightIndex + 1);
            const x = leftIndex * width, y = startYIndex * height, w = (rightIndex - leftIndex + 1) * width;
            console.info("x:" + x + ", y:" + y + ", w:" + w + ", height:" + height);
            selection.clearRanges();
            this.drawLine(leftIndex, startYIndex, this._active_buffer.display_buffer, rightIndex + 1, true);
            selection.running = true;
            let selectedText = this.handleSelectedContent(selectedContent).join("");
            selection.ranges.push(new CanvasSelection_1.SelectionRange(x, y, x + w, y, selectedText));
            this._term.clipboard.value = selection.selectedContent;
            this._term.clipboard.select();
            console.info("selectedContent:" + selection.selectedContent);
            console.info(JSON.stringify(selection));
            selection.start(x, y, this._term.getOffsetTop());
            selection.stop(x + w, y);
            console.info(JSON.stringify(selection));
        }
    }
    selectLine(selection) {
        if (this.ctx) {
            const height = this.height, width = this.measuredTextWidth, fullWidth = this._term.columns * width, startY = selection.anchorPoint.y, startYIndex = Math.floor(startY / height), selectedContent = this._display_buffer.lines[startYIndex];
            selection.clearRanges();
            this.drawLine(0, startYIndex, this._active_buffer.display_buffer, -1, true);
            selection.running = true;
            const selectedText = this.handleSelectedContent(selectedContent).join("");
            selection.ranges.push(new CanvasSelection_1.SelectionRange(0, startY, fullWidth, startY, selectedText));
            selection.start(0, startY, this._term.getOffsetTop());
            selection.stop(fullWidth, startY);
            this._term.clipboard.value = selection.selectedContent;
            this._term.clipboard.select();
            console.info("selectedContent:" + selection.selectedContent);
        }
    }
    selectAll(selection) {
        if (this.ctx) {
            const width = this.measuredTextWidth, height = this.height, fullWidth = this._term.columns * width, saved_lines = this._saved_buffer.lines;
            const lineCount = saved_lines.length + this._active_buffer.size;
            if (lineCount != selection.ranges.length) {
                selection.clearRanges();
                for (const blocks of saved_lines) {
                    if (!blocks)
                        continue;
                    const selectedText = this.handleSelectedContent(blocks).join("");
                    selection.ranges.push(new CanvasSelection_1.SelectionRange(0, 0, 0, 0, selectedText));
                }
                for (const blocks of this._change_buffer.lines) {
                    if (!blocks)
                        continue;
                    const selectedText = this.handleSelectedContent(blocks).join("");
                    selection.ranges.push(new CanvasSelection_1.SelectionRange(0, 0, 0, 0, selectedText));
                }
            }
            this.clearRect(selection);
            for (let y = 0, len = this._active_buffer.size; y < len; y++) {
                this.drawLine(0, y, this._active_buffer.display_buffer, -1, true);
            }
            selection.running = true;
            selection.selectAll = true;
            this._term.clipboard.value = selection.selectedContent;
            this._term.clipboard.select();
        }
    }
    handleSelect() {
        if (!this._term.selection.running) {
            return 0;
        }
        if (this._term.selection.selectAll) {
            this.selectAll(this._term.selection);
            return 1;
        }
        else {
            return 2;
        }
    }
}
exports.CanvasSelectionRenderer = CanvasSelectionRenderer;
