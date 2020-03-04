/**
 * 数据块的属性
 */
export class DataBlockAttribute {

    // 是否为\t
    // private _tab: boolean = false;

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

    // get tab(): boolean {
    //     return this._tab;
    // }
    //
    // set tab(value: boolean) {
    //     this._tab = value;
    // }
    // 版本号
    private _version: number = 0;

    get len2(): boolean {
        return this._len2;
    }

    set len2(value: boolean) {
        if(value == this._len2) return;
        this._len2 = value;
        this._version += 1;
    }

    get bold(): boolean {
        return this._bold;
    }

    set bold(value: boolean) {
        if(value == this._bold) return;
        this._bold = value;
        this._version += 1;
    }

    get faint(): boolean {
        return this._faint;
    }

    set faint(value: boolean) {
        if(value == this._faint) return;
        this._faint = value;
        this._version += 1;
    }

    get italic(): boolean {
        return this._italic;
    }

    set italic(value: boolean) {
        if(value == this._italic) return;
        this._italic = value;
        this._version += 1;
    }

    get underline(): boolean {
        return this._underline;
    }

    set underline(value: boolean) {
        if(value == this._underline) return;
        this._underline = value;
        this._version += 1;
    }

    get slowBlink(): boolean {
        return this._slowBlink;
    }

    set slowBlink(value: boolean) {
        if(value == this._slowBlink) return;
        this._slowBlink = value;
        this._version += 1;
    }

    get rapidBlink(): boolean {
        return this._rapidBlink;
    }

    set rapidBlink(value: boolean) {
        if(value == this._rapidBlink) return;
        this._rapidBlink = value;
        this._version += 1;
    }

    get inverse(): boolean {
        return this._inverse;
    }

    set inverse(value: boolean) {
        if(value == this._inverse) return;
        this._inverse = value;
        this._version += 1;
    }

    get invisible(): boolean {
        return this._invisible;
    }

    set invisible(value: boolean) {
        if(value == this._invisible) return;
        this._invisible = value;
        this._version += 1;
    }

    get crossedOut(): boolean {
        return this._crossedOut;
    }

    set crossedOut(value: boolean) {
        if(value == this._crossedOut) return;
        this._crossedOut = value;
        this._version += 1;
    }

    get colorClass(): string {
        return this._colorClass;
    }

    set colorClass(value: string) {
        if(value == this._colorClass) return;
        this._colorClass = value;
        this._version += 1;
    }

    get backgroundColorClass(): string {
        return this._backgroundColorClass;
    }

    set backgroundColorClass(value: string) {
        if(value == this._backgroundColorClass) return;
        this._backgroundColorClass = value;
        this._version += 1;
    }

    get version(): number {
        return this._version;
    }
}