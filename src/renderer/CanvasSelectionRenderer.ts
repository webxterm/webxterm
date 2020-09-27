import {CanvasSelection, SelectionPoint, SelectionRange} from "../CanvasSelection";
import {Terminal} from "../Terminal";
import {CommonUtils} from "../common/CommonUtils";
import {CanvasTextRenderer} from "./CanvasTextRenderer";

/**
 * 内容选择渲染器
 */
export class CanvasSelectionRenderer extends CanvasTextRenderer {

    // 上次选择的开始点和结束点
    private lastAnchorPoint: SelectionPoint;
    private lastFocusPoint: SelectionPoint;

    // 是否为反选
    private isReverseSelect: boolean = false;

    constructor(term: Terminal) {
        super(term);

        this.lastAnchorPoint = new SelectionPoint(0, 0);
        this.lastFocusPoint = new SelectionPoint(0, 0);
    }

    getView(): HTMLCanvasElement {
        return this._term.selectionView;
    }

    // /**
    //  * 清除指定行
    //  * @param yIndex
    //  */
    // clearLine(yIndex: number): void {
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
    //  * 清除全部
    //  */
    // clear(): void {
    //     for(let y = 0, len = this._rendered_lines_rect.length; y < len; y++){
    //         this.clearLine(y);
    //     }
    // }


    /**
     * 内容选择
     * @param selection
     */
    select(selection: CanvasSelection) {
        // console.info(JSON.stringify(selection));
        if(this.ctx){

            const width = this.measuredTextWidth
                , height = this.height
                , fullWidth = this._term.columns * width;

            // console.info("fullWidth:" + fullWidth);
            // 开始坐标(x, y)
            // 结束坐标(x, y)
            const anchorX = selection.anchorPoint.x
                , anchorY = selection.anchorPoint.y
                ,  focusX = selection.focusPoint.x
                ,  focusY = selection.focusPoint.y;

            // let anchorPoint = new SelectionPoint(anchorX, anchorY),
            //     focusPoint = new SelectionPoint(focusX, focusY);

            // 判断两个点是否相同
            // console.info("判断两个点是否相同：" + (this.lastAnchorPoint.x == anchorX
            //     && this.lastAnchorPoint.y == anchorY
            //     && this.lastFocusPoint.x == focusX
            //     && this.lastFocusPoint.y == focusY));
            // console.info(JSON.stringify(this.lastAnchorPoint) + JSON.stringify(this.lastFocusPoint));
            // console.info("anchorY：" + anchorY + "， anchorX：" + anchorX + "，focusX：" + focusX + "，focusY：" + focusY);
            //
            if(CommonUtils.isSamePoint(this.lastAnchorPoint, selection.anchorPoint)
                && CommonUtils.isSamePoint(this.lastFocusPoint, selection.focusPoint)){
                // 位置相同，不用处理。
                console.info("位置相同，不用处理。");
                return;
            }
            //

            // 上次选择的点
            if(CommonUtils.indexPoint(selection.anchorPoint, selection.focusPoint)){
                // 正向选择
                // 从上往下选择。
                // console.info("正向选择。。。");
                if(this.isReverseSelect){
                    // 首先需要取消之前选中的。如果之前是反向选择的话。
                    this.clearSelected(selection);
                }
                this.isReverseSelect = false;

                // 临时保存selection.ranges
                let ranges = selection.ranges;
                selection.clearRanges();

                for(let y = anchorY,
                        x = 0,
                        w = 0,
                        yIndex = 0,
                        startIndex = 0,
                        end = -1,
                        i = 0; y <= focusY; y+=height, i++){
                    if(y == anchorY) {

                        if(y == focusY){
                            // 全部在一行
                            startIndex = Math.floor(anchorX / width);
                            end = Math.floor(focusX / width);
                            w = focusX - anchorX;       // 考虑占两个位置的emoji表情
                        } else {
                            // 第一行
                            startIndex = Math.floor(anchorX / width);
                            end = -1;
                            w = fullWidth - anchorX;
                        }
                        x = anchorX;
                    } else if(y == focusY){
                        // 最后一行
                        x = 0;
                        w = focusX;     // 考虑占两个位置的emoji表情
                        startIndex = 0;
                        end = Math.floor(focusX / width);
                    } else {
                        // 中间行
                        x = 0;
                        w = fullWidth;
                        startIndex = 0;
                        end = -1;
                    }

                    if(ranges[i]
                        && CommonUtils.isSamePoint(ranges[i].startPoint, new SelectionPoint(x, y))
                        && CommonUtils.isSamePoint(ranges[i].stopPoint, new SelectionPoint(w + x, y))){
                        // console.info("第" + (i + 1) + "行不用渲染");
                        selection.ranges[i] = ranges[i];
                        continue;
                    }

                    // [0, this._term.rows - 1]
                    yIndex = Math.floor(y / height);
                    // console.info("yIndex:" + yIndex + ", startIndex:" + startIndex + ", stopIndex:" + stopIndex);

                    let data_arr = this._display_buffer.lines[yIndex];
                    if(end == -1) end = data_arr.length

                    // yIndex最大值：this._term.rows - 1
                    if(yIndex > this._term.rows - 1){
                        // []
                        continue;
                    }

                    let selectTextArray = data_arr.slice(startIndex, end);

                    // console.info(blocks);
                    // console.info(selectedBlocks);

                    // 清除当前行
                    // this.clearLine(yIndex + 1);
                    // if(this.ctx){
                    //     this.ctx.clearRect(w + x, y, fullWidth, this.height);
                    // }

                    // 如果第一行是空行的话，不用选中。
                    let selectedContent = this.handleSelectedContent(selectTextArray);

                    let textLength = selectedContent.length;
                    if(y == anchorY && textLength == 0){
                        selection.ranges[i] = new SelectionRange(0, 0, 0, 0, "");
                        continue;
                    }

                    // 考虑中文占位符的问题
                    if(textLength > 0){
                        if(selectedContent[0] === ""){
                            // 中文占位符
                            selectTextArray = data_arr.slice(startIndex + 1, end);
                            w = w - width;
                            x = x + width;
                        }
                    }

                    // console.info("selectedTextArray.length=" + selectedTextArray.length + ", focusX=" + (focusX / width));

                    // 如果focusX大于当前行的文本的坐标值的话，当前行全选。
                    // if(y == focusY){
                    //     if(textLength < Math.floor((focusX / width))){
                    //         w = fullWidth;
                    //     }
                    // }
                    // this.drawSelectedText(x, y);

                    this.drawLine(Math.floor(x / width)
                        , yIndex
                        , this._active_buffer.display_buffer
                        , end
                        , true);

                    selection.ranges[i] = new SelectionRange(x, y, w + x, y, selectedContent.join(""));

                }

                // 判断哪行是多余的（被取消选中的）
                // selection.ranges 和 ranges做对比
                if(selection.ranges.length < ranges.length){
                    // 取消选中的行应该是ranges.length - selection.ranges.length
                    for(let i = selection.ranges.length, len = ranges.length; i < len; i++){
                        if(this.ctx){
                            this.ctx.clearRect(ranges[i].startPoint.x,
                                ranges[i].startPoint.y, ranges[i].stopPoint.x - ranges[i].startPoint.x, this.height);
                        }
                    }
                }

                // console.info(selection.ranges);



            } else if(CommonUtils.reverseIndexPoint(selection.anchorPoint, selection.focusPoint)){
                // 反向选择
                // 从下往上选择
                if(!this.isReverseSelect){
                    // 首先需要取消之前选中的。如果之前是正选选择的话。
                    this.clearSelected(selection);
                }

                this.isReverseSelect = true;

                // console.info("反向选择");
                //
                // 临时保存selection.ranges
                let ranges = selection.ranges;
                selection.clearRanges();

                // console.info("len=" + Math.floor((anchorY - focusY) / height) + ", anchorY=" + anchorY + ", focusY=" + focusY + ", height=" + height);

                // 反向遍历。
                for(let y = 0,
                        x = 0,
                        w = 0,
                        yIndex = 0,
                        // len = Math.floor((anchorY - focusY) / height),
                        startIndex = 0,
                        end = 0; y <= anchorY; y += height, yIndex++){

                    if(y < focusY){
                        // console.info("y=" + y);
                        selection.ranges[yIndex] = new SelectionRange(0, y, 0, y, "", true);

                        // 清除当前行
                        if(!ranges[yIndex] || (ranges[yIndex].startPoint.x == 0 && ranges[yIndex].stopPoint.x == 0)){
                            // 两个点为原点。
                            // startPointX == stopPointX
                            continue
                        } else {
                            // 如果不是的话，则清掉
                            // if(this.ctx){
                            //     this.ctx.clearRect(0, y, fullWidth, this.height);
                            // }
                            this.clearLine(yIndex);
                        }
                        continue;
                    }

                    if(y == focusY) {
                        if(y == anchorY){
                            // 全部在一行
                            startIndex = Math.floor(focusX / width);
                            end = Math.floor(anchorX / width);
                            w = anchorX - focusX;   // 需要渲染的宽度
                        } else {
                            // 第一行
                            startIndex = Math.floor(focusX / width);
                            end = -1;
                            w = fullWidth - focusX; // 需要渲染的宽度
                        }
                        x = focusX;

                        // 第一行取消选中
                        // 如果不是的话，则清掉
                        // if(this.ctx){
                        //     this.ctx.clearRect(0, y, x, this.height);
                        // }
                        this.clearLine(yIndex);

                    } else if(y == anchorY){
                        // 最后一行
                        x = 0;
                        w = anchorX;    // 需要渲染的宽度
                        startIndex = 0;
                        end = Math.floor(anchorX / width);
                    } else {
                        // 中间行
                        x = 0;
                        w = fullWidth;  // 需要渲染的宽度
                        startIndex = 0;
                        end = -1;
                    }

                    // console.info("selection=" + JSON.stringify(selection));

                    // 判断哪行不用重新渲染。
                    // 从底部开始。
                    if(ranges[yIndex]
                        && CommonUtils.isSamePoint(ranges[yIndex].startPoint, new SelectionPoint(x, y))
                        && CommonUtils.isSamePoint(ranges[yIndex].stopPoint, new SelectionPoint(w + x, y))){
                        // console.info("第" + (i + 1) + "行不用渲染");
                        selection.ranges[yIndex] = ranges[yIndex];
                        continue;
                    }


                    // [0, this._term.rows - 1]
                    // console.info("i:" + i + ", startIndex:" + startIndex + ", stopIndex:" + stopIndex);

                    let data_arr = this._display_buffer.lines[yIndex];
                    if(end == -1) end = data_arr.length;
                    // yIndex最大值：this._term.rows - 1
                    if(yIndex > this._term.rows - 1){
                        // []
                        continue;
                    }

                    let selectTextArray = data_arr.slice(startIndex, end);

                    // 获取选中的内容
                    let selectedContent = this.handleSelectedContent(selectTextArray);
                    if(selectedContent.length > 0){
                        if(selectedContent[0] === ""){
                            // 中文占位符
                            selectTextArray = data_arr.slice(startIndex - 1, end);

                            w = w + width;
                            x = x - width;
                        }
                    }

                    // console.info("selectedBlocks:" + JSON.stringify(selectedBlocks));
                    console.info("x:" + Math.floor(x / width));
                    this.drawLine(Math.floor(x / width)
                        , yIndex
                        , this._active_buffer.display_buffer
                        , end
                        , true);

                    selection.ranges[yIndex] = new SelectionRange(x, y, w + x, y, selectedContent.join(""));

                }


            } else {
                // 两个点相同。
                // console.info("两个点相同。");
            }

            selection.running = true;

            this.lastAnchorPoint = selection.anchorPoint;
            this.lastFocusPoint = selection.focusPoint;

            this._term.clipboard.value = selection.selectedContent;
            this._term.clipboard.select();

            console.info("select:selectedContent:\"" + selection.selectedContent + "\"");

        }

    }

    /**
     * 处理选中的内容，如果后面全部都是空格的话，就不用返回空格，只返回空行。
     * @param selectTextArray
     */
    handleSelectedContent(selectTextArray: string[]){
        let validIndex = -1, result = [];
        for(let i = 0, len = selectTextArray.length; i < len; i++){
            if(selectTextArray[i] != " "){
                validIndex = i;
            }
            result[i] = selectTextArray[i];
        }
        if(validIndex == -1){
            return [];
        }
        return result.slice(0, validIndex + 1);
    }

    // /**
    //  * 绘制选中的文字
    //  * @param startX
    //  * @param startY
    //  // * @param selectedWidth 选中区域的宽度
    //  // * @param height 当前行的高度
    //  // * @param charWidth 字符宽度
    //  */
    // drawSelectedText(startX: number
    //     , startY: number
    //                  // , selectedWidth: number
    //     // , height: number
    //     // , charWidth: number
    // ): void{
    //     // 渲染选中颜色。
    //     if(this.ctx){
    //
    //         // 计算从第几个字符开始
    //         let //charCount = startX / charWidth,
    //             textStartY = startY + this.height
    //             , yIndex = startY / this.height
    //             , xIndex = startX / this.measuredTextWidth
    //             , blocks_data = this._display_buffer.lines[yIndex]    // 数据
    //             , blocks_attr = this._display_buffer.line_attrs[yIndex]   // 属性
    //             , blocks_char_width = this._display_buffer.line_char_widths[yIndex]   //
    //             , blocks_color = this._display_buffer.line_colors[yIndex]
    //             , blocks_bg_color = this._display_buffer.line_bg_colors[yIndex];
    //
    //         // ['100,100;']
    //         // 保存渲染信息，为了后面可以快速清除渲染的内容。
    //         let render_start = -1   // 开始渲染的x
    //             , render_width = 0;   // 渲染的长度
    //         const render_info = [];
    //
    //         for (let x = xIndex
    //                  , len = blocks_data.length
    //                  , current_font_style: DrawFontStyle = DrawFontStyle.NORMAL
    //                  , hasUnderline // 是否含有下划线
    //                  , isInvisible  // 是否含有下划线
    //                  , isBold = false
    //                  , isInverse = false
    //                  , isFaint = false
    //                  , isItalic = false
    //                  , isSlowBlink = false
    //                  // , isRapidBlink = false
    //                  // , isCrossedOut = false
    //                  , attrMode; x <= len; x++) {
    //
    //
    //             // 空块
    //             if (!blocks_data[x] || blocks_data[x].length == 0) continue;
    //
    //             // let value = block.data;
    //             // let invisible = block.isInvisible, underline = block.isUnderline;
    //             let selectionColor;
    //             let selectionTextColor;
    //
    //             if((attrMode = blocks_attr[x]) != ATTR_MODE_NONE){
    //                 // 没有渲染的块
    //                 // 解析样式
    //                 // let array = DataBlockAttribute.parseClassName(CommonUtils.substring(block, 2));
    //                 // let className = array[0];
    //                 let color = blocks_color[x], bgColor = blocks_bg_color[x];
    //
    //                 if(isBold) isBold = false;
    //                 if(isInverse) isInverse = false;
    //                 if(isItalic) isItalic = false;
    //                 if(isFaint) isFaint = false;
    //                 if(isFaint) isFaint = false;
    //                 if(hasUnderline) hasUnderline = false;
    //                 if(isSlowBlink) isSlowBlink = false;
    //                 // if(isRapidBlink) isRapidBlink = false;
    //                 if(isInvisible) isInvisible = false;
    //                 // if(isCrossedOut) isCrossedOut = false;
    //
    //                 // 解析attr_mode...
    //                 switch (attrMode) {
    //                     case ATTR_MODE_NONE:
    //                         break;
    //                     case ATTR_MODE_BOLD:
    //                         isBold = true;
    //                         break;
    //                     case ATTR_MODE_INVERSE:
    //                         isInverse = true;
    //                         break;
    //                     case ATTR_MODE_ITALIC:
    //                         isItalic = true;
    //                         break;
    //                     case ATTR_MODE_FAINT:
    //                         isFaint = true;
    //                         break;
    //                     case ATTR_MODE_UNDERLINE:
    //                         hasUnderline = true;
    //                         break;
    //                     case ATTR_MODE_SLOW_BLINK:
    //                         isSlowBlink = true;
    //                         break;
    //                     // case ATTR_MODE_RAPID_BLINK:
    //                     //     isRapidBlink = true;
    //                     //     break;
    //                     case ATTR_MODE_INVISIBLE:
    //                         isInvisible = true;
    //                         break;
    //                     // case ATTR_MODE_CROSSED_OUT:
    //                     //     isCrossedOut = true;
    //                     //     break;
    //                     default:
    //                         // if(attrMode > ATTR_MODE_CROSSED_OUT){
    //                         //     attrMode -= ATTR_MODE_CROSSED_OUT;
    //                         //     isCrossedOut = true;
    //                         // }
    //                         if(attrMode >= ATTR_MODE_INVISIBLE){
    //                             attrMode -= ATTR_MODE_INVISIBLE;
    //                             isInvisible = true;
    //                         }
    //                         // if(attrMode >= ATTR_MODE_RAPID_BLINK){
    //                         //     attrMode -= ATTR_MODE_RAPID_BLINK;
    //                         //     isRapidBlink = true;
    //                         // }
    //                         if(attrMode >= ATTR_MODE_SLOW_BLINK){
    //                             attrMode -= ATTR_MODE_SLOW_BLINK;
    //                             isSlowBlink = true;
    //                         }
    //                         if(attrMode >= ATTR_MODE_UNDERLINE){
    //                             attrMode -= ATTR_MODE_UNDERLINE;
    //                             hasUnderline = true;
    //                         }
    //                         if(attrMode >= ATTR_MODE_FAINT){
    //                             attrMode -= ATTR_MODE_FAINT;
    //                             isFaint = true;
    //                         }
    //                         if(attrMode >= ATTR_MODE_ITALIC){
    //                             attrMode -= ATTR_MODE_ITALIC;
    //                             isItalic = true;
    //                         }
    //                         if(attrMode >= ATTR_MODE_INVERSE){
    //                             attrMode -= ATTR_MODE_INVERSE;
    //                             isInverse = true;
    //                         }
    //                         if(attrMode >= ATTR_MODE_BOLD){
    //                             attrMode -= ATTR_MODE_BOLD;
    //                             isBold = true;
    //                         }
    //                 }
    //                 // 解析attr_mode...end...
    //
    //                 // 加粗和斜体
    //                 if(isItalic && isBold){
    //                     current_font_style = DrawFontStyle.BOTH;
    //                 } else {
    //                     // 斜体
    //                     if(isItalic){
    //                         current_font_style = DrawFontStyle.ITALIC;
    //                     }
    //                     // 加粗
    //                     if(isBold){
    //                         current_font_style = DrawFontStyle.BOLD;
    //                     }
    //                 }
    //
    //                 if(current_font_style != DrawFontStyle.NORMAL){
    //                     // 不是正常的字体
    //                     this.updateFont(current_font_style);
    //                 }
    //
    //                 // console.info("className:" + className + ", color:" + color + ', bgColor:' + bgColor);
    //
    //                 // 字体斜体，字体加粗
    //
    //                 // this.ctx.font = this.getFont(block.isItalic, block.isBold);
    //
    //                 // 绘制选中的背景颜色。
    //                 if(this._term.preferences.selectionColor.length > 0){
    //                     selectionColor = this._term.preferences.selectionColor;
    //                 } else {
    //
    //                     if(isInverse){
    //                         // 颜色反转
    //                         selectionColor = this._term.preferences.backgroundColor;
    //                     } else {
    //
    //                         if(!!color && this._term.preferences.paletteMap[color]){
    //                             selectionColor = this._term.preferences.paletteMap[color];
    //                         } else {
    //                             // 默认颜色。
    //                             selectionColor = this._term.preferences.color;
    //                         }
    //
    //                     }
    //
    //
    //                 }
    //
    //                 // 设置选中的颜色。
    //                 this.ctx.fillStyle = selectionColor;
    //                 this.ctx.fillRect(startX, startY, this.measuredTextWidth * blocks_char_width[x], this.height);
    //
    //                 // 绘制选中的文本颜色。
    //                 if(this._term.preferences.selectionTextColor.length > 0){
    //                     selectionTextColor = this._term.preferences.selectionTextColor;
    //                 } else {
    //                     if(isInverse){
    //                         // 颜色反转
    //                         selectionTextColor = this._term.preferences.color;
    //                     } else {
    //                         selectionTextColor = (!!bgColor && this._term.preferences.paletteMap[bgColor]) ?
    //                             this._term.preferences.paletteMap[bgColor]: this._term.preferences.backgroundColor;
    //                     }
    //
    //
    //                 }
    //
    //                 this.ctx.fillStyle = selectionTextColor;
    //
    //             } else {
    //                 // 设置默认的字体。
    //                 // 设置默认的字体。
    //                 this.updateFont(DrawFontStyle.NORMAL);
    //
    //                 selectionColor = this._term.preferences.selectionColor.length > 0 ? this._term.preferences.selectionColor: this._term.preferences.color;
    //                 selectionTextColor = this._term.preferences.selectionTextColor.length > 0 ? this._term.preferences.selectionTextColor : this._term.preferences.backgroundColor;
    //
    //                 this.ctx.fillStyle = selectionColor;
    //                 this.ctx.fillRect(startX, startY, this.measuredTextWidth * blocks_char_width[x], this.height);
    //                 this.ctx.fillStyle = selectionTextColor;
    //
    //             }
    //
    //             // 画下划线，高度为2个像素
    //             // 制表符
    //             // if(value === "\t"){
    //             //     const tabSize = this._term.preferences.tabSize;
    //             //     let spCount = tabSize - (charCount % tabSize);
    //             //
    //             //     for(let i = 0; i < spCount; i++){
    //             //         // 空格不输出，只右移。以减少fillText的调用次数
    //             //         this.ctx.fillStyle = selectionColor;
    //             //         this.ctx.fillRect(startX, startY, charWidth, this.height);
    //             //         startX += charWidth;
    //             //         charCount += 1;
    //             //     }
    //             //
    //             //     continue;
    //             // }
    //
    //             // 空格不输出，只右移。以减少fillText的调用次数
    //             if(!isInvisible && blocks_data[x] != " "){
    //                 // 保存渲染的信息，为了后期可以快速清除。
    //                 if(render_start == -1) render_start = startX;
    //                 render_width += this.measuredTextWidth * blocks_char_width[x];
    //
    //                 this.ctx.fillText(blocks_data[x], startX, textStartY);
    //             } else {
    //                 if(render_start >= 0 && render_width != 0){
    //                     render_info.push(render_start + "," + render_width);
    //                     // 空格或隐藏的文本。
    //                     render_start = -1;
    //                     render_width = 0;
    //                 }
    //             }
    //
    //             startX += this.measuredTextWidth * blocks_char_width[x];
    //             // charCount += blocks_char_width[x];
    //
    //             // drawCursor
    //             // if(this.activeBuffer.x == x + 1 && this.activeBuffer.y == y + 1){
    //             //     console.info("绘制光标..");
    //             //     this.drawCursor(false, selectionColor, selectionTextColor);
    //             // }
    //
    //         }
    //
    //         if(render_start >= 0 && render_width != 0){
    //             render_info.push(render_start + "," + render_width);
    //             // 空格或隐藏的文本。
    //         }
    //         this._rendered_lines_rect[yIndex] = render_info;
    //         // return startX;
    //
    //     }
    //
    //     // return startX + selectedWidth;
    //
    // }

    /**
     * 仅清除画布
     * @param selection
     */
    clearRect(selection: CanvasSelection){
        // if(this.ctx) {
        //     if(/*selection.ranges.length == 0 || */selection.selectAll){
        //         this.ctx.clearRect(0,
        //             0, this._term.selectionView.width, this._term.selectionView.height);
        //         return;
        //     } else {
        //         for(let range of selection.ranges){
        //             // 获取所有选中的范围。
        //             // this.ctx.clearRect()
        //             // this.ctx.clearRect(range.startPoint.x,
        //             //     range.startPoint.y, range.realStopX - range.startPoint.x, this.height);
        //         }
        //     }
        // }
        this.clear();
    }

    /**
     * 取消选择。
     */
    clearSelected(selection: CanvasSelection){

        if(!selection.running) return;

        if(this.ctx){

            console.info(selection);
            // 清除画布
            this.clearRect(selection);

            selection.clearRanges();
            selection.running = false;

            // 取消选中、
            let sel = window.getSelection();
            if(sel){
                sel.removeAllRanges();
            }
            this._term.clipboard.value = "";
        }
    }


    /**
     * 处理块选择
     * @param index
     * @param blocks
     * @param flag
     */
    private handleSelectBlock(index: number, blocks: string[], flag: number): number{

        let chr = blocks[index];
        if(flag == 1) {
            if(CommonUtils.isNumberLetter(chr)) {
                return index;
            } else {
                return -1;
            }
        } else if(flag == 2) {
            if(CommonUtils.isSymbol(chr)) {
                return index;
            } else {
                return -1;
            }
        } else if(flag == 3) {
            if(CommonUtils.isChinese(chr)
                || (chr == "" && CommonUtils.isChinese(blocks[index - 1]))) {
                // 中文或下一个是中文的占位号
                return index;
            } else {
                return -1;
            }
        } else if(flag == 4) {
            if(CommonUtils.isChineseSymbol(chr)
                || (chr == "" && CommonUtils.isChineseSymbol(blocks[index - 1]))) {
                // 中文或下一个是中文的占位号
                return index;
            } else {
                return -1;
            }
        } else if(flag == 10){
            // 左边的字符需要对应右边的字符
            if(/[)}\]>）】」》]/gi.test(chr)){
                return index;
            } else {
                return -1;
            }
        } else if(flag == 11){
            // 右边的字符需要对应左边的字符。
            if(/[({\[<（【「《]/gi.test(chr)){
                return index;
            } else {
                return -1;
            }
        }
        return -1;
    }

    /**
     * 选中块，主要是当前行，双击
     * 1，字母的话，选中前后的字母。
     * 2，特殊字符的话，选中前后的特殊字符
     * 3，中文的话，选中前后的中文
     * @param selection
     */
    selectBlock(selection: CanvasSelection) {

        if(this.ctx){

            const width = this.measuredTextWidth
                , height = this.height
                // selection.anchorPoint.y = index * height，需要索引的话，需要除height
                , startYIndex = Math.floor(selection.anchorPoint.y / height)
                , blocks = this._display_buffer.lines[startYIndex];

            let startXIndex = Math.floor(selection.anchorPoint.x / width);
            let selectedChar = blocks[startXIndex];

            if(selectedChar == ""){
                // 内存存储结构：["a", "b", "c", "中", "", "文", ""]
                // 计算到当前是中文占位符
                // 获取上一个中文
                startXIndex -= 1;
                selectedChar = blocks[startXIndex];
            }

            let flag = 0;
            if(CommonUtils.isNumberLetter(selectedChar)) {
                // 数字 + 字母
                flag = 1;
            } else if(/[({\[<（【「《]/gi.test(selectedChar)){
                // 整对的特殊字符(左): (){}[]<>（）【】「」《》
                flag = 10;
            } else if(/[)}\]>）】」》]/gi.test(selectedChar)){
                // 整对的特殊字符(右): (){}[]<>（）【】「」《》
                flag = 11;
            } else if(CommonUtils.isSymbol(selectedChar)){
                // 符号
                flag = 2;
            } else if(CommonUtils.isChinese(selectedChar)){
                // 中文
                flag = 3;
            } else if(CommonUtils.isChineseSymbol(selectedChar)){
                // 中文符号
                flag = 4;
            }

            // 左边搜索
            let leftIndex = startXIndex;
            if(flag != 10){
                // 如果是特殊字符，左边的符号
                let ret_index = leftIndex;
                for(let i = startXIndex - 1; 0 <= i; i--){
                    ret_index = this.handleSelectBlock(i, blocks, flag);
                    if(flag == 11){
                        // 右边特殊字符，如)、>、}等。
                        if(ret_index == -1) continue;
                        break;
                    }
                    if(ret_index == -1) break;
                    leftIndex = ret_index;
                }
                // 处理特殊字符
                if(ret_index != -1) leftIndex = ret_index;
            }

            // 右边搜索
            let rightIndex = startXIndex;
            if(flag != 11){
                let ret_index = rightIndex;
                for(let i = startXIndex + 1, len = blocks.length; i < len; i++){
                    ret_index = this.handleSelectBlock(i, blocks, flag);
                    if(flag == 10){
                        // 左边特殊字符，如(、<、{等。
                        if(ret_index == -1) continue;
                        break;
                    }
                    if(ret_index == -1) break;
                    rightIndex = ret_index;
                }
                // 处理特殊字符
                if(ret_index != -1) rightIndex = ret_index;
            }

            console.info("leftIndex:" + leftIndex + ", rightIndex:" + rightIndex);

            const selectedContent = blocks.slice(leftIndex, rightIndex + 1);
            const x = leftIndex * width
                , y = startYIndex * height
                , w = (rightIndex - leftIndex + 1) * width;

            console.info("x:" + x + ", y:" + y + ", w:" + w + ", height:" + height);

            // 绘制选中的颜色
            selection.clearRanges();
            // 正常的，stopX = x + w, 但是如果出现中文等字符的话，一个中文 = width * 2;
            this.drawLine(leftIndex
                , startYIndex
                , this._active_buffer.display_buffer
                , rightIndex + 1
                , true);

            selection.running = true;

            // 解析选中的文本
            let selectedText = this.handleSelectedContent(selectedContent).join("");
            selection.ranges.push(new SelectionRange(x, y, x + w, y, selectedText));

            this._term.clipboard.value = selection.selectedContent;
            this._term.clipboard.select();

            console.info("selectedContent:" + selection.selectedContent);

            console.info(JSON.stringify(selection));

            // 更新selection
            // 考虑后面会滚动，滚动调用select方法渲染
            selection.start(x, y, this._term.getOffsetTop());
            selection.stop(x + w, y);

            console.info(JSON.stringify(selection));

            // 22019aaaa-aaa

        }

    }


    /**
     * 选中一整行，三击
     * @param selection
     */
    selectLine(selection: CanvasSelection){

        if(this.ctx){

            const height = this.height
                , width = this.measuredTextWidth
                , fullWidth = this._term.columns * width
                // selection.anchorPoint.y = index * height，需要索引的话，需要除height
                , startY = selection.anchorPoint.y
                , startYIndex = Math.floor(startY / height)
                , selectedContent = this._display_buffer.lines[startYIndex];

            // 绘制选中的颜色
            selection.clearRanges();
            this.drawLine(0
                , startYIndex
                , this._active_buffer.display_buffer
                , -1
                , true);

            selection.running = true;
            // 解析选中的文本
            const selectedText = this.handleSelectedContent(selectedContent).join("");
            selection.ranges.push(new SelectionRange(0, startY, fullWidth, startY, selectedText));

            // 更新selection
            // 考虑后面会滚动，滚动调用select方法渲染
            selection.start(0, startY, this._term.getOffsetTop());
            selection.stop(fullWidth, startY);

            this._term.clipboard.value = selection.selectedContent;
            this._term.clipboard.select();

            console.info("selectedContent:" + selection.selectedContent);

        }
    }

    /**
     * 全选
     * @param selection
     */
    selectAll(selection: CanvasSelection) {

        if(this.ctx){

            const width = this.measuredTextWidth
                , height = this.height
                , fullWidth = this._term.columns * width
                , saved_lines = this._saved_buffer.lines;

            const lineCount = saved_lines.length + this._active_buffer.size;

            if(lineCount != selection.ranges.length){
                // 选中其他区域，需要清掉
                selection.clearRanges();

                // 这块是滚动区保存的行。
                for(const blocks of saved_lines){
                    if(!blocks) continue;
                    // 解析选中的文本
                    const selectedText = this.handleSelectedContent(blocks).join("");
                    selection.ranges.push(new SelectionRange(0, 0, 0, 0, selectedText));
                }

                // 这块是缓冲区的行
                for(const blocks of this._change_buffer.lines){
                    if(!blocks) continue;
                    // 解析选中的文本
                    const selectedText = this.handleSelectedContent(blocks).join("");
                    selection.ranges.push(new SelectionRange(0, 0, 0, 0, selectedText));
                }
            }

            this.clearRect(selection);

            // 渲染显示内容
            for(let y = 0, len = this._active_buffer.size; y < len; y++){
                this.drawLine(0
                    , y
                    , this._active_buffer.display_buffer
                    , -1
                    , true);
            }

            selection.running = true;
            selection.selectAll = true;

            this._term.clipboard.value = selection.selectedContent;
            this._term.clipboard.select();
        }


    }


    /**
     * 处理窗口缩放，滚动时候的选中内容。
     */
    handleSelect(): number{

        // 什么都没有选中
        if(!this._term.selection.running){
            return 0;
        }

        // 全选。
        // 全选的时候，不用渲染内容。
        if(this._term.selection.selectAll){
            this.selectAll(this._term.selection);
            return 1;
        } else {
            // 部分选中
            // this.select2(this._term.selection);
            return 2;
        }
    }

}