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
import {EventHandler} from "./EventHandler";
import {Cursor} from "./Cursor";
import {Printer} from "./Printer";
import {BufferSet} from "./buffer/BufferSet";

export class Terminal {

    private readonly _preferences: Preferences;
    private _eventMap: { [key: string]: any } = {};

    // 终端实例
    private readonly instance: HTMLElement;

    private readonly _instanceId: string = "";

    // 终端实例类名
    static brand: string = "webxterm";
    // 终端容器
    private readonly _container: HTMLDivElement = document.createElement("div");
    // 视图
    private readonly _viewport: HTMLDivElement = document.createElement("div");
    // 待提交
    private readonly _presentation: HTMLDivElement = document.createElement("div");
    // 粘贴板
    private readonly _clipboard: HTMLTextAreaElement = document.createElement("textarea");

    // 视图初始化完成
    private readonly onRender: Function;

    // 字符
    private measureSpan: HTMLSpanElement = document.createElement("span");
    // 行
    private measureDiv: HTMLSpanElement = document.createElement("div");

    // 字符尺寸
    private _charWidth: number = 0;
    private _charHeight: number = 0;

    // 列数
    private _columns: number = 0;
    // 行数
    private _rows: number = 0;

    private styles: Styles = Styles.getStyles();

    // 是否可用
    private enable: boolean = true;

    // Websocket服务器
    private readonly wsServer: string;

    private _transceiver: Transceiver | undefined;

    // 消息队列定时器
    private messageQueueTimer: number = 0;

    private readonly _parser: Parser;
    private eventHandler: EventHandler;

    private readonly _cursor: Cursor;

    private _scrollToBottom: boolean = true;

    // 是否已经初始化
    init: boolean = false;

    // 打印机
    private readonly _printer: Printer;

    // 缓冲区
    private readonly _bufferSet: BufferSet;

    constructor(args: { [key: string]: any }) {
        const now = new Date();
        const today = new Date(now.getFullYear() + "-" + (now.getMonth() + 1) + "-" + now.getDate()).getTime();
        this._instanceId = "ins_" + Math.abs(now.getTime() - today);

        this.instance = args["instance"];
        this.onRender = args["render"];
        this.wsServer = args["wsServer"];

        // 光标
        this._cursor = new Cursor(this._instanceId);

        this._preferences = new Preferences(this);
        this._preferences.init();

        this.initViewPort();

        this._parser = new Parser(this);
        this.eventHandler = new EventHandler();
        this.eventHandler.listen(this);

        // 设置活跃缓冲区为当前的默认缓冲区
        this._bufferSet = new BufferSet(this.rows, this.columns);
        this.addBufferFillRows();

        this._printer = new Printer(this);

    }

    // 回调函数绑定
    on(typeName: string | { [key: string]: any }, listener?: (args: object) => void): Terminal {
        if (typeof typeName === 'string') {
            if (listener) {
                this._eventMap[typeName] = listener;
            }
        } else if (typeof typeName === 'object') {
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
        this.instance.setAttribute("instance", this._instanceId);

        // 终端容器
        this.instance.appendChild(this._container);
        this._container.className = "container";

        // 视图
        this._container.appendChild(this._viewport);
        this._viewport.className = "viewport";

        // 待提交区域
        this._container.appendChild(this._presentation);
        this._presentation.className = "presentation";

        // 粘贴板
        this._presentation.appendChild(this._clipboard);
        this._clipboard.className = "clipboard";


        // 默认字符大小
        [this.charWidth, this.charHeight] = Preferences.fontSizes[Preferences.defaultFontSize];

        // 渲染完成
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
            if (document.readyState === "complete") {
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
        if (document.readyState === "complete" || event.type === 'load') {
            setTimeout(() => {
                this.ready();
            }, 1000);
        }
    }

    private ready(): void {
        console.info('ready...');
        // 获取字符的尺寸
        this.measure();

        this.startPrinter();
    }


    get viewport(): HTMLDivElement {
        return this._viewport;
    }


    get presentation(): HTMLDivElement {
        return this._presentation;
    }

    get container(): HTMLDivElement {
        return this._container;
    }

    get clipboard(): HTMLTextAreaElement {
        return this._clipboard;
    }

    get instanceId(): string {
        return this._instanceId;
    }

    get parser(): Parser {
        return this._parser;
    }

    get printer(): Printer {
        return this._printer;
    }

    set scrollToBottom(value: boolean) {
        this._scrollToBottom = value;
    }

    get preferences(): Preferences {
        return this._preferences;
    }

    get eventMap(): { [p: string]: any } {
        return this._eventMap;
    }

    get bufferSet(): BufferSet {
        return this._bufferSet;
    }

    /**
     * 获取字符的宽度和高度
     */
    measure(): void {

        this._viewport.appendChild(this.measureDiv);
        this.measureSpan.innerHTML = 'W';
        this.measureSpan.className = 'measure';
        this.measureDiv.appendChild(this.measureSpan);

        let rect = this.measureSpan.getBoundingClientRect();
        this.charWidth = rect.width;
        this.charHeight = rect.height;

        console.info('修改尺寸：' + this.rows + "," + this.columns);

        this.resizeRemote();

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

        this.resizeRemote();

    }

    /**
     * 重置终端大小
     */
    resizeRemote(){

        // 设置宽度
        if(this.transceiver){
            this.parser.bufferSet.resize(this.rows, this.columns);
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
        this._viewport.appendChild(this.measureDiv);

        console.info("value:" + value);

        const width = this.measureDiv.getBoundingClientRect().width;
        this._columns = Math.floor(width / value);

        // let paddingRight = rowRect.width - this._columns * value;

        // Styles.add(".viewport", {
        //     "padding-right": paddingRight + "px"
        // }, this._instanceId);

        Styles.add(".len2", {
            "width": value * 2 + "px"
        }, this._instanceId);

        this.measureDiv.remove();
    }


    get columns(): number {
        return this._columns;
    }

    get rows(): number {
        return this._rows;
    }

    get cursor(): Cursor {
        return this._cursor;
    }

    get transceiver(): Transceiver | undefined {
        return this._transceiver;
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
        }, this._instanceId);

        Styles.add(".viewport-row", {
            "height": value + "px",
            "line-height": value + "px"
        }, this._instanceId);

        // 计算高度
        const height = this.container.getBoundingClientRect().height;
        this._rows = Math.floor(height / value);

        Styles.add(".presentation", {
            "height": (height - this._rows * value) + "px"
        }, this._instanceId);

    }


    get charWidth(): number {
        return this._charWidth;
    }

    get charHeight(): number {
        return this._charHeight;
    }

    open(hostname: string,
                username: string,
                password: string,
                port: number = 22,
                pkey: string = ""): Terminal {


        this._transceiver = new Transceiver(this.wsServer, this);
        this._transceiver.open().then((e: any) => {
            console.info(e);
            // 连接成功

            if(this._transceiver){
                this._transceiver.send(JSON.stringify({
                    target: {
                        hostname: hostname,
                        username: username,
                        password: password,
                        port: port
                    },
                    size: {
                        w: this.columns,
                        h: this.rows
                    },
                    term: this.preferences.terminalType,
                    type: '!sftp'
                }));
            }

        }).catch((e) => {

            console.info(e);
            if(e instanceof Event){
                console.info('连接错误！');
            } else if(e instanceof CloseEvent){
                console.info('连接关闭！');
            }

        });

        return this;
    }

    /**
     * 打印文本
     * @param text
     */
    echo(text: string) {

        //
        console.info("echo:" + text);

        this._parser.parse(text);


    }

    /**
     * 启动打印机
     */
    startPrinter() {

        if (!!this.messageQueueTimer) return;

        this.messageQueueTimer = setInterval(() => {

            if(this._transceiver) {

                let chunk = this._transceiver.chunk;

                if (chunk.length > 0) {
                    this.echo(chunk.join(""));
                } else {
                    clearInterval(this.messageQueueTimer);
                    this.messageQueueTimer = 0;
                }
            }
        }, 0);
    }

    bell(): void{

    }

    focus(): void {
        this._cursor.focus = true;
    }

    blur(): void {
        this._cursor.focus = false;
    }

    reverseVideo() : void {

    }

    normalVideo() : void {

    }

    showCursor() : void {
        this._cursor.show = true;
        // 处理当前的光标
    }

    hideCursor(): void {
        this._cursor.show = false;
    }

    scrollToBottomOnInput(): void {
        if(this._preferences.scrollToBottomOnInput && this._scrollToBottom){
            this.container.scrollTop = this.container.scrollHeight;
        }
    }

    addBufferFillRows(){

        let fragment = document.createDocumentFragment();
        const lines = this.bufferSet.activeBuffer.lines;
        for(let i = 0, len = lines.length; i < len; i++){
            fragment.appendChild(lines[i].element);
        }
        this.viewport.appendChild(fragment);
    }
    

}
