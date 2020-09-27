/**
 * buffer：存储多个BufferChain
 * Buffer = [ BufferLine = [block, block, block], BufferLine, BufferLine, BufferLine, BufferLine, ...]
 */
import {
    DataBlockAttribute
} from "./DataBlockAttribute";
import {LineBuffer} from "./LineBuffer";

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

    // 缓冲区
    private readonly _change_buffer: LineBuffer;
    // 保留区
    private readonly _saved_buffer: LineBuffer;
    // 显示区
    private readonly _display_buffer: LineBuffer;
    // 回滚区
    private readonly _undo_buffer: LineBuffer;

    // 缓冲区类型
    private readonly type: string;

    // 横坐标
    private _x: number = 0;
    private _y: number = 0;

    // 高水位，针对y坐标的最大值
    private _high_water: number = 0;

    // 行
    private _rows: number = 0;
    private _columns: number = 0;

    private _savedX: number = 0;
    private _savedY: number = 0;

    // Set Scrolling Region [top;bottom] (default = full size of window) (DECSTBM), VT100.
    private _scrollTop: number = 0;
    private _scrollBottom: number = 0;

    // https://invisible-island.net/xterm/ctlseqs/ctlseqs.html#h2-The-Alternate-Screen-Buffer
    // 是否可以滚动
    readonly scrollBack: boolean = false;

    // 最大滚动行数，默认为0的话，是无限制
    private _maxScrollBack: number = -1;

    // 是否等待重置缓冲区
    private _resize_wait = false;

    constructor(rows: number, columns: number, scrollBack: boolean, type: string = "") {
        this._rows = rows;
        this._columns = columns;
        this.type = type;
        this.scrollBack = scrollBack;

        this.scrollTop = 1;
        this.scrollBottom = this._rows;

        // 设置默认坐标点为1,1，原点为左上角。
        // https://invisible-island.net/xterm/ctlseqs/ctlseqs.html#h3-Functions-using-CSI-_-ordered-by-the-final-character_s_
        // Cursor Position [row;column] (default = [1,1]) (CUP).
        this.y = 1;
        this.x = 1;
        this._high_water = 1;
        // this.blankBlocks = Array.from({length:columns}, () => Buffer.newBlankBlock());

        this._change_buffer = new LineBuffer(rows, "change_buffer");
        this._saved_buffer = new LineBuffer(0, "saved_buffer");
        this._display_buffer = new LineBuffer(0, "display_buffer");
        this._undo_buffer = new LineBuffer(0, "undo_buffer");
    }

    get x(): number {
        return this._x;
    }

    set x(value: number) {
        this._x = value;
        // this._dirtyLines[value - 1] = 1;
    }

    get y(): number {
        return this._y;
    }

    set y(value: number) {
        this._y = value;
        if (this._high_water < value) {
            this._high_water = value;
        }
    }

    get high_water(): number {
        return this._high_water;
    }

    resetHighWater() {
        this._high_water = 1;
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

    get maxScrollBack(): number {
        return this._maxScrollBack;
    }

    set maxScrollBack(value: number) {
        this._maxScrollBack = value;
    }

    get resize_wait(): boolean {
        return this._resize_wait;
    }

    set resize_wait(value: boolean) {
        this._resize_wait = value;
    }

    reset() {
        this._change_buffer.reset();
        this._saved_buffer.reset();
        this._display_buffer.reset();
    }

    get size(): number {
        return this._change_buffer.lines.length;
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

    get rows(): number {
        return this._rows;
    }

    get columns(): number {
        return this._columns;
    }

    get change_buffer(): LineBuffer {
        return this._change_buffer;
    }

    get saved_buffer(): LineBuffer {
        return this._saved_buffer;
    }

    get display_buffer(): LineBuffer {
        return this._display_buffer;
    }

    get undo_buffer(): LineBuffer {
        return this._undo_buffer;
    }

    /**
     * 重置缓冲区大小
     * @param newRows
     * @param newCols
     */
    resize(newRows: number, newCols: number) {
        this._scrollBottom = newRows;
        const currentRows = this.size;
        const currentCols = this.columns;

        if (currentRows != newRows) {
            // 将缓冲区的所有行移动到保留区中
            // 合并缓冲区的行到保留区
            this._change_buffer.moveAllLineTo(this._saved_buffer);
            // 将需要的行移动到缓冲区
            let start = this._saved_buffer.lines.length - newRows;
            this._saved_buffer.moveLineTo(this._change_buffer, start < 0 ? 0: start, newRows);

            // 当前缓冲区的行数
            const cur_buf_row_count = this._change_buffer.lines.length;
            if (currentRows < newRows) {
                // 窗口的高度放大。 24 -> 25
                this._y += cur_buf_row_count - currentRows;

                // 剩余多少行没有添加，意思是保留区是空的。
                const appendRowCount = newRows - cur_buf_row_count;
                if (appendRowCount > 0) {
                    // 添加空行
                    this.appendLine(appendRowCount);
                }

            } else if (currentRows > newRows) {
                // 窗口的高度缩小。 如 25 -> 24
                this._y -= (currentRows - newRows);
            }
        }

        if (currentCols > newCols) {
            // 删除列
            for (let i = 0; i < this._rows; i++) {
                this.remove(i, newCols, currentCols - newCols);
            }

        } else if (currentCols < newCols) {
            // 添加列
            for (let i = 0; i < this._rows; i++) {
                this.append(i, newCols - currentCols);
            }

        }

        this._columns = newCols;
        this._rows = newRows;
    }

    clear(): void {
        this.y = 1;
        this.x = 1;
        this.scrollTop = 1;
        this.scrollBottom = this._rows;
    }

    /**
     * 插入空行
     * @param start 开始的索引
     * @param count 插入多少行
     */
    insertLine(start: number, count: number): void {
        for (let i = 0; i < count; i++) {
            this._change_buffer.insertLine(start + i, this.columns);
        }
    }

    /**
     * 附加多少空行，在数组尾部添加
     * @param count
     */
    appendLine(count: number = 1): void {
        // 插入多行
        for (let i = 0; i < count; i++) {
            this._change_buffer.appendLine(this._columns);
        }
    }

    /**
     * 删除行
     * @param start
     * @param count
     * @param scroll_back 是否将删除的行添加到保留区中
     */
    removeLine(start: number, count: number, scroll_back: boolean = false): void {
        if (scroll_back && this.scrollBack) {
            this._change_buffer.moveLineTo(this._saved_buffer, start, count);
            if (this._saved_buffer.lines.length > this.maxScrollBack) {
                // 直接将第一行删除。
                this._saved_buffer.removeLine(0, 1);
            }
        } else {
            this._change_buffer.removeLine(start, count);
        }

    }

    /**
     * 抹除行
     * @param y
     * @param blockAttr 属性
     */
    eraseLine(y: number, blockAttr: DataBlockAttribute): void {
        if (!this._change_buffer.lines[y - 1]) {
            console.info("eraseLine:this._lines[y - 1]" + this._change_buffer.lines[y - 1]);
            return;
        }
        for (let xIndex = 0, len = this._change_buffer.lines[y - 1].length; xIndex < len; xIndex++) {
            this.replace(y - 1, xIndex, 1, blockAttr, " ");
        }
    }

    /**
     * 向缓冲区添加行
     */
    fillRows(): void {
        if (!this._rows) {
            throw new Error("this._rows is " + this._rows);
        } else {
            for (let y = 0; y < this._rows; y++) {
                this._change_buffer.replaceLine(y, this.columns);
            }
        }
    }

    /**
     * 移除行的某些块。
     * @param yIndex y的索引
     * @param start 开始的索引
     * @param deleteCount
     */
    remove(yIndex: number, start: number, deleteCount: number): void {
        this._change_buffer.remove(yIndex, start, deleteCount);
    }

    /**
     * 给指定的行添加块
     * @param yIndex
     * @param count
     */
    append(yIndex: number, count: number) {
        this._change_buffer.append(yIndex, count);
    }


    // /**
    //  * 在指定的位置插入块
    //  * @param yIndex
    //  * @param xIndex
    //  * @param charWidth 字符宽度，默认是1
    //  * @param dataAttr
    //  * @param blocksData
    //  */
    // insert(yIndex: number, xIndex: number, charWidth: number = 1, dataAttr: DataBlockAttribute, ...blocksData: string[]) {
    //     for (let i = 0, len = blocksData.length; i < len; i++) {
    //         this._change_buffer.insert(yIndex, xIndex + i, charWidth, dataAttr, blocksData[i]);
    //     }
    // }

    /**
     * 更新块信息
     * @param yIndex
     * @param xIndex
     * @param charWidth
     * @param dataAttr
     * @param blocksData
     */
    replace(yIndex: number, xIndex: number, charWidth: number = 1, dataAttr: DataBlockAttribute, ...blocksData: string[]) {
        for (let i = 0, len = blocksData.length; i < len; i++) {
            this._change_buffer.replace(yIndex, xIndex + i, charWidth, dataAttr, blocksData[i]);
        }
    }

    /**
     * 抹除某一个数据块
     * @param yIndex
     * @param xIndex
     * @param blockAttr
     */
    erase(yIndex: number, xIndex: number, blockAttr: DataBlockAttribute) {
        const block = this._change_buffer.lines[yIndex][xIndex];
        if (!block && block.length == 0) {
            // 如果当前清掉的是中文占位符，则需要把上一个中文清掉。
            // Demo：echo -e '😙\x08\x1b[K'
            try {
                this.replace(yIndex, xIndex - 1, 1, blockAttr, " ");
            } catch (e) {
            }
        }
        this.replace(yIndex, xIndex, 1, blockAttr, " ");
    }


    /**
     * 将缓冲区的某一行复制到undo缓冲区中
     * @param yIndex
     */
    copy_change_buffer_to_undo_buffer(yIndex: number){
        this.change_buffer.checkLine(yIndex);

        // 复制行, 非地址引用，slice
        // 如果行不在undo缓冲区内，则添加
        for(let i = 0, len = this._undo_buffer.line_ids.length; i < len; i++) {
            if(this._undo_buffer.line_ids[i] == this._change_buffer.line_ids[yIndex]){
                // 行已存在
                this._undo_buffer.removeLine(i, 1);
                break;
            }
        }

        this._undo_buffer.copyLineFrom(this._change_buffer, yIndex);

    }

    /**
     * 回滚某一行
     */
    rollback(){
        if(this._undo_buffer.size == 0) return;
        const count = this._change_buffer.line_ids.length;
        for(let i = 0, len = this._undo_buffer.line_ids.length; i < len; i++) {
            for(let j = 0; j < count; j++){
                if(this._undo_buffer.line_ids[i] == this._change_buffer.line_ids[j]){
                    // 恢复这一行
                    this._change_buffer.replaceLineFrom(this._undo_buffer, j);
                }
            }
        }
    }


}