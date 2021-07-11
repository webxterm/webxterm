import {CanvasRenderer, DrawFontStyle} from "./CanvasRenderer";
import {Terminal} from "../Terminal";
import {Buffer} from "../buffer/Buffer";
import {
    ATTR_MODE_BOLD,
    ATTR_MODE_FAINT,
    ATTR_MODE_INVERSE,
    ATTR_MODE_INVISIBLE,
    ATTR_MODE_ITALIC,
    ATTR_MODE_NONE,
    ATTR_MODE_SLOW_BLINK,
    ATTR_MODE_UNDERLINE
} from "../buffer/DataBlockAttribute";

/**
 * 文本渲染器
 */
export class CanvasTextRenderer extends CanvasRenderer {

    // private _flushTimer: number = 0;
    private _update_display_buffer: boolean = true;

    constructor(term: Terminal) {
        super(term);
    }

    getView(): HTMLCanvasElement {
        return this._term.textView;
    }

    // /**
    //  * 是否命中当前快照
    //  */
    // hitFlushLines(): boolean {
    //     const buffer_size = this.active_buffer.size;
    //     let top_index = this._term.getOffsetTop(),
    //         bottom_index = top_index + buffer_size - 1;
    //     if (top_index < 0) top_index = 0;
    //     return top_index == this._csr.top_index && bottom_index == this._csr.bottom_index;
    // }



    /**
     * 获取当前显示的行。
     */
    getDisplayBuffer(): Buffer {
        const top_index = this._term.getOffsetTop(),
            buffer_size = this.active_buffer.size,
            bottom_index = top_index + buffer_size;

        // this._update_display_buffer = !(this._lsr.top == top_index && this._lsr.bottom == bottom_index);
        //
        // this._lsr.top = this._csr.top;
        // this._lsr.bottom = this._csr.bottom;
        // this._csr.top = top_index;
        // this._csr.bottom = bottom_index;

        return this._term.bufferSet.getDisplayBuffer(top_index, bottom_index);
    }

    // getDisplayBuffer2(): Buffer {
    //
    //     let buffer_size = this.active_buffer.size,
    //         top_index = this._term.getOffsetTop(),
    //         bottom_index = top_index + buffer_size - 1,
    //         saved_buffer_size = this.saved_buffer.size,    // 保留区大小
    //         saved_buffer_index = saved_buffer_size - 1;
    //
    //     if (top_index < 0) top_index = 0;
    //
    //     // 命中
    //     if (top_index == this._csr.top_index && bottom_index == this._csr.bottom_index) {
    //         this._update_display_buffer = false;
    //         return this.display_buffer;
    //     }
    //
    //     // 如果是备用缓冲区的话，需要将默认缓冲区的内容拷贝到保留区中。
    //     if(this._term.bufferSet.isAlt){
    //         const ncb = this._term.bufferSet.normal.change_buffer;
    //         this.saved_buffer.copyFrom(ncb, 0, ncb.size);
    //     }
    //     // 将当前的change_buffer复制到保留区中。
    //     this.saved_buffer.copyFrom(this.change_buffer, 0, this.change_buffer.size);
    //     // 最终的保留区的大小
    //     let final_saved_buffer_size = this.saved_buffer.size;
    //
    //     // 获取显示区的内存
    //     let display_buffer: Buffer = new Buffer(0);
    //     display_buffer.copyFrom(this.saved_buffer, top_index, top_index + buffer_size);
    //
    //
    //     this._lsr.top = this._csr.top;
    //     this._lsr.bottom = this._csr.bottom;
    //
    //     this._csr.top = top_index + 1;
    //     this._csr.bottom = bottom_index + 1;
    //
    //     this._update_display_buffer = true;
    //
    //     console.info("createSnapshot():_csr:" + JSON.stringify(this._csr) + ', last_csr:' + JSON.stringify(this._lsr));
    //
    //     this.saved_buffer.removeLine(saved_buffer_index + 1, final_saved_buffer_size - saved_buffer_size);
    //
    //     return display_buffer;
    // }
    //
    //
    // get csr(): ScrollingRegion {
    //     return this._csr;
    // }

    /**
     * 更新窗口大小
     * @param rows
     * @param columns
     */
    resize(rows: number, columns: number) {
        super.resize(rows, columns);

        // 重置上次的样色
        // this.last_fill_style = "";

        //
        console.info("resize....drawBuffer...");
        this.flush();
    }

    /**
     * 刷新当前缓冲区
     */
    flush() {
        this.flushLines(this.getDisplayBuffer(), false);
    }

    /**
     * 渲染当前Buffer
     * @param displayBuffer 正在显示的行
     * @param fromScrollEvent 是否从滚动的事件渲染
     */
    flushLines(displayBuffer: Buffer, fromScrollEvent: boolean): void {

        // if(this._update_display_buffer){
            this.display_buffer.removeLine(0, this.active_buffer.display_buffer.size);
            this.display_buffer.copyFrom(displayBuffer, 0, displayBuffer.size);
        // }

        // 需要重新渲染选择范围
        if (fromScrollEvent) {
            if (this._term.selectionRenderer) {
                const returnCode = this._term.selectionRenderer.renderVideo(displayBuffer);
                // 0: selection not running
                // 1: select all
                // 2: select
                // 光标渲染
                if (this._term.cursorRenderer)
                    this._term.cursorRenderer.drawCursor();
                if (returnCode == 1) return;
            }
        }

        // 非全选的时候，才渲染
        // if(!(this._term.selection.running && this._term.selection.selectAll)){
        for (let i = 0, len = this._term.rows; i < len; i++) {
            this.drawLine(0, i, displayBuffer);
        }
        // }

        // if (this._term.selectionRenderer) {
        //     this._term.selectionRenderer.handleSelect();
        // }

        // 光标渲染
        if (this._term.cursorRenderer) {
            this._term.cursorRenderer.drawCursor();
        }
    }

    /**
     * 制作行
     * @param xIndex: xIndex，yIndex的可选值为[0, this.terminal.columns - 1]
     * @param yIndex yIndex坐标，在Canvas可见区域的纵坐标，yIndex的可选值为[0, this.activeBuffer.size - 1]
     * @param displayBuffer
     * @param end 结束，默认是blocks_data.length
     * @param isSelectionView
     */
    drawLine(xIndex: number = 0,
             yIndex: number,
             displayBuffer: Buffer,
             end: number = -1,
             isSelectionView: boolean = false): void {

        if (xIndex < 0) xIndex = 0;
        if (end > this._term.columns) end = this._term.columns;

        if (!this.ctx) {
            return;
        }

        // 清除之前渲染过的内容
        this.clearLine(yIndex);

        const width = this.measuredTextWidth,                           // 一个字符的宽度
            height = this.height,                                       // 高度
            startY = yIndex * height,                                   // 左上角Y坐标
            textStartY = (yIndex + 1) * height,                         // 左下角Y坐标
            blocks_data = displayBuffer.lineChars[yIndex],                  // 块数据
            blocks_attr = displayBuffer.lineCharAttrs[yIndex],             // 块属性
            blocks_char_width = displayBuffer.lineCharWidths[yIndex], // 块字体显示宽度
            blocks_color = displayBuffer.lineCharColors[yIndex],           // 块颜色
            blocks_bg_color = displayBuffer.lineCharBgColors[yIndex],     // 块背景颜色
            len = end == -1 ? this._term.columns : end;                 // 长度
            // render_info = [];                                           // 保存渲染信息，为了后面可以快速清除渲染的内容。

        // 考虑渲染不是从第一个字符开始
        let startX = xIndex * width,    // 左上角X坐标
            charCount = xIndex,         // 字符计算，主要用于\t(制表符)。
            render_start = -1,          // 开始渲染的x
            render_width = 0,           // 渲染的长度
            hasUnderline = false,       // 是否含有下划线
            isInvisible = false,        // 是否含有下划线
            isBold = false,             // 是否加粗
            isInverse = false,          // 是否反转
            isFaint = false,            // 是否变细
            isItalic = false,           // 是否斜体
            isSlowBlink = false,        // 是否闪烁光标
            current_font_style: DrawFontStyle = DrawFontStyle.NORMAL,   // 当前字体样式（默认）
            chr;                        // 当前字符

        for (let x = xIndex; x < len; x++) {

            // 占位符
            try{
                if (!blocks_data[x] || !blocks_data[x].length) continue;
            }catch (e){
                console.info(e);
            }


            // 当前块的属性
            let attrMode = blocks_attr[x];
            const displayWidth = width * blocks_char_width[x];

            // resetAttr
            hasUnderline = isInvisible = isBold = isInverse = isFaint = isItalic = isSlowBlink = false;

            // 当前字符
            chr = blocks_data[x];

            if (attrMode != ATTR_MODE_NONE) {

                // 解析样式
                // 解析attr_mode...
                switch (attrMode) {
                    case ATTR_MODE_BOLD:
                        isBold = true;
                        break;
                    case ATTR_MODE_INVERSE:
                        isInverse = true;
                        break;
                    case ATTR_MODE_ITALIC:
                        isItalic = true;
                        break;
                    case ATTR_MODE_FAINT:
                        isFaint = true;
                        break;
                    case ATTR_MODE_UNDERLINE:
                        hasUnderline = true;
                        break;
                    case ATTR_MODE_SLOW_BLINK:
                        isSlowBlink = true;
                        break;
                    case ATTR_MODE_INVISIBLE:
                        isInvisible = true;
                        break;
                    default:
                        if (attrMode >= ATTR_MODE_INVISIBLE) {
                            attrMode -= ATTR_MODE_INVISIBLE;
                            isInvisible = true;
                        }
                        if (attrMode >= ATTR_MODE_SLOW_BLINK) {
                            attrMode -= ATTR_MODE_SLOW_BLINK;
                            isSlowBlink = true;
                        }
                        if (attrMode >= ATTR_MODE_UNDERLINE) {
                            attrMode -= ATTR_MODE_UNDERLINE;
                            hasUnderline = true;
                        }
                        if (attrMode >= ATTR_MODE_FAINT) {
                            attrMode -= ATTR_MODE_FAINT;
                            isFaint = true;
                        }
                        if (attrMode >= ATTR_MODE_ITALIC) {
                            attrMode -= ATTR_MODE_ITALIC;
                            isItalic = true;
                        }
                        if (attrMode >= ATTR_MODE_INVERSE) {
                            attrMode -= ATTR_MODE_INVERSE;
                            isInverse = true;
                        }
                        if (attrMode >= ATTR_MODE_BOLD) {
                            attrMode -= ATTR_MODE_BOLD;
                            isBold = true;
                        }
                }

                // 解析attr_mode...end...

                // 加粗和斜体
                if (isItalic && isBold) {
                    current_font_style = DrawFontStyle.BOTH;
                } else {
                    // 斜体
                    if (isItalic) {
                        current_font_style = DrawFontStyle.ITALIC;
                    }
                    // 加粗
                    if (isBold) {
                        current_font_style = DrawFontStyle.BOLD;
                    }
                }

                if (current_font_style != DrawFontStyle.NORMAL) {
                    // 不是默认的字体
                    this.updateFont(current_font_style);
                }

                // 前景色、背景色
                let color = blocks_color[x],
                    bg_color = blocks_bg_color[x];

                if (isSelectionView) {
                    // 选择层
                    bg_color = this._term.preferences.paletteMap[color] || this._term.preferences.selectionColor || this._term.preferences.color;
                    color = this._term.preferences.paletteMap[bg_color] || this._term.preferences.selectionTextColor || this._term.preferences.backgroundColor;
                } else {
                    // 文本层
                    bg_color = this._term.preferences.paletteMap[bg_color] || this._term.preferences.backgroundColor;
                    color = this._term.preferences.paletteMap[color] || this._term.preferences.color;
                }

                // 颜色反转
                if (isInverse) {
                    const tmp_color = color;
                    color = bg_color;
                    bg_color = tmp_color;
                }

                // 绘制背景色
                this.ctx.fillStyle = bg_color;
                this.ctx.fillRect(startX, startY, displayWidth, height);

                // 设置前景色
                this.ctx.fillStyle = color;

            } else {
                // 设置默认的字体。
                if (this.last_font_style != DrawFontStyle.NORMAL) {
                    this.updateFont(DrawFontStyle.NORMAL);
                }

                // 绘制背景颜色
                if (isSelectionView) {
                    // 绘制背景色
                    this.ctx.fillStyle = this._term.preferences.selectionColor || this._term.preferences.color;
                    this.ctx.fillRect(startX, startY, this.measuredTextWidth * blocks_char_width[x], this.height);

                    // 设置当前的前景色
                    this.ctx.fillStyle = this._term.preferences.selectionTextColor || this._term.preferences.backgroundColor;
                } else {
                    // 绘制文字
                    this.ctx.fillStyle = this._term.preferences.color;
                }
            }

            // 画下划线，高度为2个像素
            // 如果是联想输入，高度为4个像素。
            if (hasUnderline) {
                // blocks_composition仅仅在buffer_change中，saved_buffer不保存。
                let underlineHeight = this._term.preferences.canvasSizeMultiple;
                this.ctx.fillRect(startX, textStartY - underlineHeight, displayWidth, underlineHeight);
            }

            // 空格不输出，只右移。以减少fillText的调用次数
            // 可见 && data != " "
            if ((!isInvisible && chr != " ") || isSelectionView || isInverse) {
                // 保存渲染的信息，为了后期可以快速清除。
                if (render_start == -1) {
                    render_start = startX;
                }
                render_width += displayWidth;
                if (isBold) {
                    // 加粗字体宽度+1，不然后面重置渲染会有问题
                    render_width += 1;
                }

                // 通过测试，一次性渲染多个字符比一个一个字符的渲染慢。
                // 下划线是一个特殊的字符，会超出底部基线，因此如果当前的字符是下划线的话，textStartY需要减1。
                this.ctx.fillText(chr,
                    isBold ? startX + 1 : startX,
                    chr == "_" ? textStartY - 1 : textStartY);

            } else {
                if (render_start >= 0 && render_width != 0) {
                    // render_info.push(render_start + "," + render_width);
                    // 空格或隐藏的文本。
                    render_start = -1;
                    render_width = 0;
                }
            }

            startX += displayWidth;
            charCount += blocks_char_width[x];

            this.last_font_style = current_font_style;

        }

    }

    /**
     * 标准输出
     */
    stdout(): string {

        return "";
    }

    /**
     * 将默认缓冲区的中的change_buffer刷到保留区
     */
    pushNormalBufferToSavedBuffer(): void {

    }


}