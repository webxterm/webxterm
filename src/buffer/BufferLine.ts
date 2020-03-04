/**
 * bufferRow：存储多个block
 */
import {DataBlock} from "./DataBlock";
import {DataBlockAttribute} from "./DataBlockAttribute";

export class BufferLine {

    // 数据块
    private _blocks: DataBlock[] = [];

    // 是否为脏数据(未更新到元素中的数据)
    private _dirty: boolean = false;

    // HTML行
    private readonly _element: HTMLDivElement;

    // 列数
    private _cols: number;

    // 是否被使用过
    private _used: boolean = false;

    constructor(cols: number) {
        // @param cols 列数
        // @param afterNode 后面的元素编号，如果为""的话，直接添加到容器后面

        this._element = document.createElement("div");
        this._element.className = "viewport-row";

        this._cols = cols;
        for(let i = 0; i < cols; i++){
            this._blocks.push(DataBlock.newEmptyBlock());
        }

    }

    get element(): HTMLDivElement {
        return this._element;
    }

    get dirty(): boolean {
        return this._dirty;
    }

    set dirty(value: boolean) {
        this._dirty = value;
    }

    get blocks(): DataBlock[] {
        return this._blocks;
    }

    get used(): boolean {
        return this._used;
    }

    set used(value: boolean) {
        this._used = value;
    }

    get cols(): number {
        return this._cols;
    }

    set cols(value: number) {
        this._cols = value;
    }

    /**
     * 获取某一个块
     * @param x
     */
    get(x: number): DataBlock {
        return this._blocks[x - 1];
    }


    /**
     * 在指定的位置插入块
     * @param x
     * @param blocks
     */
    insert(x: number, ...blocks: any[]){
        for(let i = 0; i < blocks.length; i++){
            this.blocks.splice(x - 1 + i, 0, blocks[i]);
        }
        // 超出当前行的字符数的话，需要从尾部删除。
        const deleteCount = this.blocks.length - this.cols;
        if(0 < deleteCount){
            this.blocks.splice(this.cols, deleteCount);
        }
    }

    /**
     * 替换指定位置的块
     * @param x
     * @param blocks
     */
    replace(x: number, ...blocks: any[]){
        for(let i = 0; i < blocks.length; i++){
            this.blocks.splice(x - 1 + i, 1, blocks[i]);
        }
    }

    /**
     * 删除指定位置的块
     * @param x
     * @param deleteCount
     */
    delete(x: number, deleteCount: number = 1): any[]{
        return this.blocks.splice(x - 1, deleteCount);
    }

    /**
     * 抹除行
     * @param blockAttr 属性
     */
    erase(blockAttr: DataBlockAttribute) {
        let dirty = false;
        for (let block of this._blocks) {
            dirty = block.erase(" ", blockAttr);
            if(dirty){
                this._dirty = true;
            }
        }
    }

}