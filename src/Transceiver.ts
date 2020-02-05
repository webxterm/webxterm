import {Terminal} from "./Terminal";

export class Transceiver {

    private readonly wsServer: string = "ws://127.0.0.1:88990";

    private _socket: WebSocket | undefined;

    // 数据缓冲区
    private _buffer: string[] = [];

    private _version: object | undefined;

    private terminal: Terminal;

    // 连接成功
    private connected: boolean = false;

    constructor(wsServer: string, terminal: Terminal) {
        if (!!wsServer)
            this.wsServer = wsServer;


        this.terminal = terminal;
    }

    /**
     * 连接到websocket服务器
     */
    public open(): Promise<any> {

        return new Promise((resolve, reject) => {

            this._socket = new WebSocket(this.wsServer);
            this._socket.onopen = (e) => {
                // 连接成功
                this.connected = true;
                resolve(e);
            };
            this._socket.onclose = (e) => {
                reject(e);
            };
            this._socket.onerror = (e) => {
                reject(e);
            };
            this._socket.onmessage = (e) => {
                if (!this._version) {
                    this._version = JSON.parse(e.data);
                } else {
                    this._buffer.push(e.data);
                    this.terminal.startPrinter();
                }
            };
        });
    }

    /**
     * 发送数据
     * @param data
     */
    public send(data: string): void {
        console.info("send.data>>>" + data);
        if (this._socket) {
            this._socket.send(data)
        }
    }


    get socket(): WebSocket | undefined {
        return this._socket;
    }

    /**
     * 获取缓冲区的数据
     */
    get buffer(): string[] {
        return this._buffer;
    }

    get chunk(): string[] {
        return this._buffer.splice(0, this._buffer.length);
    }

    /**
     * 获取版本号
     */
    get version(): object | undefined {
        return this._version;
    }

    public openSSH(
        hostname: string,
        port: number = 22,
        username: string,
        password: string,
        pkey: string = "") {

    }

}