import {Buffer} from "./Buffer";
import {BufferLine} from "./BufferLine";
import {DataBlock} from "./DataBlock";

// http://invisible-island.net/xterm/ctlseqs/ctlseqs.html#h2-The-Alternate-Screen-Buffer

export class BufferSet {

    private readonly _normal: Buffer;
    private readonly _alt: Buffer;
    private _activeBuffer: Buffer;

    constructor(rows: number, columns: number) {

        // 默认缓冲区
        this._normal = new Buffer(rows, columns, true, "normal");
        this._normal.fillRows();

        // 备用缓冲区
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

    get size(): number {
        return this._activeBuffer.lines.length;
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

    /**
     * 生成日志
     * 打印所有行
     * 保存的行和缓冲区的行
     */
    printAllLines(){

        let strings = "";
        
        function printLine(line: BufferLine) {
            let str = "";
            for(let block of line.blocks){
                if(block instanceof DataBlock){
                    str += block.data;
                }
            }
            return str + "\r\n";
        }

        for(let savedLine of this._normal.savedLines){
            strings += printLine(savedLine);
        }

        for(let bufferLine of this.activeBuffer.lines){
            strings += printLine(bufferLine);
        }

        return strings;

    }
}