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

export enum FocusTarget {
    CONTAINER,  // 容器
    CLIPBOARD   // 粘贴板
}

export class Terminal {

    private _preferences: Preferences;
    private eventMap: { [key: string]: any } = {};

    // 终端实例
    private readonly instance: HTMLElement;

    private readonly _instanceId: string = "";

    // 终端实例类名
    public static brand: string = "webxterm";
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

    private transceiver: Transceiver | undefined;

    // 消息队列定时器
    private messageQueueTimer: number = 0;

    private parser: Parser;
    private eventHandler: EventHandler;

    private _focusTarget: FocusTarget = FocusTarget.CONTAINER;

    constructor(args: { [key: string]: any }) {
        const now = new Date();
        const today = new Date(now.getFullYear() + "-" + (now.getMonth() + 1) + "-" + now.getDate()).getTime();
        this._instanceId = "ins_" + (now.getTime() - today);

        this.instance = args["instance"];
        this.onRender = args["render"];
        this.wsServer = args["wsServer"];

        this._preferences = new Preferences();
        this._preferences.init(this._instanceId);

        this.initViewPort();

        this.parser = new Parser(this);
        this.eventHandler = new EventHandler(this);
        this.eventHandler.listen();
    }

    // 回调函数绑定
    on(typeName: string | { [key: string]: any }, listener?: (args: object) => void): Terminal {
        if (typeof typeName === 'string') {
            if (listener) {
                this.eventMap[typeName] = listener;
            }
        } else if (typeof typeName === 'object') {
            for (let key in typeName) {
                const sk = key + "";
                this.eventMap[sk] = typeName[sk];
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
        this.charWidth = 9.633331298828125;
        this.charHeight = 19;

        // 渲染完成
        this.onRender({
            'type': 'render',
            'instance': this
        });

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

    set focusTarget(value: FocusTarget) {
        this._focusTarget = value;
    }



    /**
     * 获取字符的宽度和高度
     */
    private measure(): void {

        this._viewport.appendChild(this.measureDiv);
        this.measureSpan.innerHTML = 'W';
        this.measureSpan.className = 'measure';
        this.measureDiv.appendChild(this.measureSpan);

        let rect = this.measureSpan.getBoundingClientRect();
        this.charWidth = rect.width;
        this.charHeight = rect.height;

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

        let rowRect = this.measureDiv.getBoundingClientRect();
        this._columns = Math.floor(rowRect.width / value);
        let paddingRight = rowRect.width - this._columns * value;

        Styles.add(".viewport", {
            "padding-right": paddingRight + "px"
        }, this._instanceId);

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
    }


    get charWidth(): number {
        return this._charWidth;
    }

    get charHeight(): number {
        return this._charHeight;
    }

    public open(hostname: string,
                username: string,
                password: string,
                port: number = 22,
                pkey: string = ""): Terminal {


        this.transceiver = new Transceiver(this.wsServer, this);
        this.transceiver.open().then((e: any) => {
            console.info(e);

            if(this.transceiver){
                this.transceiver.send(JSON.stringify({
                    target: {
                        hostname: hostname,
                        username: username,
                        password: password,
                        port: port
                    },
                    size: {
                        w: 80,
                        h: 24
                    },
                    term: 'xterm',
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
    public echo(text: string) {

        //
        console.info("echo:" + text);

        this.parser.parse(text);


    }

    /**
     * 启动打印机
     */
    public startPrinter() {

        if (!!this.messageQueueTimer) return;

        this.messageQueueTimer = setInterval(() => {

            if(this.transceiver) {

                let chunk = this.transceiver.chunk;

                if (chunk.length > 0) {
                    this.echo(chunk.join(""));
                } else {
                    clearInterval(this.messageQueueTimer);
                    this.messageQueueTimer = 0;
                }
            }
        }, 0);
    }

    public bell(): void{

    }

    public focus(): void {

    }

    public reverseVideo() : void {

    }

    public normalVideo() : void {

    }

    public showCursor() : void {

    }

    public hideCursor(): void {

    }


    get preferences(): Preferences {
        return this._preferences;
    }
}
