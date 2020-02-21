import {Buffer} from "./Buffer";
import {BufferLine} from "./BufferLine";
import {Printer} from "../../Printer";

export class BufferSet {

    private readonly _normal: Buffer;
    private readonly _alt: Buffer;
    private _activeBuffer: Buffer;

    constructor(rows: number, columns: number) {

        this._normal = new Buffer(rows, columns, true, "normal");

        // http://invisible-island.net/xterm/ctlseqs/ctlseqs.html#h2-The-Alternate-Screen-Buffer
        this._alt = new Buffer(rows, columns, false, "alt");
        this._alt.fillRows();
        this._activeBuffer = this._normal;


    }

    get normal(): Buffer {
        return this._normal;
    }

    get alt(): Buffer {
        return this._alt;
    }

    get activeBuffer(): Buffer {
        return this._activeBuffer;
    }

    get activeBufferLine(): BufferLine {
        return this._activeBuffer.get(this._activeBuffer.y);
    }

    /**
     * 切换到默认缓冲区
     */
    activateNormalBuffer(){

        if(this._activeBuffer === this._normal) return;

        this._normal.x = this._alt.x;
        this._normal.y = this._alt.y;

        this._alt.clear();

        this._activeBuffer = this._normal;
    }

    /**
     * 切换到备用缓冲区
     */
    activateAltBuffer(){

        if(this._activeBuffer === this._alt) return document.createDocumentFragment();

        this._alt.x = this._normal.x;
        this._alt.y = this._normal.y;

        this._activeBuffer = this._alt;
    }

    /**
     * 重置窗口大小
     * @param newRows
     * @param newCols
     */
    resize(newRows: number, newCols: number){
        this._normal.resize(newRows, newCols);
        this._alt.resize(newRows, newCols);
    }

    /**
     * 是否是备用缓冲区
     */
    get isAlt(): boolean {
        return this._activeBuffer === this._alt;
    }

    /**
     * 是否是默认缓冲区
     */
    get isNormal(): boolean {
        return  this._activeBuffer === this._normal;
    }

    /**
     * 清除回滚的行
     */
    clearSavedLines(){
        this._normal.clearSavedLines();
    }
}