import {DataBlockAttribute} from "./DataBlockAttribute";

/**
 * 缓冲区数据块
 */
export class DataBlock {

    // 数据
    private _data: string = " ";

    // 属性
    private _attribute: DataBlockAttribute = new DataBlockAttribute();

    // 数据更新版本号，默认为0，每次数据更新的时候，都会+1
    private _version: number = 0;

    // 自定义的超链接
    private _href: string = "";

    // 判断是否为空，当_attribute.len2 == true的时候，下一个DataBlock将会为empty
    private _empty: boolean = false;

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

    get data(): string {
        return this._data;
    }

    set data(value: string) {
        this._data = value;
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

    get href(): string {
        return this._href;
    }

    set href(value: string) {
        this._href = value;
    }

    get empty(): boolean {
        return this._empty;
    }

    set empty(value: boolean) {
        this._empty = value;
    }

    /**
     * 抹除数据块中的数据
     * 返回是否已被修改过。
     * @param data
     * @param attr
     */
    public erase(data: string = "",
                 attr: DataBlockAttribute): boolean {

        let dirty = this.copyValue(attr);

        if(data != this.data){
            this.data = data;
            this.empty = false;
            this.attribute.len2 = false;

            if(!dirty) dirty = true;
        } else {
            this._version++;
        }

        return dirty;
    }

    public copyValue(attr: DataBlockAttribute): boolean {

        const version: number = this._attribute.version;

        this._attribute.backgroundColorClass = attr.backgroundColorClass;
        this._attribute.colorClass = attr.colorClass;
        this._attribute.bold = attr.bold;
        this._attribute.crossedOut = attr.crossedOut;
        this._attribute.inverse = attr.inverse;
        this._attribute.inverse = attr.inverse;
        this._attribute.invisible = attr.invisible;
        this._attribute.italic = attr.italic;
        this._attribute.len2 = attr.len2;
        this._attribute.rapidBlink = attr.rapidBlink;
        this._attribute.slowBlink = attr.slowBlink;
        this._attribute.underline = attr.underline;

        return version != this._attribute.version;
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
        if(this._attribute.faint) value.push("faint");

        return value.join(" ").trim();
    }


}