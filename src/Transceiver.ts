import {Terminal} from "./Terminal";

export class Transceiver {

    private readonly wsServer: string = "ws://127.0.0.1:88990";

    private _socket: WebSocket | undefined;

    private _version: {[key: string] : string} | undefined;

    readonly terminal: Terminal;

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
                const message: string = e.data;
                console.info("message:", message);
                if (!this._version) {
                    // 有可能数据和下一个chunk合并返回的情况
                    const endIndex = message.indexOf("}") + 1;
                    this._version = JSON.parse(message.substring(message.indexOf("{"), endIndex));
                    if(message.length - 1 !== endIndex){
                        this.terminal.pushMessage(message.substring(endIndex));
                    }
                } else {
                    this.terminal.pushMessage(message);
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