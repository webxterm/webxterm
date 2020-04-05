"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Transceiver {
    constructor(wsServer, terminal) {
        this.wsServer = "ws://127.0.0.1:88990";
        this.keepAlive = false;
        this.heartbeatId = 0;
        this.enableHeartbeat = false;
        this.nextHeartbeatSeconds = 0;
        this._connected = false;
        if (!!wsServer)
            this.wsServer = wsServer;
        this.terminal = terminal;
    }
    open() {
        return new Promise((resolve, reject) => {
            this._socket = new WebSocket(this.wsServer);
            this._socket.onopen = (e) => {
                this._connected = true;
                resolve(e);
            };
            this._socket.onclose = (e) => {
                this._connected = false;
                reject(e);
            };
            this._socket.onerror = (e) => {
                this._connected = false;
                reject(e);
            };
            this._socket.onmessage = (e) => {
                const message = e.data;
                if (this.enableHeartbeat) {
                    this.stopHeartbeat();
                }
                if (!this._version) {
                    const endIndex = message.indexOf("}") + 1;
                    this._version = JSON.parse(message.substring(message.indexOf("{"), endIndex));
                    if (message.length - 1 !== endIndex) {
                        this.terminal.pushMessage(message.substring(endIndex));
                    }
                }
                else {
                    this.terminal.pushMessage(message);
                }
                if (this.enableHeartbeat) {
                    this.startHeartbeat();
                }
            };
        });
    }
    send(data) {
        if (this._socket) {
            this._socket.send(data);
        }
    }
    get socket() {
        return this._socket;
    }
    get version() {
        return this._version;
    }
    openSSH(hostname, port = 22, username, password, pkey = "") {
    }
    stopHeartbeat() {
        if (this.heartbeatId) {
            clearInterval(this.heartbeatId);
            this.heartbeatId = 0;
        }
    }
    startHeartbeat() {
        this.heartbeatId = setInterval(() => {
            if (this._socket) {
                this.send("\x1b^hello!\x1b\\");
            }
        }, this.nextHeartbeatSeconds * 1000);
    }
    get connected() {
        return this._connected;
    }
}
exports.Transceiver = Transceiver;
