import {CommonUtils} from "./common/CommonUtils";
import {Styles} from "./Styles";

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

    // 光标元素
    private element = document.createElement("span");
    // 内容的元素
    private contentElement = document.createElement("span");
    // 光标轮廓元素
    private outlineElement = document.createElement("span");

    // 数据更新版本号，默认为0，每次数据更新的时候，都会+1
    private version = 0;

    readonly instanceId: string = "";

    // 额外添加的样式，来源于 DataBlock.getClassName()
    private _extraClass: string = "";

    // 前景色和背景色
    private _color: string = "";
    private _backgroundColor: string = "";

    constructor(instanceId: string) {
        this.element.className = "cursor";
        this.contentElement.className = "content";
        this.outlineElement.className = "outline";

        this.instanceId = instanceId;
        this.element.appendChild(this.contentElement);
        this.element.appendChild(this.outlineElement);

    }

    get show(): boolean {
        return this._show;
    }

    set show(value: boolean) {
        this._show = value;

        // if(value){
        //     CommonUtils.removeClass(this.currentElement, "cursor-hide");
        // } else {
        //     CommonUtils.addClass(this.currentElement, "cursor-hide");
        // }

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
        if(this._color == value){
            return;
        }

        // 光标内容选中颜色
        Styles.add([
            ".cursor.cursor-shape-block.focus::selection",
            ".cursor.cursor-shape-block.focus::-moz-selection",
            ".cursor.cursor-shape-block.focus::-webkit-selection"], {
            "color": value,
            "background-color": this.backgroundColor
        }, this.instanceId);

        // 设置边框色
        Styles.addCursorStyle(".cursor > .outline", {
            "border-color": value + " !important"
        }, this.instanceId);

        // 设置背景色
        Styles.addCursorStyle(".cursor.cursor-shape-block.cursor-focus", {
            "background-color": value + " !important",
            "color": this.backgroundColor + " !important"
        }, this.instanceId);

        this._color = value;

    }

    get backgroundColor(): string {
        return this._backgroundColor;
    }

    set backgroundColor(value: string) {
        if(this._backgroundColor == value){
            return;
        }

        // 光标内容选中颜色
        // Styles.add([
        //     ".cursor > .content::selection",
        //     ".cursor > .content::-moz-selection",
        //     ".cursor > .content::-webkit-selection"], {
        //     "background-color": value,
        // }, this.instanceId);

        this._backgroundColor = value;
    }

    get focus(): boolean {
        return this._focus;
    }

    set focus(value: boolean) {
        this._focus = value;

        // if (value) {
        //     CommonUtils.addClass(this.element, "cursor-focus");
        //     // 当前在页面显示的元素
        //     CommonUtils.addClass(this.currentElement, "cursor-focus");
        //
        //     // 如果存在额外的样式，则将其去掉
        //     if(!!this._extraClass){
        //         CommonUtils.removeClass(this.element, this._extraClass.split(" "));
        //     }
        // } else {
        //     CommonUtils.removeClass(this.element, "cursor-focus");
        //     // 当前在页面显示的元素
        //     CommonUtils.removeClass(this.currentElement, "cursor-focus");
        // }
    }

    get blinking(): boolean {
        return this._blinking;
    }

    set blinking(value: boolean) {
        this._blinking = value;

        // if (value) {
        //     if (this._cursorShape == 'Block') {
        //         CommonUtils.addClass(this.element, "cursor-blink");
        //         // 当前在页面显示的元素
        //         CommonUtils.addClass(this.currentElement, "cursor-blink");
        //     } else {
        //         CommonUtils.addClass(this.outlineElement, "cursor-blink");
        //         // 当前在页面显示的元素
        //         CommonUtils.addClass(this.currentOutlineElement, "cursor-blink");
        //     }
        // } else {
        //     if (this._cursorShape == 'Block') {
        //         CommonUtils.removeClass(this.element, "cursor-blink");
        //         // 当前在页面显示的元素
        //         CommonUtils.removeClass(this.currentElement, "cursor-blink");
        //     } else {
        //         CommonUtils.removeClass(this.outlineElement, "cursor-blink");
        //         // 当前在页面显示的元素
        //         CommonUtils.removeClass(this.currentOutlineElement, "cursor-blink");
        //     }
        // }
    }

    get cursorShape(): string {
        return this._cursorShape;
    }

    // 设置光标的形状
    set cursorShape(value: string) {
        this._cursorShape = value;

        // const currentElement = this.currentElement;
        // if (value == "Block") {
        //
        //     CommonUtils.removeClass(this.element, ["cursor-shape-underline", "cursor-shape-vertical-bar"]);
        //     // 当前在页面显示的元素
        //     CommonUtils.removeClass(currentElement, ["cursor-shape-underline", "cursor-shape-vertical-bar"]);
        //     CommonUtils.addClass(this.element, "cursor-shape-block");
        //     // 当前在页面显示的元素
        //     CommonUtils.addClass(currentElement, "cursor-shape-block");
        //
        //     if (this._blinking) {
        //         CommonUtils.removeClass(this.outlineElement, "cursor-blink");
        //         CommonUtils.removeClass(this.currentOutlineElement, "cursor-blink");
        //         CommonUtils.addClass(this.element, "cursor-blink");
        //         CommonUtils.addClass(currentElement, "cursor-blink");
        //     }
        // } else {
        //     if (this._blinking) {
        //         CommonUtils.removeClass(this.element, "cursor-blink");
        //         CommonUtils.removeClass(currentElement, "cursor-blink");
        //         CommonUtils.addClass(this.outlineElement, "cursor-blink");
        //         CommonUtils.addClass(this.currentOutlineElement, "cursor-blink");
        //     }
        //
        //     if (value == "Underline" || value == "Wide Underline") {
        //         CommonUtils.removeClass(this.element, ["cursor-shape-block", "cursor-shape-vertical-bar"]);
        //         CommonUtils.removeClass(currentElement, ["cursor-shape-block", "cursor-shape-vertical-bar"]);
        //         CommonUtils.addClass(this.element, "cursor-shape-underline");
        //         CommonUtils.addClass(currentElement, "cursor-shape-underline");
        //     } else if (value == "I-Beam" || value == "Wide I-Beam") {
        //         CommonUtils.removeClass(this.element, ["cursor-shape-block", "cursor-shape-underline"]);
        //         CommonUtils.removeClass(currentElement, ["cursor-shape-block", "cursor-shape-underline"]);
        //         CommonUtils.addClass(this.element, "cursor-shape-vertical-bar");
        //         CommonUtils.addClass(currentElement, "cursor-shape-vertical-bar");
        //     }
        // }
        //
        // // 为了马上可以看到效果
        // let cursor = this.currentElement;
        // if (cursor && cursor.parentElement) {
        //     cursor.parentElement.replaceChild(this.element, cursor);
        // }
    }

    get value(): string {
        return this._value;
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

    // set extraClass(value: string) {
    //     // 如果更新额外的样式，需要将原来的删掉，否则会冲突。
    //     if(!!this._extraClass){
    //         CommonUtils.removeClass(this.element, this._extraClass.split(" "));
    //     }
    //     this._extraClass = value;
    // }

    // get id(): string {
    //     return this.instanceId + "-cursor-" + this.version;
    // }

    // get currentElement(): HTMLElement | null {
    //     return document.getElementById(this.id);
    // }
    //
    // get currentOutlineElement(): HTMLElement | null {
    //     const ele = this.currentElement;
    //     if(ele){
    //         return <HTMLElement> ele.lastElementChild;
    //     }
    //     return null;
    // }

    // getElement(){
    //
    //     this.version++;
    //
    //     if(!this.show){
    //         let element = document.createElement("span");
    //         element.id = this.id;
    //         element.appendChild(document.createTextNode(this.value));
    //         element.className = this._extraClass;
    //         return element;
    //     }
    //
    //     this.element.id = this.id;
    //
    //     this.contentElement.appendChild(document.createTextNode(this.value));
    //     CommonUtils.addClass(this.element, this._extraClass);
    //
    //     return this.element;
    // }



    // /**
    //  * 最终生成的html
    //  */
    // get html(): string {
    //
    //     let oldCursor = document.getElementById(this.id);
    //     if (oldCursor) {
    //         // console.info("oldCursor。remove..." + this.id);
    //         // oldCursor.remove();
    //         if(oldCursor.parentElement){
    //             let newNode,
    //                 extraClass = oldCursor.getAttribute("data-extra-class"),
    //                 value = oldCursor.getAttribute("data-value") || "";
    //             if(!!extraClass){
    //                 newNode = document.createElement("span");
    //                 newNode.innerHTML = value;
    //                 newNode.className = extraClass;
    //             } else {
    //                 newNode = document.createTextNode(value);
    //             }
    //
    //             oldCursor.parentElement.replaceChild(newNode, oldCursor);
    //         }
    //     }
    //
    //     this.version++;
    //
    //     if(!this.show){
    //         // let element = document.createElement("span");
    //         // element.id = this.id;
    //         // element.innerHTML = this.value;
    //         // element.className = this._extraClass;
    //         // return element.outerHTML;
    //         return `<span id="${this.id}" class="${this._extraClass}" data-extra-class="${this._extraClass}" data-value="${this.value}">${this.value}</span>`;
    //     }
    //
    //     this.element.id = this.id;
    //
    //     this.contentElement.innerHTML = this.value;
    //     CommonUtils.addClass(this.element, this._extraClass);
    //     this.element.setAttribute("data-extra-class", this._extraClass);
    //     this.element.setAttribute("data-value", this.value);
    //
    //     return this.element.outerHTML;
    // }

}