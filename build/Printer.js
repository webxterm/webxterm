"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Printer {
    constructor(terminal) {
        this.terminal = terminal;
        this.parser = this.terminal.parser;
    }
    get activeBuffer() {
        return this.parser.bufferSet.activeBuffer;
    }
    get cursorLine() {
        return this.activeBuffer.get(this.parser.y);
    }
    printBuffer() {
        const len = this.activeBuffer.size;
        for (let y = 1; y <= len; y++) {
            const line = this.activeBuffer.get(y);
            this.printLine(line, true);
        }
    }
    printLine(line, displayCursor = false) {
        if (!line.dirty) {
            return;
        }
        if (line !== this.cursorLine) {
            line.dirty = false;
        }
        let element;
        let leftClassName = "";
        let strings = [];
        for (let x = 1; x <= line.blocks.length; x++) {
            let block = line.get(x);
            if (block.empty) {
                continue;
            }
            let value = block.data, className = block.getClassName();
            switch (value) {
                case ' ':
                    value = '&nbsp;';
                    break;
                case '>':
                    value = '&gt;';
                    break;
                case '<':
                    value = '&lt;';
                    break;
            }
            if (displayCursor
                && this.parser.x === x
                && line === this.cursorLine) {
                if (!!leftClassName && element) {
                    strings.push(element.outerHTML);
                    element = undefined;
                    leftClassName = "";
                }
                this.terminal.cursor.value = value;
                const pref = this.terminal.preferences;
                const attr = this.terminal.esParser.attribute;
                if (!!block.attribute.backgroundColorClass || !!attr.backgroundColorClass) {
                    this.terminal.cursor.backgroundColor = pref.getColor(block.attribute.backgroundColorClass || attr.backgroundColorClass);
                }
                else {
                    this.terminal.cursor.backgroundColor = pref.defaultCursorColor ? pref.backgroundColor : pref.cursorBackgroundColor;
                }
                if (!!block.attribute.colorClass || !!attr.colorClass) {
                    this.terminal.cursor.color = pref.getColor(block.attribute.colorClass || attr.colorClass);
                }
                else {
                    this.terminal.cursor.color = pref.defaultCursorColor ? pref.color : pref.cursorColor;
                }
                this.terminal.cursor.extraClass = className;
                strings.push(this.terminal.cursor.html);
                continue;
            }
            if (!!className) {
                if (!element) {
                    element = document.createElement("span");
                    element.className = className;
                }
                if (block.attribute.len2) {
                    if (!!leftClassName)
                        strings.push(element.outerHTML);
                    element.className = className;
                    element.innerHTML = value;
                }
                else {
                    if (!!leftClassName && leftClassName !== className) {
                        strings.push(element.outerHTML);
                        element.className = className;
                    }
                    if (leftClassName === className) {
                        element.innerHTML = element.innerHTML + value;
                    }
                    else {
                        element.innerHTML = value;
                    }
                }
            }
            else {
                if (!!leftClassName && element) {
                    strings.push(element.outerHTML);
                    element = undefined;
                }
                strings.push(value);
            }
            leftClassName = className;
        }
        if (!!leftClassName && element) {
            strings.push(element.outerHTML);
        }
        line.element.innerHTML = strings.join("");
    }
}
exports.Printer = Printer;
