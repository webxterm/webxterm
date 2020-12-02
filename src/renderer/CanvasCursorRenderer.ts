import {CanvasRenderer, DrawFontStyle} from "./CanvasRenderer";
import {Terminal} from "../Terminal";

/**
 * 光标渲染器
 */
export class CanvasCursorRenderer extends CanvasRenderer {

    constructor(term: Terminal) {
        super(term);
    }

    getView():HTMLCanvasElement {
        return this._term.cursorView;
    }

    /**
     * 清除光标
     */
    clearCursor(){
        this.clear();
    }

    /**
     * 制作联想输入光标
     */
    drawComposingCursor(x: number, y: number){
        if(this.ctx){
            x = x * this.measuredTextWidth;
            y = (y - 1) * this.height;
            this.ctx.fillStyle = this._term.preferences.cursorBackgroundColor;
            this.ctx.fillRect(x, y, 2, this.height);
            this._rendered_lines_rect[0] = [x + "," + y + "," + 2 + "," + this.height];
        }
    }

    /**
     * 制作光标
     * @param blur 是否获取焦点
     * @param color 设置的前景色
     * @param bgColor 设置的背景色
     */
    drawCursor(blur: boolean = false, color: string = "", bgColor: string = ""){
        // console.info("drawCursor...");
        if(!this._active_buffer) return;

        if(this.ctx){

            // 清除上次的光标。
            this.clearCursor();

            if(!this._term.cursor.show) return;

            const width = this.measuredTextWidth
                , height = this.height
                , y = this._active_buffer.y
                , x = this._active_buffer.x
                , yIndex = y - 1
                , xIndex = x - 1
                , startY = yIndex * height
                , blocks_data = this._display_buffer.lines[yIndex]    // 数据
                , blocks_char_width = this._display_buffer.line_char_widths[yIndex];

            // const blocks = this.getBlocks(y - 1);
            // if(!blocks) return;

            let startX;// (this.activeBuffer.x - 1) * width; // 考虑block.displaySize 为非1 的情况，即如emoji表情，占用一个字符，显示2个宽度。
            {
                let count = 0;
                for(let i = 0; i < x - 1; i++){
                    count += blocks_char_width[i];
                }
                startX = count * width;
            }

            const w = width * blocks_char_width[xIndex];
            // 失去焦点
            if(bgColor.length == 0){
                bgColor = this._term.preferences.cursorBackgroundColor;
            }

            let rect = [];
            if(blur){
                this.ctx.strokeStyle = bgColor;
                this.ctx.lineWidth = 2;
                // strokeRect => border，会在矩形的外部增加一层边框。
                this.ctx.strokeRect(startX + 1, startY + 1, w - 2, height - 2);
                rect.push((startX + 1) + "," + (startY + 1) + "," + (w - 2) + "," + (height - 2));
            } else {
                this.ctx.fillStyle = bgColor;
                this.ctx.fillRect(startX, startY, w, height);
                rect.push(startX + "," + startY + "," + w + "," + height);
            }

            this._rendered_lines_rect.push(rect);

            if(color.length == 0){
                color = this._term.preferences.cursorColor;
            }
            this.ctx.fillStyle = color;
            this.ctx.fillText(blocks_data[xIndex] || " ", startX, y * height);

        }
    }

    /**
     * 光标失去焦点
     */
    cursorBlur(){
        this.drawCursor(true);
    }

    clearLine(y: number): void {
        throw new Error("Method not implemented.");
    }

    /**
     * 清除光标
     */
    clear(): void {
        for(let y = 0, len1 = this._rendered_lines_rect.length; y < len1; y++){
            const rect = this._rendered_lines_rect[y];
            for(let x = 0, len2 = rect.length, startX, startY, width, height; x < len2; x++){
                [startX, startY, width, height] = rect[x].split(",");
                if(this.ctx) this.ctx.clearRect(parseInt(startX), parseInt(startY), parseInt(width), parseInt(height));
            }
        }
        this._rendered_lines_rect.splice(0, this._rendered_lines_rect.length);
    }
}