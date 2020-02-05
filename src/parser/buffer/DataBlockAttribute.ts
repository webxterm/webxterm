
export class DataBlockAttribute {

    // 是否为\t
    private isTab: boolean = false;

    // 是否为双字节字符，/[\u4E00-\u9FA5]|[\uFE30-\uFFA0]/gi.test(chr)
    private isLen2: boolean = false;

    // 加粗
    private isBold: boolean = false;

    // 强度降低
    private isFaint: boolean = false;

    // 斜体
    private isItalic: boolean = false;

    // 下划线
    private isUnderline: boolean = false;

    // Slow Blink, less than 150 per minute
    private isSlowBlink: boolean = false;

    // MS-DOS ANSI.SYS; 150+ per minute; not widely supported
    private isRapidBlink: boolean = false;

    // 反转 reverse video, swap foreground and background colors
    private isInverse: boolean = false;

    // 隐藏
    private isInvisible: boolean = false;

    // 删除线
    private isCrossedOut: boolean = false;

    // 颜色class
    private colorClass: string = "";

    // 背景颜色class
    private backgroundColorClass: string = "";


    get tab(): boolean {
        return this.isTab;
    }

    set tab(value: boolean) {
        this.isTab = value;
    }

    get len2(): boolean {
        return this.isLen2;
    }

    set len2(value: boolean) {
        this.isLen2 = value;
    }

    get bold(): boolean {
        return this.isBold;
    }

    set bold(value: boolean) {
        this.isBold = value;
    }

    get faint(): boolean {
        return this.isFaint;
    }

    set faint(value: boolean) {
        this.isFaint = value;
    }

    get italic(): boolean {
        return this.isItalic;
    }

    set italic(value: boolean) {
        this.isItalic = value;
    }

    get underline(): boolean {
        return this.isUnderline;
    }

    set underline(value: boolean) {
        this.isUnderline = value;
    }

    get slowBlink(): boolean {
        return this.isSlowBlink;
    }

    set slowBlink(value: boolean) {
        this.isSlowBlink = value;
    }

    get rapidBlink(): boolean {
        return this.isRapidBlink;
    }

    set rapidBlink(value: boolean) {
        this.isRapidBlink = value;
    }

    get inverse(): boolean {
        return this.isInverse;
    }

    set inverse(value: boolean) {
        this.isInverse = value;
    }

    get invisible(): boolean {
        return this.isInvisible;
    }

    set invisible(value: boolean) {
        this.isInvisible = value;
    }

    get crossedOut(): boolean {
        return this.isCrossedOut;
    }

    set crossedOut(value: boolean) {
        this.isCrossedOut = value;
    }

    get color(): string {
        return this.colorClass;
    }

    set color(value: string) {
        this.colorClass = value;
    }

    get backgroundColor(): string {
        return this.backgroundColorClass;
    }

    set backgroundColor(value: string) {
        this.backgroundColorClass = value;
    }
}