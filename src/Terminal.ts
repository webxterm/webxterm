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
import {BufferSet} from "./buffer/BufferSet";
// import {EventLog} from "./input/EventLog";
import {EscapeSequenceParser} from "./parser/EscapeSequenceParser";
import {OscParser} from "./parser/OscParser";
import {SSHServerInfo} from "./SSHServerInfo";
import {CanvasSelection} from "./CanvasSelection";
import {Composition} from "./input/Composition";
import {CanvasTextRenderer} from "./renderer/CanvasTextRenderer";
import {CanvasSelectionRenderer} from "./renderer/CanvasSelectionRenderer";
import {CanvasCursorRenderer} from "./renderer/CanvasCursorRenderer";

export enum RenderType {
    HTML, CANVAS
}

export class Terminal {

    private _eventMap: { [key: string]: any } = {};

    // 和底部最小间隙，最大为1个charHeight.
    private readonly min_gap_with_bottom: number = 5;
    // private readonly max_viewport_margin: number = 3;
    private readonly viewport_margin_tb: number = 0;
    private readonly viewport_margin_lf: number = 3;

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
    // 是否已经初始化度量容器
    is_init_measure: boolean = false;

    // // 消息队列定时器
    private messageQueueTimer: number = 0;
    //
    readonly messageQueue: string[] = [];

    // 渲染类型
    readonly renderType: RenderType = RenderType.CANVAS;   // CANVAS
    // 终端实例
    readonly instance: HTMLElement;
    readonly instanceId: string = "";
    // 终端实例类名
    static brand: string = "webxterm";
    // 终端容器
    readonly container: HTMLDivElement = document.createElement("div");
    // 视图
    readonly viewport: HTMLDivElement = document.createElement("div");

    readonly textView: HTMLCanvasElement = document.createElement("canvas");        // 文本视图
    readonly selectionView: HTMLCanvasElement = document.createElement("canvas");   // 选择视图
    readonly cursorView: HTMLCanvasElement = document.createElement("canvas");      // 光标视图
    readonly blinkView: HTMLCanvasElement = document.createElement("canvas");       // 闪烁视图

    readonly scrollArea: HTMLDivElement = document.createElement("div");
    readonly scrollView: HTMLDivElement = document.createElement("div");

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

    // 渲染器
    // 文本渲染器、内容选择渲染器、光标渲染器
    textRenderer: CanvasTextRenderer | undefined;
    selectionRenderer: CanvasSelectionRenderer | undefined;
    cursorRenderer: CanvasCursorRenderer | undefined;

    // 缓冲区
    readonly bufferSet: BufferSet;
    // 时间记录器
    // readonly eventLog: EventLog;
    // 偏好设置
    private readonly _preferences: Preferences;
    // 连接的服务器信息
    readonly sshServerInfo: SSHServerInfo;
    // 终端提示符
    readonly prompt: string = "WebXterm>>> ";
    // // 发送接收器
    readonly transceiver: Transceiver;
    // Worker
    // readonly sshWorker: Worker;

    // 选择器
    readonly selection: CanvasSelection = new CanvasSelection();

    // 联想输入
    readonly composing: Composition = new Composition();
    readonly processComposing: Composition = new Composition();

    constructor(args: { [key: string]: any }) {
        // const now = new Date();
        // const today = new Date(now.getFullYear() + "-" + (now.getMonth() + 1) + "-" + now.getDate()).getTime();
        this.instanceId = "ins_" + new Date().getTime();

        this.instance = args["instance"];
        this.onRender = args["render"];
        this.wsServer = args["wsServer"] || "";
        this.prompt = args["prompt"] || "";
        // this.viewport_margin = args['margin'] || this.max_viewport_margin;

        if (this.wsServer.length == 0) {
            this.write(this.prompt);
        }

        this.greetings = args['greetings'] || "Welcome to WebXterm, a web Terminal Emulator.\r\n\r\n";


        // 光标
        this.cursor = new Cursor(this.instanceId);

        // 偏好设置
        this._preferences = new Preferences(this);
        this._preferences.init();

        if (!!args['scrollBack']) {
            this._preferences.scrollBack = args['scrollBack'];
        }

        this.cursor.blinking = this._preferences.cursorBlinking;
        this.cursor.enable = true;

        this.initViews();

        // 解析器
        this.parser = new Parser(this);
        this.esParser = new EscapeSequenceParser(this, this.parser);
        this.oscParser = new OscParser(this, this.parser);

        // 事件处理
        this.eventHandler = new EventHandler();
        this.eventHandler.listen(this);

        // 设置活跃缓冲区为当前的默认缓冲区
        this.bufferSet = new BufferSet();

        // 时间记录
        // this.eventLog = new EventLog();

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
        this.transceiver.enableHeartbeat = this._preferences.enableHeartbeat;
        this.transceiver.nextHeartbeatSeconds = this._preferences.nextHeartbeatSeconds;

        // if(this.viewport_margin > this.max_viewport_margin){
        //     throw new Error("无效的viewport_margin值" + this.viewport_margin + "，该值不能大于" + this.max_viewport_margin);
        // }

    }

    get preferences(): Preferences {
        return this._preferences;
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
    private initViews() {
        // 内部结构
        // --div.instance(容器)
        //      --div.container(滚动区域)
        //          --div.viewport(视图)
        //              --canvas.text-view
        //              --canvas.selection-view
        //              --canvas.cursor-view
        //          --div.presentation(待提交)
        //              --textarea.clipboard(粘贴板)

        CommonUtils.addClass(this.instance, Terminal.brand);
        this.instance.setAttribute("instance", this.instanceId);

        // 终端容器
        this.instance.appendChild(this.container);
        this.container.className = "container";

        // 初始化度量容器的
        this.measureSpan.innerHTML = 'W';
        this.measureSpan.className = 'measure';
        this.measureDiv.appendChild(this.measureSpan);

        if(this.renderType === RenderType.CANVAS){

            // 滚动容器
            this.scrollView.className = "scroll-view";
            this.scrollView.appendChild(this.scrollArea);
            // this.scrollView.style.overflowY = "scroll";

            this.scrollArea.className = "scroll-area";
            this.container.appendChild(this.scrollView);

            Styles.add(".container", {
                "overflow": "hidden"
            }, this.instanceId);

            // 视图
            this.container.appendChild(this.viewport);
            this.viewport.className = "viewport";
            this.viewport.setAttribute("spellcheck", "false");
            this.viewport.style.margin = this.viewport_margin_tb + "px " + this.viewport_margin_lf + "px";

            // 实际宽度：容器宽度 - 滚动条宽度 - 边距
            this.updateViewport();

        } else {
            // 视图
            this.container.appendChild(this.viewport);
            this.viewport.className = "viewport";
        }

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
        [this.charWidth, this.charHeight] = this._preferences.defaultFontSizeVal;

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

    /**
     * 添加行
     * @param newChild
     */
    private append(newChild: Node){
        if(this.renderType === RenderType.HTML) {
            this.viewport.appendChild(newChild);
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
     * 初始化渲染器
     */
    private initRenderer() {
        this.cursorRenderer = new CanvasCursorRenderer(this);
        this.textRenderer = new CanvasTextRenderer(this);
        this.selectionRenderer = new CanvasSelectionRenderer(this);
    }


    /**
     * 获取字符的宽度和高度
     */
    measure(): void {

        this.scrollView.appendChild(this.measureDiv);
        let rect = this.measureSpan.getBoundingClientRect();
        this.charWidth = rect.width;
        this.charHeight = rect.height;

        // 缓冲区初始化
        this.bufferSet.init(this.rows, this.columns);
        this.addBufferFillRows();
        // 第一行设置为已被使用。
        // this.bufferSet.activeBufferLine.used = true;
        // 设置最大滚动行数
        this.bufferSet.normal.maxScrollBack = this._preferences.scrollBack;

        // 终端已就绪
        if(!this.isReady){
            this.initRenderer();
            this.isReady = true;
        }


        if (!!this.greetings)
            this.echo(this.greetings);

        if (this.messageQueue.length > 0) {
            // this.startPrinter();
            this.echo(this.messageQueue.splice(0, this.messageQueue.length).join(""))
        }

        if (!!this.wsServer){
            this.connectServer();
        }

        if(this.measureDiv.isConnected) this.measureDiv.remove();
    }

    /**
     * 重置窗口大小
     */
    resizeWindow() {

        // 计算宽度
        const width = this.measureDivWidth;

        console.info("width:" + width + ", _charWidth:" + this._charWidth);
        this._columns = Math.floor(width / this._charWidth);
        this.measureDiv.remove();

        // 计算高度
        this.updateHeight(this._charHeight);

        // 更新缓冲区
        this.parser.bufferSet.resize(this.rows, this.columns);

        this.resizeRemote();

        if(this.renderType == RenderType.CANVAS){
            this.updateViewport();

            if(this.textRenderer) this.textRenderer.resize(this._rows, this._columns);
            if(this.cursorRenderer) this.cursorRenderer.resize(this._rows, this._columns);
            if(this.selectionRenderer) this.selectionRenderer.resize(this._rows, this._columns);

            // 计算滚动区的高度、
            this.updateScrollAreaHeight();

        } else if(this.renderType == RenderType.HTML){
            // if (fragment) this.viewport.appendChild(fragment);
        }

        // 重置
        if(this.selection.running){
            if(this.selectionRenderer) this.selectionRenderer.select(this.selection);
        }

        // 滚动到底部
        this.scrollToBottom();

    }

    // 计算滚动区的高度、
    updateScrollAreaHeight(){
        Styles.add(".scroll-view .scroll-area", {
            "height": this._charHeight * (this.bufferSet.normal.saved_buffer.lines.length + this.bufferSet.activeBuffer.size) + "px"
        }, this.instanceId);
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
     * 获取度量div的宽度
     */
    get measureDivWidth(){
        // 获取行数
        if(!this.measureDiv.parentElement){
            this.scrollView.appendChild(this.measureDiv);
        }
        return this.measureDiv.getBoundingClientRect().width
            - parseInt(this.viewport.style.marginLeft)
            - parseInt(this.viewport.style.marginRight);
    }

    /**
     * 修改字符宽度
     * @param value
     */
    set charWidth(value: number) {
        this._charWidth = value;

        console.info("value:" + value);

        const width = this.measureDivWidth;
        console.info("prop:charWidth: width:" + width + ", _charWidth:" + this._charWidth);
        this._columns = Math.floor(width / value);

        Styles.add(".len2", {
            "width": value * 2 + "px"
        }, this.instanceId);

        // if(this.measureDiv.isConnected) this.measureDiv.remove();
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
        if(this.renderType === RenderType.CANVAS){
            value += this._preferences.fontFamily.getLineHeight();
        }

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
        this.updateHeight(value);

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
        //         case "data":
        //             this.sshWorker.postMessage({
        //                 "type": "get"
        //             });
        //             break;
        //         case "get":
        //             this.messageQueue.push(data["data"]);
        //             this.startPrinter();
        //             break;
        //         case "sshVersion":
        //             console.info("ssh version is ", data["data"]);
        //             break;
        //     }
        //
        // };

        this.transceiver.open().then((e: any) => {
            console.info(e);
            // 连接成功
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
            if(e instanceof Event){
                this.eventMap["connect"]("fail", `无法建立到 ${this.wsServer} 服务器的连接。`);
            } else if(e instanceof CloseEvent){
                this.eventMap["connect"]("close", "连接关闭！");
            }

        });
    }

    /**
     * 打印文本
     * @param text
     * @param callback
     */
    echo(text: string, callback: Function | undefined = undefined) {
        if (!this.isReady) {
            setTimeout(() => {
                this.parser.parse(text, false, callback);
            }, 1000);
        } else {
            this.parser.parse(text, false, callback);
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

        this.messageQueueTimer = setInterval(() => {

            clearInterval(this.messageQueueTimer);
            this.messageQueueTimer = 0;

            // 如果终端没有就绪的话，就不要输出。
            if(!this.isReady){
                return;
            }
            const len = this.messageQueue.length;
            if(len > 0) {
                const chunk = this.messageQueue.splice(0, len);
                this.echo(chunk.join(""), () => {
                    // this.sshWorker.postMessage({
                    //     "type": "get"
                    // });
                    this.startPrinter();
                });
            }

        }, 0);

    }

    /**
     * 虚拟响铃，通过修改背景颜色实现。
     */
    bell() {
        if(this.renderType == RenderType.HTML){
            this.container.style.backgroundColor = this._preferences.visualBellColor;
            this.container.style.transition = "0.25s";
            setTimeout(() => {
                this.container.style.backgroundColor = "";
                this.container.style.transition = "";
            }, 250);
        }
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

        this.updateScrollAreaHeight();

        if (this._preferences.scrollToBottomOnInput && this._enableScrollToBottom) {
            this.scrollToBottom();
        }
    }

    /**
     * 滚动到底部
     */
    scrollToBottom() {
        if(this.renderType == RenderType.HTML){
            // this.container.scrollTop = this.container.scrollHeight;
        } else if(this.renderType == RenderType.CANVAS){
            this.scrollView.scrollTop = this.scrollView.scrollHeight;
        }

    }

    /**
     * 将缓冲区的所有行添加到viewport
     */
    addBufferFillRows() {

        if(this.renderType === RenderType.HTML){

            // let fragment = document.createDocumentFragment();
            // const lines = this.bufferSet.activeBuffer.lines;
            // for (let i = 0, len = lines.length; i < len; i++) {
            //     fragment.appendChild(lines[i]);
            // }
            // this.viewport.appendChild(fragment);

        } else if(this.renderType == RenderType.CANVAS){

            // 添加行

        }

    }

    /**
     * 注册重新连接事件
     */
    registerConnect() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                // 按了回车键
                // if (this.transceiver)
                //     this.transceiver.send(JSON.stringify({cmd: '\x0d'}));
            }
            e.stopPropagation();
            e.preventDefault();
        });
    }

    private updateViewport() {

        let width = this.scrollArea.getBoundingClientRect().width
            - parseInt(this.viewport.style.marginLeft)
            - parseInt(this.viewport.style.marginRight);

        Styles.add(".viewport", {
            "width": width + "px",
            "padding": "0",
            "z-index": "9997"
        }, this.instanceId);

        Styles.add(".scroll-view", {
            "overflow-y": "scroll",
            "z-index": "9998"
        }, this.instanceId);

        Styles.add(".presentation .clipboard", {
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

    updateHeight(value: number) {

        const height = this.container.getBoundingClientRect().height
            - parseInt(this.viewport.style.marginTop)
            - parseInt(this.viewport.style.marginBottom);

        // 行数
        this._rows = Math.floor(height / value);
        // 所有的行的高度
        let winHeight = this._rows * value;

        const gap = height - winHeight;
        if(gap < this.min_gap_with_bottom){
            // 小于最小间隙。
            this._rows -= 1;
            winHeight = this._rows * value;
        }

        const h = winHeight * this._preferences.canvasSizeMultiple;

        // this.viewport.style.height = winHeight + "px";
        // this.scrollArea.style.height = winHeight + "px";

        Styles.add(".viewport", {
            "height": winHeight + "px"
        }, this.instanceId);

        Styles.add(".scroll-view .scroll-area", {
            "height": winHeight + "px"
        }, this.instanceId);

        this.selectionView.height = h;
        this.cursorView.height = h;
        this.textView.height = h;

        Styles.add(".presentation", {
            "height": (height - winHeight) + "px"
        }, this.instanceId);

        // Styles.add(".scroll-view", {
        //     "margin-bottom": (height - winHeight) + "px"
        // }, this.instanceId);
    }

    /**
     * 获取滚动视图的scrollTop
     */
    get scrollViewScrollTop(): number{
        const scrollTop = this.scrollView.scrollTop
            , height = this.scrollView.getBoundingClientRect().height
            , viewport_height = this.viewport.getBoundingClientRect().height;

        // 当scrollTop == 0时，scrollTop + (height - viewport_height)不能大于一个行高(this._charHeight)。
        // 否则第一行无法显示。
        // height - viewport_height == viewport.marginTop + viewport.marginBottom + presentation.height
        return scrollTop + (height - viewport_height);
        // return this.scrollView.scrollTop;
    }

    /**
     * 判断是否滚动到底部
     */
    get isScrollToBottom(): boolean {
        return this.scrollView.scrollTop == this.scrollView.scrollHeight - this.scrollView.getBoundingClientRect().height;
    }

    /**
     * 获取当前的偏移量
     * 当前缓冲区中的第一个行离顶部的行数。
     * 内存缓冲区如下：
     *  memory buffer
     *  ---------------------
     * |                     |
     * |    saved lines      |
     * |                     |
     *  ---------------------
     * | ___ buffer line ___ |
     * |                     |
     * |       buffer        |
     * |                     |
     *  ---------------------
     * 通过上面buffer中可以看到，offset最小是0，最大是保留区的长度。
     */
    getOffsetTop(){
        return Math.ceil(this.scrollView.scrollTop / this.charHeight);
    }


}
