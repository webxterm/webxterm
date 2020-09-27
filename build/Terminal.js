"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Preferences_1 = require("./Preferences");
const CommonUtils_1 = require("./common/CommonUtils");
const Styles_1 = require("./Styles");
const Transceiver_1 = require("./Transceiver");
const Parser_1 = require("./parser/Parser");
const EventHandler_1 = require("./input/EventHandler");
const Cursor_1 = require("./Cursor");
const BufferSet_1 = require("./buffer/BufferSet");
const EscapeSequenceParser_1 = require("./parser/EscapeSequenceParser");
const OscParser_1 = require("./parser/OscParser");
const SSHServerInfo_1 = require("./SSHServerInfo");
const CanvasSelection_1 = require("./CanvasSelection");
const Composition_1 = require("./input/Composition");
const CanvasTextRenderer_1 = require("./renderer/CanvasTextRenderer");
const CanvasSelectionRenderer_1 = require("./renderer/CanvasSelectionRenderer");
const CanvasCursorRenderer_1 = require("./renderer/CanvasCursorRenderer");
var RenderType;
(function (RenderType) {
    RenderType[RenderType["HTML"] = 0] = "HTML";
    RenderType[RenderType["CANVAS"] = 1] = "CANVAS";
})(RenderType = exports.RenderType || (exports.RenderType = {}));
class Terminal {
    constructor(args) {
        this._eventMap = {};
        this.min_gap_with_bottom = 5;
        this.viewport_margin_tb = 0;
        this.viewport_margin_lf = 3;
        this._charWidth = 0;
        this._charHeight = 0;
        this._columns = 0;
        this._rows = 0;
        this.enable = true;
        this._enableScrollToBottom = true;
        this.init = false;
        this.isReady = false;
        this.is_init_measure = false;
        this.messageQueueTimer = 0;
        this.messageQueue = [];
        this.renderType = RenderType.CANVAS;
        this.instanceId = "";
        this.container = document.createElement("div");
        this.viewport = document.createElement("div");
        this.textView = document.createElement("canvas");
        this.selectionView = document.createElement("canvas");
        this.cursorView = document.createElement("canvas");
        this.blinkView = document.createElement("canvas");
        this.scrollArea = document.createElement("div");
        this.scrollView = document.createElement("div");
        this.presentation = document.createElement("div");
        this.clipboard = document.createElement("textarea");
        this.measureSpan = document.createElement("span");
        this.measureDiv = document.createElement("div");
        this.prompt = "WebXterm>>> ";
        this.selection = new CanvasSelection_1.CanvasSelection();
        this.composing = new Composition_1.Composition();
        this.processComposing = new Composition_1.Composition();
        this.instanceId = "ins_" + new Date().getTime();
        this.instance = args["instance"];
        this.onRender = args["render"];
        this.wsServer = args["wsServer"] || "";
        this.prompt = args["prompt"] || "";
        if (this.wsServer.length == 0) {
            this.write(this.prompt);
        }
        this.greetings = args['greetings'] || "Welcome to WebXterm, a web Terminal Emulator.\r\n\r\n";
        this.cursor = new Cursor_1.Cursor(this.instanceId);
        this._preferences = new Preferences_1.Preferences(this);
        this._preferences.init();
        if (!!args['scrollBack']) {
            this._preferences.scrollBack = args['scrollBack'];
        }
        this.cursor.blinking = this._preferences.cursorBlinking;
        this.cursor.enable = true;
        this.initViews();
        this.parser = new Parser_1.Parser(this);
        this.esParser = new EscapeSequenceParser_1.EscapeSequenceParser(this, this.parser);
        this.oscParser = new OscParser_1.OscParser(this, this.parser);
        this.eventHandler = new EventHandler_1.EventHandler();
        this.eventHandler.listen(this);
        this.bufferSet = new BufferSet_1.BufferSet();
        this.sshServerInfo = new SSHServerInfo_1.SSHServerInfo();
        this.transceiver = new Transceiver_1.Transceiver(this.wsServer, this);
        this.transceiver.enableHeartbeat = this._preferences.enableHeartbeat;
        this.transceiver.nextHeartbeatSeconds = this._preferences.nextHeartbeatSeconds;
    }
    get preferences() {
        return this._preferences;
    }
    on(typeName, listener) {
        if (typeof typeName == 'string') {
            if (listener) {
                this._eventMap[typeName] = listener;
            }
        }
        else if (typeof typeName == 'object') {
            for (let key in typeName) {
                const sk = key + "";
                this._eventMap[sk] = typeName[sk];
            }
        }
        return this;
    }
    initViews() {
        CommonUtils_1.CommonUtils.addClass(this.instance, Terminal.brand);
        this.instance.setAttribute("instance", this.instanceId);
        this.instance.appendChild(this.container);
        this.container.className = "container";
        this.measureSpan.innerHTML = 'W';
        this.measureSpan.className = 'measure';
        this.measureDiv.appendChild(this.measureSpan);
        if (this.renderType === RenderType.CANVAS) {
            this.scrollView.className = "scroll-view";
            this.scrollView.appendChild(this.scrollArea);
            this.scrollArea.className = "scroll-area";
            this.container.appendChild(this.scrollView);
            Styles_1.Styles.add(".container", {
                "overflow": "hidden"
            }, this.instanceId);
            this.container.appendChild(this.viewport);
            this.viewport.className = "viewport";
            this.viewport.setAttribute("spellcheck", "false");
            this.viewport.style.margin = this.viewport_margin_tb + "px " + this.viewport_margin_lf + "px";
            this.updateViewport();
        }
        else {
            this.container.appendChild(this.viewport);
            this.viewport.className = "viewport";
        }
        this.container.appendChild(this.presentation);
        this.presentation.className = "presentation";
        this.presentation.appendChild(this.clipboard);
        this.clipboard.className = "clipboard";
        this.clipboard.autocapitalize = "off";
        this.clipboard.autocomplete = "off";
        [this.charWidth, this.charHeight] = this._preferences.defaultFontSizeVal;
        if (this.onRender)
            this.onRender({
                'type': 'render',
                'instance': this
            });
        this.init = true;
        if (!document.body) {
            setTimeout(() => {
                this.ready();
            });
        }
        else {
            if (document.readyState == "complete") {
                setTimeout(() => {
                    this.ready();
                }, 1000);
            }
            else {
                document.addEventListener("DOMContentLoaded", (e) => {
                    this.completed(e);
                }, false);
                document.addEventListener("readystatechange", (e) => {
                    this.completed(e);
                }, false);
            }
        }
    }
    completed(event) {
        if (document.readyState == "complete" || event.type == 'load') {
            setTimeout(() => {
                this.ready();
            }, 1000);
        }
    }
    append(newChild) {
        if (this.renderType === RenderType.HTML) {
            this.viewport.appendChild(newChild);
        }
    }
    ready() {
        console.info('ready...');
        this.measure();
    }
    set enableScrollToBottom(value) {
        this._enableScrollToBottom = value;
    }
    get eventMap() {
        return this._eventMap;
    }
    pushMessage(data) {
        this.messageQueue.push(data);
        this.startPrinter();
    }
    initRenderer() {
        this.cursorRenderer = new CanvasCursorRenderer_1.CanvasCursorRenderer(this);
        this.textRenderer = new CanvasTextRenderer_1.CanvasTextRenderer(this);
        this.selectionRenderer = new CanvasSelectionRenderer_1.CanvasSelectionRenderer(this);
    }
    measure() {
        this.scrollView.appendChild(this.measureDiv);
        let rect = this.measureSpan.getBoundingClientRect();
        this.charWidth = rect.width;
        this.charHeight = rect.height;
        this.bufferSet.init(this.rows, this.columns);
        this.addBufferFillRows();
        this.bufferSet.normal.maxScrollBack = this._preferences.scrollBack;
        if (!this.isReady) {
            this.initRenderer();
            this.isReady = true;
        }
        if (!!this.greetings)
            this.echo(this.greetings);
        if (this.messageQueue.length > 0) {
            this.echo(this.messageQueue.splice(0, this.messageQueue.length).join(""));
        }
        if (!!this.wsServer) {
            this.connectServer();
        }
        if (this.measureDiv.isConnected)
            this.measureDiv.remove();
    }
    resizeWindow() {
        const width = this.measureDivWidth;
        console.info("width:" + width + ", _charWidth:" + this._charWidth);
        this._columns = Math.floor(width / this._charWidth);
        this.measureDiv.remove();
        this.updateHeight(this._charHeight);
        this.parser.bufferSet.resize(this.rows, this.columns);
        this.resizeRemote();
        if (this.renderType == RenderType.CANVAS) {
            this.updateViewport();
            if (this.textRenderer)
                this.textRenderer.resize(this._rows, this._columns);
            if (this.cursorRenderer)
                this.cursorRenderer.resize(this._rows, this._columns);
            if (this.selectionRenderer)
                this.selectionRenderer.resize(this._rows, this._columns);
            this.updateScrollAreaHeight();
        }
        else if (this.renderType == RenderType.HTML) {
        }
        if (this.selection.running) {
            if (this.selectionRenderer)
                this.selectionRenderer.select(this.selection);
        }
        this.scrollToBottom();
    }
    updateScrollAreaHeight() {
        Styles_1.Styles.add(".scroll-view .scroll-area", {
            "height": this._charHeight * (this.bufferSet.normal.saved_buffer.lines.length + this.bufferSet.activeBuffer.size) + "px"
        }, this.instanceId);
    }
    resizeRemote() {
        if (this.transceiver) {
            this.transceiver.send(JSON.stringify({
                size: {
                    w: this.columns,
                    h: this.rows
                }
            }));
        }
    }
    get measureDivWidth() {
        if (!this.measureDiv.parentElement) {
            this.scrollView.appendChild(this.measureDiv);
        }
        return this.measureDiv.getBoundingClientRect().width
            - parseInt(this.viewport.style.marginLeft)
            - parseInt(this.viewport.style.marginRight);
    }
    set charWidth(value) {
        this._charWidth = value;
        console.info("value:" + value);
        const width = this.measureDivWidth;
        console.info("prop:charWidth: width:" + width + ", _charWidth:" + this._charWidth);
        this._columns = Math.floor(width / value);
        Styles_1.Styles.add(".len2", {
            "width": value * 2 + "px"
        }, this.instanceId);
    }
    get columns() {
        return this._columns;
    }
    get rows() {
        return this._rows;
    }
    set charHeight(value) {
        if (this.renderType === RenderType.CANVAS) {
            value += this._preferences.fontFamily.getLineHeight();
        }
        this._charHeight = value;
        Styles_1.Styles.add(".len2", {
            "height": value + "px",
            "line-height": value + "px"
        }, this.instanceId);
        Styles_1.Styles.add(".viewport-row", {
            "height": value + "px",
            "line-height": value + "px"
        }, this.instanceId);
        this.updateHeight(value);
    }
    get charWidth() {
        return this._charWidth;
    }
    get charHeight() {
        return this._charHeight;
    }
    open(hostname, username, password, port = 22, pkey = "") {
        this.sshServerInfo.hostname = hostname;
        this.sshServerInfo.username = username;
        this.sshServerInfo.password = password;
        this.sshServerInfo.port = port;
        this.sshServerInfo.pkey = pkey;
        return this;
    }
    connectServer() {
        this.transceiver.open().then((e) => {
            console.info(e);
            this.eventMap["connect"]("success", "连接成功。");
            this.transceiver.send(JSON.stringify({
                target: {
                    hostname: this.sshServerInfo.hostname,
                    username: this.sshServerInfo.username,
                    password: this.sshServerInfo.password,
                    port: this.sshServerInfo.port
                },
                size: {
                    w: this.columns,
                    h: this.rows
                },
                term: this._preferences.terminalType,
                type: '!sftp'
            }));
        }).catch((e) => {
            if (e instanceof Event) {
                this.eventMap["connect"]("fail", `无法建立到 ${this.wsServer} 服务器的连接。`);
            }
            else if (e instanceof CloseEvent) {
                this.eventMap["connect"]("close", "连接关闭！");
            }
        });
    }
    echo(text, callback = undefined) {
        if (!this.isReady) {
            setTimeout(() => {
                this.parser.parse(text, false, callback);
            }, 1000);
        }
        else {
            this.parser.parse(text, false, callback);
        }
    }
    write(text) {
        if (!!text)
            this.messageQueue.push(text);
        return this;
    }
    startPrinter() {
        if (this.messageQueueTimer) {
            return;
        }
        this.messageQueueTimer = setInterval(() => {
            clearInterval(this.messageQueueTimer);
            this.messageQueueTimer = 0;
            if (!this.isReady) {
                return;
            }
            const len = this.messageQueue.length;
            if (len > 0) {
                const chunk = this.messageQueue.splice(0, len);
                this.echo(chunk.join(""), () => {
                    this.startPrinter();
                });
            }
        }, 0);
    }
    bell() {
        if (this.renderType == RenderType.HTML) {
            this.container.style.backgroundColor = this._preferences.visualBellColor;
            this.container.style.transition = "0.25s";
            setTimeout(() => {
                this.container.style.backgroundColor = "";
                this.container.style.transition = "";
            }, 250);
        }
    }
    focus() {
        this.cursor.focus = true;
    }
    blur() {
        this.cursor.focus = false;
    }
    reverseVideo() {
        CommonUtils_1.CommonUtils.addClass(this.container, 'inverse');
    }
    normalVideo() {
        CommonUtils_1.CommonUtils.removeClass(this.container, 'inverse');
    }
    showCursor() {
        this.cursor.show = true;
    }
    hideCursor() {
    }
    scrollToBottomOnInput() {
        this.updateScrollAreaHeight();
        if (this._preferences.scrollToBottomOnInput && this._enableScrollToBottom) {
            this.scrollToBottom();
        }
    }
    scrollToBottom() {
        if (this.renderType == RenderType.HTML) {
        }
        else if (this.renderType == RenderType.CANVAS) {
            this.scrollView.scrollTop = this.scrollView.scrollHeight;
        }
    }
    addBufferFillRows() {
        if (this.renderType === RenderType.HTML) {
        }
        else if (this.renderType == RenderType.CANVAS) {
        }
    }
    registerConnect() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
            }
            e.stopPropagation();
            e.preventDefault();
        });
    }
    updateViewport() {
        let width = this.scrollArea.getBoundingClientRect().width
            - parseInt(this.viewport.style.marginLeft)
            - parseInt(this.viewport.style.marginRight);
        Styles_1.Styles.add(".viewport", {
            "width": width + "px",
            "padding": "0",
            "z-index": "9997"
        }, this.instanceId);
        Styles_1.Styles.add(".scroll-view", {
            "overflow-y": "scroll",
            "z-index": "9998"
        }, this.instanceId);
        Styles_1.Styles.add(".presentation .clipboard", {
            "z-index": "9999"
        }, this.instanceId);
        let width2 = width * this._preferences.canvasSizeMultiple;
        console.info("width:" + width2);
        this.viewport.appendChild(this.textView);
        this.textView.className = "text-view";
        this.textView.width = width2;
        this.viewport.appendChild(this.selectionView);
        this.selectionView.className = "selection-view";
        this.selectionView.width = width2;
        this.viewport.appendChild(this.cursorView);
        this.cursorView.className = "cursor-view";
        this.cursorView.width = width2;
    }
    updateHeight(value) {
        const height = this.container.getBoundingClientRect().height
            - parseInt(this.viewport.style.marginTop)
            - parseInt(this.viewport.style.marginBottom);
        this._rows = Math.floor(height / value);
        let winHeight = this._rows * value;
        const gap = height - winHeight;
        if (gap < this.min_gap_with_bottom) {
            this._rows -= 1;
            winHeight = this._rows * value;
        }
        const h = winHeight * this._preferences.canvasSizeMultiple;
        Styles_1.Styles.add(".viewport", {
            "height": winHeight + "px"
        }, this.instanceId);
        Styles_1.Styles.add(".scroll-view .scroll-area", {
            "height": winHeight + "px"
        }, this.instanceId);
        this.selectionView.height = h;
        this.cursorView.height = h;
        this.textView.height = h;
        Styles_1.Styles.add(".presentation", {
            "height": (height - winHeight) + "px"
        }, this.instanceId);
    }
    get scrollViewScrollTop() {
        const scrollTop = this.scrollView.scrollTop, height = this.scrollView.getBoundingClientRect().height, viewport_height = this.viewport.getBoundingClientRect().height;
        return scrollTop + (height - viewport_height);
    }
    get isScrollToBottom() {
        return this.scrollView.scrollTop == this.scrollView.scrollHeight - this.scrollView.getBoundingClientRect().height;
    }
    getOffsetTop() {
        return Math.ceil(this.scrollView.scrollTop / this.charHeight);
    }
}
exports.Terminal = Terminal;
Terminal.brand = "webxterm";
