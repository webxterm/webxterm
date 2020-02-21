/**
 * bufferRow：存储多个block
 */
import {DataBlock} from "./DataBlock";
import {Block} from "./Block";
import {PlaceholderBlock} from "./PlaceholderBlock";
import {Buffer} from "./Buffer";
import {DataBlockAttribute} from "./DataBlockAttribute";
import {Printer} from "../../Printer";

export class BufferLine {

    // 数据块
    private _blocks: Block[] = [];

    // 是否为脏数据(未更新到元素中的数据)
    private _dirty: boolean = false;

    // HTML行
    private readonly _element: HTMLDivElement;

    // 列数
    private cols: number;

    constructor(cols: number, afterNode: HTMLElement | null = null) {
        // @param cols 列数
        // @param afterNode 后面的元素编号，如果为""的话，直接添加到容器后面

        this._element = document.createElement("div");
        this._element.className = "viewport-row";

        this.setAfterNode(afterNode);

        this.cols = cols;
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

    get blocks(): Block[] {
        return this._blocks;
    }

    /**
     * 获取某一个块
     * @param x
     */
    get(x: number): DataBlock | PlaceholderBlock {
        return this._blocks[x - 1];
    }


    setAfterNode(afterNode: HTMLElement | null = null){
        if(afterNode){
            this._element.setAttribute("after-node",
                <string>afterNode.getAttribute("line-num"));
        }
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
        for (let block of this._blocks) {
            if (block instanceof DataBlock) {
                block.erase(" ", blockAttr);
            }
        }
    }

    /**
     * 判断是否为空行
     */
    isEmpty(): boolean {
        for(let i = 0, len = this.blocks.length, block; i < len; i++){
            block = this.blocks[i];
            if(block instanceof DataBlock){
                if(!block.empty){
                    return false;
                }
            }
        }
        return true;
    }

}