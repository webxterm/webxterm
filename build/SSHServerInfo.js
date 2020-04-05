"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SSHServerInfo {
    constructor() {
        this._hostname = "";
        this._username = "";
        this._password = "";
        this._port = 22;
        this._pkey = "";
    }
    get hostname() {
        return this._hostname;
    }
    set hostname(value) {
        this._hostname = value;
    }
    get username() {
        return this._username;
    }
    set username(value) {
        this._username = value;
    }
    get password() {
        return this._password;
    }
    set password(value) {
        this._password = value;
    }
    get port() {
        return this._port;
    }
    set port(value) {
        this._port = value;
    }
    get pkey() {
        return this._pkey;
    }
    set pkey(value) {
        this._pkey = value;
    }
}
exports.SSHServerInfo = SSHServerInfo;
