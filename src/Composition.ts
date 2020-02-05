/**
 * 联想输入
 */
export class Composition {

    private _update: string = "";
    private _end: string = "";
    private _done: boolean = false;
    private _running: boolean = false;

    get update(): string {
        return this._update;
    }

    set update(value: string) {
        this._update = value;
    }

    get end(): string {
        return this._end;
    }

    set end(value: string) {
        this._end = value;
    }

    get done(): boolean {
        return this._done;
    }

    set done(value: boolean) {
        this._done = value;
    }

    get running(): boolean {
        return this._running;
    }

    set running(value: boolean) {
        this._running = value;
    }
}