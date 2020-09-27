"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Keyboard_1 = require("./Keyboard");
const LineBuffer_1 = require("../buffer/LineBuffer");
const DataBlockAttribute_1 = require("../buffer/DataBlockAttribute");
const symbols = [];
for (let i = 32, chr; i < 127; i++) {
    chr = String.fromCharCode(i);
    if (48 <= i && i <= 57) {
        continue;
    }
    else if ((65 <= i && i <= 90) || (97 <= i && i <= 122)) {
        continue;
    }
    symbols.push(chr);
}
class InputEvent {
    constructor(target, terminal) {
        this.keyboard = new Keyboard_1.Keyboard();
        this.target = target;
        this.terminal = terminal;
        this.composing = terminal.composing;
        this.processComposing = terminal.processComposing;
        this.processComposing.isProcess = true;
        console.info(this.target);
        this.composing.isPC = window.orientation == undefined;
        this.init();
    }
    initCompositionEvents() {
        this.target.addEventListener("compositionstart", (e) => {
            console.info("compositionstart。。。", e);
            if (e instanceof CompositionEvent) {
                this.processComposing.reset();
                this.composing.reset();
                this.composing.events = true;
                this.composing.update = e.data;
                this.composing.running = true;
                this.composing.state = 1;
                console.info(JSON.stringify(this.composing));
                this.write_change_buffer(this.composing);
            }
        });
        this.target.addEventListener("compositionupdate", (e) => {
            console.info("compositionupdate。。。", e);
            if (e instanceof CompositionEvent) {
                this.composing.update = e.data;
                this.composing.state = 2;
                console.info(JSON.stringify(this.composing));
                console.info("this.terminal.bufferSet.activeBuffer.x:" + this.terminal.bufferSet.activeBuffer.x);
                this.write_change_buffer(this.composing);
            }
        });
        this.target.addEventListener("compositionend", (e) => {
            if (e instanceof CompositionEvent) {
                this.composing.update = "";
                this.composing.done = true;
                this.composing.running = false;
                this.composing.end = e.data;
                this.composing.state = 3;
                console.info(e);
                this.write_change_buffer(this.composing);
                console.info(JSON.stringify(this.composing));
                this.sendMessage(e.data);
                this.composing.reset();
            }
        });
        return this;
    }
    initKeydownEvent() {
        this.target.addEventListener("keydown", (e) => {
            console.info("this.target:" + this.target.value);
            if (!this.isPreventDefault(e)) {
                return;
            }
            console.info(e);
            e.preventDefault();
            e.stopPropagation();
            const key = e.key, isProcess = (e.which === 229 || e.keyCode == 229);
            if (this.composing.isPC) {
                if (this.composing.running) {
                    return;
                }
                if (e['keyIdentifier'] == undefined) {
                    if (isProcess)
                        return;
                }
                else {
                    this.composing.isSafari = true;
                }
            }
            let keySym = this.keyboard.getKeySym(e, this.terminal.esParser.applicationCursorKeys, this.terminal.parser.applicationKeypad);
            if (!this.composing.isPC) {
                if (!this.composing.running) {
                    if ((key.codePointAt(0) || 0x0) > 0xFFFF || /[\u3000-\u303F]/gi.test(key)) {
                        if (this.processComposing.running) {
                            this.processComposing.reset();
                        }
                        this.target.value = "";
                    }
                    else if (e.code == 'Space') {
                        if (this.processComposing.running) {
                            this.sendMessage(this.processComposing.update);
                            this.processComposing.reset();
                        }
                        this.target.value = "";
                    }
                    else if (isProcess) {
                        switch (this.processComposing.state) {
                            case 0:
                                this.processComposing.running = true;
                                this.processComposing.events = false;
                                this.processComposing.update = keySym;
                                this.processComposing.state = 1;
                                break;
                            case 1:
                                this.processComposing.update = this.processComposing.update + keySym;
                                this.processComposing.state = 2;
                                break;
                            case 2:
                                this.processComposing.update = this.processComposing.update + keySym;
                                console.info(JSON.stringify(this.processComposing));
                                break;
                            case 3:
                                this.processComposing.done = true;
                                this.processComposing.running = false;
                                this.processComposing.update = "";
                                this.processComposing.end = e.key;
                                this.sendMessage(e.key);
                                this.processComposing.reset();
                                return;
                            default:
                                break;
                        }
                        this.write_change_buffer(this.composing);
                        console.info(JSON.stringify(this.processComposing));
                        return;
                    }
                    else if (e.code == 'Backspace') {
                        if (this.processComposing.running) {
                            this.processComposing.reset();
                            this.processComposing.state = 3;
                            this.processComposing.isProcess = true;
                            this.write_change_buffer(this.composing);
                            return;
                        }
                        console.info(JSON.stringify(this.processComposing));
                    }
                    else if (e.code == 'Enter') {
                        if (this.processComposing.running) {
                            this.sendMessage(this.processComposing.update + keySym);
                            this.processComposing.reset();
                            return;
                        }
                        this.target.value = "";
                        console.info(JSON.stringify(this.processComposing));
                    }
                }
                else {
                    this.processComposing.reset();
                    return;
                }
            }
            this.sendMessage(keySym);
        });
        return this;
    }
    isPreventDefault(e) {
        if (this.composing.running) {
            return false;
        }
        if (e.metaKey) {
            let key = e.key.toLowerCase();
            if (key === "meta") {
                return false;
            }
            if ("cv".indexOf(key) !== -1) {
                return false;
            }
            else if ('a' === key) {
                if (this.terminal.selectionRenderer)
                    this.terminal.selectionRenderer.selectAll(this.terminal.selection);
                return false;
            }
        }
        return true;
    }
    init() {
        this.target.addEventListener("input", (e) => {
            const inputType = e['inputType'];
            if (inputType == "insertCompositionText" || inputType == "insertFromComposition") {
                console.info(e['data']);
                return;
            }
            else if (inputType == "insertText") {
                const data = e['data'];
                this.sendMessage(data);
            }
            console.info(e);
            console.info(this.target.value);
        });
    }
    bindMobileSafariEvents() {
    }
    bindSafariEvents() {
    }
    bindFirefox() {
    }
    sendMessage(data) {
        if (data.length > 0) {
            let presentation = JSON.stringify({
                cmd: data
            });
            console.info("发送的内容：" + presentation);
            this.terminal.transceiver.send(presentation);
        }
    }
    write_change_buffer(composing) {
        let data;
        if (composing.done) {
            this.terminal.cursor.show = true;
            data = composing.end;
        }
        else {
            if (this.terminal.cursor.show)
                this.terminal.cursor.show = false;
            data = composing.update;
        }
        const display_buffer = this.get_composing_display_buffer(data);
        if (this.terminal.textRenderer)
            this.terminal.textRenderer.flushLines(display_buffer, false);
    }
    get_composing_display_buffer(data) {
        let display_buffer = new LineBuffer_1.LineBuffer(0);
        let change_buffer = this.terminal.bufferSet.activeBuffer.change_buffer;
        for (let y = 0; y < this.terminal.rows; y++) {
            display_buffer.copyLineFrom(change_buffer, y);
        }
        if (data.length == 0) {
            return display_buffer;
        }
        const text = Array.from(data), len = text.length;
        let y = this.terminal.parser.y, x = this.terminal.parser.x, self = this;
        const attr = new DataBlockAttribute_1.DataBlockAttribute();
        attr.underline = DataBlockAttribute_1.ATTR_MODE_UNDERLINE;
        function update(s, charWidth = 1) {
            if (x > self.terminal.columns) {
                if (y == self.terminal.bufferSet.activeBuffer.scrollBottom) {
                    display_buffer.removeLine(0, 1);
                    display_buffer.appendLine(self.terminal.columns, 1);
                }
                else {
                    y++;
                }
                x = 1;
            }
            display_buffer.replace(y - 1, x - 1, charWidth, attr, s);
            if (charWidth > 1) {
                display_buffer.replace(y - 1, x, 1, attr, "");
            }
            x += charWidth;
        }
        for (let i = 0, s; i < len; i++) {
            s = text[i];
            const asciiStandardCode = s.codePointAt(0);
            if (asciiStandardCode && 32 <= asciiStandardCode && asciiStandardCode < 127) {
                if (s.codePointAt(1) == undefined) {
                    update(s, 1);
                }
            }
            else if (/[\u4E00-\u9FA5]|[\uFE30-\uFFA0]|[\u3000-\u303F]|[\u2E80-\u2EFF]/gi.test(s)) {
                update(s, 2);
            }
        }
        if (this.terminal.cursorRenderer) {
            this.terminal.cursorRenderer.clearCursor();
            this.terminal.cursorRenderer.drawComposingCursor(x, y);
        }
        console.info(display_buffer);
        return display_buffer;
    }
}
exports.InputEvent = InputEvent;
