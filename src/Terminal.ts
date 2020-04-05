/**
 * web terminal
 * @author liaobaikai <baikai.liao@qq.com>
 * @version 2.0
 */
import {Preferences} from "./Preferences";
import {CommonUtils} from "./common/CommonUtils";
import {Styles} from "./Styles";
import {Transceiver} from "./Transceiver";
import {Parser} from "./parser/Parser";
import {EventHandler} from "./input/EventHandler";
import {Cursor} from "./Cursor";
import {Printer} from "./Printer";
import {BufferSet} from "./buffer/BufferSet";
import {EventLog} from "./input/EventLog";
import {EscapeSequenceParser} from "./parser/EscapeSequenceParser";
import {OscParser} from "./parser/OscParser";
import {SSHServerInfo} from "./SSHServerInfo";

export class Terminal {

    private _eventMap: { [key: string]: any } = {};

    // 字符尺寸
    private _charWidth: number = 0;
    private _charHeight: number = 0;

    // 列数
    private _columns: number = 0;
    // 行数
    private _rows: number = 0;

    // 是否可用
    private enable: boolean = true;

    // 是否可以滚动到底部
    private _enableScrollToBottom: boolean = true;

    // 是否已经初始化
    init: boolean = false;
    // 是否已经就绪
    isReady: boolean = false;

    // // 消息队列定时器
    private messageQueueTimer: number = 0;
    //
    readonly messageQueue: string[] = [];


    // 终端实例
    readonly instance: HTMLElement;
    readonly instanceId: string = "";
    // 终端实例类名
    static brand: string = "webxterm";
    // 终端容器
    readonly container: HTMLDivElement = document.createElement("div");
    // 视图
    readonly viewport: HTMLDivElement = document.createElement("div");
    // 待提交
    readonly presentation: HTMLDivElement = document.createElement("div");
    // 粘贴板
    readonly clipboard: HTMLTextAreaElement = document.createElement("textarea");

    // 视图初始化完成
    readonly onRender: Function;
    // 字符
    readonly measureSpan: HTMLSpanElement = document.createElement("span");
    readonly measureDiv: HTMLSpanElement = document.createElement("div");

    // Websocket服务器
    readonly wsServer: string;
    // 问候语
    readonly greetings: string;

    // 解析器
    readonly parser: Parser;
    // 序列解析器
    readonly esParser: EscapeSequenceParser;
    // 系统命令解析器
    readonly oscParser: OscParser;
    // 时间处理器
    readonly eventHandler: EventHandler;
    // 光标
    readonly cursor: Cursor;
    // 打印机
    readonly printer: Printer;
    // 缓冲区
    readonly bufferSet: BufferSet;
    // 时间记录器
    readonly eventLog: EventLog;
    // 偏好设置
    readonly preferences: Preferences;
    // 连接的服务器信息
    readonly sshServerInfo: SSHServerInfo;
    // 终端提示符
    readonly prompt: string = "WebXterm>>> ";
    // 发送接收器
    readonly transceiver: Transceiver;
    // Worker
    // readonly sshWorker: Worker;

    constructor(args: { [key: string]: any }) {
        // const now = new Date();
        // const today = new Date(now.getFullYear() + "-" + (now.getMonth() + 1) + "-" + now.getDate()).getTime();
        this.instanceId = "ins_" + new Date().getTime();

        this.instance = args["instance"];
        this.onRender = args["render"];
        this.wsServer = args["wsServer"] || "";
        this.prompt = args["prompt"] || "";

        if (this.wsServer.length == 0) {
            this.write(this.prompt);
        }

        this.greetings = args['greetings'] || "Welcome to WebXterm, a web Terminal Emulator.\r\n\r\n";


        // 光标
        this.cursor = new Cursor(this.instanceId);

        // 偏好设置
        this.preferences = new Preferences(this);
        this.preferences.init();

        if (!!args['scrollBack']) {
            this.preferences.scrollBack = args['scrollBack'];
        }

        this.cursor.blinking = this.preferences.cursorBlinking;
        this.cursor.enable = true;

        this.initViewPort();

        // 解析器
        this.parser = new Parser(this);
        this.esParser = new EscapeSequenceParser(this, this.parser);
        this.oscParser = new OscParser(this, this.parser);

        // 事件处理
        this.eventHandler = new EventHandler();
        this.eventHandler.listen(this);

        // 设置活跃缓冲区为当前的默认缓冲区
        this.bufferSet = new BufferSet();

        // 打印机
        this.printer = new Printer(this);

        // 时间记录
        this.eventLog = new EventLog();

        // 需要连接的服务器信息
        this.sshServerInfo = new SSHServerInfo();

        // this.sshWorker = new Worker("../src/worker/worker1.js");
        // this.sshWorker.postMessage({
        //     "type": "socket",
        //     "url": this.wsServer,
        //     "enableHeartbeat": this.preferences.enableHeartbeat,
        //     "nextHeartbeatSeconds": this.preferences.nextHeartbeatSeconds
        // });

        // 初始化发送接收器
        this.transceiver = new Transceiver(this.wsServer, this);
        this.transceiver.enableHeartbeat = this.preferences.enableHeartbeat;
        this.transceiver.nextHeartbeatSeconds = this.preferences.nextHeartbeatSeconds;

    }

    // 回调函数绑定
    on(typeName: string | { [key: string]: any }, listener?: (args: object) => void): Terminal {
        if (typeof typeName == 'string') {
            if (listener) {
                this._eventMap[typeName] = listener;
            }
        } else if (typeof typeName == 'object') {
            for (let key in typeName) {
                const sk = key + "";
                this._eventMap[sk] = typeName[sk];
            }
        }

        return this;
    }

    /**
     * 初始化视图
     */
    private initViewPort() {
        // 内部结构
        // --div.instance(容器)
        //      --div.container(滚动区域)
        //          --div.viewport(视图)
        //              --div.viewport-row
        //          --div.presentation(待提交)
        //              --textarea.clipboard(粘贴板)

        CommonUtils.addClass(this.instance, Terminal.brand);
        this.instance.setAttribute("instance", this.instanceId);

        // 终端容器
        this.instance.appendChild(this.container);
        this.container.className = "container";

        // 视图
        this.container.appendChild(this.viewport);
        this.viewport.className = "viewport";


        // 待提交区域
        this.container.appendChild(this.presentation);
        this.presentation.className = "presentation";

        // 粘贴板
        this.presentation.appendChild(this.clipboard);
        this.clipboard.className = "clipboard";
        // 首字母大写取消
        this.clipboard.autocapitalize = "off";
        // 关闭记录输入的内容
        this.clipboard.autocomplete = "off";


        // 默认字符大小
        [this.charWidth, this.charHeight] = this.preferences.defaultFontSizeVal;

        // 渲染完成
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
        } else {
            if (document.readyState == "complete") {
                // 文档加载完成、
                setTimeout(() => {
                    this.ready();
                }, 1000);
            } else {
                document.addEventListener("DOMContentLoaded", (e) => {
                    this.completed(e);
                }, false);
                document.addEventListener("readystatechange", (e) => {
                    this.completed(e);
                }, false);
            }
        }

    }

    private completed(event: Event): void {
        if (document.readyState == "complete" || event.type == 'load') {
            setTimeout(() => {
                this.ready();
            }, 1000);
        }
    }

    private ready(): void {
        console.info('ready...');
        // 获取字符的尺寸
        this.measure();
    }

    set enableScrollToBottom(value: boolean) {
        this._enableScrollToBottom = value;
    }

    get eventMap(): { [p: string]: any } {
        return this._eventMap;
    }

    /**
     * 将输入存入消息队列中
     * @param data
     */
    pushMessage(data: string){
        this.messageQueue.push(data);
        this.startPrinter();
    }

    /**
     * 获取字符的宽度和高度
     */
    measure(): void {

        this.viewport.appendChild(this.measureDiv);
        this.measureSpan.innerHTML = 'W';
        this.measureSpan.className = 'measure';
        this.measureDiv.appendChild(this.measureSpan);

        let rect = this.measureSpan.getBoundingClientRect();
        this.charWidth = rect.width;
        this.charHeight = rect.height;

        console.info('修改尺寸：' + this.rows + "," + this.columns);

        // 缓冲区初始化
        this.bufferSet.init(this.rows, this.columns);
        this.addBufferFillRows();
        // 第一行设置为已被使用。
        this.bufferSet.activeBufferLine.used = true;
        // 设置最大滚动行数
        this.bufferSet.normal.maxScrollBack = this.preferences.scrollBack;

        // 终端已就绪
        this.isReady = true;

        if (!!this.greetings)
            this.echo(this.greetings);

        if (this.messageQueue.length > 0) {
            // this.startPrinter();
            this.echo(this.messageQueue.splice(0, this.messageQueue.length).join(""))
        }

        if (!!this.wsServer)
            this.connectServer();

    }

    /**
     * 重置窗口大小
     */
    resizeWindow() {

        this.viewport.appendChild(this.measureDiv);
        const width = this.measureDiv.getBoundingClientRect().width;
        this._columns = Math.floor(width / this._charWidth);
        this.measureDiv.remove();

        // 计算高度
        const height = this.container.getBoundingClientRect().height;
        this._rows = Math.floor(height / this._charHeight);

        // 更新缓冲区
        let fragment = this.parser.bufferSet.resize(this.rows, this.columns);
        if (fragment) this.viewport.appendChild(fragment);

        this.resizeRemote();

        // 滚动到底部
        this.scrollToBottom();

    }

    /**
     * 重置终端大小
     */
    resizeRemote() {

        // 设置宽度
        if (this.transceiver) {

            this.transceiver.send(JSON.stringify({
                size: {
                    w: this.columns,
                    h: this.rows
                }
            }));
        }
    }

    /**
     * 修改字符宽度
     * @param value
     */
    set charWidth(value: number) {
        this._charWidth = value;

        // 获取行数
        this.viewport.appendChild(this.measureDiv);

        console.info("value:" + value);

        const width = this.measureDiv.getBoundingClientRect().width;
        this._columns = Math.floor(width / value);

        Styles.add(".len2", {
            "width": value * 2 + "px"
        }, this.instanceId);

        this.measureDiv.remove();
    }


    get columns(): number {
        return this._columns;
    }

    get rows(): number {
        return this._rows;
    }

    /**
     * 修改字符高度
     * @param value
     */
    set charHeight(value: number) {
        this._charHeight = value;

        Styles.add(".len2", {
            "height": value + "px",
            "line-height": value + "px"
        }, this.instanceId);

        Styles.add(".viewport-row", {
            "height": value + "px",
            "line-height": value + "px"
        }, this.instanceId);

        // 计算高度
        const height = this.container.getBoundingClientRect().height;
        this._rows = Math.floor(height / value);

        Styles.add(".presentation", {
            "height": (height - this._rows * value) + "px"
        }, this.instanceId);

    }


    get charWidth(): number {
        return this._charWidth;
    }

    get charHeight(): number {
        return this._charHeight;
    }

    /**
     * 打开服务器
     * @param hostname
     * @param username
     * @param password
     * @param port
     * @param pkey
     */
    open(hostname: string,
         username: string,
         password: string,
         port: number = 22,
         pkey: string = ""): Terminal {

        // 加入等待初始化完成？
        this.sshServerInfo.hostname = hostname;
        this.sshServerInfo.username = username;
        this.sshServerInfo.password = password;
        this.sshServerInfo.port = port;
        this.sshServerInfo.pkey = pkey;

        return this;
    }

    /**
     * 连接SSH服务器
     */
    private connectServer() {


        // this.sshWorker.postMessage({
        //     "type": "ssh",
        //     "target": {
        //         hostname: this.sshServerInfo.hostname,
        //         username: this.sshServerInfo.username,
        //         password: this.sshServerInfo.password,
        //         port: this.sshServerInfo.port
        //     },
        //     "size": {
        //         w: this.columns,
        //         h: this.rows
        //     },
        //     "term": this.preferences.terminalType,
        //     "sshType": '!sftp'
        // });
        //
        // this.sshWorker.onmessage = (e) => {
        //     let data = e.data;
        //     switch (data["type"]) {
        //         case "socket":
        //             break;
        //         case "get":
        //             this.messageQueue.push(data["data"]);
        //             this.startPrinter();
        //             break;
        //         case "sshVersion":
        //             console.info("ssh version is " + data["data"]);
        //             break;
        //     }
        //
        // };

        this.transceiver.open().then((e: any) => {
            console.info(e);
            // 连接成功

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
            if(e instanceof Event){
                console.info('连接错误！');
            } else if(e instanceof CloseEvent){
                console.info('连接关闭！');
            }

        });
    }

    /**
     * 打印文本
     * @param text
     */
    echo(text: string) {
        if (!this.isReady) {
            setTimeout(() => {
                this.parser.parse(text);
            }, 1000);
        } else {
            this.parser.parse(text);
        }
    }

    /**
     * 将数据写入终端，这个方法会等待终端就绪。
     */
    write(text: string) {
        if (!!text)
            this.messageQueue.push(text);
        return this;
    }

    /**
     * 启动打印机
     */
    startPrinter() {

        if (this.messageQueueTimer) {
            return;
        }

        // let waiting = false;

        this.messageQueueTimer = setInterval(() => {

            // 如果终端没有就绪的话，就不要输出。
            if(!this.isReady){
                clearInterval(this.messageQueueTimer);
                this.messageQueueTimer = 0;
                return;
            }

            const len = this.messageQueue.length;
            if(len == 0) {
                clearInterval(this.messageQueueTimer);
                this.messageQueueTimer = 0;
            } else {
                // if(waiting){
                //     console.info("waiting...", len);
                //     return;
                // }
                // waiting = true;
                const chunk = this.messageQueue.splice(0, len);
                this.echo(chunk.join(""));
                // waiting = false;
            }

        }, 0);
    }

    /**
     * 虚拟响铃，通过修改背景颜色实现。
     */
    bell() {
        this.container.style.backgroundColor = this.preferences.visualBellColor;
        this.container.style.transition = "0.25s";
        setTimeout(() => {
            this.container.style.backgroundColor = "";
            this.container.style.transition = "";
        }, 250);

    }

    /**
     * 终端获取焦点
     */
    focus(): void {
        this.cursor.focus = true;
    }

    /**
     * 终端失去焦点
     */
    blur(): void {
        this.cursor.focus = false;
    }

    /**
     * 反转颜色
     */
    reverseVideo() {
        CommonUtils.addClass(this.container, 'inverse');
    }

    /**
     * 正常颜色
     */
    normalVideo() {
        CommonUtils.removeClass(this.container, 'inverse');
    }

    /**
     * 显示光标
     */
    showCursor() {
        this.cursor.show = true;
    }

    /**
     * 隐藏光标
     */
    hideCursor() {
        // console.info("hideCursor...");
        // this.cursor.show = false;
    }

    /**
     * 当输入的时候，滚动到底部。
     */
    scrollToBottomOnInput() {

        if (this.preferences.scrollToBottomOnInput && this._enableScrollToBottom) {
            this.scrollToBottom();
        }

    }

    /**
     * 滚动到底部
     */
    scrollToBottom() {
        this.container.scrollTop = this.container.scrollHeight;
    }

    /**
     * 将缓冲区的所有行添加到viewport
     */
    addBufferFillRows() {

        let fragment = document.createDocumentFragment();
        const lines = this.bufferSet.activeBuffer.lines;
        for (let i = 0, len = lines.length; i < len; i++) {
            fragment.appendChild(lines[i].element);
        }
        this.viewport.appendChild(fragment);
    }

    /**
     * 注册重新连接事件
     */
    registerConnect() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                // 按了回车键
                if (this.transceiver)
                    this.transceiver.send(JSON.stringify({cmd: '\x0d'}));
            }
            e.stopPropagation();
            e.preventDefault();
        });
    }

}
