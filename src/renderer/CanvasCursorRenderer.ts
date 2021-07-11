import {CanvasRenderer} from "./CanvasRenderer";
import {Terminal} from "../Terminal";
import {Buffer} from "../buffer/Buffer";

/**
 * 光标渲染器
 */
export class CanvasCursorRenderer extends CanvasRenderer {

    private cursorPosition: number[] = [];

    constructor(term: Terminal) {
        super(term);
    }

    getView(): HTMLCanvasElement {
        return this._term.cursorView;
    }

    /**
     * 清除光标
     */
    clearCursor() {
        this.clear();
    }

    /**
     * 更新光标点
     * @param value
     * @param is_fill
     * @param is_stroke
     */
    updateCursorPosition(value: number[], is_fill: boolean = true, is_stroke: boolean = false) {
        const [x, y, w, h] = value;
        if(this.ctx && is_fill) this.ctx.fillRect(x, y, w, h);
        if(this.ctx && is_stroke) this.ctx.strokeRect(x, y, w, h);
        this.cursorPosition = value;
    }

    /**
     * 制作联想输入光标
     */
    drawComposingCursor(x: number, y: number) {
        if (this.ctx) {
            x = x * this.measuredTextWidth;
            y = (y - 1) * this.height;
            this.ctx.fillStyle = this._term.preferences.cursorBackgroundColor;
            this.updateCursorPosition([x, y, 2, this.height]);
        }
    }

    /**
     * 制作光标
     * @param displayBuffer 显示缓冲区
     * @param blur 是否获取焦点
     * @param color 设置的前景色
     * @param bgColor 设置的背景色
     */
    drawCursor(displayBuffer: Buffer | undefined = undefined,
               blur: boolean = false,
               color: string = "",
               bgColor: string = "") {

        if (!this.active_buffer || !this.ctx) return;

        // 清除上次的光标。
        this.clearCursor();

        if (!this._term.cursor.show) return;

        const topIndex = this._term.getOffsetTop();
        const end = this.active_buffer.size + topIndex;

        if(displayBuffer == undefined){
            displayBuffer = this._term.bufferSet.getDisplayBuffer(topIndex, end);
            // 更新显示缓冲区信息
            this.display_buffer.removeLine(0, this.active_buffer.display_buffer.size);
            this.display_buffer.copyFrom(displayBuffer, 0, displayBuffer.size);
        }

        let yIndex = -1, cli = this.active_buffer.cursorLineId; //
        for(let i = topIndex, j = 0; i < end; i++, j++){
            if(displayBuffer.lineIds[j] == cli){
                yIndex = j;
                break;
            }
        }

        if(yIndex == -1) {
            // 没有匹配到
            // 无需渲染光标
            return;
        }

        // 开始的y
        const width = this.measuredTextWidth,
            height = this.height,
            startY = yIndex * height,
            x = this.active_buffer.x,
            xIndex = x - 1,
            lineCharWidths = displayBuffer.lineCharWidths[yIndex],    // 从显示缓冲区获取相关的数据
            lineChars = displayBuffer.lineChars[yIndex];

        // 考虑block.displaySize 为非1 的情况，即如emoji表情，占用一个字符，显示2个宽度。
        let count = 0;
        for (let i = 0; i < xIndex; i++) {
            count += lineCharWidths[i];
        }
        const startX = count * width;

        // 计算光标需要显示的长度
        const cursorWidth = width * lineCharWidths[xIndex];

        // 失去焦点
        if (bgColor.length == 0) {
            bgColor = this._term.preferences.cursorBackgroundColor;
        }

        if (blur) {
            this.ctx.strokeStyle = bgColor;
            this.ctx.lineWidth = 2;
            // strokeRect => border，会在矩形的外部增加一层边框。
            this.updateCursorPosition([startX + 1, startY + 1, cursorWidth - 2, height - 2], false, true);
        } else {
            this.ctx.fillStyle = bgColor;
            this.updateCursorPosition([startX, startY, cursorWidth, height]);
        }

        if (color.length == 0) {
            color = this._term.preferences.cursorColor;
        }
        this.ctx.fillStyle = color;
        this.ctx.fillText(lineChars[xIndex] || " ", startX, startY + height);

    }

    /**
     * 光标失去焦点
     */
    cursorBlur() {
        this.drawCursor(undefined, true);
    }

    clearLine(y: number): void {
        throw new Error("Method not implemented.");
    }

    /**
     * 清除光标
     */
    clear(): void {
        // for (let y = 0, len1 = this._rendered_lines_rect.length; y < len1; y++) {
        //     const rect = this._rendered_lines_rect[y];
        //     for (let x = 0, len2 = rect.length, startX, startY, width, height; x < len2; x++) {
        //         [startX, startY, width, height] = rect[x].split(",");
        //         if (this.ctx) this.ctx.clearRect(parseInt(startX), parseInt(startY), parseInt(width), parseInt(height));
        //     }
        // }
        // this._rendered_lines_rect.splice(0, this._rendered_lines_rect.length);
        const [x, y, w, h] = this.cursorPosition;
        if (this.ctx) this.ctx.clearRect(x - this.ctx.lineWidth, y - this.ctx.lineWidth, w + this.ctx.lineWidth*2, h + this.ctx.lineWidth*2);
    }

    /**
     * 是否显示光标
     * 如果所有行都是缓冲区的行的话，就渲染光标
     */
    isShowCursor(): boolean {

        for(let y1 = 0, len1 = this.display_buffer.size, y2, len2; y1 < len1; y1++){
            for(y2 = 0, len2 = this.change_buffer.size; y2 < len2; y2++){
                if(this.display_buffer.lineChars[y2] != this.change_buffer.lineChars[y1]){
                    return false;
                }
            }
        }

        return true;
    }
}