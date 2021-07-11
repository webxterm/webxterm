/**
 * 终端光标
 */
export class Cursor {

    // 是否显示
    private _show: boolean = true;

    // 启用
    private _enable: boolean = true;

    // 是否获取焦点
    private _focus: boolean = false;

    // 是否闪烁
    private _blinking: boolean = true;

    // 光标的形状
    private _cursorShape: string = "";

    // 光标的内容
    private _value: string = " ";

    // 是否为默认值
    private defaultValue: boolean = true;

    readonly instanceId: string = "";

    // 额外添加的样式，来源于 DataBlock.getClassName()
    private _extraClass: string = "";

    // 前景色和背景色
    private _color: string = "";
    private _backgroundColor: string = "";

    constructor(instanceId: string) {
        this.instanceId = instanceId;
    }

    get show(): boolean {
        return this._show;
    }

    set show(value: boolean) {
        this._show = value;
    }

    get enable(): boolean {
        return this._enable;
    }

    set enable(value: boolean) {
        this._enable = value;
    }


    get color(): string {
        return this._color;
    }

    set color(value: string) {
        if (this._color == value) {
            return;
        }

        this._color = value;

    }

    get backgroundColor(): string {
        return this._backgroundColor;
    }

    set backgroundColor(value: string) {
        if (this._backgroundColor == value) {
            return;
        }

        this._backgroundColor = value;
    }

    get focus(): boolean {
        return this._focus;
    }

    set focus(value: boolean) {
        this._focus = value;
    }

    get blinking(): boolean {
        return this._blinking;
    }

    set blinking(value: boolean) {
        this._blinking = value;
    }

    get cursorShape(): string {
        return this._cursorShape;
    }

    // 设置光标的形状
    set cursorShape(value: string) {
        this._cursorShape = value;
    }

    set value(value: string) {
        if (value.length == 0) {
            value = " ";
            this.defaultValue = true;
        } else {
            this.defaultValue = false;
        }
        this._value = value;
    }

}