import {ATTR_MODE_NONE, DataBlockAttribute} from "./DataBlockAttribute";


/**
 * 行缓冲区
 */
export class LineBuffer {

    private readonly _init_line_size: number = 0;   // 初始化行数

    private _lines: string[][];                 // 缓冲区的所有行
    private _line_char_widths: number[][];     // 字符显示宽度，默认是1，可选值为1，2，3，4...127？
    private _line_attrs: number[][];           // 行属性, 最小是0，最大为127
    private _line_colors: string[][];           // 字符前景颜色
    private _line_bg_colors: string[][];        // 字符背景颜色
    private _line_soft_wraps: number[];         // 软换行, 0: 硬换行，1:软换行

    private _line_ids: number[];                // 行编号，不会改变，只会一直增加
    // 正常的，只有change_buffer会调用改方法。其他buffer将会一直是0
    private _current_id: number = 0;            // 当前的行编号

    //
    // private _line_compositions: number[][];     // 是否为联想输入

    // 缓冲区类型
    private readonly type: string = "";

    constructor(init_line_size: number = 0, type: string = "") {
        this._init_line_size = init_line_size;
        this._lines = new Array(init_line_size);
        this._line_char_widths = new Array(init_line_size);
        this._line_attrs = new Array(init_line_size);
        this._line_colors = new Array(init_line_size);
        this._line_bg_colors = new Array(init_line_size);
        this._line_soft_wraps = new Array(init_line_size);
        this._line_ids = new Array(init_line_size);
        // this._line_compositions = new Array(init_line_size);

        this.type = type;
    }

    /**
     * 重置
     */
    reset(){
        this._lines = new Array(this._init_line_size);
        this._line_char_widths = new Array(this._init_line_size);
        this._line_attrs = new Array(this._init_line_size);
        this._line_colors = new Array(this._init_line_size);
        this._line_bg_colors = new Array(this._init_line_size);
        this._line_soft_wraps = new Array(this._init_line_size);
        this._line_ids = new Array(this._init_line_size);
        // this._line_compositions = new Array(this._init_line_size);
    }

    // 正常的，只有change_buffer会调用改方法。
    get current_id(): number {
        return ++this._current_id;
    }

    get lines(): string[][] {
        return this._lines;
    }

    get line_char_widths(): number[][]{
        return this._line_char_widths;
    }

    get line_attrs(): number[][] {
        return this._line_attrs;
    }

    get line_colors(): string[][] {
        return this._line_colors;
    }

    get line_bg_colors(): string[][] {
        return this._line_bg_colors;
    }

    get line_soft_wraps(): number[] {
        return this._line_soft_wraps;
    }

    get line_ids(): number[] {
        return this._line_ids;
    }

    // get line_compositions(): number[][] {
    //     return this._line_compositions;
    // }

    get size(){
        return this._lines.length;
    }

    get init_line_size(): number {
        return this._init_line_size;
    }

    newItems<T>(initVal: T, columns: number = 0): T[] {
        return Array.from({length: columns}, ()=> initVal);
    }

    //////////////////////////////////////////////////////////////////////////
    // 列
    //////////////////////////////////////////////////////////////////////////

    /**
     * 替换某一个块
     * @param yIndex
     * @param xIndex
     * @param charWidth
     * @param dataAttr
     * @param isComposition
     * @param data
     */
    replace(yIndex: number, xIndex: number, charWidth: number = 1, dataAttr: DataBlockAttribute, data: string): void{
        this.checkLine(yIndex);

        this._lines[yIndex][xIndex] = data;
        this._line_attrs[yIndex][xIndex] = dataAttr.sum;
        this._line_char_widths[yIndex][xIndex] = charWidth;
        this._line_colors[yIndex][xIndex] = dataAttr.colorClass;
        this._line_bg_colors[yIndex][xIndex] = dataAttr.backgroundColorClass;

        // this._line_compositions[yIndex][xIndex] = isComposition ? 1 : 0;
    }

    /**
     * 更新块信息
     * @param yIndex
     * @param xIndex
     * @param charWidth
     * @param dataAttr
     * @param blocksData
     * @param isComposition 是否为联想输入
     */
    replace_more(yIndex: number, xIndex: number, charWidth: number = 1, dataAttr: DataBlockAttribute, ...blocksData: string[]) {
        for (let i = 0, len = blocksData.length; i < len; i++) {
            this.replace(yIndex, xIndex + i, charWidth, dataAttr, blocksData[i]);
        }
    }

    /**
     * 追加一个块
     * @param yIndex
     * @param count
     * @param charWidth
     */
    append(yIndex: number, count: number, charWidth: number = 1): void{
        this.checkLine(yIndex);

        this._lines[yIndex].push(...this.newItems(" ", count));
        this._line_attrs[yIndex].push(...this.newItems(ATTR_MODE_NONE, count));
        this._line_char_widths[yIndex].push(...this.newItems(charWidth, count));

        this._line_colors[yIndex].push(...this.newItems("", count));
        this._line_bg_colors[yIndex].push(...this.newItems("", count));

        // this._line_compositions[yIndex].push(...this.newItems(0, count));
    }

    /**
     * 移除一个块
     * @param yIndex
     * @param start
     * @param deleteCount
     */
    remove(yIndex: number, start: number, deleteCount: number): void{
        this.checkLine(yIndex);

        this._lines[yIndex].splice(start, deleteCount);
        this._line_attrs[yIndex].splice(start, deleteCount);
        this._line_char_widths[yIndex].splice(start, deleteCount);

        this._line_colors[yIndex].splice(start, deleteCount);
        this._line_bg_colors[yIndex].splice(start, deleteCount);

        // this._line_compositions[yIndex].splice(start, deleteCount);
    }


    //////////////////////////////////////////////////////////////////////////
    // 行
    //////////////////////////////////////////////////////////////////////////

    /**
     * 检查行是否存在
     * @param yIndex
     */
    checkLine(yIndex: number): boolean {
        if(!this._lines[yIndex]) throw new Error("LineBuffer._lines: rownum="+yIndex+" is not exists");
        if(!this._line_attrs[yIndex]) throw new Error("LineBuffer._line_attrs: rownum="+yIndex+" is not exists");
        if(!this._line_char_widths[yIndex]) throw new Error("LineBuffer._line_char_widths: rownum="+yIndex+" is not exists");
        if(!this._line_colors[yIndex]) throw new Error("LineBuffer._line_colors: rownum="+yIndex+" is not exists");
        if(!this._line_bg_colors[yIndex]) throw new Error("LineBuffer._line_bg_colors: rownum="+yIndex+" is not exists");
        // if(!this._line_compositions[yIndex]) throw new Error("LineBuffer._line_compositions: rownum="+yIndex+" is not exists");
        return true;
    }

    /**
     * 插入一行（空行）
     * @param start
     * @param columns
     * @param charWidth
     */
    insertLine(start: number, columns: number, charWidth: number = 1): void{
        this._lines.splice(start, 0, this.newItems(" ", columns));
        this._line_attrs.splice(start, 0, this.newItems(ATTR_MODE_NONE, columns));
        this._line_char_widths.splice(start, 0, this.newItems(charWidth, columns));
        this._line_colors.splice(start, 0, this.newItems("", columns));
        this._line_bg_colors.splice(start, 0, this.newItems("", columns));
        this._line_soft_wraps.splice(start, 0, 0);
        this._line_ids.splice(start, 0, this.current_id);
        // this._line_compositions.splice(start, 0, this.newItems(0, columns));
    }

    /**
     * 追加一行（空行）
     * @param columns
     * @param charWidth
     */
    appendLine(columns: number, charWidth: number = 1): void{
        this._lines.push(this.newItems(" ", columns));
        this._line_attrs.push(this.newItems(ATTR_MODE_NONE, columns));
        this._line_char_widths.push(this.newItems(charWidth, columns));
        this._line_colors.push(this.newItems("", columns));
        this._line_bg_colors.push(this.newItems("", columns));

        this._line_soft_wraps.push(0);
        this._line_ids.push(this.current_id);
        // this._line_compositions.push(this.newItems(0, columns));
    }

    /**
     * 替换一行（空行）
     * @param yIndex
     * @param columns
     * @param charWidth
     */
    replaceLine(yIndex: number, columns: number, charWidth: number = 1): void{
        this._lines[yIndex] = this.newItems(" ", columns);
        this._line_attrs[yIndex] = this.newItems(ATTR_MODE_NONE, columns);
        this._line_char_widths[yIndex] = this.newItems(charWidth, columns);
        this._line_colors[yIndex] = this.newItems("", columns);
        this._line_bg_colors[yIndex] = this.newItems("", columns);

        this._line_soft_wraps[yIndex] = 0;
        this._line_ids[yIndex] = this.current_id;

        // this._line_compositions[yIndex] = this.newItems(0, columns);
    }

    /**
     * 移除一行
     * @param start
     * @param deleteCount
     */
    removeLine(start: number, deleteCount: number): void {
        this._lines.splice(start, deleteCount);
        this._line_attrs.splice(start, deleteCount);
        this._line_char_widths.splice(start, deleteCount);
        this._line_colors.splice(start, deleteCount);
        this._line_bg_colors.splice(start, deleteCount);

        this._line_soft_wraps.splice(start, deleteCount);
        this._line_ids.splice(start, deleteCount);

        // this._line_compositions.splice(start, deleteCount);
    }

    /**
     * 将行移动到保留区
     * @param to
     * @param start
     * @param deleteCount
     */
    moveLineTo(to: LineBuffer, start: number, deleteCount: number): void {

        to.lines.push(...this._lines.splice(start, deleteCount));
        to.line_attrs.push(...this._line_attrs.splice(start, deleteCount));
        to.line_char_widths.push(...this._line_char_widths.splice(start, deleteCount));
        to.line_colors.push(...this._line_colors.splice(start, deleteCount));
        to.line_bg_colors.push(...this._line_bg_colors.splice(start, deleteCount));

        to.line_soft_wraps.push(...this.line_soft_wraps.splice(start, deleteCount));
        to.line_ids.push(...this.line_ids.splice(start, deleteCount));

    }

    /**
     * 移动所有行
     * @param to
     */
    moveAllLineTo(to: LineBuffer){
       this.moveLineTo(to, 0, this._lines.length);
    }

    /**
     * 复制行到指定的LineBuffer中
     * @param from
     * @param start 索引
     * @param end 索引不包括end
     */
    copyFrom(from: LineBuffer, start: number, end: number): void{

        this._lines.push(...from.lines.slice(start, end));
        this._line_attrs.push(...from.line_attrs.slice(start, end));
        this._line_char_widths.push(...from.line_char_widths.slice(start, end));
        this._line_bg_colors.push(...from.line_bg_colors.slice(start, end));
        this._line_colors.push(...from.line_colors.slice(start, end));

        this._line_soft_wraps.push(...from.line_soft_wraps.slice(start, end));
        this._line_ids.push(...from.line_ids.slice(start, end));
    }

    /**
     * 复制某一行的某些元素到指定的lineBuffer中
     * @param from
     * @param yIndex
     * @param start
     * @param end
     */
    copyLineFrom(from: LineBuffer, yIndex: number, start: number = 0, end: number = -1){
        if(end == -1){
            end = from._lines[yIndex].length;
        }
        this._lines.push(from._lines[yIndex].slice(start, end));
        this._line_attrs.push(from._line_attrs[yIndex].slice(start, end));
        this._line_char_widths.push(from._line_char_widths[yIndex].slice(start, end));
        this._line_bg_colors.push(from._line_bg_colors[yIndex].slice(start, end));
        this._line_colors.push(from._line_colors[yIndex].slice(start, end));

        this._line_soft_wraps.push(from.line_soft_wraps[yIndex]);
        this._line_ids.push(from.line_ids[yIndex]);
    }

    /**
     * 替换某一行
     * @param from
     * @param yIndex
     */
    replaceLineFrom(from: LineBuffer, yIndex: number){
        this._lines[yIndex] = from.lines[yIndex];
        this._line_attrs[yIndex] = from.line_attrs[yIndex];
        this._line_char_widths[yIndex] = from.line_char_widths[yIndex];
        this._line_colors[yIndex] = from.line_colors[yIndex];
        this._line_bg_colors[yIndex] = from.line_bg_colors[yIndex];

        this._line_soft_wraps[yIndex] = from.line_soft_wraps[yIndex];
        this._line_ids[yIndex] = from.line_ids[yIndex];
    }

}