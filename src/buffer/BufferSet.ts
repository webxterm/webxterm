import {Buffer} from "./Buffer";
import {BufferLine} from "./BufferLine";
import {DataBlock} from "./DataBlock";

// http://invisible-island.net/xterm/ctlseqs/ctlseqs.html#h2-The-Alternate-Screen-Buffer
export class BufferSet {

    private _normal: Buffer | undefined;
    private _alt: Buffer | undefined;
    private _activeBuffer: Buffer | undefined;

    init(rows: number, columns: number){
        // 默认缓冲区
        this._normal = new Buffer(rows, columns, true, "normal");
        this._normal.fillRows();

        // 备用缓冲区
        this._alt = new Buffer(rows, columns, false, "alt");
        this._activeBuffer = this._normal;
    }

    get normal(): Buffer {
        return <Buffer>this._normal;
    }

    get alt(): Buffer {
        return <Buffer>this._alt;
    }

    get activeBuffer(): Buffer {
        return <Buffer>this._activeBuffer;
    }

    get activeBufferLine(): BufferLine {
        if(!this._activeBuffer){
            throw new Error("_activeBuffer is " + this._activeBuffer);
        }

        return this._activeBuffer.get(this._activeBuffer.y);
    }

    get size(): number {
        if(!this._activeBuffer){
            throw new Error("_activeBuffer is " + this._activeBuffer);
        }
        return this._activeBuffer.lines.length;
    }

    /**
     * 切换到默认缓冲区
     */
    activateNormalBuffer(){
        if(this._activeBuffer === this._normal) return;
        this._activeBuffer = this._normal;
    }

    /**
     * 切换到备用缓冲区
     */
    activateAltBuffer(){

        if(this._activeBuffer === this._alt) return;

        // ==> 为了解决内容没有充满缓冲区的时候，切换切换到备用缓冲区的时候，会有一段的空白。

        // 删除默认缓冲区没有使用过的行
        if(!this._normal){
            throw new Error("_normal is " + this._normal);
        }

        if(!this._alt){
            throw new Error("_alt is " + this._alt);
        }

        for(let i = 0; i < this._normal.size; i++){
            let line: BufferLine = this._normal.lines[i];
            if(line && !line.used){
                // 没有试过用
                line.element.remove();
            }
        }

        this._alt.clear();

        this._alt.reset();
        this._alt.fillRows();

        this._activeBuffer = this._alt;
    }

    /**
     * 重置窗口大小
     * @param newRows
     * @param newCols
     */
    resize(newRows: number, newCols: number): DocumentFragment | undefined {

        if(this.isNormal){
            // 使用默认缓冲区
            if(this._alt)
                this._alt.resize(newRows, newCols);
            if(this._normal)
                return this._normal.resize(newRows, newCols);
        } else {
            // 使用备用缓冲区
            if(this._normal)
                this._normal.resize(newRows, newCols);
            if(this._alt)
                return this._alt.resize(newRows, newCols);
        }
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
        if(this._normal)
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
                str += block.data;
            }
            return str + "\r\n";
        }

        if(!this._normal){
            throw new Error("_normal is " + this._normal);
        }

        for(let savedLine of this._normal.savedLines){
            strings += printLine(savedLine);
        }

        // 如果当前的缓冲区是备用缓冲区的话，需要将默认的缓冲区的内容也输出、
        if(this.isAlt){
            for(let bufferLine of this._normal.lines){
                strings += printLine(bufferLine);
            }
        }

        for(let bufferLine of this.activeBuffer.lines){
            strings += printLine(bufferLine);
        }

        return strings;

    }
}