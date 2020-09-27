"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Keyboard_1 = require("./Keyboard");
const Terminal_1 = require("../Terminal");
const CommonUtils_1 = require("../common/CommonUtils");
const Styles_1 = require("../Styles");
const CanvasSelection_1 = require("../CanvasSelection");
const InputEvent_1 = require("./InputEvent");
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
    listen(t) {
        const defaultOption = { preventScroll: true };
        let focusTarget = FocusTarget.UNDEFINED;
        let container = t.container;
        let clipboard = t.clipboard;
        let selection = t.selection;
        new InputEvent_1.InputEvent(clipboard, t).initCompositionEvents().initKeydownEvent();
        container.addEventListener("click", (e) => {
            this.quickSelectAll = false;
            if (this.getSelection().length === 0) {
                clipboard.focus(defaultOption);
            }
        });
        container.addEventListener("paste", (e) => {
            clipboard.focus();
            t.scrollToBottom();
            if (e.clipboardData) {
                let text = e.clipboardData.getData('text');
                this.sendMessage(t, text.replace(/\n|\r\n/gi, '\x0d'));
            }
        });
        container.addEventListener("mousedown", (e) => {
            console.info('container...mousedown....', e);
            switch (e.button) {
                case 0:
                    focusTarget = FocusTarget.CONTAINER;
                    clipboard.focus(defaultOption);
                    return;
                case 1:
                    e.preventDefault();
                    this.sendMessage(t, this.selectionContent);
                    clipboard.focus();
                    break;
                case 2:
                    if (this.quickSelectAll) {
                        break;
                    }
                    if (t.renderType == Terminal_1.RenderType.CANVAS) {
                        let target = e.target, x, y = 0, h = t.charHeight;
                        let layerY = e.clientY - cursorViewRect.top, height = t.charHeight;
                        x = e.clientX - cursorViewRect.left;
                        y = Math.floor(layerY / height) * height + parseInt(t.viewport.style.marginTop);
                        Styles_1.Styles.add(".clipboard", {
                            position: "absolute",
                            left: (x - t.charWidth / 2) + "px",
                            top: y + "px",
                            height: h + "px",
                            width: (target.getBoundingClientRect().width - x) + "px"
                        }, t.instanceId);
                    }
                    else if (t.renderType == Terminal_1.RenderType.HTML) {
                        if (!this.isFocusSelectionRanges(e)) {
                            console.info('isFocusSelectionRanges => false');
                            console.info(e.target);
                            let target = e.target, x = e.pageX - t.container.getBoundingClientRect().left, y = 0, h = t.charHeight;
                            if (target === t.container) {
                                y = e.pageY - (e.pageY % t.charHeight);
                            }
                            else if (target === t.presentation) {
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
                                left: (x - t.charWidth / 2) + "px",
                                top: y + "px",
                                height: h + "px",
                                width: (target.getBoundingClientRect().width - x) + "px"
                            }, t.instanceId);
                        }
                    }
                    break;
                case 3:
                    break;
                case 4:
                    break;
            }
        });
        container.addEventListener('mouseup', (e) => {
            console.info('container...mouseup....', e);
            const selectionContent = this.getSelection();
            if (!!selectionContent) {
                this.selectionContent = selectionContent;
            }
            else {
            }
        });
        document.addEventListener("keydown", (e) => {
            console.info('document...keydown....', e);
            if (e.key === "Alt"
                || e.key === "Control"
                || e.key === "Shift"
                || e.metaKey
                || e.altKey) {
                return;
            }
            let keySym = this.keyboard.getKeySym(e, t.esParser.applicationCursorKeys, t.parser.applicationKeypad);
            this.sendMessage(t, keySym);
            clipboard.focus();
        });
        clipboard.addEventListener("contextmenu", () => {
            clipboard.focus();
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
            if (t.renderType === Terminal_1.RenderType.CANVAS) {
                setTimeout(() => {
                    if (t.cursorRenderer)
                        t.cursorRenderer.drawCursor();
                });
            }
            else if (t.renderType === Terminal_1.RenderType.HTML) {
                t.focus();
                clipboard.value = '';
                focusTarget = FocusTarget.CLIPBOARD;
            }
        });
        clipboard.focus(defaultOption);
        window.addEventListener('blur', () => {
            if (t.renderType === Terminal_1.RenderType.CANVAS) {
                setTimeout(() => {
                    if (t.cursorRenderer)
                        t.cursorRenderer.cursorBlur();
                });
            }
            else if (t.renderType === Terminal_1.RenderType.HTML) {
                focusTarget = FocusTarget.UNDEFINED;
                console.info('失去焦点');
                t.blur();
            }
        });
        window.onresize = () => {
            if (!!resizingTimer) {
                clearTimeout(resizingTimer);
                resizingTimer = 0;
            }
            resizingTimer = setTimeout(() => {
                if (t.eventMap["resize"])
                    t.eventMap["resize"]();
                t.resizeWindow();
                clearTimeout(resizingTimer);
                resizingTimer = 0;
            }, 100);
        };
        let cursorViewRect = t.cursorView.getBoundingClientRect();
        let clickTime = [];
        let clickPoints = [];
        function calcPointX(layerX) {
            const width = (t.textRenderer) ? t.textRenderer.measuredTextWidth : 0;
            const xMod = layerX * 2 % width;
            let x = Math.floor(layerX * 2 / width) * width;
            if (xMod > width / 2) {
                x += width;
            }
            return x;
        }
        function calcPointY(layerY) {
            const height = (t.textRenderer) ? t.textRenderer.height : 0;
            return Math.floor(layerY * 2 / height) * height;
        }
        t.scrollView.addEventListener("mousedown", (e) => {
            console.info("terminal。。。mousedown。。。", e);
            switch (e.buttons) {
                case 1:
                    if (!selection.enable)
                        selection.enable = true;
                    let x = e.clientX - cursorViewRect.left, y = e.clientY - cursorViewRect.top;
                    let offsetTop = t.getOffsetTop();
                    if (e.shiftKey) {
                        selection.stop(calcPointX(x), calcPointY(y), offsetTop);
                        if (t.selectionRenderer)
                            t.selectionRenderer.select(selection);
                    }
                    else {
                        if (t.selectionRenderer)
                            t.selectionRenderer.clearSelected(selection);
                        if (selection.selectAll) {
                            selection.selectAll = false;
                            if (t.textRenderer)
                                t.textRenderer.flushLines(t.textRenderer.getDisplayBuffer(), false);
                        }
                        console.info("offsetTop:" + offsetTop);
                        selection.start(calcPointX(x), calcPointY(y), offsetTop);
                        const now = new Date().getTime();
                        switch (clickTime.length) {
                            case 1:
                                if ((now - clickTime[0]) < 500) {
                                    clickPoints.push(new CanvasSelection_1.SelectionPoint(x, y));
                                    if (CommonUtils_1.CommonUtils.isSamePoint(clickPoints[0], clickPoints[1])) {
                                        console.info("双击。。。。");
                                        console.info(clickPoints);
                                        selection.stop(calcPointX(x), calcPointY(y), offsetTop);
                                        if (t.selectionRenderer)
                                            t.selectionRenderer.selectBlock(selection);
                                        clickTime.push(now);
                                        break;
                                    }
                                }
                                clickTime = [now];
                                clickPoints = [new CanvasSelection_1.SelectionPoint(x, y)];
                                break;
                            case 2:
                                if ((now - clickTime[1]) < 500
                                    && (clickTime[1] - clickTime[0]) < 500) {
                                    clickPoints.push(new CanvasSelection_1.SelectionPoint(x, y));
                                    if (CommonUtils_1.CommonUtils.isSamePoint(clickPoints[0], clickPoints[1])
                                        && CommonUtils_1.CommonUtils.isSamePoint(clickPoints[1], clickPoints[2])) {
                                        console.info("三击。。。。");
                                        console.info(clickPoints);
                                        selection.stop(calcPointX(x), calcPointY(y), offsetTop);
                                        if (t.selectionRenderer)
                                            t.selectionRenderer.selectLine(selection);
                                        break;
                                    }
                                }
                                clickTime = [now];
                                clickPoints = [new CanvasSelection_1.SelectionPoint(x, y)];
                                break;
                            default:
                                clickTime = [now];
                                clickPoints = [new CanvasSelection_1.SelectionPoint(x, y)];
                        }
                    }
                    console.info(e);
                    break;
                case 2:
                    selection.enable = false;
                    break;
            }
        });
        container.addEventListener("mousemove", (e) => {
            if (e.buttons == 0)
                return;
            switch (e.buttons) {
                case 1:
                    if (t.renderType == Terminal_1.RenderType.CANVAS
                        && selection.enable) {
                        let x = e.clientX - cursorViewRect.left, y = e.clientY - cursorViewRect.top;
                        selection.stop(calcPointX(x), calcPointY(y));
                        if (t.selectionRenderer)
                            t.selectionRenderer.select(selection);
                    }
                    break;
                case 2:
                    break;
                case 4:
                    break;
                case 8:
                    break;
                case 16:
                    break;
            }
        });
        let pending_flush_buf, refresh, is_draw_cursor;
        t.scrollView.addEventListener("scroll", (e) => {
            if (t.textRenderer && t.textRenderer.hitFlushLines()) {
                console.info("命中缓存。。。");
                return;
            }
            console.info(e);
            if (t.textRenderer)
                pending_flush_buf = t.textRenderer.getDisplayBuffer();
            refresh = false;
            is_draw_cursor = true;
            for (let i = 0, len = pending_flush_buf.lines.length; i < len; i++) {
                if (!refresh && pending_flush_buf.lines[i] != t.bufferSet.activeBuffer.display_buffer.lines[i]) {
                    refresh = true;
                }
                if (is_draw_cursor && t.bufferSet.activeBuffer.change_buffer.lines[i] != pending_flush_buf.lines[i]) {
                    is_draw_cursor = false;
                }
                if (refresh && !is_draw_cursor) {
                    break;
                }
            }
            t.cursor.show = is_draw_cursor;
            if (refresh) {
                if (t.textRenderer)
                    t.textRenderer.flushLines(pending_flush_buf, true);
            }
            else {
                if (t.cursor.show) {
                    if (t.cursorRenderer)
                        t.cursorRenderer.drawCursor();
                }
            }
        });
    }
    sendMessage(t, data) {
        if (data.length > 0) {
            let presentation = JSON.stringify({
                cmd: data
            });
            console.info("发送的内容：" + presentation);
            t.transceiver.send(presentation);
        }
    }
}
exports.EventHandler = EventHandler;
