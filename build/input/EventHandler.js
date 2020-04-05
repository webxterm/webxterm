"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Keyboard_1 = require("./Keyboard");
const CommonUtils_1 = require("../common/CommonUtils");
const Styles_1 = require("../Styles");
const Composition_1 = require("./Composition");
var FocusTarget;
(function (FocusTarget) {
    FocusTarget[FocusTarget["UNDEFINED"] = 0] = "UNDEFINED";
    FocusTarget[FocusTarget["CONTAINER"] = 1] = "CONTAINER";
    FocusTarget[FocusTarget["CLIPBOARD"] = 2] = "CLIPBOARD";
})(FocusTarget || (FocusTarget = {}));
class EventHandler {
    constructor() {
        this.keyboard = new Keyboard_1.Keyboard();
        this.selectionContent = "";
        this.selectionRanges = [];
        this.quickSelectAll = false;
        this.composing = new Composition_1.Composition();
    }
    getSelection() {
        let sel = window.getSelection();
        if (!sel)
            throw new Error("window.selection is " + sel);
        for (let i = 0; i < sel.rangeCount; i++) {
            this.selectionRanges[i] = sel.getRangeAt(i);
        }
        return sel.toString();
    }
    isFocusSelectionRanges(event) {
        for (let range of this.selectionRanges) {
            for (let rect of range.getClientRects()) {
                if ((rect.x <= event.pageX && event.pageX <= rect.right)
                    && (rect.y <= event.pageY && event.pageY <= rect.bottom)) {
                    return true;
                }
            }
        }
        return false;
    }
    listen(terminal) {
        const defaultOption = { preventScroll: true };
        let focusTarget = FocusTarget.UNDEFINED;
        let container = terminal.container;
        let clipboard = terminal.clipboard;
        container.addEventListener("click", (e) => {
            this.quickSelectAll = false;
            if (this.getSelection().length === 0) {
                clipboard.focus(defaultOption);
            }
        });
        container.addEventListener("paste", (e) => {
            clipboard.focus();
            terminal.scrollToBottom();
            if (e.clipboardData) {
                let text = e.clipboardData.getData('text');
                this.sendMessage(terminal, {
                    "cmd": text.replace(/\n|\r\n/gi, '\x0d')
                });
            }
        });
        container.addEventListener("mousedown", (e) => {
            switch (e.button) {
                case 0:
                    focusTarget = FocusTarget.CONTAINER;
                    clipboard.focus(defaultOption);
                    return;
                case 1:
                    e.preventDefault();
                    this.sendMessage(terminal, {
                        "cmd": this.selectionContent
                    });
                    clipboard.focus();
                    break;
                case 2:
                    if (this.quickSelectAll) {
                        break;
                    }
                    if (!this.isFocusSelectionRanges(e)) {
                        console.info('isFocusSelectionRanges => false');
                        console.info(e.target);
                        let target = e.target, x = e.pageX - terminal.container.getBoundingClientRect().left, y = 0, h = terminal.charHeight;
                        if (target === terminal.container) {
                            y = e.pageY - (e.pageY % terminal.charHeight);
                        }
                        else if (target === terminal.presentation) {
                            y = target.offsetTop;
                            h = target.getBoundingClientRect().height;
                        }
                        else if (CommonUtils_1.CommonUtils.hasClass(target, 'viewport-row')) {
                            y = target.offsetTop;
                        }
                        else {
                            if (target.nodeName && target.nodeName.toUpperCase() == "SPAN") {
                                if (target.parentElement
                                    && CommonUtils_1.CommonUtils.hasClass(target.parentElement, 'viewport-row')) {
                                    y = target.offsetTop;
                                }
                                else {
                                    break;
                                }
                            }
                            else {
                                break;
                            }
                        }
                        Styles_1.Styles.add(".clipboard", {
                            position: "absolute",
                            left: (x - terminal.charWidth / 2) + "px",
                            top: y + "px",
                            height: h + "px",
                            width: (target.getBoundingClientRect().width - x) + "px"
                        }, terminal.instanceId);
                        setTimeout(() => {
                            Styles_1.Styles.add(".clipboard", {
                                position: "",
                                left: "",
                                top: "",
                                height: "",
                                width: ""
                            }, terminal.instanceId);
                        }, 100);
                    }
                    break;
                case 3:
                    break;
                case 4:
                    break;
            }
        });
        container.addEventListener('mouseup', () => {
            const selectionContent = this.getSelection();
            if (!!selectionContent) {
                this.selectionContent = selectionContent;
            }
            else {
            }
        });
        document.addEventListener("keydown", (e) => {
            if (e.key === "Alt"
                || e.key === "Control"
                || e.key === "Shift"
                || e.metaKey
                || e.altKey) {
                return;
            }
            let keySym = this.keyboard.getKeySym(e, terminal.esParser.applicationCursorKeys, terminal.parser.applicationKeypad);
            this.sendMessage(terminal, {
                "cmd": keySym
            });
            clipboard.focus();
        });
        clipboard.addEventListener('keydown', (e) => {
            this.quickSelectAll = false;
            if (e.metaKey) {
                let key = e.key.toLowerCase();
                if ("cv".indexOf(key) !== -1) {
                    return;
                }
                else if ('a' === key) {
                    this.quickSelectAll = true;
                    clipboard.blur();
                    return;
                }
            }
            e.preventDefault();
            e.stopPropagation();
            if (e.which === 229 || e.keyCode == 229) {
                const key = e.key;
                if (key == "Process") {
                    return;
                }
                if (/[\u4E00-\u9FA5]|[\uFE30-\uFFA0]/gi.test(key)) {
                }
                else {
                    switch (this.composing.state) {
                        case 0:
                            this.composing.reset();
                            this.composing.update = key;
                            this.composing.state = 1;
                            this.composing.running = true;
                            compositionElement = document.createElement("span");
                            compositionElement.className = "composition2";
                            compositionElement.innerHTML = this.composing.update;
                            let currentElement = terminal.cursor.currentElement;
                            if (currentElement && currentElement.parentElement) {
                                currentElement.parentElement.insertBefore(compositionElement, currentElement);
                            }
                            break;
                        case 1:
                            this.composing.state = 2;
                        case 2:
                            this.composing.update = this.composing.update + key;
                            compositionElement.innerHTML = this.composing.update;
                            break;
                        case 3:
                            this.composing.end = key;
                            compositionElement.innerHTML = this.composing.end;
                            this.sendMessage(terminal, {
                                "cmd": this.composing.end
                            });
                            this.composing.reset();
                            compositionElement.remove();
                            break;
                    }
                    return;
                }
            }
            else if (!this.composing.events && this.composing.running) {
                if (e.key == "Backspace") {
                    this.composing.running = false;
                    this.composing.update = "";
                    this.composing.done = true;
                    this.composing.state = 3;
                }
                else if (e.key == "Enter") {
                    this.composing.end = this.composing.update;
                    compositionElement.innerHTML = this.composing.end;
                    this.composing.running = false;
                    this.composing.update = "";
                    this.composing.done = true;
                    this.composing.state = 3;
                    this.sendMessage(terminal, {
                        "cmd": this.composing.end
                    });
                    this.composing.reset();
                    compositionElement.remove();
                }
                return;
            }
            let keySym = this.keyboard.getKeySym(e, terminal.esParser.applicationCursorKeys, terminal.parser.applicationKeypad);
            this.sendMessage(terminal, {
                "cmd": keySym
            });
            if (terminal.bufferSet.activeBuffer.currentLineNum >= terminal.rows
                && !terminal.enableScrollToBottom) {
                terminal.enableScrollToBottom = true;
            }
        });
        clipboard.addEventListener("contextmenu", () => {
            clipboard.focus();
        });
        let compositionElement, compositionBlinkingTimer = 0;
        clipboard.addEventListener("compositionstart", (e) => {
            if (e instanceof CompositionEvent) {
                this.composing.reset();
                this.composing.events = true;
                this.composing.update = e.data;
                this.composing.running = true;
                this.composing.state = 1;
                console.info(JSON.stringify(this.composing));
                compositionElement = document.createElement("span");
                compositionElement.className = "composition";
                compositionElement.innerHTML = this.composing.update;
                let currentElement = terminal.cursor.currentElement;
                if (currentElement && currentElement.parentElement) {
                    currentElement.parentElement.insertBefore(compositionElement, currentElement);
                }
                terminal.hideCursor();
            }
        });
        clipboard.addEventListener('compositionupdate', (e) => {
            if (e instanceof CompositionEvent) {
                this.composing.update = e.data;
                this.composing.state = 2;
                console.info(JSON.stringify(this.composing));
                if (compositionElement) {
                    compositionElement.innerHTML = this.composing.update;
                    CommonUtils_1.CommonUtils.addClass(compositionElement, "running");
                    if (!!compositionBlinkingTimer) {
                        return;
                    }
                    compositionBlinkingTimer = setTimeout(() => {
                        CommonUtils_1.CommonUtils.removeClass(compositionElement, "running");
                        clearTimeout(compositionBlinkingTimer);
                        compositionBlinkingTimer = 0;
                    }, 1200);
                }
            }
        });
        clipboard.addEventListener('compositionend', (e) => {
            if (e instanceof CompositionEvent) {
                this.composing.update = "";
                this.composing.done = true;
                this.composing.running = false;
                this.composing.end = e.data;
                this.composing.state = 3;
                console.info(JSON.stringify(this.composing));
                if (compositionElement) {
                    compositionElement.innerHTML = this.composing.end;
                    terminal.showCursor();
                    this.sendMessage(terminal, {
                        "cmd": e.data
                    });
                    this.composing.reset();
                    compositionElement.remove();
                }
            }
        });
        container.addEventListener('scroll', (e) => {
            let target = e.target;
            terminal.enableScrollToBottom = target.scrollTop + target.getBoundingClientRect().height + 15 >= target.scrollHeight;
        });
        let resizingTimer = 0, blurTimer = 0;
        clipboard.addEventListener('focus', (e) => {
            if (blurTimer) {
                clearTimeout(blurTimer);
                blurTimer = 0;
            }
            e.stopPropagation();
            e.preventDefault();
            console.info('获取焦点');
            window.scrollTo(0, 0);
            terminal.focus();
            clipboard.value = '';
            focusTarget = FocusTarget.CLIPBOARD;
        });
        clipboard.focus(defaultOption);
        window.addEventListener('blur', () => {
            focusTarget = FocusTarget.UNDEFINED;
            terminal.blur();
        });
        window.onresize = () => {
            if (!!resizingTimer) {
                clearTimeout(resizingTimer);
                resizingTimer = 0;
            }
            resizingTimer = setTimeout(() => {
                if (terminal.eventMap["resize"])
                    terminal.eventMap["resize"]();
                terminal.resizeWindow();
                clearTimeout(resizingTimer);
                resizingTimer = 0;
            }, 100);
        };
    }
    paste(data, clipboard, terminal) {
        if (!!data && terminal.transceiver) {
            if (!(terminal.parser.applicationKeypad
                || terminal.esParser.applicationCursorKeys
                || terminal.bufferSet.isAlt)) {
                if (data === "\x0d") {
                    terminal.eventLog.add();
                }
                else {
                    terminal.eventLog.append(data);
                }
            }
            terminal.transceiver.send(JSON.stringify({
                "cmd": data
            }));
        }
        else if (!terminal.transceiver || !terminal.transceiver.connected) {
            console.info("clipboard.keySym:" + data);
            switch (data) {
                case "\x0d":
                    terminal.echo("\r\n" + terminal.prompt);
                    break;
                case "\x7f":
                    if (terminal.bufferSet.activeBuffer.x >= terminal.prompt.length) {
                        terminal.echo("\x08\x1b[P");
                    }
                    else {
                        terminal.echo("\x07");
                    }
                    break;
                case "\x1b[A":
                case "\x1b[B":
                    terminal.echo("\x07");
                    break;
                default:
                    terminal.echo(data);
            }
        }
    }
    sendMessage(terminal, data) {
        terminal.transceiver.send(JSON.stringify(data));
    }
}
exports.EventHandler = EventHandler;
