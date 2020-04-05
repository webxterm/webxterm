"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CommonUtils_1 = require("./common/CommonUtils");
const Styles_1 = require("./Styles");
class Cursor {
    constructor(instanceId) {
        this._show = true;
        this._enable = true;
        this._focus = false;
        this._blinking = true;
        this._cursorShape = "";
        this._value = "";
        this.element = document.createElement("span");
        this.contentElement = document.createElement("span");
        this.outlineElement = document.createElement("span");
        this.version = 0;
        this.instanceId = "";
        this._extraClass = "";
        this._color = "";
        this._backgroundColor = "";
        this.element.className = "cursor";
        this.contentElement.className = "content";
        this.outlineElement.className = "outline";
        this.instanceId = instanceId;
        this.value = "&nbsp;";
        this.element.appendChild(this.contentElement);
        this.element.appendChild(this.outlineElement);
    }
    get show() {
        return this._show;
    }
    set show(value) {
        this._show = value;
        if (value) {
            CommonUtils_1.CommonUtils.removeClass(this.currentElement, "cursor-hide");
        }
        else {
            CommonUtils_1.CommonUtils.addClass(this.currentElement, "cursor-hide");
        }
    }
    get enable() {
        return this._enable;
    }
    set enable(value) {
        this._enable = value;
    }
    get color() {
        return this._color;
    }
    set color(value) {
        if (this._color == value) {
            return;
        }
        Styles_1.Styles.add([
            ".cursor.cursor-shape-block.focus::selection",
            ".cursor.cursor-shape-block.focus::-moz-selection",
            ".cursor.cursor-shape-block.focus::-webkit-selection"
        ], {
            "color": value,
            "background-color": this.backgroundColor
        }, this.instanceId);
        Styles_1.Styles.addCursorStyle(".cursor > .outline", {
            "border-color": value + " !important"
        }, this.instanceId);
        Styles_1.Styles.addCursorStyle(".cursor.cursor-shape-block.cursor-focus", {
            "background-color": value + " !important",
            "color": this.backgroundColor + " !important"
        }, this.instanceId);
        this._color = value;
    }
    get backgroundColor() {
        return this._backgroundColor;
    }
    set backgroundColor(value) {
        if (this._backgroundColor == value) {
            return;
        }
        this._backgroundColor = value;
    }
    get focus() {
        return this._focus;
    }
    set focus(value) {
        this._focus = value;
        if (value) {
            CommonUtils_1.CommonUtils.addClass(this.element, "cursor-focus");
            CommonUtils_1.CommonUtils.addClass(this.currentElement, "cursor-focus");
            if (!!this._extraClass) {
                CommonUtils_1.CommonUtils.removeClass(this.element, this._extraClass.split(" "));
            }
        }
        else {
            CommonUtils_1.CommonUtils.removeClass(this.element, "cursor-focus");
            CommonUtils_1.CommonUtils.removeClass(this.currentElement, "cursor-focus");
        }
    }
    get blinking() {
        return this._blinking;
    }
    set blinking(value) {
        this._blinking = value;
        if (value) {
            if (this._cursorShape == 'Block') {
                CommonUtils_1.CommonUtils.addClass(this.element, "cursor-blink");
                CommonUtils_1.CommonUtils.addClass(this.currentElement, "cursor-blink");
            }
            else {
                CommonUtils_1.CommonUtils.addClass(this.outlineElement, "cursor-blink");
                CommonUtils_1.CommonUtils.addClass(this.currentOutlineElement, "cursor-blink");
            }
        }
        else {
            if (this._cursorShape == 'Block') {
                CommonUtils_1.CommonUtils.removeClass(this.element, "cursor-blink");
                CommonUtils_1.CommonUtils.removeClass(this.currentElement, "cursor-blink");
            }
            else {
                CommonUtils_1.CommonUtils.removeClass(this.outlineElement, "cursor-blink");
                CommonUtils_1.CommonUtils.removeClass(this.currentOutlineElement, "cursor-blink");
            }
        }
    }
    get cursorShape() {
        return this._cursorShape;
    }
    set cursorShape(value) {
        this._cursorShape = value;
        const currentElement = this.currentElement;
        if (value == "Block") {
            CommonUtils_1.CommonUtils.removeClass(this.element, ["cursor-shape-underline", "cursor-shape-vertical-bar"]);
            CommonUtils_1.CommonUtils.removeClass(currentElement, ["cursor-shape-underline", "cursor-shape-vertical-bar"]);
            CommonUtils_1.CommonUtils.addClass(this.element, "cursor-shape-block");
            CommonUtils_1.CommonUtils.addClass(currentElement, "cursor-shape-block");
            if (this._blinking) {
                CommonUtils_1.CommonUtils.removeClass(this.outlineElement, "cursor-blink");
                CommonUtils_1.CommonUtils.removeClass(this.currentOutlineElement, "cursor-blink");
                CommonUtils_1.CommonUtils.addClass(this.element, "cursor-blink");
                CommonUtils_1.CommonUtils.addClass(currentElement, "cursor-blink");
            }
        }
        else {
            if (this._blinking) {
                CommonUtils_1.CommonUtils.removeClass(this.element, "cursor-blink");
                CommonUtils_1.CommonUtils.removeClass(currentElement, "cursor-blink");
                CommonUtils_1.CommonUtils.addClass(this.outlineElement, "cursor-blink");
                CommonUtils_1.CommonUtils.addClass(this.currentOutlineElement, "cursor-blink");
            }
            if (value == "Underline" || value == "Wide Underline") {
                CommonUtils_1.CommonUtils.removeClass(this.element, ["cursor-shape-block", "cursor-shape-vertical-bar"]);
                CommonUtils_1.CommonUtils.removeClass(currentElement, ["cursor-shape-block", "cursor-shape-vertical-bar"]);
                CommonUtils_1.CommonUtils.addClass(this.element, "cursor-shape-underline");
                CommonUtils_1.CommonUtils.addClass(currentElement, "cursor-shape-underline");
            }
            else if (value == "I-Beam" || value == "Wide I-Beam") {
                CommonUtils_1.CommonUtils.removeClass(this.element, ["cursor-shape-block", "cursor-shape-underline"]);
                CommonUtils_1.CommonUtils.removeClass(currentElement, ["cursor-shape-block", "cursor-shape-underline"]);
                CommonUtils_1.CommonUtils.addClass(this.element, "cursor-shape-vertical-bar");
                CommonUtils_1.CommonUtils.addClass(currentElement, "cursor-shape-vertical-bar");
            }
        }
        let cursor = this.currentElement;
        if (cursor && cursor.parentElement) {
            cursor.parentElement.replaceChild(this.element, cursor);
        }
    }
    get value() {
        return this._value;
    }
    set value(value) {
        if (value.length == 0) {
            value = "&nbsp;";
        }
        this._value = value;
    }
    set extraClass(value) {
        if (!!this._extraClass) {
            CommonUtils_1.CommonUtils.removeClass(this.element, this._extraClass.split(" "));
        }
        this._extraClass = value;
    }
    get id() {
        return this.instanceId + "-cursor-" + this.version;
    }
    get currentElement() {
        return document.getElementById(this.id);
    }
    get currentOutlineElement() {
        const ele = this.currentElement;
        if (ele) {
            return ele.lastElementChild;
        }
        return null;
    }
    getElement() {
        this.version++;
        if (!this.show) {
            let element = document.createElement("span");
            element.id = this.id;
            element.appendChild(document.createTextNode(this.value));
            element.className = this._extraClass;
            return element;
        }
        this.element.id = this.id;
        this.contentElement.appendChild(document.createTextNode(this.value));
        CommonUtils_1.CommonUtils.addClass(this.element, this._extraClass);
        return this.element;
    }
    get html() {
        this.version++;
        if (!this.show) {
            return `<span id="${this.id}" class="${this._extraClass}">${this.value}</span>`;
        }
        this.element.id = this.id;
        this.contentElement.innerHTML = this.value;
        CommonUtils_1.CommonUtils.addClass(this.element, this._extraClass);
        return this.element.outerHTML;
    }
}
exports.Cursor = Cursor;
