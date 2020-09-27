"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CanvasRenderer_1 = require("./CanvasRenderer");
const LineBuffer_1 = require("../buffer/LineBuffer");
const DataBlockAttribute_1 = require("../buffer/DataBlockAttribute");
class CanvasTextRenderer extends CanvasRenderer_1.CanvasRenderer {
    constructor(term) {
        super(term);
        this._flushTimer = 0;
    }
    getView() {
        return this._term.textView;
    }
    hitFlushLines() {
        const buffer_size = this._active_buffer.size;
        let top_index = Math.ceil(this._term.scrollView.scrollTop / this._term.charHeight), bottom_index = top_index + buffer_size - 1;
        if (top_index < 0)
            top_index = 0;
        return top_index == this._csr.top_index && bottom_index == this._csr.bottom_index;
    }
    getDisplayBuffer() {
        const saved_size = this._saved_buffer.lines.length, saved_max_index = saved_size - 1, buffer_size = this._active_buffer.size;
        let top_index = this._term.getOffsetTop(), bottom_index = top_index + buffer_size - 1;
        if (top_index < 0)
            top_index = 0;
        if (top_index == this._csr.top_index && bottom_index == this._csr.bottom_index) {
            return this._display_buffer;
        }
        let display_buffer;
        if (saved_size == 0) {
            display_buffer = this._change_buffer;
        }
        else {
            if (bottom_index <= saved_max_index) {
                display_buffer = new LineBuffer_1.LineBuffer(0);
                display_buffer.copyFrom(this._saved_buffer, top_index, top_index + buffer_size);
            }
            else {
                if (saved_max_index <= top_index) {
                    display_buffer = this._change_buffer;
                }
                else {
                    const saved_count = saved_max_index - top_index, buffer_count = buffer_size - saved_count;
                    display_buffer = new LineBuffer_1.LineBuffer(0);
                    if (saved_count > 0)
                        display_buffer.copyFrom(this._saved_buffer, top_index, top_index + saved_count);
                    if (buffer_count > 0)
                        display_buffer.copyFrom(this._change_buffer, 0, buffer_count);
                }
            }
        }
        this._last_csr.top = this._csr.top;
        this._last_csr.bottom = this._csr.bottom;
        this._csr.top = top_index + 1;
        this._csr.bottom = bottom_index + 1;
        console.info("createSnapshot():_csr:" + JSON.stringify(this._csr) + ', last_csr:' + JSON.stringify(this._last_csr));
        return display_buffer;
    }
    get csr() {
        return this._csr;
    }
    resize(rows, columns) {
        super.resize(rows, columns);
        console.info("resize....drawBuffer...");
        this.flush();
    }
    flush() {
        this.flushLines(this.getDisplayBuffer(), false);
    }
    flushLines(displayBuffer, fromScrollEvent) {
        this._display_buffer.removeLine(0, this._display_buffer.size);
        this._display_buffer.copyFrom(displayBuffer, 0, displayBuffer.size);
        if (fromScrollEvent) {
            if (this._term.selectionRenderer) {
                const returnCode = this._term.selectionRenderer.handleSelect();
                if (this._term.cursorRenderer)
                    this._term.cursorRenderer.drawCursor();
                if (returnCode == 1)
                    return;
            }
        }
        if (this._flushTimer > 0) {
            return;
        }
        this._flushTimer = setTimeout(() => {
            for (let i = 0, len = this._term.rows; i < len; i++) {
                this.drawLine(0, i, displayBuffer);
            }
            this._flushTimer = 0;
        }, 0);
        if (this._term.cursorRenderer)
            this._term.cursorRenderer.drawCursor();
    }
    drawLine(xIndex = 0, yIndex, displayBuffer, end = -1, isSelectionView = false) {
        if (xIndex < 0)
            xIndex = 0;
        if (end > this._term.columns)
            end = this._term.columns;
        let default_color = this._term.preferences.color, default_bg_color = this._term.preferences.backgroundColor;
        if (isSelectionView) {
            default_color = !!this._term.preferences.selectionTextColor ? this._term.preferences.selectionTextColor : this._term.preferences.backgroundColor;
            default_bg_color = !!this._term.preferences.selectionColor ? this._term.preferences.selectionColor : this._term.preferences.color;
        }
        if (this.ctx) {
            const width = this.measuredTextWidth, height = this.height, startY = yIndex * height, textStartY = (yIndex + 1) * height, blocks_data = displayBuffer.lines[yIndex], blocks_attr = displayBuffer.line_attrs[yIndex], blocks_char_width = displayBuffer.line_char_widths[yIndex], blocks_color = displayBuffer.line_colors[yIndex], blocks_bg_color = displayBuffer.line_bg_colors[yIndex];
            let startX = xIndex * width;
            let charCount = xIndex;
            this.clearLine(yIndex);
            let render_start = -1, render_width = 0;
            const render_info = [];
            for (let x = xIndex, w, displaySize, len = end == -1 ? this._term.columns : end, current_font_style = CanvasRenderer_1.DrawFontStyle.NORMAL, hasUnderline, isInvisible, isBold = false, isInverse = false, isFaint = false, isItalic = false, isSlowBlink = false, attrMode; x < len; x++) {
                if (!blocks_data[x] || blocks_data[x].length == 0) {
                    continue;
                }
                if (blocks_data[x] == " " && !isSelectionView) {
                    w = width;
                    displaySize = 1;
                    if (render_start >= 0 && render_width != 0) {
                        render_info.push(render_start + "," + render_width);
                        render_start = -1;
                        render_width = 0;
                    }
                }
                else {
                    displaySize = blocks_char_width[x];
                    w = width * displaySize;
                    if (hasUnderline)
                        hasUnderline = false;
                    if (isInvisible)
                        isInvisible = false;
                    if ((attrMode = blocks_attr[x]) != DataBlockAttribute_1.ATTR_MODE_NONE) {
                        if (isBold)
                            isBold = false;
                        if (isInverse)
                            isInverse = false;
                        if (isItalic)
                            isItalic = false;
                        if (isFaint)
                            isFaint = false;
                        if (isFaint)
                            isFaint = false;
                        if (isSlowBlink)
                            isSlowBlink = false;
                        switch (attrMode) {
                            case DataBlockAttribute_1.ATTR_MODE_BOLD:
                                isBold = true;
                                break;
                            case DataBlockAttribute_1.ATTR_MODE_INVERSE:
                                isInverse = true;
                                break;
                            case DataBlockAttribute_1.ATTR_MODE_ITALIC:
                                isItalic = true;
                                break;
                            case DataBlockAttribute_1.ATTR_MODE_FAINT:
                                isFaint = true;
                                break;
                            case DataBlockAttribute_1.ATTR_MODE_UNDERLINE:
                                hasUnderline = true;
                                break;
                            case DataBlockAttribute_1.ATTR_MODE_SLOW_BLINK:
                                isSlowBlink = true;
                                break;
                            case DataBlockAttribute_1.ATTR_MODE_INVISIBLE:
                                isInvisible = true;
                                break;
                            default:
                                if (attrMode >= DataBlockAttribute_1.ATTR_MODE_INVISIBLE) {
                                    attrMode -= DataBlockAttribute_1.ATTR_MODE_INVISIBLE;
                                    isInvisible = true;
                                }
                                if (attrMode >= DataBlockAttribute_1.ATTR_MODE_SLOW_BLINK) {
                                    attrMode -= DataBlockAttribute_1.ATTR_MODE_SLOW_BLINK;
                                    isSlowBlink = true;
                                }
                                if (attrMode >= DataBlockAttribute_1.ATTR_MODE_UNDERLINE) {
                                    attrMode -= DataBlockAttribute_1.ATTR_MODE_UNDERLINE;
                                    hasUnderline = true;
                                }
                                if (attrMode >= DataBlockAttribute_1.ATTR_MODE_FAINT) {
                                    attrMode -= DataBlockAttribute_1.ATTR_MODE_FAINT;
                                    isFaint = true;
                                }
                                if (attrMode >= DataBlockAttribute_1.ATTR_MODE_ITALIC) {
                                    attrMode -= DataBlockAttribute_1.ATTR_MODE_ITALIC;
                                    isItalic = true;
                                }
                                if (attrMode >= DataBlockAttribute_1.ATTR_MODE_INVERSE) {
                                    attrMode -= DataBlockAttribute_1.ATTR_MODE_INVERSE;
                                    isInverse = true;
                                }
                                if (attrMode >= DataBlockAttribute_1.ATTR_MODE_BOLD) {
                                    attrMode -= DataBlockAttribute_1.ATTR_MODE_BOLD;
                                    isBold = true;
                                }
                        }
                        if (isItalic && isBold) {
                            current_font_style = CanvasRenderer_1.DrawFontStyle.BOTH;
                        }
                        else {
                            if (isItalic) {
                                current_font_style = CanvasRenderer_1.DrawFontStyle.ITALIC;
                            }
                            if (isBold) {
                                current_font_style = CanvasRenderer_1.DrawFontStyle.BOLD;
                            }
                        }
                        if (current_font_style != CanvasRenderer_1.DrawFontStyle.NORMAL) {
                            this.updateFont(current_font_style);
                        }
                        let color = blocks_color[x], bgColor = blocks_bg_color[x];
                        if (bgColor.length > 0 && this._term.preferences.paletteMap[bgColor])
                            bgColor = this._term.preferences.paletteMap[bgColor];
                        if (bgColor.length == 0) {
                            if (isSelectionView)
                                bgColor = color.length > 0 ? default_color : default_bg_color;
                        }
                        if (color.length > 0 && this._term.preferences.paletteMap[color])
                            color = this._term.preferences.paletteMap[color];
                        if (color.length == 0)
                            color = default_color;
                        if ((isInverse && !isSelectionView) || (!isInverse && isSelectionView)) {
                            const tmpColor = color;
                            if (!!bgColor)
                                color = bgColor;
                            if (!!tmpColor)
                                bgColor = tmpColor;
                        }
                        if (!!bgColor) {
                            this.ctx.fillStyle = bgColor;
                            this.ctx.fillRect(startX, startY, w, height);
                        }
                        if (!!color) {
                            this.ctx.fillStyle = color;
                        }
                    }
                    else {
                        if (this.last_font_style != CanvasRenderer_1.DrawFontStyle.NORMAL) {
                            this.updateFont(CanvasRenderer_1.DrawFontStyle.NORMAL);
                        }
                        if (isSelectionView) {
                            this.ctx.fillStyle = default_bg_color;
                            this.ctx.fillRect(startX, startY, this.measuredTextWidth * blocks_char_width[x], this.height);
                        }
                        this.ctx.fillStyle = default_color;
                    }
                    if (hasUnderline) {
                        let underlineHeight = this._term.preferences.canvasSizeMultiple;
                        this.ctx.fillRect(startX, textStartY - underlineHeight, w, underlineHeight);
                    }
                    if ((!isInvisible && blocks_data[x] != " ") || isSelectionView) {
                        if (render_start == -1)
                            render_start = startX;
                        render_width += w;
                        this.ctx.fillText(blocks_data[x], startX, textStartY);
                    }
                    else {
                        if (render_start >= 0 && render_width != 0) {
                            render_info.push(render_start + "," + render_width);
                            render_start = -1;
                            render_width = 0;
                        }
                    }
                }
                startX += w;
                charCount += displaySize;
                this.last_font_style = current_font_style;
            }
            if (render_start >= 0 && render_width != 0) {
                render_info.push(render_start + "," + render_width);
            }
            this._rendered_lines_rect[yIndex] = render_info;
        }
    }
}
exports.CanvasTextRenderer = CanvasTextRenderer;
