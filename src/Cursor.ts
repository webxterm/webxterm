import {CommonUtils} from "./common/CommonUtils";

/**
 * 终端光标
 */
export class Cursor {

    // 是否显示
    private _show: boolean = true;

    // 禁用
    private _enable: boolean = false;

    // 是否获取焦点
    private _focus: boolean = false;

    // 是否闪烁
    private _blinking: boolean = false;

    // 光标的形状
    private _cursorShape: string = "";

    // 光标的内容
    private _value: string = "";

    // 光标元素
    private element = document.createElement("span");
    // 内容的元素
    private contentElement = document.createElement("span");
    // 光标轮廓元素
    private outlineElement = document.createElement("span");

    // 数据更新版本号，默认为0，每次数据更新的时候，都会+1
    private version = 0;

    private _instanceId: string = "";

    // 额外添加的样式，来源于 DataBlock.getClassName()
    // 当show = false的时候有效！！
    private _extraClass: string = "";

    constructor(instanceId: string) {
        this.element.className = "cursor";
        this.contentElement.className = "content";
        this.outlineElement.className = "outline";

        this._instanceId = instanceId;
        this.value = "&nbsp;";
        this.element.appendChild(this.contentElement);
        this.element.appendChild(this.outlineElement);
    }

    get show(): boolean {
        return this._show;
    }

    set show(value: boolean) {
        this._show = value;

        if (value) {
            CommonUtils.removeClass(this.element, "cursor-hide");
            CommonUtils.removeClass(this.currentElement, "cursor-hide");
        } else {
            CommonUtils.addClass(this.element, "cursor-hide");
            CommonUtils.addClass(this.currentElement, "cursor-hide");
        }

    }

    get enable(): boolean {
        return this._enable;
    }

    set enable(value: boolean) {
        this._enable = value;
    }

    get focus(): boolean {
        return this._focus;
    }

    set focus(value: boolean) {
        this._focus = value;

        if (value) {
            CommonUtils.addClass(this.element, "cursor-focus");
            // 当前在页面显示的元素
            CommonUtils.addClass(this.currentElement, "cursor-focus");

            // 如果存在额外的样式，则将其去掉
            if(!!this._extraClass){
                CommonUtils.removeClass(this.element, this._extraClass.split(" "));
            }
        } else {
            CommonUtils.removeClass(this.element, "cursor-focus");
            // 当前在页面显示的元素
            CommonUtils.removeClass(this.currentElement, "cursor-focus");
        }
    }

    get blinking(): boolean {
        return this._blinking;
    }

    set blinking(value: boolean) {
        this._blinking = value;

        if (value) {
            if (this._cursorShape === 'Block') {
                CommonUtils.addClass(this.element, "cursor-blink");
                // 当前在页面显示的元素
                CommonUtils.addClass(this.currentElement, "cursor-blink");
            } else {
                CommonUtils.addClass(this.outlineElement, "cursor-blink");
                // 当前在页面显示的元素
                CommonUtils.addClass(this.currentOutlineElement, "cursor-blink");
            }
        } else {
            if (this._cursorShape === 'Block') {
                CommonUtils.removeClass(this.element, "cursor-blink");
                // 当前在页面显示的元素
                CommonUtils.removeClass(this.currentElement, "cursor-blink");
            } else {
                CommonUtils.removeClass(this.outlineElement, "cursor-blink");
                // 当前在页面显示的元素
                CommonUtils.removeClass(this.currentOutlineElement, "cursor-blink");
            }
        }
    }

    get cursorShape(): string {
        return this._cursorShape;
    }

    // 设置光标的形状
    set cursorShape(value: string) {
        this._cursorShape = value;

        const currentElement = this.currentElement;
        if (value === "Block") {

            CommonUtils.removeClass(this.element, ["cursor-shape-underline", "cursor-shape-vertical-bar"]);
            // 当前在页面显示的元素
            CommonUtils.removeClass(currentElement, ["cursor-shape-underline", "cursor-shape-vertical-bar"]);
            CommonUtils.addClass(this.element, "cursor-shape-block");
            // 当前在页面显示的元素
            CommonUtils.addClass(currentElement, "cursor-shape-block");

            if (this._blinking) {
                CommonUtils.removeClass(this.outlineElement, "cursor-blink");
                CommonUtils.removeClass(this.currentOutlineElement, "cursor-blink");
                CommonUtils.addClass(this.element, "cursor-blink");
                CommonUtils.addClass(currentElement, "cursor-blink");
            }
        } else {
            if (this._blinking) {
                CommonUtils.removeClass(this.element, "cursor-blink");
                CommonUtils.removeClass(currentElement, "cursor-blink");
                CommonUtils.addClass(this.outlineElement, "cursor-blink");
                CommonUtils.addClass(this.currentOutlineElement, "cursor-blink");
            }

            if (value === "Underline" || value === "Wide Underline") {
                CommonUtils.removeClass(this.element, ["cursor-shape-block", "cursor-shape-vertical-bar"]);
                CommonUtils.removeClass(currentElement, ["cursor-shape-block", "cursor-shape-vertical-bar"]);
                CommonUtils.addClass(this.element, "cursor-shape-underline");
                CommonUtils.addClass(currentElement, "cursor-shape-underline");
            } else if (value === "I-Beam" || value === "Wide I-Beam") {
                CommonUtils.removeClass(this.element, ["cursor-shape-block", "cursor-shape-underline"]);
                CommonUtils.removeClass(currentElement, ["cursor-shape-block", "cursor-shape-underline"]);
                CommonUtils.addClass(this.element, "cursor-shape-vertical-bar");
                CommonUtils.addClass(currentElement, "cursor-shape-vertical-bar");
            }
        }

        // 为了马上可以看到效果
        let cursor = this.currentElement;
        if (cursor && cursor.parentElement) {
            cursor.parentElement.replaceChild(this.element, cursor);
        }
    }

    get value(): string {
        return this._value;
    }

    set value(value: string) {
        this._value = value;
        if (value.length === 0) {
            value = "&nbsp;";
        }
        this.contentElement.innerHTML = value;

    }

    set extraClass(value: string) {
        // 如果更新额外的样式，需要将原来的删掉，否则会冲突。
        if(!!this._extraClass){
            CommonUtils.removeClass(this.element, this._extraClass.split(" "));
        }
        this._extraClass = value;
    }

    get instanceId() {
        return this._instanceId;
    }

    set instanceId(value) {
        this._instanceId = value;
    }

    get id(): string {
        return this.instanceId + "-cursor-" + this.version;
    }

    get currentElement(): HTMLElement | null {
        return document.getElementById(this.id);
    }

    get currentOutlineElement(): HTMLElement | null {
        const ele = this.currentElement;
        if(ele){
            return <HTMLElement> ele.lastElementChild;
        }
        return null;
    }

    /**
     * 最终生成的html
     */
    get html(): string {

        // let oldCursor = document.getElementById(this.id);
        // if (oldCursor) {
        //     console.info("oldCursor。remove..." + this.id);
        //     oldCursor.remove();
        // }

        this.version++;
        this.element.id = this.id;

        if(!this.show){
            CommonUtils.addClass(this.element, this._extraClass);
        }

        return this.element.outerHTML;
    }
}