/**
 * bufferRow：存储多个block
 */
// import {DataBlock} from "./DataBlock";
import {DataBlockAttribute} from "./DataBlockAttribute";

export class BufferLine {

    // 数据块
    // private _blocks: DataBlock[] = [];

    // 0W0000000000
    // data(1个字符),
    // len2(0|1),
    // bold(0|1),
    // faint(0|1),
    // italic(0|1),
    // underline(0|1),
    // show-blink(0|1),
    // rapid-blink(0|1),
    // inverse(0|1),
    // invisiable(0|1),
    // corrsed-out(0|1)
    // color(red|000000); backgroundColor(yellow|000000)
    private readonly _blocks: string[] = [];

    // 是否为脏数据(未更新到元素中的数据)
    private _dirty: boolean = false;

    // HTML行
    private _element: HTMLDivElement;

    // 列数
    private _cols: number;

    constructor(cols: number) {
        // @param cols 列数
        // @param afterNode 后面的元素编号，如果为""的话，直接添加到容器后面

        this._element = document.createElement("div");
        this._element.className = "viewport-row";

        this._cols = cols;

        for(let i = 0; i < cols; i++){
            this._blocks.push(" ");
            // this._blocks.push(DataBlock.newEmptyBlock());
        }

    }

    get element(): HTMLDivElement {
        return this._element;
    }

    set element(value: HTMLDivElement) {
        this._element = value;
    }

    get dirty(): boolean {
        return this._dirty;
    }

    set dirty(value: boolean) {
        this._dirty = value;
    }

    get blocks(): string[] {
        return this._blocks;
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
    get(x: number): string {
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
            // this.blocks.splice(x - 1 + i, 1, blocks[i]);
            this._blocks[x - 1 + i] = blocks[i];
        }
    }

    /**
     * 替换指定位置的数据块
     * @param x
     * @param block
     */
    replaceOne(x: number, block: any){
        this._blocks[x - 1] = block;
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
        for(let i = 0, len = this._blocks.length; i < len; i++){
            this._blocks[i] = this.updateBlockValue(" ", blockAttr);
        }
    }

    /**
     * 抹除某一个数据块
     * @param x
     * @param blockAttr
     */
    eraseBlock(x: number, blockAttr: DataBlockAttribute){
        this._blocks[x - 1] = this.updateBlockValue(" ", blockAttr);
    }

    /**
     *
     * @param data 更新数据
     * @param blockAttr 属性
     */
    updateBlockValue(data: string, blockAttr: DataBlockAttribute){
        return BufferLine.newBlock(data, blockAttr);
    }

    // /**
    //  * 获取数据块
    //  * @param x
    //  */
    // getBlock(x: number): string[]{
    //     let b = this._blocks[x - 1];
    //     let colors = this._colors[x - 1];
    //     return {
    //         flag: b.charAt(0),
    //         data: b.charAt(1),
    //         classNames: DataBlockAttribute.parseClassName(b.substring(2), colors)
    //     }
    // }

    // isUsed(x: number): boolean {
    //     return this._blocks[x - 1].length > 0;
    // }
    //
    // /**
    //  * 获取数据块的数据
    //  * @param x
    //  */
    // getBlockData(x: number): string {
    //     return this._blocks[x - 1].charAt(0);
    // }
    //
    // /**
    //  * 判断数据块是否长度为2
    //  * 数据 +
    //  * @param x
    //  */
    // isLen2Block(x: number): boolean {
    //     return this._blocks[x - 1].charAt(1) === "1";
    // }
    //
    // /**
    //  * 获取数据块的样式类名称
    //  * @param x
    //  */
    // getBlockClassNames(x: number){
    //     return DataBlockAttribute.parseClassName(this._blocks[x - 1].substring(3));
    // }

    /**
     * 创建一个空块
     */
    static newEmptyBlock(){
        return "";
    }

    /**
     * 创建一个新块
     * @param data
     * @param blockAttr
     * @param len2
     */
    static newBlock(data: string, blockAttr: DataBlockAttribute, len2: number = 0){
        if(data.length > 1){
            throw new Error("{" + data + "} length is " + data.length + ", expect 1.");
        }

        let hex = blockAttr.hex;
        if(hex == "" && len2 == 0){
            return data;
        }

        return data + len2 + hex;
    }

    /**
     * 创建一个长度为2的数据块
     * @param data
     * @param blockAttr
     */
    static newLen2Block(data: string, blockAttr: DataBlockAttribute){
        return BufferLine.newBlock(data, blockAttr, 1);
    }

}