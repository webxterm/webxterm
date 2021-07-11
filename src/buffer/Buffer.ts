import {ATTR_MODE_NONE, DataBlockAttribute} from "./DataBlockAttribute";
import {IdCounter} from "../common/IdCounter";

/**
 * 行缓冲区
 */
export class Buffer {

    // 缓冲区类型
    private readonly type: string = "";

    // 初始化行数
    private readonly _initLineSize: number = 0;

    // 缓冲区的所有行
    private _lineChars: string[][];

    // 字符显示宽度，默认是1，可选值为0（当为中文字符的时候，下一个占位符的宽度就是0），1，2，3，4...127？
    private _lineCharWidths: number[][];

    // 行字符属性, 最小是0，最大为255
    private _lineCharAttrs: number[][];

    // 字符前景颜色
    private _lineCharColors: string[][];

    // 字符背景颜色
    private _lineCharBgColors: string[][];

    // 行编号，不会改变，只会一直增加
    // 表示方式：
    // 1, 负数为软换行
    // 2, 正数表示行id
    private _lineIds: number[];

    // 行选择版本号，默认是0
    // 两种情况会出现增加：
    // 1, 选择内容
    // 选择内容按照 @{CanvasSelection.version} 判断
    private _lineVersions: number[];

    // 行属性，当前的行编号，正常的，只有change_buffer会调用改方法。其他buffer将会一直是0
    // private _lineId: number = 0;


    constructor(init_line_size: number = 0, type: string = "") {
        this._initLineSize = init_line_size;

        this._lineChars = new Array(init_line_size);
        this._lineCharWidths = new Array(init_line_size);
        this._lineCharAttrs = new Array(init_line_size);
        this._lineCharColors = new Array(init_line_size);
        this._lineCharBgColors = new Array(init_line_size);
        this._lineIds = new Array(init_line_size);
        this._lineVersions = new Array(init_line_size);

        this.type = type;
    }

    /**
     * 更新为软换行
     * @param yIndex
     */
    update2SoftLine(yIndex: number){
        this.lineIds[yIndex] = - this.lineIds[yIndex];
    }

    /**
     * 重置
     */
    reset() {
        this._lineChars = new Array(this._initLineSize);
        this._lineCharWidths = new Array(this._initLineSize);

        this._lineCharAttrs = new Array(this._initLineSize);
        this._lineCharColors = new Array(this._initLineSize);
        this._lineCharBgColors = new Array(this._initLineSize);

        this._lineIds = new Array(this._initLineSize);
        this._lineVersions = new Array(this._initLineSize);
    }

    // 正常的，只有change_buffer会调用改方法。
    // get current_id(): number {
    //     return ++this._lineId;
    // }


    get lineChars(): string[][] {
        return this._lineChars;
    }

    get lineCharWidths(): number[][] {
        return this._lineCharWidths;
    }

    get lineCharAttrs(): number[][] {
        return this._lineCharAttrs;
    }

    get lineCharColors(): string[][] {
        return this._lineCharColors;
    }

    get lineCharBgColors(): string[][] {
        return this._lineCharBgColors;
    }

    // get lineId(): number {
    //     return this._lineId;
    // }

    get lineIds(): number[] {
        return this._lineIds;
    }

    get lineVersions(): number[] {
        return this._lineVersions;
    }

    get size() {
        return this._lineChars.length;
    }

    getId(index: number): number{
        return this._lineIds[index];
    }

    newItems<T>(initVal: T, columns: number = 0): T[] {
        return Array.from({length: columns}, () => initVal);
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
     * @param data
     */
    replace(yIndex: number, xIndex: number, charWidth: number = 1, dataAttr: DataBlockAttribute, data: string): void {
        this.checkLine(yIndex);

        this._lineChars[yIndex][xIndex] = data;
        this._lineCharAttrs[yIndex][xIndex] = dataAttr.sum;
        this._lineCharWidths[yIndex][xIndex] = charWidth;
        this._lineCharColors[yIndex][xIndex] = dataAttr.colorClass;
        this._lineCharBgColors[yIndex][xIndex] = dataAttr.backgroundColorClass;

    }

    /**
     * 更新块信息
     * @param yIndex
     * @param xIndex
     * @param charWidth
     * @param dataAttr
     * @param blocksData
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
    append(yIndex: number, count: number, charWidth: number = 1): void {
        this.checkLine(yIndex);

        this._lineChars[yIndex].push(...this.newItems(" ", count));
        this._lineCharAttrs[yIndex].push(...this.newItems(ATTR_MODE_NONE, count));
        this._lineCharWidths[yIndex].push(...this.newItems(charWidth, count));

        this._lineCharColors[yIndex].push(...this.newItems("", count));
        this._lineCharBgColors[yIndex].push(...this.newItems("", count));

    }

    /**
     * 移除一个块
     * @param yIndex
     * @param start
     * @param deleteCount
     */
    remove(yIndex: number, start: number, deleteCount: number): void {
        this.checkLine(yIndex);

        this._lineChars[yIndex].splice(start, deleteCount);
        this._lineCharAttrs[yIndex].splice(start, deleteCount);
        this._lineCharWidths[yIndex].splice(start, deleteCount);

        this._lineCharColors[yIndex].splice(start, deleteCount);
        this._lineCharBgColors[yIndex].splice(start, deleteCount);

    }


    //////////////////////////////////////////////////////////////////////////
    // 行
    //////////////////////////////////////////////////////////////////////////

    /**
     * 检查行是否存在
     * @param yIndex
     */
    checkLine(yIndex: number): boolean {
        if (!this._lineChars[yIndex]) throw new Error("Buffer._lineChars: rownum=" + yIndex + " is not exists");
        if (!this._lineCharAttrs[yIndex]) throw new Error("Buffer._lineCharAttrs: rownum=" + yIndex + " is not exists");
        if (!this._lineCharWidths[yIndex]) throw new Error("Buffer._lineCharWidths: rownum=" + yIndex + " is not exists");
        if (!this._lineCharColors[yIndex]) throw new Error("Buffer._lineCharColors: rownum=" + yIndex + " is not exists");
        if (!this._lineCharBgColors[yIndex]) throw new Error("Buffer._lineCharBgColors: rownum=" + yIndex + " is not exists");
        return true;
    }

    /**
     * 插入一行（空行）
     * @param start
     * @param columns
     * @param charWidth
     */
    insertLine(start: number, columns: number, charWidth: number = 1): void {
        this._lineChars.splice(start, 0, this.newItems(" ", columns));
        this._lineCharAttrs.splice(start, 0, this.newItems(ATTR_MODE_NONE, columns));
        this._lineCharWidths.splice(start, 0, this.newItems(charWidth, columns));
        this._lineCharColors.splice(start, 0, this.newItems("", columns));
        this._lineCharBgColors.splice(start, 0, this.newItems("", columns));

        this._lineIds.splice(start, 0, IdCounter.instance.next);
        this._lineVersions.splice(start, 0, 0);

    }

    /**
     * 追加一行（空行）
     * @param columns
     * @param charWidth
     */
    appendLine(columns: number, charWidth: number = 1): void {
        this._lineChars.push(this.newItems(" ", columns));
        this._lineCharAttrs.push(this.newItems(ATTR_MODE_NONE, columns));
        this._lineCharWidths.push(this.newItems(charWidth, columns));
        this._lineCharColors.push(this.newItems("", columns));
        this._lineCharBgColors.push(this.newItems("", columns));

        this._lineIds.push(IdCounter.instance.next);
        this._lineVersions.push(0);

    }

    /**
     * 替换一行（空行）
     * @param yIndex
     * @param columns
     * @param charWidth
     */
    replaceLine(yIndex: number, columns: number, charWidth: number = 1): void {
        this._lineChars[yIndex] = this.newItems(" ", columns);
        this._lineCharAttrs[yIndex] = this.newItems(ATTR_MODE_NONE, columns);
        this._lineCharWidths[yIndex] = this.newItems(charWidth, columns);
        this._lineCharColors[yIndex] = this.newItems("", columns);
        this._lineCharBgColors[yIndex] = this.newItems("", columns);

        this._lineIds[yIndex] = IdCounter.instance.next;
        this._lineVersions[yIndex] = 0;

    }

    /**
     * 移除一行
     * @param start
     * @param deleteCount
     */
    removeLine(start: number, deleteCount: number = 1): void {
        this._lineChars.splice(start, deleteCount);
        this._lineCharAttrs.splice(start, deleteCount);
        this._lineCharWidths.splice(start, deleteCount);
        this._lineCharColors.splice(start, deleteCount);
        this._lineCharBgColors.splice(start, deleteCount);

        this._lineIds.splice(start, deleteCount);
        this._lineVersions.splice(start, deleteCount);


    }

    /**
     * 将行移动到保留区
     * @param to
     * @param start
     * @param deleteCount
     */
    moveLineTo(to: Buffer, start: number, deleteCount: number): void {

        to.lineChars.push(...this._lineChars.splice(start, deleteCount));
        to.lineCharAttrs.push(...this._lineCharAttrs.splice(start, deleteCount));
        to.lineCharWidths.push(...this._lineCharWidths.splice(start, deleteCount));
        to.lineCharColors.push(...this._lineCharColors.splice(start, deleteCount));
        to.lineCharBgColors.push(...this._lineCharBgColors.splice(start, deleteCount));

        to.lineIds.push(...this._lineIds.splice(start, deleteCount));
        to.lineVersions.push(...this._lineVersions.splice(start, deleteCount));

    }

    /**
     * 移动所有行
     * @param to
     */
    moveAllLineTo(to: Buffer) {
        this.moveLineTo(to, 0, this._lineChars.length);
    }

    /**
     * 复制行到指定的LineBuffer中
     * @param from
     * @param start 索引
     * @param end 索引不包括end
     */
    copyFrom(from: Buffer, start: number, end: number): void {

        this._lineChars.push(...from.lineChars.slice(start, end));
        this._lineCharAttrs.push(...from.lineCharAttrs.slice(start, end));
        this._lineCharWidths.push(...from.lineCharWidths.slice(start, end));
        this._lineCharBgColors.push(...from.lineCharBgColors.slice(start, end));
        this._lineCharColors.push(...from.lineCharColors.slice(start, end));

        this._lineIds.push(...from.lineIds.slice(start, end));
        this._lineVersions.push(...from.lineVersions.slice(start, end));

    }

    /**
     * 复制某一行的某些元素到指定的lineBuffer中
     * @param from
     * @param yIndex
     * @param start
     * @param end
     */
    copyLineFrom(from: Buffer, yIndex: number, start: number = 0, end: number = -1) {
        if (end == -1) {
            end = from.lineChars[yIndex].length;
        }
        this._lineChars.push(from.lineChars[yIndex].slice(start, end));
        this._lineCharAttrs.push(from.lineCharAttrs[yIndex].slice(start, end));
        this._lineCharWidths.push(from.lineCharWidths[yIndex].slice(start, end));
        this._lineCharBgColors.push(from.lineCharBgColors[yIndex].slice(start, end));
        this._lineCharColors.push(from.lineCharColors[yIndex].slice(start, end));

        this._lineIds.push(from.lineIds[yIndex]);
        this._lineVersions.push(from.lineVersions[yIndex]);

    }

    /**
     * 替换某一行
     * @param from
     * @param yIndex
     */
    replaceLineFrom(from: Buffer, yIndex: number) {
        this._lineChars[yIndex] = from.lineChars[yIndex];
        this._lineCharAttrs[yIndex] = from.lineCharAttrs[yIndex];
        this._lineCharWidths[yIndex] = from.lineCharWidths[yIndex];
        this._lineCharColors[yIndex] = from.lineCharColors[yIndex];
        this._lineCharBgColors[yIndex] = from.lineCharBgColors[yIndex];

        this._lineIds[yIndex] = from.lineIds[yIndex];
        this._lineVersions[yIndex] = from.lineVersions[yIndex];

    }

}