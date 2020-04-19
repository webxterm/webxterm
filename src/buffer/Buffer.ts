/**
 * buffer：存储多个BufferChain
 * Buffer = [ BufferLine = [block, block, block], BufferLine, BufferLine, BufferLine, BufferLine, ...]
 */
// import {BufferLine} from "./BufferLine";

import {DataBlockAttribute} from "./DataBlockAttribute";

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
    // private _lines: BufferLine[] = [];
    private _lineBlocks: string[][] = [];       // 二维数组
    private _lineDirties: boolean[] = [];       // 是否为脏行
    private _lineElements: HTMLElement[] = [];  // 元素

    // 缓冲区类型
    private readonly type: string;

    // 横坐标
    private _x: number = 0;
    private _y: number = 0;

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
    readonly scrollBack: boolean = false;
    // 保存的行，只保存元素，内容为innerHTML
    private _savedLines: HTMLElement[] = [];
    // 最大滚动行数
    private _maxScrollBack: number = 1024;

    private readonly blankBlocks: string[] = [];

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

        for(let i = 0; i < columns; i++){
            this.blankBlocks.push(" ");
        }
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
        this._y = value;

        // let line: BufferLine = this.get(this._y);
        // if(line && !line.used){
        //     line.used = true;
        // }
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

    get lines(): HTMLElement[] {
        return this._lineElements;
    }

    reset(){
        // this._lines = [];
        this._lineElements = [];
        this._lineBlocks = [];
        this._lineDirties = [];
    }

    get size(): number {
        return this._lineElements.length;
    }

    /**
     * 获取当前行
     */
    get activeBufferLine(): HTMLElement {
        return this._lineElements[this._y - 1];
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

    // 获取当前的行号
    get currentLineNum(): number {
        return this.lineNum;
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
    get savedLines(): HTMLElement[] {
        return this._savedLines;
    }

    /**
     * 获取指定的缓冲区链
     * @param y
     */
    get(y: number): HTMLElement {
        return this._lineElements[y - 1];
    }

    getBlocks(y: number): string[] {
        return this._lineBlocks[y - 1];
    }

    isDirty(y: number): boolean {
        return this._lineDirties[y - 1];
    }

    /**
     *
     * @param y
     * @param isDirty
     */
    updateDirty(y: number, isDirty: boolean){
        const source = this._lineDirties[y - 1];
        if(isDirty){
            if(!source)
                this._lineDirties[y - 1] = true;
        } else {
            if(source)
                this._lineDirties[y - 1] = false;
        }
    }

    // /**
    //  * 在指定的位置插入缓冲区链/行
    //  * @param y
    //  * @param lines
    //  */
    // insert(y: number, ...lines: BufferLine[]) {
    //     let result = [];
    //     for (let i = 0; i < lines.length; i++) {
    //         let element = lines[i].element;
    //         if (element) {
    //             let afterNode = this._lines[y - 1 + i].element;
    //             let line = lines[i];
    //             result.push(afterNode);
    //             // line.setAfterNode(afterNode);
    //             this._lines.splice(y - 1 + i, 0, line);
    //         }
    //
    //     }
    //     return result;
    // }

    insert2(y: number, blocks: string[], element: HTMLElement){
        let afterNode = this._lineElements[y - 1];
        this._lineBlocks.splice(y - 1, 0, blocks);
        return afterNode;
    }

    insert(y: number, element: HTMLElement){
        let afterNode = this._lineElements[y - 1];
        this._lineBlocks.splice(y - 1, 0, this.getBlankBlocks());
        this._lineElements.splice(y - 1, 0, element);
        return afterNode;
    }

    // /**
    //  * 附加行
    //  * @param lines
    //  */
    // append(...lines: BufferLine[]) {
    //     for (let i = 0; i < lines.length; i++) {
    //         this._lines.push(lines[i]);
    //     }
    // }

    /**
     * 附加行
     * @param blocks
     * @param element
     */
    append2(blocks: string[], element: HTMLElement){
        this._lineBlocks.push(blocks);
        this._lineElements.push(element);
    }

    // /**
    //  * 删除指定位置的缓冲区行
    //  * @param y
    //  * @param deleteCount
    //  * @param saveLines 是否保存行
    //  */
    // delete(y: number, deleteCount: number = 1, saveLines: boolean) : BufferLine[] {
    //     let lines = this._lines.splice(y - 1, deleteCount);
    //     for (let i = 0; i < lines.length; i++) {
    //         if (saveLines && this.scrollBack) {
    //             this._savedLines.push(lines[i].element);
    //
    //             // 如果超过最大的scrollBack的话，就删除第一行
    //             if(this._savedLines.length > this._maxScrollBack){
    //                 this._savedLines.splice(0, 1)[0].remove();
    //             }
    //         } else {
    //             // 不是备用缓冲区或不需要保存行。
    //             // 直接将其元素删除。
    //             lines[i].element.remove();
    //             lines = [];
    //         }
    //     }
    //     return lines;
    // }

    delete2(y: number, deleteCount: number = 1, saveLines: boolean) : object {

        let result: any = {},
            index = y - 1,
            deletedBlocks = this._lineBlocks.splice(index, deleteCount),
            deletedElements = this._lineElements.splice(index, deleteCount),
            deletedDirties = this._lineDirties.splice(index, deleteCount);

        for (let i = 0; i < deletedElements.length; i++) {
            if (saveLines && this.scrollBack) {
                this._savedLines.push(deletedElements[i]);
                // 如果超过最大的scrollBack的话，就删除第一行
                if(this._savedLines.length > this._maxScrollBack){
                    this._savedLines.splice(0, 1)[0].remove();
                }
            } else {
                // 不是备用缓冲区或不需要保存行。
                // 直接将其元素删除。
                deletedElements[i].remove();

            }
        }

        if (saveLines && this.scrollBack) {
            result['dirties'] = deletedDirties;
            result["blocks"] = deletedBlocks;
            result["elements"] = deletedElements;
        }

        return result;
    }

    /**
     * 重置缓冲区大小
     * @param newRows
     * @param newCols
     */
    resize(newRows: number, newCols: number) {

        this._scrollBottom = newRows;

        const rows = this._lineElements.length;

        const fragment = document.createDocumentFragment();

        if (rows < newRows) {
            for (let i = rows; i < newRows; i++) {
                // 添加缓冲区行
                // let line = new BufferLine(newRows);
                // this._lines.push(line);
                this._lineDirties.push(false);
                this._lineBlocks.push(this.getBlankBlocks());
                fragment.appendChild(this.getBlankLine2());
            }
        } else if (rows > newRows) {
            // 删除
            let len = rows;
            for (let i = newRows; i < len; i++) {
                let deletedElement = this._lineElements.splice(i, 1);
                this._lineBlocks.splice(i, 1);
                this._lineDirties.splice(i, 1);
                if(deletedElement.length > 0)
                deletedElement[0].remove();

                i -= 1;     // splice
                len -= 1;   // splice
            }
        }
        // else {
        //     // newRows == this._row
        // }

        if (this._columns > newCols) {
            // 删除列
            for (let i = 0; i < this._rows; i++) {
                let blocks = this._lineBlocks[i];
                if(!blocks) continue;
                let len = blocks.length - newCols;
                blocks.splice(newCols, len);
            }

            this.blankBlocks.splice(newCols, this.blankBlocks.length - newCols);

        } else if(this._columns < newCols){
            // 添加列
            for (let i = 0; i < this._rows; i++) {
                let blocks = this._lineBlocks[i];
                if(!blocks) continue;
                let len = newCols - blocks.length;
                for (let j = 0; j < len; j++) {
                    blocks.push(Buffer.newEmptyBlock());
                }
            }

            for(let i = this._columns; i < newCols; i++){
                this.blankBlocks.push(" ");
            }
        }
        // else {
        //     // newCols === this._columns
        // }

        this._columns = newCols;
        this._rows = newRows;

        return fragment;

    }

    clear() {
        this.y = 1;
        this.x = 1;
        this.lineNum = 0;

        this.scrollTop = 1;
        this.scrollBottom = this._rows;
    }

    fillRows(): DocumentFragment{
        let fragment = document.createDocumentFragment();
        for (let y = 0, el; y < this._rows; y++) {
            el = this.getBlankLine2();
            this._lineElements.push(el);
            fragment.appendChild(el);
            this._lineBlocks.push(this.getBlankBlocks());
            this._lineDirties.push(false);
        }
        return fragment;
    }

    // getBlankLine() {
    //
    //     // let element = document.createElement("div");
    //
    //     let line = new BufferLine(this._columns);
    //     this.setDataId(line.element);
    //     // line.used = true;
    //
    //     return line;
    // }

    getBlankBlocks(){
        return this.blankBlocks.slice(0, this.columns);
    }

    getBlankLine2(){
        let el = document.createElement("div");
        el.className = "viewport-row";
        return el;
    }

    // setDataId(element: HTMLDivElement){
    //     element.setAttribute("line-num", this.nextLineNum + "");
    // }

    /**
     * 备用缓冲区清除保存的行
     */
    clearSavedLines(){
        let deletedLines = this.savedLines.splice(0, this.savedLines.length);
        for(let i = 0, len = deletedLines.length; i < len; i++){
            deletedLines[i].remove();
        }
    }


    /**
     * 创建一个空块
     */
    static newEmptyBlock(){
        return "";
    }

    /**
     * 创建一个新块
     * @param data
     * @param blockAttr
     * @param len2
     */
    static newBlock(data: string, blockAttr: DataBlockAttribute, len2: number = 0){
        if(data.length > 1){
            throw new Error("{" + data + "} length is " + data.length + ", expect 1.");
        }

        let hex = blockAttr.hex;
        if(hex == "" && len2 == 0){
            return data;
        }

        return data + len2 + hex;
    }

    /**
     * 创建一个长度为2的数据块
     * @param data
     * @param blockAttr
     */
    static newLen2Block(data: string, blockAttr: DataBlockAttribute){
        return Buffer.newBlock(data, blockAttr, 1);
    }

    /**
     * 在指定的位置插入块
     * @param y
     * @param x
     * @param blocks
     */
    insertBlocks(y: number, x: number, ...blocks: string[]){

        for(let i = 0; i < blocks.length; i++){
            this._lineBlocks[y - 1].splice(x - 1 + i, 0, blocks[i]);
        }
        // 超出当前行的字符数的话，需要从尾部删除。
        const deleteCount = this._lineBlocks[y - 1].length - this._columns;
        if(0 < deleteCount){
            this._lineBlocks[y - 1].splice(this._columns, deleteCount);
        }
    }

    /**
     * 替换指定位置的块
     * @param y
     * @param x
     * @param blocks
     */
    replaceBlocks(y: number, x: number, ...blocks: any[]){
        for(let i = 0; i < blocks.length; i++){
            // this.blocks.splice(x - 1 + i, 1, blocks[i]);
            this._lineBlocks[y - 1][x - 1 + i] = blocks[i];
        }
    }

    /**
     * 替换指定位置的数据块
     * @param y
     * @param x
     * @param block
     */
    replaceOneBlock(y: number, x: number, block: any){
        this._lineBlocks[y - 1][x - 1] = block;
    }

    /**
     * 删除指定位置的块
     * @param y
     * @param x
     * @param deleteCount
     */
    deleteBlocks(y: number, x: number, deleteCount: number = 1): any[]{
        return this._lineBlocks[y - 1].splice(x - 1, deleteCount);
    }

    /**
     * 抹除行
     * @param y
     * @param blockAttr 属性
     */
    eraseLine(y: number, blockAttr: DataBlockAttribute) {
        for(let i = 0, len = this._lineBlocks[y - 1].length; i < len; i++){
            this._lineBlocks[y - 1][i] = this.updateBlockValue(" ", blockAttr);
        }
    }

    /**
     * 抹除某一个数据块
     * @param y
     * @param x
     * @param blockAttr
     */
    eraseBlock(y: number, x: number, blockAttr: DataBlockAttribute){
        this._lineBlocks[y - 1][x - 1] = this.updateBlockValue(" ", blockAttr);
    }

    /**
     *
     * @param data 更新数据
     * @param blockAttr 属性
     */
    updateBlockValue(data: string, blockAttr: DataBlockAttribute){
        return Buffer.newBlock(data, blockAttr);
    }

}