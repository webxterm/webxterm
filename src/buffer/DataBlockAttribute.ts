/**
 * 数据块的属性
 */
export class DataBlockAttribute {

    // 是否为\t
    private _tab: boolean = false;

    // 是否为双字节字符，/[\u4E00-\u9FA5]|[\uFE30-\uFFA0]/gi.test(chr)
    private _len2: boolean = false;

    // 加粗
    private _bold: boolean = false;

    // 强度降低
    private _faint: boolean = false;

    // 斜体
    private _italic: boolean = false;

    // 下划线
    private _underline: boolean = false;

    // Slow Blink, less than 150 per minute
    private _slowBlink: boolean = false;

    // MS-DOS ANSI.SYS; 150+ per minute; not widely supported
    private _rapidBlink: boolean = false;

    // 反转 reverse video, swap foreground and background colors
    private _inverse: boolean = false;

    // 隐藏
    private _invisible: boolean = false;

    // 删除线
    private _crossedOut: boolean = false;

    // 颜色class
    private _colorClass: string = "";

    // 背景颜色class
    private _backgroundColorClass: string = "";


    get tab(): boolean {
        return this._tab;
    }

    set tab(value: boolean) {
        this._tab = value;
    }

    get len2(): boolean {
        return this._len2;
    }

    set len2(value: boolean) {
        this._len2 = value;
    }

    get bold(): boolean {
        return this._bold;
    }

    set bold(value: boolean) {
        this._bold = value;
    }

    get faint(): boolean {
        return this._faint;
    }

    set faint(value: boolean) {
        this._faint = value;
    }

    get italic(): boolean {
        return this._italic;
    }

    set italic(value: boolean) {
        this._italic = value;
    }

    get underline(): boolean {
        return this._underline;
    }

    set underline(value: boolean) {
        this._underline = value;
    }

    get slowBlink(): boolean {
        return this._slowBlink;
    }

    set slowBlink(value: boolean) {
        this._slowBlink = value;
    }

    get rapidBlink(): boolean {
        return this._rapidBlink;
    }

    set rapidBlink(value: boolean) {
        this._rapidBlink = value;
    }

    get inverse(): boolean {
        return this._inverse;
    }

    set inverse(value: boolean) {
        this._inverse = value;
    }

    get invisible(): boolean {
        return this._invisible;
    }

    set invisible(value: boolean) {
        this._invisible = value;
    }

    get crossedOut(): boolean {
        return this._crossedOut;
    }

    set crossedOut(value: boolean) {
        this._crossedOut = value;
    }

    get colorClass(): string {
        return this._colorClass;
    }

    set colorClass(value: string) {
        this._colorClass = value;
    }

    get backgroundColorClass(): string {
        return this._backgroundColorClass;
    }

    set backgroundColorClass(value: string) {
        this._backgroundColorClass = value;
    }
}