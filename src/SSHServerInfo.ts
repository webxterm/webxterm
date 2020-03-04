export class SSHServerInfo {

    private _hostname: string = "";
    private _username: string = "";
    private _password: string = "";
    private _port: number = 22;
    private _pkey: string = ""


    get hostname(): string {
        return this._hostname;
    }

    set hostname(value: string) {
        this._hostname = value;
    }

    get username(): string {
        return this._username;
    }

    set username(value: string) {
        this._username = value;
    }

    get password(): string {
        return this._password;
    }

    set password(value: string) {
        this._password = value;
    }

    get port(): number {
        return this._port;
    }

    set port(value: number) {
        this._port = value;
    }

    get pkey(): string {
        return this._pkey;
    }

    set pkey(value: string) {
        this._pkey = value;
    }
}