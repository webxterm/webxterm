"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ScrollingRegion_1 = require("../ScrollingRegion");
var DrawFontStyle;
(function (DrawFontStyle) {
    DrawFontStyle[DrawFontStyle["NORMAL"] = 0] = "NORMAL";
    DrawFontStyle[DrawFontStyle["ITALIC"] = 1] = "ITALIC";
    DrawFontStyle[DrawFontStyle["BOLD"] = 2] = "BOLD";
    DrawFontStyle[DrawFontStyle["BOTH"] = 3] = "BOTH";
})(DrawFontStyle = exports.DrawFontStyle || (exports.DrawFontStyle = {}));
class CanvasRenderer {
    constructor(term) {
        this._measuredTextWidth = 0;
        this._font_size = 0;
        this.last_font_style = DrawFontStyle.NORMAL;
        this._height = 0;
        this._composing_x = 0;
        this._composing_y = 0;
        this._term = term;
        this._csr = new ScrollingRegion_1.ScrollingRegion();
        this._last_csr = new ScrollingRegion_1.ScrollingRegion();
        this._rendered_lines_rect = [];
        this._active_buffer = term.bufferSet.activeBuffer;
        this._saved_buffer = term.bufferSet.normal.saved_buffer;
        this._change_buffer = this._active_buffer.change_buffer;
        this._display_buffer = this._active_buffer.display_buffer;
        this._view = this.getView();
        this.ctx = this._view.getContext("2d");
        this.init();
    }
    init() {
        this.updateFontSize();
    }
    getFont(fontStyle) {
        const fontName = this._term.preferences.fontFamily.getFontName();
        if (fontStyle == DrawFontStyle.BOTH) {
            return "italic bold " + this._font_size + "px '" + fontName + "'";
        }
        else {
            if (fontStyle == DrawFontStyle.ITALIC) {
                return "italic " + this._font_size + "px '" + fontName + "'";
            }
            if (fontStyle == DrawFontStyle.BOLD) {
                return "bold " + this._font_size + "px '" + fontName + "'";
            }
            return this._font_size + "px '" + fontName + "'";
        }
    }
    updateFontSize() {
        const fontSize = this._term.preferences.fontSize.toLowerCase();
        console.info("CanvasRenderer......updateFontSize()...." + fontSize);
        let fs = 0;
        if (fontSize.indexOf("px") != -1) {
            fs = parseInt(fontSize);
        }
        else if (fontSize.indexOf("pt") != -1) {
            fs = parseInt(fontSize) / 0.75;
        }
        this._font_size = fs * 2;
        this._height = this._term.charHeight * this._term.preferences.canvasSizeMultiple;
        if (this.ctx) {
            this.updateFont(DrawFontStyle.NORMAL);
            this.ctx.textBaseline = "bottom";
            this._measuredTextWidth = Math.round(this.ctx.measureText("w").width);
        }
    }
    updateFont(fontStyle = DrawFontStyle.NORMAL) {
        if (this.ctx)
            this.ctx.font = this.getFont(fontStyle);
    }
    resize(rows, columns) {
        this.updateFontSize();
    }
    clearLine(yIndex) {
        const rect = this._rendered_lines_rect[yIndex];
        if (!rect)
            return;
        const len = rect.length;
        if (len == 0)
            return;
        const height = this.height, startY = yIndex * height;
        for (let i = 0, startX, width; i < len; i++) {
            [startX, width] = rect[i].split(",");
            if (this.ctx)
                this.ctx.clearRect(parseInt(startX), startY, parseInt(width), height);
        }
    }
    clear() {
        for (let y = 0, len = this._rendered_lines_rect.length; y < len; y++) {
            this.clearLine(y);
        }
    }
    get measuredTextWidth() {
        if (this._measuredTextWidth == 0)
            console.info("Warning: CanvasRenderer._measuredTextWidth is 0");
        return this._measuredTextWidth;
    }
    get height() {
        if (this._height == 0)
            console.info("Warning: CanvasRenderer._height is 0");
        return this._height;
    }
}
exports.CanvasRenderer = CanvasRenderer;
