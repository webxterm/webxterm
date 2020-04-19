/**
 * 数据块的属性
 */

const classNames = [
    "crossed-out",
    "invisible",
    "inverse",
    "rapid-blink",
    "slow-blink",
    "underline",
    "faint",
    "bold"
];

export class DataBlockAttribute {

    // 是否为\t
    // private _tab: boolean = false;

    // 是否为双字节字符，/[\u4E00-\u9FA5]|[\uFE30-\uFFA0]/gi.test(chr)
    // only 0 or 1
    // len2: number = 0;

    // 加粗
    // only 0 or 1
    bold: number = 0;

    // 强度降低
    // only 0 or 1
    faint: number = 0;

    // 斜体
    // only 0 or 1
    italic: number = 0;

    // 下划线
    // only 0 or 1
    underline: number = 0;

    // Slow Blink, less than 150 per minute
    // only 0 or 1
    slowBlink: number = 0;

    // MS-DOS ANSI.SYS; 150+ per minute; not widely supported
    // only 0 or 1
    rapidBlink: number = 0;

    // 反转 reverse video, swap foreground and background colors
    // only 0 or 1
    inverse: number = 0;

    // 隐藏
    // only 0 or 1
    invisible: number = 0;

    // 删除线
    // only 0 or 1
    crossedOut: number = 0;

    // 颜色class
    colorClass: string = "";

    // 背景颜色class
    backgroundColorClass: string = "";

    /**
     * 转为16进制
     */
    get hex(): string {
        let n = parseInt(`${this.bold}${this.faint}${this.underline}${this.slowBlink}${this.rapidBlink}${this.inverse}${this.invisible}${this.crossedOut}`);
        if(n == 0 && this.colorClass == "" && this.backgroundColorClass == ""){
            return "";
        }
        return n.toString(16) + ";" + this.colorClass + ";" + this.backgroundColorClass;
    }


    /**
     * 解析样式类名称
     * @param value 16进制数据;颜色;背景颜色
     * @return [classNames, color, backgroundColor]
     */
    static parseClassName(value: string): string[]{

        if(value == "") return ["", "", ""];

        let result = value.split(";");
        const hexVal = result.splice(0, 1)[0];
        let attrs = [];
        attrs.push(result[0]);
        attrs.push(result[1]);

        if(hexVal !== "0"){
            const tmpVal = (parseInt(hexVal, 16) + "").split("").reverse();
            // 1000000
            for(let i = 0, len = tmpVal.length; i < len; i++){
                if(tmpVal[i] === "1"){
                    attrs.push(classNames[i]);
                }
            }
        }

        result.splice(0, 0, attrs.join(" ").trim());

        return result;
    }

    // get tab(): boolean {
    //     return this._tab;
    // }
    //
    // set tab(value: boolean) {
    //     this._tab = value;
    // }
    // 版本号
    // private _version: number = 0;
    //
    // get len2(): boolean {
    //     return this._len2 === 0;
    // }
    //
    // set len2(value: boolean) {
    //     if(value == this._len2) return;
    //     this._len2 = value;
    //     this._version += 1;
    // }
    //
    // get bold(): boolean {
    //     return this._bold === 0;
    // }
    //
    // set bold(value: boolean) {
    //     if(value == this._bold) return;
    //     this._bold = value;
    //     this._version += 1;
    // }
    //
    // get faint(): boolean {
    //     return this._faint === 0;
    // }
    //
    // set faint(value: boolean) {
    //     if(value == this._faint) return;
    //     this._faint = value;
    //     this._version += 1;
    // }
    //
    // get italic(): boolean {
    //     return this._italic === 0;
    // }
    //
    // set italic(value: boolean) {
    //     if(value == this._italic) return;
    //     this._italic = value;
    //     this._version += 1;
    // }
    //
    // get underline(): boolean {
    //     return this._underline === 0;
    // }
    //
    // set underline(value: boolean) {
    //     if(value == this._underline) return;
    //     this._underline = value;
    //     this._version += 1;
    // }
    //
    // get slowBlink(): boolean {
    //     return this._slowBlink === 0;
    // }
    //
    // set slowBlink(value: boolean) {
    //     if(value == this._slowBlink) return;
    //     this._slowBlink = value;
    //     this._version += 1;
    // }
    //
    // get rapidBlink(): boolean {
    //     return this._rapidBlink;
    // }
    //
    // set rapidBlink(value: boolean) {
    //     if(value == this._rapidBlink) return;
    //     this._rapidBlink = value;
    //     this._version += 1;
    // }
    //
    // get inverse(): boolean {
    //     return this._inverse;
    // }
    //
    // set inverse(value: boolean) {
    //     if(value == this._inverse) return;
    //     this._inverse = value;
    //     this._version += 1;
    // }
    //
    // get invisible(): boolean {
    //     return this._invisible;
    // }
    //
    // set invisible(value: boolean) {
    //     if(value == this._invisible) return;
    //     this._invisible = value;
    //     this._version += 1;
    // }
    //
    // get crossedOut(): boolean {
    //     return this._crossedOut;
    // }
    //
    // set crossedOut(value: boolean) {
    //     if(value == this._crossedOut) return;
    //     this._crossedOut = value;
    //     this._version += 1;
    // }
    //
    // get colorClass(): string {
    //     return this._colorClass;
    // }
    //
    // set colorClass(value: string) {
    //     if(value == this._colorClass) return;
    //     this._colorClass = value;
    //     this._version += 1;
    // }
    //
    // get backgroundColorClass(): string {
    //     return this._backgroundColorClass;
    // }
    //
    // set backgroundColorClass(value: string) {
    //     if(value == this._backgroundColorClass) return;
    //     this._backgroundColorClass = value;
    //     this._version += 1;
    // }
    //
    // get version(): number {
    //     return this._version;
    // }
}