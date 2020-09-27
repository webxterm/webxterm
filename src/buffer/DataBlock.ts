import {DataBlockAttribute} from "./DataBlockAttribute";

/**
 * 缓冲区数据块
 */
export class DataBlock {

    // 数据
    private _data: string = " ";
    // private _dataArray: string[] = [];
    private _isEmpty: boolean = true;
    private _length: number = 0;
    private _displaySize: number = 1;

    // 是否为默认的属性
    private _isDefaultAttrs: boolean = true;
    // 属性
    private _colorClass = "";
    private _backgroundColorClass = "";

    private _className = "";
    private _isBold = false;
    private _isFaint = false;
    private _isUnderline = false;
    private _isItalic = false;
    private _isSlowBlink = false;
    private _isRapidBlink = false;
    private _isInverse = false;
    private _isInvisible = false;
    private _isCrossedOut = false;

    static instance: DataBlock;

    public static getDataBlock(): DataBlock {
        if (DataBlock.instance == null) {
            DataBlock.instance = new DataBlock();
        } else {
            DataBlock.instance.reset();
        }
        return DataBlock.instance;
    }

    private reset() {
        // 数据
        if(this._data != " ") this._data = " ";
        if(!this._isEmpty) this._isEmpty = true;
        if(this._length != 0) this._length = 0;
        if(this._displaySize != 1) this._displaySize = 1;
        // 是否为默认的属性
        if(!this._isDefaultAttrs) this._isDefaultAttrs = true;
        // 属性
        if(this._colorClass != "") this._colorClass = "";
        if(this._backgroundColorClass != "") this._backgroundColorClass = "";

        if(this._className) this._className = "";
        if(this._isBold) this._isBold = false;
        if(this._isFaint) this._isFaint = false;
        if(this._isUnderline) this._isUnderline = false;
        if(this._isItalic) this._isItalic = false;
        if(this._isSlowBlink) this._isSlowBlink = false;
        if(this._isRapidBlink) this._isRapidBlink = false;
        if(this._isInverse) this._isInverse = false;
        if(this._isInvisible) this._isInvisible = false;
        if(this._isCrossedOut) this._isCrossedOut = false;
    }

    get data(): string {
        return this._data;
    }

    set data(value: string) {
        this._data = value;
    }

    get isEmpty(): boolean {
        return this._isEmpty;
    }

    set isEmpty(value: boolean) {
        this._isEmpty = value;
    }

    get length(): number {
        return this._length;
    }

    set length(value: number) {
        this._length = value;
    }

    get displaySize(): number {
        return this._displaySize;
    }

    set displaySize(value: number) {
        this._displaySize = value;
    }

    get colorClass(): string {
        return this._colorClass;
    }

    set colorClass(value: string) {
        this._colorClass = value;
    }

    get backgroundColorClass(): string {
        return this._backgroundColorClass;
    }

    set backgroundColorClass(value: string) {
        this._backgroundColorClass = value;
    }

    get isBold(): boolean {
        return this._isBold;
    }

    set isBold(value: boolean) {
        this._isBold = value;
    }

    get isFaint(): boolean {
        return this._isFaint;
    }

    set isFaint(value: boolean) {
        this._isFaint = value;
    }

    get isUnderline(): boolean {
        return this._isUnderline;
    }

    set isUnderline(value: boolean) {
        this._isUnderline = value;
    }

    get isItalic(): boolean {
        return this._isItalic;
    }

    set isItalic(value: boolean) {
        this._isItalic = value;
    }

    get isSlowBlink(): boolean {
        return this._isSlowBlink;
    }

    set isSlowBlink(value: boolean) {
        this._isSlowBlink = value;
    }

    get isRapidBlink(): boolean {
        return this._isRapidBlink;
    }

    set isRapidBlink(value: boolean) {
        this._isRapidBlink = value;
    }

    get isInverse(): boolean {
        return this._isInverse;
    }

    set isInverse(value: boolean) {
        this._isInverse = value;
    }

    get isInvisible(): boolean {
        return this._isInvisible;
    }

    set isInvisible(value: boolean) {
        this._isInvisible = value;
    }

    get isCrossedOut(): boolean {
        return this._isCrossedOut;
    }

    set isCrossedOut(value: boolean) {
        this._isCrossedOut = value;
    }


    // get dataArray(): string[] {
    //     return this._dataArray;
    // }
    //
    // set dataArray(value: string[]) {
    //     this._dataArray = value;
    // }

    get isDefaultAttrs(): boolean {
        return this._isDefaultAttrs;
    }

    set isDefaultAttrs(value: boolean) {
        this._isDefaultAttrs = value;
    }


    get className(): string {
        return this._className;
    }

    set className(value: string) {
        this._className = value;
    }

    // /**
    //  * 解码
    //  * @param block
    //  */
    // public static decode(block: string): DataBlock {
    //
    //     let b = DataBlock.getDataBlock();
    //
    //     // len == 0
    //     if (!block) {
    //         b.displaySize = 0;
    //         b.length = 0;
    //         b.data = "";
    //         return b;
    //     }
    //
    //     const arr = Array.from(block);
    //     const len = arr.length;
    //     if (len == 1) {
    //         b.length = 1;
    //         b.displaySize = 1;
    //         b.data = block;
    //     } else if (len > 1) { // 非空块
    //         b.length = parseInt(arr[0], 8);
    //         b.displaySize = parseInt(arr[1], 8);
    //         const array = arr.slice(2);
    //         // b.dataArray = array.slice(0, b.length);
    //         const dataArray = arr.slice(2, 2 + b.length);
    //         b.data = dataArray.join("");
    //         b.isDefaultAttrs = !(array.length > b.length);
    //
    //         if (!b.isDefaultAttrs) {
    //             const attrs = DataBlockAttribute.parseClassName(array.slice(b.length).join(""));
    //             if (attrs[0].indexOf("bold") >= 0) b.isBold = true;
    //             if (attrs[0].indexOf("faint") >= 0) b.isFaint = true;
    //             if (attrs[0].indexOf("underline") >= 0) b.isUnderline = true;
    //             if (attrs[0].indexOf("italic") >= 0) b.isItalic = true;
    //             if (attrs[0].indexOf("slow-blink") >= 0) b.isSlowBlink = true;
    //             if (attrs[0].indexOf("rapid-blink") >= 0) b.isRapidBlink = true;
    //             if (attrs[0].indexOf("inverse") >= 0) b.isInverse = true;
    //             if (attrs[0].indexOf("invisible") >= 0) b.isInvisible = true;
    //             if (attrs[0].indexOf("crossed-out") >= 0) b.isCrossedOut = true;
    //
    //             if (attrs[1]) b.colorClass = attrs[1];
    //             if (attrs[2]) b.backgroundColorClass = attrs[2];
    //
    //             b.className = attrs[0];
    //         }
    //
    //     }
    //     return b;
    // }

    // /**
    //  * 编码
    //  * @param data
    //  * @param blockAttr
    //  * @param displaySize
    //  */
    // public static encode(data: string, blockAttr: DataBlockAttribute, displaySize: number) {
    //     const hex = blockAttr.hex;
    //     // 真实长度 + 显示长度 + 数据 + 字符属性;前景色;背景色
    //     const len = Array.from(data).length;
    //     if (len == 0) return "";
    //     if (displaySize == 1 && len == 1 && hex == "") {
    //         return data;
    //     }
    //     // 长度最大为15
    //     return len.toString(8) + displaySize.toString(8) + data + blockAttr.hex;
    // }
    //
    // /**
    //  * 编码
    //  * @param data
    //  * @param displaySize
    //  */
    // public static encode2(data: string, displaySize: number) {
    //     // 真实长度 + 显示长度 + 数据 + 字符属性;前景色;背景色
    //     const len = Array.from(data).length;
    //     if (len == 0) return "";
    //     if (displaySize == 1 && len == 1) {
    //         return data;
    //     }
    //     // 长度最大为15
    //     return len.toString(32) + displaySize.toString(16) + data;
    // }


}