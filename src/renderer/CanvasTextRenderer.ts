import {CanvasRenderer, DrawFontStyle} from "./CanvasRenderer";
import {Terminal} from "../Terminal";
import {LineBuffer} from "../buffer/LineBuffer";
import {ScrollingRegion} from "../ScrollingRegion";
import {
    ATTR_MODE_BOLD,
    ATTR_MODE_FAINT,
    ATTR_MODE_INVERSE, ATTR_MODE_INVISIBLE,
    ATTR_MODE_ITALIC,
    ATTR_MODE_NONE, ATTR_MODE_SELECTION, ATTR_MODE_SLOW_BLINK, ATTR_MODE_UNDERLINE
} from "../buffer/DataBlockAttribute";

/**
 * 文本渲染器
 */
export class CanvasTextRenderer extends CanvasRenderer {

    private _flushTimer: number = 0;

    constructor(term: Terminal) {
        super(term);
    }

    getView(): HTMLCanvasElement {
        return this._term.textView;
    }

    /**
     * 是否命中当前快照
     */
    hitFlushLines(): boolean {
        const buffer_size = this._active_buffer.size;
        let top_index = Math.ceil(this._term.scrollView.scrollTop / this._term.charHeight)
            , bottom_index = top_index + buffer_size - 1;
        if(top_index < 0) top_index = 0;
        return top_index == this._csr.top_index && bottom_index == this._csr.bottom_index;
    }

    /**
     * 获取当前显示的行。
     */
    getDisplayBuffer(): LineBuffer {

        const saved_size = this._saved_buffer.lines.length
            , saved_max_index = saved_size - 1
            , buffer_size = this._active_buffer.size;

        let top_index = this._term.getOffsetTop()
            , bottom_index = top_index + buffer_size - 1;

        if(top_index < 0) top_index = 0;

        if(top_index == this._csr.top_index && bottom_index == this._csr.bottom_index){
            return this._display_buffer;
        }

        // 默认
        let display_buffer: LineBuffer;

        // 保留区是空的。
        if(saved_size == 0){
            // 显示的所有行都在缓冲区
            display_buffer = this._change_buffer;
        } else {
            if(bottom_index <= saved_max_index){
                // 显示的所有行都在保留区、
                display_buffer = new LineBuffer(0);
                display_buffer.copyFrom(this._saved_buffer, top_index, top_index + buffer_size);
            } else {
                if(saved_max_index <= top_index){
                    // 显示的所有行都在缓冲区
                    display_buffer = this._change_buffer;
                } else {
                    // 保留区需要读取的行数
                    const saved_count = saved_max_index - top_index
                        // 缓冲区需要读取的行数
                        , buffer_count = buffer_size - saved_count;

                    display_buffer = new LineBuffer(0);
                    if(saved_count > 0) display_buffer.copyFrom(this._saved_buffer, top_index, top_index + saved_count);
                    if(buffer_count > 0) display_buffer.copyFrom(this._change_buffer, 0, buffer_count);

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


    get csr(): ScrollingRegion {
        return this._csr;
    }

    /**
     * 更新窗口大小
     * @param rows
     * @param columns
     */
    resize(rows: number, columns: number){
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
    flush(){
        this.flushLines(this.getDisplayBuffer(), false);
    }

    /**
     * 渲染当前Buffer
     * @param displayBuffer 正在显示的行
     * @param fromScrollEvent 是否从滚动的事件渲染
     */
    flushLines(displayBuffer: LineBuffer, fromScrollEvent: boolean): void{

        //
        this._display_buffer.removeLine(0, this._display_buffer.size);
        this._display_buffer.copyFrom(displayBuffer, 0, displayBuffer.size);

        // 需要重新渲染选择范围
        if(fromScrollEvent){
            if(this._term.selectionRenderer){
                const returnCode = this._term.selectionRenderer.handleSelect();
                // 0: selection not running
                // 1: select all
                // 2: select
                // 光标渲染
                if(this._term.cursorRenderer) this._term.cursorRenderer.drawCursor();
                if(returnCode == 1) return;
            }
        }

        // console.info("drawBuffer...");

        // if(this.ctx){
        //     this.ctx.font = this.getFont();
        //     this.ctx.fillStyle = this._term.preferences.color;
        // }
        if(this._flushTimer > 0){
            return;
        }

        this._flushTimer = setTimeout(() => {
            for(let i = 0, len = this._term.rows; i < len; i++){
                this.drawLine(0,i, displayBuffer);
            }
            this._flushTimer = 0;

        }, 0);

        // 光标渲染
        if(this._term.cursorRenderer) this._term.cursorRenderer.drawCursor();
    }


    // /**
    //  * 清除指定行
    //  * @param yIndex
    //  */
    // clearLine(yIndex: number): void{
    //     // 空行不处理。
    //     const rect = this._rendered_lines_rect[yIndex];
    //     if(!rect) return;
    //     const len = rect.length;
    //     if(len == 0) return;
    //
    //     const height = this.height, startY = yIndex * height;
    //     for(let i = 0, startX, width; i < len; i++){
    //         [startX, width] = rect[i].split(",");
    //         if(this.ctx) this.ctx.clearRect(parseInt(startX), startY, parseInt(width), height);
    //     }
    // }
    //
    // /**
    //  * 全部清除
    //  */
    // clear(): void {
    //     for(let y = 0, len = this._rendered_lines_rect.length; y < len; y++){
    //         this.clearLine(y);
    //     }
    // }


    /**
     * 制作行
     * @param xIndex: xIndex，yIndex的可选值为[0, this.terminal.columns - 1]
     * @param yIndex yIndex坐标，在Canvas可见区域的纵坐标，yIndex的可选值为[0, this.activeBuffer.size - 1]
     * @param displayBuffer
     * @param end 结束，默认是blocks_data.length
     * @param isSelectionView
     */
    drawLine(xIndex: number = 0
             , yIndex: number
             , displayBuffer: LineBuffer
             , end: number = -1
             , isSelectionView: boolean = false): void{

        if(xIndex < 0) xIndex = 0;
        if(end > this._term.columns) end = this._term.columns;

        if(this.ctx){

            const width = this.measuredTextWidth   // 一个字符的宽度
                , height = this.height // 高度
                , startY = yIndex * height  // 左上角Y坐标
                , textStartY = (yIndex + 1) * height;   // 左下角Y坐标

            const blocks_data = displayBuffer.lines[yIndex]    // 数据
                , blocks_attr = displayBuffer.line_attrs[yIndex]   // 属性
                , blocks_char_width = displayBuffer.line_char_widths[yIndex]   //
                , blocks_color = displayBuffer.line_colors[yIndex]
                , blocks_bg_color = displayBuffer.line_bg_colors[yIndex];

            // 考虑渲染不是从第一个字符开始
            let startX = xIndex * width;                 // 左上角X坐标
            let charCount = xIndex;  // 字符计算，主要用于\t(制表符)。

            // 清除之前渲染过的内容
            this.clearLine(yIndex);

            // ['100,100;']
            // 保存渲染信息，为了后面可以快速清除渲染的内容。
            // 开始渲染的x
            // 渲染的长度
            let render_start = -1, render_width = 0;
            const render_info = [];

            let hasUnderline            // 是否含有下划线
                , isInvisible           // 是否含有下划线
                , isBold = false        // 是否加粗
                , isInverse = false     // 是否反转
                , isFaint = false       // 是否变细
                , isItalic = false      // 是否斜体
                , isSlowBlink = false   // 是否闪烁光标
                , isSelection = false   // 是否选择
                , current_font_style: DrawFontStyle = DrawFontStyle.NORMAL
                , chr;                  // 当前字符

            // 长度
            const len = end == -1 ? this._term.columns : end;

            for (let x = xIndex; x < len; x++) {

                // 占位符
                if (!blocks_data[x] || blocks_data[x].length == 0) {
                    continue;
                }

                // 当前块的属性
                let attrMode = blocks_attr[x];

                // 非选择层
                // 没有其他样式
                // if(blocks_data[x] == " " && !isSelectionView && attrMode == ATTR_MODE_NONE){
                //     // 空块
                //     w = width;
                //
                //     if(render_start >= 0 && render_width != 0){
                //         render_info.push(render_start + "," + render_width);
                //         // 空格
                //         render_start = -1;
                //         render_width = 0;
                //     }
                //
                // } else {
                const displayWidth = width * blocks_char_width[x];
                // charAt() 不支持4字节字符，如emoji表情
                // let value = block.data,
                //     invisible = block.isInvisible,
                //     underline = block.isUnderline,
                //     len2 = block.displaySize == 2;

                // resetAttr
                hasUnderline = isInvisible = isBold = isInverse = isFaint = isItalic = isSlowBlink = false;

                // 当前字符
                chr = blocks_data[x];

                if(attrMode != ATTR_MODE_NONE){
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
                        case ATTR_MODE_SELECTION:
                            isSelection = true;
                            break;
                        default:
                            if(attrMode >= ATTR_MODE_SELECTION){
                                attrMode -= ATTR_MODE_SELECTION;
                                isSelection = true;
                            }
                            if(attrMode >= ATTR_MODE_INVISIBLE){
                                attrMode -= ATTR_MODE_INVISIBLE;
                                isInvisible = true;
                            }
                            if(attrMode >= ATTR_MODE_SLOW_BLINK){
                                attrMode -= ATTR_MODE_SLOW_BLINK;
                                isSlowBlink = true;
                            }
                            if(attrMode >= ATTR_MODE_UNDERLINE){
                                attrMode -= ATTR_MODE_UNDERLINE;
                                hasUnderline = true;
                            }
                            if(attrMode >= ATTR_MODE_FAINT){
                                attrMode -= ATTR_MODE_FAINT;
                                isFaint = true;
                            }
                            if(attrMode >= ATTR_MODE_ITALIC){
                                attrMode -= ATTR_MODE_ITALIC;
                                isItalic = true;
                            }
                            if(attrMode >= ATTR_MODE_INVERSE){
                                attrMode -= ATTR_MODE_INVERSE;
                                isInverse = true;
                            }
                            if(attrMode >= ATTR_MODE_BOLD){
                                attrMode -= ATTR_MODE_BOLD;
                                isBold = true;
                            }
                    }
                    // 解析attr_mode...end...

                    // 加粗和斜体
                    if(isItalic && isBold){
                        current_font_style = DrawFontStyle.BOTH;
                    } else {
                        // 斜体
                        if(isItalic){
                            current_font_style = DrawFontStyle.ITALIC;
                        }
                        // 加粗
                        if(isBold){
                            current_font_style = DrawFontStyle.BOLD;
                        }
                    }

                    if(current_font_style != DrawFontStyle.NORMAL){
                        // 不是正常的字体
                        this.updateFont(current_font_style);
                    }

                    let color = blocks_color[x], bg_color = blocks_bg_color[x];

                    if(isSelectionView){
                        // 选择层
                        bg_color = this._term.preferences.paletteMap[color] || this._term.preferences.selectionColor || this._term.preferences.color;
                        color = this._term.preferences.paletteMap[bg_color] || this._term.preferences.selectionTextColor || this._term.preferences.backgroundColor;
                    } else {
                        // 文本层
                        bg_color = this._term.preferences.paletteMap[bg_color] || this._term.preferences.backgroundColor;
                        color = this._term.preferences.paletteMap[color] || this._term.preferences.color;
                    }

                    // 颜色反转
                    if(isInverse){
                        const tmp_color = color;
                        color = bg_color;
                        bg_color = tmp_color;
                    }

                    this.ctx.fillStyle = bg_color;
                    this.ctx.fillRect(startX, startY, displayWidth, height);

                    this.ctx.fillStyle = color;

                } else {
                    // 设置默认的字体。
                    if(this.last_font_style != DrawFontStyle.NORMAL){
                        this.updateFont(DrawFontStyle.NORMAL);
                    }

                    // 绘制背景颜色
                    if(isSelectionView){
                        this.ctx.fillStyle = this._term.preferences.selectionColor || this._term.preferences.color;
                        this.ctx.fillRect(startX, startY, this.measuredTextWidth * blocks_char_width[x], this.height);
                        this.ctx.fillStyle = this._term.preferences.selectionTextColor || this._term.preferences.backgroundColor;
                    } else {
                        // 绘制文字
                        this.ctx.fillStyle = this._term.preferences.color;
                    }

                    // if(this.last_fill_style != "" && this.ctx.fillStyle != default_color.toLowerCase()){
                    //     throw new Error("错误");
                    // }

                }

                // 画下划线，高度为2个像素
                // 如果是联想输入，高度为4个像素。
                if(hasUnderline){
                    // blocks_composition仅仅在buffer_change中，saved_buffer不保存。
                    let underlineHeight = this._term.preferences.canvasSizeMultiple;
                    this.ctx.fillRect(startX, textStartY - underlineHeight, displayWidth, underlineHeight);
                }

                // 制表符
                // if(value === "\t"){
                //     const tabSize = this._term.preferences.tabSize;
                //     let spCount = tabSize - (charCount % tabSize);
                //
                //     for(let i = 0; i < spCount; i++){
                //         // 空格不输出，只右移。以减少fillText的调用次数
                //         startX += width;
                //         charCount += 1;
                //     }
                //
                //     continue;
                // }

                // 空格不输出，只右移。以减少fillText的调用次数
                // 可见 && data != " "
                if((!isInvisible && chr != " ") || isSelectionView || isInverse){
                    // 保存渲染的信息，为了后期可以快速清除。
                    if(render_start == -1) {
                        render_start = startX;
                    }
                    render_width += displayWidth;
                    if(isBold){
                        // 加粗字体宽度+1，不然后面重置渲染会有问题
                        render_width += 1;
                    }

                    // 通过测试，一次性渲染多个字符比一个一个字符的渲染慢。
                    // 下划线是一个特殊的字符，会超出底部基线，因此如果当前的字符是下划线的话，textStartY需要减1。
                    this.ctx.fillText(chr,
                        isBold ? startX + 1: startX,
                        chr == "_" ? textStartY - 1: textStartY);

                } else {
                    if(render_start >= 0 && render_width != 0){
                        render_info.push(render_start + "," + render_width);
                        // 空格或隐藏的文本。
                        render_start = -1;
                        render_width = 0;
                    }
                }

                // }

                startX += displayWidth;
                charCount += blocks_char_width[x];

                this.last_font_style = current_font_style;

            }

            if(render_start >= 0 && render_width != 0){
                render_info.push(render_start + "," + render_width);
                // 空格或隐藏的文本。
            }

            this._rendered_lines_rect[yIndex] = render_info;

        }

    }




}