export class IdCounter {

    private static _instance: IdCounter = new IdCounter();

    private _count: number = 1;

    static get instance(){
        return IdCounter._instance;
    }

    get next(): number {
        this._count++;
        return this._count;
    }

    get get(): number{
        return this._count;
    }

}