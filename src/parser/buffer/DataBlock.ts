/**
 * 缓冲区数据块
 */
import {Block} from "./Block";
import {DataBlockAttribute} from "./DataBlockAttribute";

export class DataBlock implements Block {

    // 数据
    private value: string = "";

    private attr: DataBlockAttribute = new DataBlockAttribute();

    // 数据更新版本号，默认为0，每次数据更新的时候，都会+1
    private version = 0;

    constructor(data: string = "", attr: DataBlockAttribute = new DataBlockAttribute()) {
        this.data = data;
        // this.attribute = JSON.parse(JSON.stringify(attr));
        this.copyValue(attr);
    }

    get data(): string {
        return this.value;
    }

    set data(value: string) {
        this.value = value;
        this.version++;
    }

    get attribute(): DataBlockAttribute {
        return this.attr;
    }

    set attribute(value: DataBlockAttribute) {
        this.attr = value;
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

    public static newBlankBlock(): DataBlock {
        return new DataBlock(" ");
    }

    public static newBlock(): DataBlock {
        return new DataBlock();
    }

    private copyValue(attr: DataBlockAttribute) : void {

        console.info("copyValue>>>");

        this.attribute.backgroundColor = attr.backgroundColor;
        this.attribute.color = attr.color;
        this.attribute.bold = attr.bold;
        this.attribute.crossedOut = attr.crossedOut;
        this.attribute.inverse = attr.inverse;
        this.attribute.invisible = attr.invisible;
        this.attribute.italic = attr.italic;
        this.attribute.len2 = attr.len2;
        this.attribute.rapidBlink = attr.rapidBlink;
        this.attribute.slowBlink = attr.slowBlink;
        this.attribute.tab = attr.tab;
        this.attribute.underline = attr.underline;
    }

    /**
     * 通过attribute解析出class
     */
    public getClassName() : string {

        let value = [
            this.attribute.backgroundColor,
            this.attribute.color
        ];

        if(this.attribute.bold) value.push("bold");

        if(this.attribute.crossedOut) value.push("crossed-out");

        if(this.attribute.inverse) value.push("inverse");

        if(this.attribute.invisible) value.push("invisible");

        if(this.attribute.italic) value.push("italic");

        if(this.attribute.len2) value.push("len2");

        if(this.attribute.rapidBlink) value.push("rapid-blink");

        if(this.attribute.slowBlink) value.push("slow-blink");

        if(this.attribute.underline) value.push("underline");

        if(this.attribute.tab) value.push("tab");

        return value.join(" ").trim();
    }

}