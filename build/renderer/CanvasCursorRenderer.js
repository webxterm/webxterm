"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CanvasRenderer_1 = require("./CanvasRenderer");
class CanvasCursorRenderer extends CanvasRenderer_1.CanvasRenderer {
    constructor(term) {
        super(term);
    }
    getView() {
        return this._term.cursorView;
    }
    clearCursor() {
        this.clear();
    }
    drawComposingCursor(startX, startY) {
        if (this.ctx) {
            startX = startX * this.measuredTextWidth;
            startY = (startY - 1) * this.height;
            this.ctx.fillStyle = this._term.preferences.cursorBackgroundColor;
            this.ctx.fillRect(startX, startY, 2, this.height);
            this._rendered_lines_rect[0] = [startX + "," + startY + "," + 2 + "," + this.height];
        }
        this._rendered_lines_rect.splice(0, this._rendered_lines_rect.length);
    }
    drawCursor(blur = false, color = "", bgColor = "") {
        if (!this._active_buffer)
            return;
        if (this.ctx) {
            this.clearCursor();
            if (!this._term.cursor.show)
                return;
            const width = this.measuredTextWidth, height = this.height, y = this._active_buffer.y, x = this._active_buffer.x, yIndex = y - 1, xIndex = x - 1, startY = yIndex * height, blocks_data = this._display_buffer.lines[yIndex], blocks_char_width = this._display_buffer.line_char_widths[yIndex];
            let startX;
            {
                let count = 0;
                for (let i = 0; i < x - 1; i++) {
                    count += blocks_char_width[xIndex];
                }
                startX = count * width;
            }
            const w = width * blocks_char_width[xIndex];
            if (bgColor.length == 0) {
                bgColor = this._term.preferences.cursorBackgroundColor;
            }
            let rect = [];
            if (blur) {
                this.ctx.strokeStyle = bgColor;
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(startX + 1, startY + 1, w - 2, height - 2);
                rect.push((startX + 1) + "," + (startY + 1) + "," + (w - 2) + "," + (height - 2));
            }
            else {
                this.ctx.fillStyle = bgColor;
                this.ctx.fillRect(startX, startY, w, height);
                rect.push(startX + "," + startY + "," + w + "," + height);
            }
            this._rendered_lines_rect.push(rect);
            if (color.length == 0) {
                color = this._term.preferences.cursorColor;
            }
            this.ctx.fillStyle = color;
            this.ctx.fillText(blocks_data[xIndex] || " ", startX, y * height);
        }
    }
    cursorBlur() {
        this.drawCursor(true);
    }
    clearLine(y) {
        throw new Error("Method not implemented.");
    }
    clear() {
        for (let y = 0, len1 = this._rendered_lines_rect.length; y < len1; y++) {
            const rect = this._rendered_lines_rect[y];
            for (let x = 0, len2 = rect.length, startX, startY, width, height; x < len2; x++) {
                [startX, startY, width, height] = rect[x].split(",");
                if (this.ctx)
                    this.ctx.clearRect(parseInt(startX), parseInt(startY), parseInt(width), parseInt(height));
            }
        }
    }
}
exports.CanvasCursorRenderer = CanvasCursorRenderer;
