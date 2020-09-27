"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Styles_1 = require("./Styles");
class Cursor {
    constructor(instanceId) {
        this._show = true;
        this._enable = true;
        this._focus = false;
        this._blinking = true;
        this._cursorShape = "";
        this._value = " ";
        this.defaultValue = true;
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
        this.element.appendChild(this.contentElement);
        this.element.appendChild(this.outlineElement);
    }
    get show() {
        return this._show;
    }
    set show(value) {
        this._show = value;
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
    }
    get blinking() {
        return this._blinking;
    }
    set blinking(value) {
        this._blinking = value;
    }
    get cursorShape() {
        return this._cursorShape;
    }
    set cursorShape(value) {
        this._cursorShape = value;
    }
    get value() {
        return this._value;
    }
    set value(value) {
        if (value.length == 0) {
            value = " ";
            this.defaultValue = true;
        }
        else {
            this.defaultValue = false;
        }
        this._value = value;
    }
}
exports.Cursor = Cursor;
