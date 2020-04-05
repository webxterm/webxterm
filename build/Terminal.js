"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Preferences_1 = require("./Preferences");
const CommonUtils_1 = require("./common/CommonUtils");
const Styles_1 = require("./Styles");
const Transceiver_1 = require("./Transceiver");
const Parser_1 = require("./parser/Parser");
const EventHandler_1 = require("./input/EventHandler");
const Cursor_1 = require("./Cursor");
const Printer_1 = require("./Printer");
const BufferSet_1 = require("./buffer/BufferSet");
const EventLog_1 = require("./input/EventLog");
const EscapeSequenceParser_1 = require("./parser/EscapeSequenceParser");
const OscParser_1 = require("./parser/OscParser");
const SSHServerInfo_1 = require("./SSHServerInfo");
class Terminal {
    constructor(args) {
        this._eventMap = {};
        this._charWidth = 0;
        this._charHeight = 0;
        this._columns = 0;
        this._rows = 0;
        this.enable = true;
        this._enableScrollToBottom = true;
        this.init = false;
        this.isReady = false;
        this.messageQueueTimer = 0;
        this.messageQueue = [];
        this.instanceId = "";
        this.container = document.createElement("div");
        this.viewport = document.createElement("div");
        this.presentation = document.createElement("div");
        this.clipboard = document.createElement("textarea");
        this.measureSpan = document.createElement("span");
        this.measureDiv = document.createElement("div");
        this.prompt = "WebXterm>>> ";
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
        this.preferences = new Preferences_1.Preferences(this);
        this.preferences.init();
        if (!!args['scrollBack']) {
            this.preferences.scrollBack = args['scrollBack'];
        }
        this.cursor.blinking = this.preferences.cursorBlinking;
        this.cursor.enable = true;
        this.initViewPort();
        this.parser = new Parser_1.Parser(this);
        this.esParser = new EscapeSequenceParser_1.EscapeSequenceParser(this, this.parser);
        this.oscParser = new OscParser_1.OscParser(this, this.parser);
        this.eventHandler = new EventHandler_1.EventHandler();
        this.eventHandler.listen(this);
        this.bufferSet = new BufferSet_1.BufferSet();
        this.printer = new Printer_1.Printer(this);
        this.eventLog = new EventLog_1.EventLog();
        this.sshServerInfo = new SSHServerInfo_1.SSHServerInfo();
        this.transceiver = new Transceiver_1.Transceiver(this.wsServer, this);
        this.transceiver.enableHeartbeat = this.preferences.enableHeartbeat;
        this.transceiver.nextHeartbeatSeconds = this.preferences.nextHeartbeatSeconds;
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
    initViewPort() {
        CommonUtils_1.CommonUtils.addClass(this.instance, Terminal.brand);
        this.instance.setAttribute("instance", this.instanceId);
        this.instance.appendChild(this.container);
        this.container.className = "container";
        this.container.appendChild(this.viewport);
        this.viewport.className = "viewport";
        this.container.appendChild(this.presentation);
        this.presentation.className = "presentation";
        this.presentation.appendChild(this.clipboard);
        this.clipboard.className = "clipboard";
        this.clipboard.autocapitalize = "off";
        this.clipboard.autocomplete = "off";
        [this.charWidth, this.charHeight] = this.preferences.defaultFontSizeVal;
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
    measure() {
        this.viewport.appendChild(this.measureDiv);
        this.measureSpan.innerHTML = 'W';
        this.measureSpan.className = 'measure';
        this.measureDiv.appendChild(this.measureSpan);
        let rect = this.measureSpan.getBoundingClientRect();
        this.charWidth = rect.width;
        this.charHeight = rect.height;
        console.info('修改尺寸：' + this.rows + "," + this.columns);
        this.bufferSet.init(this.rows, this.columns);
        this.addBufferFillRows();
        this.bufferSet.activeBufferLine.used = true;
        this.bufferSet.normal.maxScrollBack = this.preferences.scrollBack;
        this.isReady = true;
        if (!!this.greetings)
            this.echo(this.greetings);
        if (this.messageQueue.length > 0) {
            this.echo(this.messageQueue.splice(0, this.messageQueue.length).join(""));
        }
        if (!!this.wsServer)
            this.connectServer();
    }
    resizeWindow() {
        this.viewport.appendChild(this.measureDiv);
        const width = this.measureDiv.getBoundingClientRect().width;
        this._columns = Math.floor(width / this._charWidth);
        this.measureDiv.remove();
        const height = this.container.getBoundingClientRect().height;
        this._rows = Math.floor(height / this._charHeight);
        let fragment = this.parser.bufferSet.resize(this.rows, this.columns);
        if (fragment)
            this.viewport.appendChild(fragment);
        this.resizeRemote();
        this.scrollToBottom();
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
    set charWidth(value) {
        this._charWidth = value;
        this.viewport.appendChild(this.measureDiv);
        console.info("value:" + value);
        const width = this.measureDiv.getBoundingClientRect().width;
        this._columns = Math.floor(width / value);
        Styles_1.Styles.add(".len2", {
            "width": value * 2 + "px"
        }, this.instanceId);
        this.measureDiv.remove();
    }
    get columns() {
        return this._columns;
    }
    get rows() {
        return this._rows;
    }
    set charHeight(value) {
        this._charHeight = value;
        Styles_1.Styles.add(".len2", {
            "height": value + "px",
            "line-height": value + "px"
        }, this.instanceId);
        Styles_1.Styles.add(".viewport-row", {
            "height": value + "px",
            "line-height": value + "px"
        }, this.instanceId);
        const height = this.container.getBoundingClientRect().height;
        this._rows = Math.floor(height / value);
        Styles_1.Styles.add(".presentation", {
            "height": (height - this._rows * value) + "px"
        }, this.instanceId);
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
                term: this.preferences.terminalType,
                type: '!sftp'
            }));
        }).catch((e) => {
            console.info(e);
            if (e instanceof Event) {
                console.info('连接错误！');
            }
            else if (e instanceof CloseEvent) {
                console.info('连接关闭！');
            }
        });
    }
    echo(text) {
        if (!this.isReady) {
            setTimeout(() => {
                this.parser.parse(text);
            }, 1000);
        }
        else {
            this.parser.parse(text);
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
            if (!this.isReady) {
                clearInterval(this.messageQueueTimer);
                this.messageQueueTimer = 0;
                return;
            }
            const len = this.messageQueue.length;
            if (len == 0) {
                clearInterval(this.messageQueueTimer);
                this.messageQueueTimer = 0;
            }
            else {
                const chunk = this.messageQueue.splice(0, len);
                this.echo(chunk.join(""));
            }
        }, 0);
    }
    bell() {
        this.container.style.backgroundColor = this.preferences.visualBellColor;
        this.container.style.transition = "0.25s";
        setTimeout(() => {
            this.container.style.backgroundColor = "";
            this.container.style.transition = "";
        }, 250);
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
        if (this.preferences.scrollToBottomOnInput && this._enableScrollToBottom) {
            this.scrollToBottom();
        }
    }
    scrollToBottom() {
        this.container.scrollTop = this.container.scrollHeight;
    }
    addBufferFillRows() {
        let fragment = document.createDocumentFragment();
        const lines = this.bufferSet.activeBuffer.lines;
        for (let i = 0, len = lines.length; i < len; i++) {
            fragment.appendChild(lines[i].element);
        }
        this.viewport.appendChild(fragment);
    }
    registerConnect() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                if (this.transceiver)
                    this.transceiver.send(JSON.stringify({ cmd: '\x0d' }));
            }
            e.stopPropagation();
            e.preventDefault();
        });
    }
}
exports.Terminal = Terminal;
Terminal.brand = "webxterm";
