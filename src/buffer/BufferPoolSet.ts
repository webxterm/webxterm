import {BufferPool} from "./BufferPool";
import {Buffer} from "./Buffer";

// http://invisible-island.net/xterm/ctlseqs/ctlseqs.html#h2-The-Alternate-Screen-Buffer
export class BufferPoolSet {

    private _normal: BufferPool | undefined;
    private _alt: BufferPool | undefined;
    private _activeBuffer: BufferPool | undefined;

    init(rows: number, columns: number) {
        // 默认缓冲区
        this._normal = new BufferPool(rows, columns, true, "normal");
        this._normal.fillRows();

        // 备用缓冲区
        this._alt = new BufferPool(rows, columns, false, "alt");
        this._activeBuffer = this._normal;
    }

    get normal(): BufferPool {
        return <BufferPool>this._normal;
    }

    get alt(): BufferPool {
        return <BufferPool>this._alt;
    }

    get activeBuffer(): BufferPool {
        return <BufferPool>this._activeBuffer;
    }

    get absY(): number {
        return this.activeBuffer.y + this.normal.saved_buffer.size;
    }

    // get activeBufferLine(): HTMLElement {
    //     if(!this._activeBuffer){
    //         throw new Error("_activeBuffer is " + this._activeBuffer);
    //     }
    //
    //     return this._activeBuffer.get(this._activeBuffer.y);
    // }

    get size(): number {
        if (!this._activeBuffer) {
            throw new Error("_activeBuffer is " + this._activeBuffer);
        }
        return this._activeBuffer.size;
    }

    /**
     * 切换到默认缓冲区
     */
    activateNormalBuffer() {
        if (this._activeBuffer === this._normal) {
            return;
        }
        this._activeBuffer = this._normal;
    }

    /**
     * 切换到备用缓冲区
     */
    activateAltBuffer() {

        if (this._activeBuffer === this._alt) {
            return;
        }

        // ==> 为了解决内容没有充满缓冲区的时候，切换切换到备用缓冲区的时候，会有一段的空白。

        // 删除默认缓冲区没有使用过的行
        if (!this._normal) {
            throw new Error("_normal is " + this._normal);
        }

        if (!this._alt) {
            throw new Error("_alt is " + this._alt);
        }

        // for(let i = 0; i < this._normal.size; i++){
        //     let line: Buffer = this._normal.lines[i];
        //     if(line && !line.used){
        //         // 没有试过用
        //         line.element.remove();
        //     }
        // }
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
    resize(newRows: number, newCols: number) {

        // if(this.isNormal){
        //     // 使用默认缓冲区
        //     if(this._alt)
        //         this._alt.resize(newRows, newCols);
        //     if(this._normal)
        //         this._normal.resize(newRows, newCols);
        // } else {
        //     // 使用备用缓冲区
        //     if(this._normal)
        //         this._normal.resize(newRows, newCols);
        //     if(this._alt)
        //         this._alt.resize(newRows, newCols);
        // }
        if (this.isNormal) {
            if (this._normal) this._normal.resize(newRows, newCols);
            if (this._alt) this._alt.resize_wait = true;
        } else {
            if (this._normal) this._normal.resize_wait = true;
            if (this._alt) this._alt.resize(newRows, newCols);
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
        return this._activeBuffer === this._normal;
    }

    /**
     * 清除回滚的行
     */
    clearSavedLines() {
        // if(this._normal)
        //     this._normal.clearSavedLines();
    }

    /**
     * 生成日志
     * 打印所有行
     * 保存的行和缓冲区的行
     */
    printAllLines() {

        // let strings = "";
        //
        // function printLine(line: Buffer) {
        //     let str = "";
        //     for(let block of line.blocks){
        //         str += block.data;
        //     }
        //     return str + "\r\n";
        // }
        //
        // if(!this._normal){
        //     throw new Error("_normal is " + this._normal);
        // }
        //
        // for(let savedLine of this._normal.savedLines2){
        //     strings += savedLine;
        // }
        //
        // // 如果当前的缓冲区是备用缓冲区的话，需要将默认的缓冲区的内容也输出、
        // if(this.isAlt){
        //     for(let bufferLine of this._normal.lines){
        //         strings += printLine(bufferLine);
        //     }
        // }
        //
        // for(let bufferLine of this.activeBuffer.lines){
        //     strings += printLine(bufferLine);
        // }
        //
        // return strings;

    }

    // getDocument(): void {
    //     //
    //     // document
    //     //
    //     /**
    //      * ********************************** *
    //      *                                    *
    //      *            saved_buffer            *
    //      *                                    *
    //      * ********************************** * ********************************** *
    //      *                                    *                                    *
    //      *           change_buffer            *            change_buffer           *
    //      *                                    *                                    *
    //      * ********************************** * ********************************** *
    //      *          NORMAL                                  ALT
    //      *
    //      */
    //     this.normal.saved_buffer
    // }


    /**
     * 更新选择版本
     * @param startIndex 开始的索引
     * @param end 结束
     * @param version 版本
     */
    updateSelectVersion(startIndex: number, end: number, version: number): void {

        const saved_buffer_end = this.normal.saved_buffer.size,
            normal_buffer_end = saved_buffer_end + this.normal.change_buffer.size,
            alt_buffer_end = normal_buffer_end + this.alt.change_buffer.size;

        if (startIndex < saved_buffer_end) {
            let i = startIndex;
            if (end <= saved_buffer_end) {
                // 1, startIndex -> end 在保留区内
                // ----------
                // -        -    <----| startIndex  120
                // -        -
                // -        -
                // - saved  -    <----| end         140
                // ----------
                // -        -
                // -  nor   -
                // ----------
                for (; i < end; i++) {
                    this.normal.saved_buffer.lineVersions[i] = version;
                }
            } else {
                // 2, startIndex -> 在保留区内，end 在默认缓冲区内
                // ----------
                // -        -
                // - saved  -    <----| startIndex 120
                // ----------
                // -        -
                // -  nor   -    <----| end        140
                // ----------
                for (; i < saved_buffer_end; i++) {
                    this.normal.saved_buffer.lineVersions[i] = version;
                }
                // 默认缓冲区从0开始
                for (let j = 0; i < end; i++, j++) {
                    this.normal.change_buffer.lineVersions[j] = version;
                }
            }

            return;
        }

        let i = startIndex, j = startIndex - saved_buffer_end;
        if (end <= normal_buffer_end) {
            // 3, startIndex -> 在默认缓冲区内，end 在默认缓冲内
            // ----------
            // -        -
            // - saved  -
            // ----------   <----| startIndex  120
            // -        -
            // -  nor   -
            // ----------   <----| end         140

            for (; i < end; i++, j++) {
                this.normal.change_buffer.lineVersions[j] = version;
            }
        } else if (end < alt_buffer_end && startIndex < normal_buffer_end) {
            // 4, startIndex -> 在默认缓冲区内，end 在备用缓冲区内
            // ----------
            // -        -
            // - saved  -
            // ----------
            // -        -   <----| startIndex  120
            // -  nor   -
            // ----------
            // -        -   <----| end         140
            // -  alt   -
            // ----------
            for (; i < normal_buffer_end; i++, j++) {
                this.normal.change_buffer.lineVersions[j] = version;
            }
            // 备用缓冲区从0开始
            for (let j = 0; i < end; i++, j++) {
                this.alt.change_buffer.lineVersions[j] = version;
            }
        } else {
            // 5, startIndex -> 在备用缓冲区内，end 在备用缓冲区内
            // ----------
            // -        -
            // - saved  -
            // ----------
            // -        -
            // -  nor   -
            // ----------   <----| startIndex  120
            // -        -
            // -  alt   -
            // ----------   <----| end         140
            j -= normal_buffer_end;
            for (; i < end; i++, j++) {
                this.alt.change_buffer.lineVersions[j] = version;
            }
        }

    }

    /**
     * 获取当前需要显示的缓冲区
     * @param startIndex 开始的行索引
     * @param end 结束行
     */
    getDisplayBuffer(startIndex: number, end: number): Buffer{

        const buffer = new Buffer();

        const saved_buffer_end = this.normal.saved_buffer.size,
            normal_buffer_end = saved_buffer_end + this.normal.change_buffer.size,
            alt_buffer_end = normal_buffer_end + this.alt.change_buffer.size;

        if (startIndex < saved_buffer_end) {

            if (end <= saved_buffer_end) {
                // 1, startIndex -> end 在保留区内
                // ----------
                // -        -    <----| startIndex  120
                // -        -
                // -        -
                // - saved  -    <----| end         140
                // ----------
                // -        -
                // -  nor   -
                // ----------

                buffer.copyFrom(this.normal.saved_buffer, startIndex, end);
            } else {
                // 2, startIndex -> 在保留区内，end 在默认缓冲区内
                // ----------
                // -        -
                // - saved  -    <----| startIndex 120
                // ----------
                // -        -
                // -  nor   -    <----| end        140
                // ----------
                buffer.copyFrom(this.normal.saved_buffer, startIndex, saved_buffer_end);

                // 默认缓冲区从0开始
                buffer.copyFrom(this.normal.change_buffer, 0, end - saved_buffer_end);
            }

            return buffer;
        }

        let start = startIndex - saved_buffer_end;

        if (end <= normal_buffer_end) {
            // 3, startIndex -> 在默认缓冲区内，end 在默认缓冲内
            // ----------
            // -        -
            // - saved  -
            // ----------   <----| startIndex  120
            // -        -
            // -  nor   -
            // ----------   <----| end         140

            buffer.copyFrom(this.normal.change_buffer, start, end - saved_buffer_end);

        } else if (end < alt_buffer_end && startIndex < normal_buffer_end) {
            // 4, startIndex -> 在默认缓冲区内，end 在备用缓冲区内
            // ----------
            // -        -
            // - saved  -
            // ----------
            // -        -   <----| startIndex  120
            // -  nor   -
            // ----------
            // -        -   <----| end         140
            // -  alt   -
            // ----------

            buffer.copyFrom(this.normal.change_buffer, start, normal_buffer_end - saved_buffer_end);

            // 备用缓冲区从0开始
            buffer.copyFrom(this.alt.change_buffer, 0, end - normal_buffer_end);

        } else {
            // 5, startIndex -> 在备用缓冲区内，end 在备用缓冲区内
            // ----------
            // -        -
            // - saved  -
            // ----------
            // -        -
            // -  nor   -
            // ----------   <----| startIndex  120
            // -        -
            // -  alt   -
            // ----------   <----| end         140

            start = startIndex - normal_buffer_end;
            buffer.copyFrom(this.alt.change_buffer, start, end - startIndex);

        }

        return buffer;

    }
}