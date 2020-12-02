import {Terminal} from "../Terminal";
import {ScrollingRegion} from "../ScrollingRegion";
import {Buffer} from "../buffer/Buffer";
import {LineBuffer} from "../buffer/LineBuffer";

/**
 * 字体样式
 */
export enum DrawFontStyle {
    NORMAL, ITALIC, BOLD, BOTH
}

/**
 * 渲染器
 */
export abstract class CanvasRenderer {

    protected ctx: CanvasRenderingContext2D | null;
    protected _view: HTMLCanvasElement;

    // 字符宽度
    private _measuredTextWidth: number = 0;
    // 字体大小
    protected _font_size: number = 0;
    // 当前终端示例
    protected _term: Terminal;

    // 保留区 + 缓冲区
    // 实际内容的行号
    // 如果保留区为空，则dy1=1, dy2=buffer_size
    // current scrolling region
    protected _csr: ScrollingRegion;
    protected _last_csr: ScrollingRegion;

    /**
     * 上次绘制的字体样式
     */
    protected last_font_style: DrawFontStyle = DrawFontStyle.NORMAL;
    // protected last_fill_style: string = "";

    /**
     * 已渲染的块，用于后面抹除已经渲染的区域。
     * item = startPX,width
     */
    protected readonly _rendered_lines_rect: string[][];

    protected _active_buffer: Buffer;

    protected _saved_buffer: LineBuffer;
    protected _change_buffer: LineBuffer;
    protected _display_buffer: LineBuffer;

    // 高度
    private _height: number = 0;

    // 开始联想输入的点
    protected _composing_x: number = 0;
    protected _composing_y: number = 0;

    protected constructor(term: Terminal) {
        this._term = term;
        this._csr = new ScrollingRegion();
        this._last_csr = new ScrollingRegion();
        this._rendered_lines_rect = [];

        this._active_buffer = term.bufferSet.activeBuffer;
        //
        this._saved_buffer = term.bufferSet.normal.saved_buffer;
        this._change_buffer = this._active_buffer.change_buffer;
        this._display_buffer = this._active_buffer.display_buffer;

        this._view = this.getView();
        this.ctx = this._view.getContext("2d");

        // 初始化字体
        this.init();
    }

    init(): void {
        // 初始化字体
        this.updateFontSize();
    }

    abstract getView(): HTMLCanvasElement;

    //
    // 考虑性能问题，这里采用连加的方式
    // https://www.cnblogs.com/imyeah/p/es6-stringTemplate-performance-testing.html
    getFont(fontStyle: DrawFontStyle){
        const fontName = this._term.preferences.fontFamily.getFontName();
        // 考虑到加粗字体渲染的宽度和高度比普通字体大，后面重新渲染会导致出现边线。
        // 所以暂时不支持字体加粗样式
        if(fontStyle == DrawFontStyle.BOTH){
            return "italic bold " + this._font_size + "px '" + fontName + "'";
        } else {
            if(fontStyle == DrawFontStyle.ITALIC){
                return "italic " + this._font_size + "px '" + fontName + "'";
            }
            if(fontStyle == DrawFontStyle.BOLD){
                return "bold " + this._font_size + "px '" + fontName + "'";
            }
            return this._font_size + "px '" + fontName + "'";
        }
    }

    updateFontSize(): void{
        // 字体大小
        const fontSize = this._term.preferences.fontSize.toLowerCase();
        console.info("CanvasRenderer......updateFontSize()...." + fontSize);

        let fs: number = 0;
        if(fontSize.indexOf("px") != -1){
            fs = parseInt(fontSize);
        } else if(fontSize.indexOf("pt") != -1){
            fs = parseInt(fontSize) / 0.75;
        }
        this._font_size = fs * 2;
        this._height = this._term.charHeight * this._term.preferences.canvasSizeMultiple;

        // 获取默认字体
        if(this.ctx) {
            this.updateFont(DrawFontStyle.NORMAL);
            this.ctx.textBaseline = "bottom";
            this._measuredTextWidth = Math.round(this.ctx.measureText("w").width);
        }
    }

    /**
     * 更新字体
     * @param fontStyle
     */
    updateFont(fontStyle: DrawFontStyle = DrawFontStyle.NORMAL) {
        if(this.ctx) this.ctx.font = this.getFont(fontStyle);
    }

    /**
     * 更新
     * @param rows
     * @param columns
     */
    resize(rows: number, columns: number){
        // 更新字体大小，并计算字符宽度
        this.updateFontSize();
    }

    /**
     * 清除指定行
     * @param yIndex
     */
    clearLine(yIndex: number): void {
        // 空行不处理。
        const rect = this._rendered_lines_rect[yIndex];
        if(!rect) return;
        const len = rect.length;
        if(len == 0) return;

        const height = this.height,
            startY = yIndex * height;
        for(let i = 0, startX, width; i < len; i++){
            [startX, width] = rect[i].split(",");

            if(this.ctx) this.ctx.clearRect(parseInt(startX), startY, parseInt(width), height);
        }
    }

    /**
     * 清除全部
     */
    clear(): void {
        for(let y = 0, len = this._rendered_lines_rect.length; y < len; y++){
            this.clearLine(y);
        }
    }

    get measuredTextWidth(): number {
        if(this._measuredTextWidth == 0)
            console.info("Warning: CanvasRenderer._measuredTextWidth is 0");
        return this._measuredTextWidth;
    }

    get height(): number {
        if(this._height == 0)
            console.info("Warning: CanvasRenderer._height is 0");
        return this._height;
    }

}