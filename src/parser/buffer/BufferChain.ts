/**
 * bufferRow：存储多个block
 */
import {DataBlock} from "./DataBlock";
import {Block} from "./Block";
import {MetaDataBlock} from "./MetaDataBlock";
import {DataBlockAttribute} from "./DataBlockAttribute";

export class BufferChain {

    private blocks: Block[] = [];
    // 是否为脏数据(未更新到元素中的数据)
    private dirty: boolean = false;

    /**
     * 添加一个空白的数据块，默认添加到尾部
     * @param index
     */
    public addBlankBlock(index: number = -1): void {
        this.addBlock(DataBlock.newBlankBlock(), index);
    }

    /**
     * 添加数据块，默认添加到尾部
     * @param block
     * @param index
     */
    public addBlock(block: Block, index: number = -1): BufferChain {
        if (index < 0) {
            this.blocks.push(block);
        } else {
            this.blocks.splice(index, 0, block);
        }

        this.dirty = true;

        return this;
    }

    /**
     * 添加或更新块
     * @param data
     * @param attribute
     * @param index
     * @param len2
     */
    public addOrUpdateBlock(data: string,
                            attribute: DataBlockAttribute,
                            index: number,
                            len2: boolean = false): BufferChain {
        let block = <DataBlock> this.blocks[index];
        if(block){
            block.data = data;
            block.attribute = attribute;
        } else {
            block = new DataBlock(data, attribute);
            this.blocks[index] = block;
        }
        block.attribute.len2 = len2;

        this.dirty = true;

        return this;
    }

    /**
     * 添加或更新块
     * @param block
     * @param index
     */
    public addOrUpdateBlock2(block: Block,
                            index: number): BufferChain {
        this.blocks[index] = block;
        this.dirty = true;
        return this;
    }

    /**
     * 如果数据块不存在的话，就创建。
     * @param data
     * @param attribute
     * @param index
     */
    public addBlockIfNotExists(data: string,
                               attribute: DataBlockAttribute,
                               index: number): void {
        if (this.exists(index)) {
            return;
        }
        this.addOrUpdateBlock(data, attribute, index);
    }

    /**
     * 添加多个数据块，默认添加到尾部
     * @param blocks
     * @param index
     */
    public addBlocks(blocks: Block[], index: number = -1): BufferChain {

        for (let i = 0, len = blocks.length; i < len; i++) {
            if (index < 0) {
                this.blocks.push(blocks[i]);
            } else {
                this.blocks.splice(index + i, 0, blocks[i]);
            }
        }

        this.dirty = true;

        return this;
    }

    /**
     * 删除数据块
     * @param block
     */
    public removeBlock(block: Block): void {

        for (let i = 0, len = this.blocks.length; i < len; i++) {
            if (this.blocks[i] === block) {
                this.removeBlock2(i);
                break;
            }
        }

    }

    /**
     * 删除数据块
     * @param index
     * @param deleteCount
     */
    public removeBlock2(index: number, deleteCount: number = 1): Block[] {
        this.dirty = true;
        return this.blocks.splice(index, deleteCount);
    }

    /**
     * 抹除区中的所有数据块的数据
     */
    public eraseBlock(attribute: DataBlockAttribute): void {

        for (let block of this.blocks) {
            if (block instanceof DataBlock) {
                block.erase(" ", attribute);
            }
        }

        this.dirty = true;
    }

    public getDataBlock(index: number): DataBlock {
        return <DataBlock>this.blocks[index];
    }

    public getMetaBlock(): MetaDataBlock {
        return <MetaDataBlock>this.blocks[0];
    }

    get element(): HTMLDivElement {
        return this.getMetaBlock().element;
    }

    public flush(innerHTML: string): void {
        this.element.innerHTML = innerHTML;
        this.resetDirty();
    }


    // public getBlocks(): Block[] {
    //     return this.blocks;
    // }

    get blockSize(): number {
        return this.blocks.length;
    }

    /**
     * 是否存在指定索引的block
     * @param index
     */
    public exists(index: number) {
        return this.blocks[index] !== undefined;
    }

    get isDirty(): boolean {
        return this.dirty;
    }

    public resetDirty(): void {
        this.dirty = false;
    }

}