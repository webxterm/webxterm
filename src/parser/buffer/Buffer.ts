/**
 * buffer：存储多个BufferChain
 * Buffer = [ BufferLine = [block, block, block], BufferLine, BufferLine, BufferLine, BufferLine, ...]
 */
import {BufferLine} from "./BufferLine";
import {DataBlock} from "./DataBlock";

/**
 *  memory buffer
 *
 *  ---------------------
 * |                     |
 * |    saved lines      |
 * |                     |
 *  ---------------------
 * | ___ buffer line ___ |
 * |                     |
 * |       buffer        |
 * |                     |
 *  ---------------------
 *
 */
export class Buffer {

    // 数据链
    private _lines: BufferLine[] = [];

    // 缓冲区类型
    private readonly type: string;

    // 横坐标
    private _x: number = 1;
    private _y: number = 1;

    // 行
    private _rows: number = 0;
    private _columns: number = 0;

    private _savedX: number = 0;
    private _savedY: number = 0;
    private _savedLineNum: number = 0;

    // Set Scrolling Region [top;bottom] (default = full size of window) (DECSTBM), VT100.
    private _scrollTop: number = 0;
    private _scrollBottom: number = 0;

    // 行编号
    private lineNum: number = 0;

    // https://invisible-island.net/xterm/ctlseqs/ctlseqs.html#h2-The-Alternate-Screen-Buffer
    // 是否可以滚动
    private readonly scrollBack: boolean = false;
    // 保存的行
    private _savedLines: BufferLine[] = [];

    // 上一次更新
    private _lastY: number = 0;

    constructor(rows: number, columns: number, scrollBack: boolean, type: string = "") {
        this._rows = rows;
        this._columns = columns;
        this.type = type;
        this.scrollBack = scrollBack;

        this.scrollTop = 1;
        this.scrollBottom = this._rows;
    }

    get x(): number {
        return this._x;
    }

    set x(value: number) {
        this._x = value;
    }

    get y(): number {
        return this._y;
    }

    set y(value: number) {
        this._lastY = this._y;
        this._y = value;
    }

    get lastY(): number {
        return this._lastY;
    }

    get savedX(): number {
        return this._savedX;
    }

    set savedX(value: number) {
        this._savedX = value;
    }

    get savedY(): number {
        return this._savedY;
    }

    set savedY(value: number) {
        this._savedY = value;
    }

    get lines(): BufferLine[] {
        return this._lines;
    }

    get size(): number {
        return this._lines.length;
    }

    /**
     * 获取当前行
     */
    get activeBufferLine(): BufferLine {
        return this._lines[this._y - 1];
    }

    get scrollTop(): number {
        return this._scrollTop;
    }

    set scrollTop(value: number) {
        this._scrollTop = value;
    }

    get scrollBottom(): number {
        return this._scrollBottom;
    }

    set scrollBottom(value: number) {
        this._scrollBottom = value;
    }

    // 获取行号
    get nextLineNum(): number {
        this.lineNum += 1;
        return this.lineNum;
    }

    get savedLineNum(): number {
        return this._savedLineNum;
    }

    set savedLineNum(value: number) {
        this._savedLineNum = value;
    }

    get rows(): number {
        return this._rows;
    }

    get columns(): number {
        return this._columns;
    }

    /**
     * 获取保存的行，如果是备用缓冲区的话，任何时候都是空数组。
     */
    get savedLines(): BufferLine[] {
        return this._savedLines;
    }

    /**
     * 获取指定的缓冲区链
     * @param y
     */
    get(y: number): BufferLine {
        return this._lines[y - 1];
    }

    /**
     * 在指定的位置插入缓冲区链/行
     * @param y
     * @param lines
     */
    insert(y: number, ...lines: BufferLine[]) {
        let result = [];
        for (let i = 0; i < lines.length; i++) {
            let element = lines[i].element;
            if (element) {
                let afterNode = this._lines[y - 1 + i].element;
                let line = lines[i];
                result.push(afterNode);
                line.setAfterNode(afterNode);
                this._lines.splice(y - 1 + i, 0, line);
            }

        }
        return result;
    }

    /**
     * 附加行
     * @param lines
     */
    append(...lines: BufferLine[]) {
        for (let i = 0; i < lines.length; i++) {
            this._lines.push(lines[i]);
        }
    }

    /**
     * 删除指定位置的缓冲区行
     * @param y
     * @param deleteCount
     * @param saveLines 是否保存行
     */
    delete(y: number, deleteCount: number = 1, saveLines: boolean) : BufferLine[] {
        let lines = this._lines.splice(y - 1, deleteCount);
        for (let i = 0; i < lines.length; i++) {
            if (saveLines && this.scrollBack) {
                this._savedLines.push(lines[i]);
                // 如果超过最大的scrollBack的话，就删除第一行
                if(this._savedLines.length > 1024){
                    this._savedLines.splice(0, 1)[0].element.remove();
                }
            } else {
                lines[i].element.remove();
            }
        }
        return lines;
    }

    /**
     * 重置缓冲区大小
     * @param newRows
     * @param newCols
     */
    resize(newRows: number, newCols: number) {

        if (this._rows < newRows) {
            for (let i = this._rows; i < newRows; i++) {
                // 添加缓冲区行
                this._lines.push(new BufferLine(newRows));
            }
        } else if (this._rows > newRows) {
            // 删除
            for (let i = newRows; i < this._rows; i++) {
                let deletedLine = this._lines.splice(i, 1);
                deletedLine[0].element.remove();
            }
        }

        if (this._columns > newCols) {
            // 删除列
            for (let i = 0; i < this._rows; i++) {
                this._lines[i].blocks.splice(newCols, this._columns - newCols);
            }
        } else {
            // 添加列
            for (let i = 0; i < this._rows; i++) {
                for (let j = newCols; j < this._columns; j++) {
                    this._lines[i].blocks.push(DataBlock.newEmptyBlock());
                }
            }
        }

        this._columns = newCols;
        this._rows = newRows;

    }

    clear() {
        this.y = 1;
        this.x = 1;

        this.scrollTop = 1;
        this.scrollBottom = this._rows;
    }

    fillRows(): DocumentFragment{
        let fragment = document.createDocumentFragment();
        for (let y = 0; y < this._rows; y++) {
            let line = new BufferLine(this._columns);
            this.setDataId(line.element);
            fragment.appendChild(line.element);
            this._lines.push(line);
        }
        return fragment;
    }

    getBlankLine() {
        let line = new BufferLine(this._columns);
        this.setDataId(line.element);
        return line;
    }

    setDataId(element: HTMLDivElement){
        element.setAttribute("line-num", this.nextLineNum + "");
    }

    /**
     * 备用缓冲区清除保存的行
     */
    clearSavedLines(){
        let deletedLines = this.savedLines.splice(0, this.savedLines.length);
        for(let i = 0, len = deletedLines.length; i < len; i++){
            deletedLines[i].element.remove();
        }
    }


}