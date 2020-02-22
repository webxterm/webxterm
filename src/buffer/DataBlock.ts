import {DataBlockAttribute} from "./DataBlockAttribute";
import {Block} from "./Block";
import {BufferLine} from "./BufferLine";

/**
 * 缓冲区数据块
 */
export class DataBlock implements Block {

    // 数据
    private _data: string = " ";

    // 属性
    private _attribute: DataBlockAttribute = new DataBlockAttribute();

    // 数据更新版本号，默认为0，每次数据更新的时候，都会+1
    private _version: number = 0;

    // 是否为空，默认生成就是空的，当调用data设置数据的时候，
    private _empty: boolean = true;

    /**
     * 创建新块
     * @param data
     * @param attr
     */
    static newBlock(data: string, attr: DataBlockAttribute){
        let block = new DataBlock();
        block.data = data;
        block.copyValue(attr);
        return block;
    }

    static newEmptyBlock(){
        return new DataBlock();
    }

    get empty(): boolean {
        return this._empty;
    }

    get data(): string {
        return this._data;
    }

    set data(value: string) {
        this._data = value;
        this._empty = false;
        this._version++;
    }

    get attribute(): DataBlockAttribute {
        return this._attribute;
    }

    set attribute(value: DataBlockAttribute) {
        this._attribute = value;
    }

    get version(): number {
        return this._version;
    }

    set version(value: number) {
        this._version = value;
    }

    /**
     * 抹除数据块中的数据
     * @param data
     * @param attr
     */
    public erase(data: string = "",
                 attr: DataBlockAttribute): void {
        this.data = data;
        this.copyValue(attr);
    }

    public copyValue(attr: DataBlockAttribute): void {

        this._attribute.backgroundColorClass = attr.backgroundColorClass;
        this._attribute.colorClass = attr.colorClass;
        this._attribute.bold = attr.bold;
        this._attribute.crossedOut = attr.crossedOut;
        this._attribute.inverse = attr.inverse;
        this._attribute.invisible = attr.invisible;
        this._attribute.italic = attr.italic;
        this._attribute.len2 = attr.len2;
        this._attribute.rapidBlink = attr.rapidBlink;
        this._attribute.slowBlink = attr.slowBlink;
        this._attribute.tab = attr.tab;
        this._attribute.underline = attr.underline;

    }

    /**
     * 通过attribute解析出class
     */
    public getClassName(): string {

        let value = [
            this._attribute.backgroundColorClass,
            this._attribute.colorClass
        ];

        if (this._attribute.bold) value.push("bold");
        if (this._attribute.crossedOut) value.push("crossed-out");
        if (this._attribute.inverse) value.push("inverse");
        if (this._attribute.invisible) value.push("invisible");
        if (this._attribute.italic) value.push("italic");
        if (this._attribute.len2) value.push("len2");
        if (this._attribute.rapidBlink) value.push("rapid-blink");
        if (this._attribute.slowBlink) value.push("slow-blink");
        if (this._attribute.underline) value.push("underline");
        if (this._attribute.tab) value.push("tab");
        if(this._attribute.faint) value.push("faint");

        return value.join(" ").trim();
    }


}