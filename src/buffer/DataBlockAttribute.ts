/**
 * 数据块的属性
 */
export const ATTR_MODE_NONE         = 0,
            ATTR_MODE_BOLD          = 1,
            ATTR_MODE_INVERSE       = 2,
            ATTR_MODE_ITALIC        = 4,
            ATTR_MODE_FAINT         = 8,
            ATTR_MODE_UNDERLINE     = 16,
            ATTR_MODE_SLOW_BLINK    = 32,
            // ATTR_MODE_RAPID_BLINK   = 64,
            ATTR_MODE_INVISIBLE     = 64;
            // ATTR_MODE_CROSSED_OUT   = 256;

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
    // 无需支持
    // rapidBlink: number = 0;

    // 反转 reverse video, swap foreground and background colors
    // only 0 or 1
    inverse: number = 0;

    // 隐藏
    // only 0 or 1
    invisible: number = 0;

    // 删除线
    // only 0 or 1
    // 无需支持
    // crossedOut: number = 0 ;

    // 颜色class
    colorClass: string = "";

    // 背景颜色class
    backgroundColorClass: string = "";

    /**
     * 获取总和
     */
    get sum(): number{
        return this.bold
            + this.inverse
            + this.italic
            + this.faint
            + this.underline
            + this.slowBlink
            // + this.rapidBlink
            + this.invisible;
            // + this.crossedOut;
    }

    reset(){
        if(this.bold != 0) this.bold = 0;
        if(this.inverse != 0) this.inverse = 0;
        if(this.italic != 0) this.italic = 0;
        if(this.faint != 0) this.faint = 0;
        if(this.underline != 0) this.underline = 0;
        if(this.slowBlink != 0) this.slowBlink = 0;
        // if(this.rapidBlink != 0) this.rapidBlink = 0;
        if(this.invisible != 0) this.invisible = 0;
        // if(this.crossedOut != 0) this.crossedOut = 0;

        if(this.colorClass != "") this.colorClass = "";
        if(this.backgroundColorClass != "") this.backgroundColorClass = "";
    }



    /**
     * 转为16进制
     */
    // get hex(): string {
    //
    //     // 全部是false;
    //     if(this.bold == 0
    //         && this.faint == 0
    //         && this.underline == 0
    //         && this.slowBlink == 0
    //         && this.rapidBlink == 0
    //         && this.inverse == 0
    //         && this.invisible == 0
    //         && this.crossedOut){
    //         return "";
    //     }
    //
    //     // 将二进制转为十进制
    //     const binary = parseInt("" +
    //         this.bold +
    //         this.faint +
    //         this.underline +
    //         this.slowBlink +
    //         this.rapidBlink +
    //         this.inverse +
    //         this.invisible +
    //         this.crossedOut, 2);
    //
    //     if(binary == 0 && this.colorClass == "" && this.backgroundColorClass == ""){
    //         return "";
    //     }
    //
    //     // 将十进制数转为十六进制数
    //     let result = binary != 0 ? binary.toString(16) : "";
    //     if(!!this.colorClass){
    //         result += ";" + this.colorClass;
    //     }
    //     if(!!this.backgroundColorClass){
    //         if(this.colorClass.length == 0){
    //             result += ";";
    //         }
    //         result += ";" + this.backgroundColorClass;
    //     }
    //
    //     // 情况1：;red
    //     // 情况2：ee;red
    //     // 情况3：ee;;red
    //     // 情况4：;white;red
    //
    //     return result;
    // }
    //
    //
    // /**
    //  * 解析样式类名称
    //  * @param value 16进制数据;颜色;背景颜色
    //  * @return [classNames, color, backgroundColor]
    //  */
    // static parseClassName(value: string): string[]{
    //
    //     if(value == "") return ["", "", ""];
    //
    //     let result = value.split(";");
    //     const hexVal = result[0] || "";
    //
    //     let attrs = "";
    //     if(!result[1]) result[1] = "";
    //     if(!result[2]) result[2] = "";
    //
    //     if(hexVal.length > 0){
    //         // 十六进制转10进制 -> 10进制转2进制
    //         const tmpVal = parseInt(hexVal, 16).toString(2);
    //         // 1 => 00000001  => 8 - 1 = 7
    //         // 1001 => 00001001 => 8 - 4 = 4
    //         const n1 = tmpVal.length;
    //         const n2 = classNames.length - n1;
    //         for(let i = n1 - 1; 0 <= i; i--){
    //             if(tmpVal.charAt(i) == "1"){
    //                 attrs += classNames[i + n2];
    //             }
    //             if(i != 0){
    //                 attrs += " ";
    //             }
    //         }
    //     }
    //
    //     result[0] = attrs;
    //
    //     return result;
    // }

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