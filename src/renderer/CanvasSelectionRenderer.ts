import {CanvasSelection} from "../selection/CanvasSelection";
import {Terminal} from "../Terminal";
import {CommonUtils} from "../common/CommonUtils";
import {CanvasTextRenderer} from "./CanvasTextRenderer";
import {Buffer} from "../buffer/Buffer";
import {DataTypeValue} from "../buffer/DataTypeValue";
import {CanvasSelectionPoint} from "../selection/CanvasSelectionPoint";
import {CanvasSelectionSelectType} from "../selection/CanvasSelectionSelectType";


/**
 * 字符类型
 */
enum CharType {
    NUMBER_LETTER,  // 数字 + 英文 + '-'
    SYMBOL,         // 英文符号
    CHINESE,        // 中文
    CHINESE_SYMBOL, // 中文符号
    LEFT_SYMBOL,    // 左符号，如 (
    RIGHT_SYMBOL,   // 右符号，如 )
    BLANK,          // 空格
    UNKNOWN         // 其他
}

/**
 * 单词边界状态
 */
enum BoundaryArrived {
    NO,             // 没到单词边界
    UNKNOWN,        // 未定的单词边界
    YES             // 已到单词边界
}

/**
 * 一对的符号
 * (){}[]<>（）【】「」《》
 */
const CoupleSymbol: { [key: string]: string } = {
    "(": ")",
    "[": "]",
    "{": "}",
    "<": ">",
    ")": "(",
    "]": "[",
    "}": "{",
    ">": "<",

    "（": "）",
    "【": "】",
    "「": "」",
    "《": "》",
    "）": "（",
    "】": "【",
    "」": "「",
    "》": "《"
};


// 换行符
const LINE_FEED = "\n";

/**
 * 内容选择渲染器
 */
export class CanvasSelectionRenderer extends CanvasTextRenderer {

    // 选中的行的内容
    private _selectContents: string[] = [];

    constructor(term: Terminal) {
        super(term);

    }

    getView(): HTMLCanvasElement {
        return this._term.selectionView;
    }


    resize(rows: number, columns: number) {
        // 更新字体大小，并计算字符宽度
        super.updateFontSize();
        this.select2();
    }

    calcPoint(sel: CanvasSelection): number[]{
        let ps = [];
        if (sel.anchorPoint2.pageY < sel.focusPoint2.pageY
            || (sel.anchorPoint2.pageY == sel.focusPoint2.pageY && sel.anchorPoint2.pageX <= sel.focusPoint2.pageX)) {
            // 正向选择
            ps[0] = this.calcStartLineX(sel.anchorPoint2.pageX);
            ps[1] = this.calcStartLineY(sel.anchorPoint2.pageY);

            ps[2] = this.calcStartLineX(sel.focusPoint2.pageX);
            ps[3] = this.calcStartLineY(sel.focusPoint2.pageY);
        } else {
            // 反向选择
            ps[0] = this.calcStartLineX(sel.focusPoint2.pageX);
            ps[1] = this.calcStartLineY(sel.focusPoint2.pageY);

            ps[2] = this.calcStartLineX(sel.anchorPoint2.pageX);
            ps[3] = this.calcStartLineY(sel.anchorPoint2.pageY);
        }
        return ps;
    }

    /**
     * 普通内容选择
     * @param duplicate2clipboard 是否需要更新选中的内容到粘贴板中
     * @param displayBuffer 显示缓冲区
     */
    select2(duplicate2clipboard: boolean = true,
            displayBuffer: Buffer | undefined = undefined) {

        const sel: CanvasSelection = this._term.selection;
        if(!sel.running) return;

        // 相同的点进来不用处理
        if(CommonUtils.isSamePoint(sel.anchorPoint2, sel.focusPoint2)){
            console.info("select2>isSamePoint...." + JSON.stringify(sel.anchorPoint2))
            return;
        }

        // 描述：
        // sel.anchorPoint = sel.anchorPoint2: 开始点
        // sel.focusPoint = sel.focusPoint2: 结束点
        // sel.version: 当前选择版本号

        // 选择原理
        // 通过getDisplayBuffer() 获取的Buffer，查询当前版本行的版本号是否为sel.version，
        // 如果版本号一致的话，则说明是当前需要被选中的行。
        // 至于从哪里开始，哪里结束，需要看sel.anchorPoint2和sel.focusPoint2这两个点。
        // 如果sel.anchorPoint2比sel.focusPoint2大的话，说明是从下向上选择的，否则就是从上到下选择。
        const topIndex = this._term.getOffsetTop();
        if(displayBuffer == undefined){
            displayBuffer = this._term.bufferSet.getDisplayBuffer(topIndex, this.active_buffer.size + topIndex);
            // 更新显示缓冲区信息
            this.display_buffer.removeLine(0, this.active_buffer.display_buffer.size);
            this.display_buffer.copyFrom(displayBuffer, 0, displayBuffer.size);
        }

        // x1, y1 => 开始点
        // x2, y2 => 结束点
        let [x1, y1, x2, y2] = this.calcPoint(sel);
        console.info(x1, y1, x2, y2);

        // y: 当前可视化界面的行索引。
        // docY: 当前的文档的所有行的行索引。
        for (let y = 0, yIndex = topIndex, len = displayBuffer.size; y < len; y++, yIndex++) {

            this.clearLine(y);

            // 没有被选择的话，跳过
            if (displayBuffer.lineVersions[y] != sel.version) {
                continue;
            }

            let x = 0, end = -1;
            if (sel.columnMode || (y1 == y2 && x1 < x2)) {
                // 选择在同一行 || 列模式
                x = x1;
                end = x2;
            } else if (yIndex == y1) {
                // 开始行
                x = x1;
            } else if (yIndex == y2) {
                // 结束行
                end = x2;
            }

            // 渲染选中的内容
            this.drawLine(x, y, displayBuffer, end, true);

            // 是否需要更新选中的内容到粘贴板中
            if(!duplicate2clipboard){
                continue;
            }
            // 获取每一行选择的内容
            const currentLineChars = displayBuffer.lineChars[y];
            const selectTextArray = currentLineChars.slice(x, end);
            let selectText = this.handleSelectedContent2(selectTextArray);

            this._selectContents[yIndex] = displayBuffer.lineIds[y] > 0 ? selectText + LINE_FEED : selectText;
        }

        // 是否需要更新选中的内容到粘贴板中
        if(!duplicate2clipboard){
            return;
        }

        // 去掉最后一个\n
        const finalSelectText = this._selectContents.slice(sel.startY, sel.stopY).join("");
        sel.selectedContent = finalSelectText.substring(0, finalSelectText.length - 1);

        // 选中内容
        this._term.clipboard.value = sel.selectedContent;
        this._term.clipboard.select();

        //////////////////////////////////////////////////////////////////////////////////////////
        /// BUG：选择后，只有当前显示区的内容会被选择，其他没有在显示区的内容并没有添加到selectedContent中。
        //////////////////////////////////////////////////////////////////////////////////////////

    }

    get selectContents(): string[] {
        return this._selectContents;
    }

    /**
     * 内容选择
     */
    select() {
        this.select2();
    }

    /**
     * 处理选中的内容，如果后面全部都是空格的话，就不用返回空格，只返回空行。
     * @param selectTextArray
     */
    handleSelectedContent(selectTextArray: string[]): string[] {
        let validIndex = -1, result = [];
        for (let i = 0, len = selectTextArray.length; i < len; i++) {
            if (selectTextArray[i] != " ") {
                validIndex = i;
            }
            result[i] = selectTextArray[i];
        }
        if (validIndex == -1) {
            return [];
        }
        return result.slice(0, validIndex + 1);
    }

    handleSelectedContent2(selectTextArray: string[]): string {
        return this.handleSelectedContent(selectTextArray).join("");
    }

    /**
     * 取消选择。
     */
    cancel() {

        const selection = this._term.selection;

        if (!selection.running) return;

        if (this.ctx) {

            // 清除画布
            this.clear();

            selection.reset();

            // 取消选中、
            let sel = window.getSelection();
            if (sel) {
                sel.removeAllRanges();
            }

            //
            this._term.clipboard.value = "";
            this._selectContents = [];
        }
    }

    /**
     * 全选
     */
    selectAll() {

        this.select2();

        this._term.selection.running = true;
        this._term.selection.selectAll = true;
    }


    /**
     * 处理窗口缩放，滚动时候的选中内容。
     * @param displayBuffer 显示缓冲区
     */
    renderVideo(displayBuffer: Buffer): number {

        // 什么都没有选中
        if (!this._term.selection.running) {
            return 0;
        }

        // 全选。
        this.select2(false, displayBuffer);

        if (this._term.selection.selectAll) {
            // 全选的时候，不用渲染内容。
            return 1;
        } else {
            // 部分选中
            return 2;
        }
    }


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // 双击块选择功能
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * 比较数据类型 是否达到了单词边界
     * @param index 索引
     * @param chars 数据
     * @param selected 选择的字符
     * @param ct 数据类型
     */
    compareCharType(index: number, chars: string[], selected: string, ct: CharType): BoundaryArrived {
        let c = chars[index], lc = chars[index - 1];
        switch (ct) {
            case CharType.LEFT_SYMBOL:
                // 左边的字符需要对应右边的字符
                // ({\[<（【「《
                // return CoupleSymbol[c] == selected ? BoundaryArrived.YES : BoundaryArrived.NO;
            case CharType.RIGHT_SYMBOL:
                // 右边的字符需要对应左边的字符。
                return CoupleSymbol[c] == selected ? BoundaryArrived.YES: BoundaryArrived.NO;

            case CharType.NUMBER_LETTER:
                if (CommonUtils.isNumberLetter(c)) {
                    return BoundaryArrived.NO;
                }
                break;
            case CharType.SYMBOL:
                if (CommonUtils.isSymbol(c)) {
                    return BoundaryArrived.NO;
                }
                break;
            case CharType.CHINESE:
                if (CommonUtils.isChinese(c) || (CommonUtils.isChinese(lc) && c == DataTypeValue.SECONDARY)) {
                    // 中文或下一个是中文的占位号
                    return BoundaryArrived.NO;
                }
                break;
            case CharType.CHINESE_SYMBOL:
                if (CommonUtils.isChineseSymbol(c) || (CommonUtils.isChineseSymbol(lc) && c == DataTypeValue.SECONDARY)) {
                    // 中文符号或下一个是中文符号的占位号
                    return BoundaryArrived.NO;
                }
                break;

            case CharType.BLANK:
                // 空格
                if (CommonUtils.isBlank(c)) {
                    return BoundaryArrived.NO;
                }
                break;
        }
        return BoundaryArrived.YES;
    }

    /**
     * 判断字符是属于那些类型的字符
     * @param c 字符
     * @private
     */
    getCharType(c: string): CharType {
        if (CommonUtils.isLeftSymbol(c)) {
            // 整对的特殊字符(左): (){}[]<>（）【】「」《》
            return CharType.LEFT_SYMBOL;
        } else if (CommonUtils.isRightSymbol(c)) {
            // 整对的特殊字符(右): (){}[]<>（）【】「」《》
            return CharType.RIGHT_SYMBOL;
        } else if (CommonUtils.isNumberLetter(c)) {
            // 数字 + 字母
            return CharType.NUMBER_LETTER;
        } else if (CommonUtils.isSymbol(c)) {
            // 符号
            return CharType.SYMBOL;
        } else if (CommonUtils.isChinese(c)) {
            // 中文
            return CharType.CHINESE;
        } else if (CommonUtils.isChineseSymbol(c)) {
            // 中文符号
            return CharType.CHINESE_SYMBOL;
        } else if (CommonUtils.isBlank(c)) {
            // 空格
            return CharType.BLANK;
        }
        return CharType.UNKNOWN;
    }

    /**
     * 选中块，主要是当前行，双击
     * 1，字母的话，选中前后的字母。
     * 2，特殊字符的话，选中前后的特殊字符
     * 3，中文的话，选中前后的中文
     */
    selectBlock() {
        if (!this.ctx) {
            return;
        }

        // 选择原理
        // 通过在显示区中双击选中某一个字符，块选择的功能就是把 对应的字符串，直到遇到分隔符，才结束
        // 那么如果一整行都没有分割符的话，需要向上行/向下行查找分隔符。
        // 如果在显示区一直没有找到分隔符的，就一直向上/向下，直到将所有行查找。
        const sel = this._term.selection;

        const topIndex = this._term.getOffsetTop();
        const displayBuffer = this._term.bufferSet.getDisplayBuffer(topIndex, this.active_buffer.size + topIndex);

        // 考虑到精度问题
        const yIndex = Math.floor(sel.anchorPoint2.y / this.height);
        const lineChars = displayBuffer.lineChars[yIndex];
        let xIndex = Math.floor(sel.anchorPoint2.x / this.measuredTextWidth);
        // 获取到选中的值
        let selected = lineChars[xIndex];
        // 选中的字符是空字符串
        if(selected == DataTypeValue.SECONDARY){
            // 中文占位符
            xIndex -= 1;
            selected = lineChars[xIndex];
        }

        // 向上查找，获取最终的边界点。
        const anchorPoint = this.findPrev(xIndex, yIndex, displayBuffer, selected, topIndex);

        // 向下查找
        const focusPoint = this.findNext(xIndex + 1, yIndex, displayBuffer, selected, topIndex);

        // 重新设置选择定位点
        sel.start(anchorPoint.x, anchorPoint.y, anchorPoint.offsetTop);
        sel.stop(focusPoint.x, focusPoint.y, focusPoint.offsetTop);

        // 使用默认选择功能
        this._term.emitSelect(CanvasSelectionSelectType.NORMAL);

    }

    /**
     * 向上查找 直到有硬换行，如果没有硬换行的，一直查找到保留区才结束。
     * 原理：
     * 每一行的lineId < 0 代表软换行。正数代表硬换行。
     * @param xIndex 当前选中行的结束分析x坐标
     * @param yIndex
     * @param displayBuffer
     * @param selected 字符
     * @param topIndex 离顶部的距离
     * @return CanvasSelectionPoint
     */
    private findPrev(xIndex: number,
                   yIndex: number,
                   displayBuffer: Buffer,
                   selected: string,
                   topIndex: number): CanvasSelectionPoint {

        const offsetTop = this._term.measureOffsetTop2(topIndex);

        // 获取选中字符的数据类型
        const charType = this.getCharType(selected);
        if(charType == CharType.LEFT_SYMBOL){
            // 如果遇到对应符号且为左边的符号，如(<《等，则左边不用处理。
            return new CanvasSelectionPoint(xIndex * this.measuredTextWidth, yIndex * this.height, offsetTop);
        }

        // 上一行的索引。
        let prevIndex = yIndex,
            // 是否需要向上循环查找
            loop = true;

        // 是否为词汇边界，0：代表不是词汇边界，1: 代表行的第一个字符，2：代表边界字符
        let boundary = BoundaryArrived.NO,
            // x坐标
            index = xIndex;

        while (loop) {

            // 判断是否符合字符条件
            // selected
            // 判断当前行是否为词汇边界。
            let chars = displayBuffer.lineChars[prevIndex];
            for(let i = index; -1 < i; i--){
                // 从右边开始查找
                boundary = this.compareCharType(i, chars, selected, charType);
                if(boundary == BoundaryArrived.YES){
                    // 结束向上查找
                    // 如果是右边的符号的，需要包含选中。
                    index = i + (charType == CharType.RIGHT_SYMBOL ? 0 : 1);
                    break;
                }
                if(i == 0){
                    // 如果到了第一个字符还不知道是否为单词边界的话，先更换了另一个状态，因为有可能上一个是软换行。
                    boundary = BoundaryArrived.UNKNOWN;
                    index = i;
                }
            }
            // 遇到单词边界，结束。
            if(boundary == BoundaryArrived.YES){
                break;
            }

            // 超出了显示缓冲区了，需要继续向上查找。直到保留区的第一行。
            if (prevIndex == 0) {
                // 外层循环挂起。。。。
                console.info("外层循环挂起。。。。");

                // 假如当前在备用备用缓冲区，是不可能会查找到默认缓冲区的。备用缓冲区和默认缓冲区会出现断行的情况，无需考虑。
                // 假如当前在默认缓冲区，如果没有断行的情况，需要一直向上查找，直到保留区的第一行。
                let topIndex2: number = topIndex;
                // 获取上一个的显示区。
                let end = topIndex2;
                topIndex2 = end - this.active_buffer.size;

                // 显示区的最后一行的y坐标
                let y;
                if(topIndex2 < 0){
                    topIndex2 = 0;
                    y = end - 1;
                } else {
                    y = this.active_buffer.size - 1;
                }

                // 获取上一个显示缓冲区
                let db = this._term.bufferSet.getDisplayBuffer(topIndex2, end);
                let x = db.lineChars[y].length - 1;

                // 从右下角开始选择。
                return this.findPrev(x, y, db, selected, topIndex2);
            }

            // 是否需要向上一行查找
            // 上一行为正数的话，代表上一行已断行。
            // 负数的话，代表上一行是软换行。
            if(!(loop = displayBuffer.lineIds[prevIndex - 1] < 0)) {
                // 行id > 0，说明已经断行、
                if(boundary == BoundaryArrived.UNKNOWN){
                    if(charType == CharType.RIGHT_SYMBOL){
                        // 选中的是右符号
                        // 如果没有匹配到左符号的话，就选中符号本身。
                        // 重置
                        index = xIndex;
                        prevIndex = yIndex;
                    } else {
                        boundary = BoundaryArrived.YES;
                    }
                }
                break;
            }
            prevIndex -= 1;
            index = chars.length - 1;
        }

        return new CanvasSelectionPoint(index * this.measuredTextWidth, prevIndex * this.height, offsetTop);
    }


    /**
     * 向下查找（包含当前行）直到有硬换行，如果没有硬换行的，一直查找到缓冲区尾部区才结束。
     * 原理：
     * 每一行的lineId < 0 代表软换行。正数代表硬换行。
     * @param xIndex 当前行的开始分析x坐标
     * @param yIndex
     * @param displayBuffer
     * @param selected 字符
     * @param topIndex 离顶部的距离
     * @return CanvasSelectionPoint
     */
    private findNext(xIndex: number,
                     yIndex: number,
                     displayBuffer: Buffer,
                     selected: string,
                     topIndex: number): CanvasSelectionPoint {

        const offsetTop = this._term.measureOffsetTop2(topIndex);

        // 字符类型
        const charType = this.getCharType(selected);
        if(charType == CharType.RIGHT_SYMBOL){
            // 如果遇到对应符号且为右边的符号，如)>》等，则右边不用处理。
            return new CanvasSelectionPoint(xIndex * this.measuredTextWidth, yIndex * this.height, offsetTop);
        }

        // 循环查找，直到结束
        let loop = true, nextIndex = yIndex, index = xIndex;

        // 是否为词汇边界，0：代表不是词汇边界，1: 代表行的第一个字符，2：代表边界字符
        let boundary = BoundaryArrived.NO;

        while (loop){

            // 获取单词边界
            const chars = displayBuffer.lineChars[nextIndex];
            for(let i = index, len = chars.length; i < len; i++){
                // 是否为单词边界
                boundary = this.compareCharType(i, chars, selected, charType);
                if(boundary == BoundaryArrived.YES){
                    // 结束向下查找
                    // 如果是左边的符号的，需要包含选中。
                    index = i + (charType == CharType.LEFT_SYMBOL ? 1 : 0);
                    loop = false;
                    break;
                }
                if(i == len - 1){
                    // 如果到了最后一个字符还不知道是否为单词边界的话，先更换了另一个状态，因为有可能下一个是软换行。
                    boundary = BoundaryArrived.UNKNOWN;
                    index = i;
                }
            }
            // 遇到单词边界，结束。
            if(boundary == BoundaryArrived.YES){
                break;
            }

            // 是否需要向下一行查找
            // 下一行为正数的话，代表下一行已断行。
            // 负数的话，代表上一行是软换行。

            if(!(loop = displayBuffer.lineIds[nextIndex] < 0)) {
                // 当前行是正数，说明不用继续查找下一行
                if(boundary == BoundaryArrived.UNKNOWN){
                    boundary = BoundaryArrived.YES;
                }
                break;
            }
            // 继续下一行查找。
            nextIndex += 1;
            // 下一行从0开始。
            index = 0;

            if(nextIndex >= this.active_buffer.size){
                // 到了最后一行了。
                // 进入外部循环挂起

                let topIndex2: number = topIndex + this.active_buffer.size;
                // 获取下一个的显示区。
                let end = topIndex2 + this.active_buffer.size;

                // 所有缓冲区的行数
                let bottom = this.saved_buffer.size + this._term.bufferSet.normal.size;
                if(this._term.bufferSet.isAlt){
                    bottom += this._term.bufferSet.alt.size;
                }

                // 显示区的最后一行的y坐标
                if(end >= bottom){
                    end = bottom;
                }

                // 获取上一个显示缓冲区
                let db = this._term.bufferSet.getDisplayBuffer(topIndex2, end);

                // 从左上角开始选择
                return this.findNext(0, 0, db, selected, topIndex2);

            }
        }
        return new CanvasSelectionPoint(index * this.measuredTextWidth, nextIndex * this.height, offsetTop);
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // 三击行选择功能
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * 选中一整行，三击
     */
    selectLine() {

        // 更新选择点
        // 一直从当前行向上、向下查找，直到lineId > 0
        if (!this.ctx) {
            return;
        }

        // 选择原理
        // 通过在显示区中双击选中某一个字符，块选择的功能就是把 对应的字符串，直到遇到分隔符，才结束
        // 那么如果一整行都没有分割符的话，需要向上行/向下行查找分隔符。
        // 如果在显示区一直没有找到分隔符的，就一直向上/向下，直到将所有行查找。
        const sel = this._term.selection;

        const topIndex = this._term.getOffsetTop();
        const displayBuffer = this._term.bufferSet.getDisplayBuffer(topIndex, this.active_buffer.size + topIndex);

        // 选择行
        // 考虑到精度问题
        const yIndex = Math.floor(sel.anchorPoint2.y / this.height);
        // 当前选择行

        // 向上查找，获取最终的边界点。
        const anchorPoint = this.findUp(yIndex, displayBuffer, topIndex);

        // 向下查找
        const focusPoint = this.findDown(yIndex, displayBuffer, topIndex);

        // 重新设置选择定位点
        sel.start(anchorPoint.x, anchorPoint.y, anchorPoint.offsetTop);
        sel.stop(focusPoint.x, focusPoint.y, focusPoint.offsetTop);

        // 使用默认选择功能
        this._term.emitSelect(CanvasSelectionSelectType.NORMAL);

    }

    /**
     * 向上查找行，直到上一行为lineId > 0才结束
     * @param yIndex
     * @param displayBuffer
     * @param topIndex
     * @private
     */
    private findUp(yIndex: number, displayBuffer: Buffer, topIndex: number): CanvasSelectionPoint {
        const offsetTop = this._term.measureOffsetTop2(topIndex);
        let upIndex = yIndex;
        let loop = true;
        while(loop) {
            if(upIndex == 0){
                let topIndex2: number = topIndex;
                let end = topIndex;
                topIndex2 = end - this.active_buffer.size;

                // 显示区的最后一行的y坐标
                let y;
                if(topIndex2 < 0){
                    topIndex2 = 0;
                    y = end - 1;
                } else {
                    y = this.active_buffer.size - 1;
                }

                // 获取上一个显示缓冲区
                let db = this._term.bufferSet.getDisplayBuffer(topIndex2, end);

                return this.findUp(y, db, topIndex2);
            }

            if(!(loop = displayBuffer.lineIds[upIndex - 1] < 0)){
                // 结束软换行
                break;
            }
            upIndex -= 1;
        }

        return new CanvasSelectionPoint(0, upIndex * this.height, offsetTop);
    }

    /**
     * 向下查找行，直到当前行为lineId > 0才结束
     * @param yIndex
     * @param displayBuffer
     * @param topIndex
     * @private
     */
    private findDown(yIndex: number, displayBuffer: Buffer, topIndex: number): CanvasSelectionPoint {
        const offsetTop = this._term.measureOffsetTop2(topIndex);
        let downIndex = yIndex;
        let loop = true;
        while (loop) {

            if(downIndex >= this.active_buffer.size){
                // 到了最后一行了。
                // 进入外部循环挂起

                let topIndex2: number = topIndex + this.active_buffer.size;
                // 获取下一个的显示区。
                let end = topIndex2 + this.active_buffer.size;

                // 所有缓冲区的行数
                let bottom = this.saved_buffer.size + this._term.bufferSet.normal.size;
                if(this._term.bufferSet.isAlt){
                    bottom += this._term.bufferSet.alt.size;
                }

                // 显示区的最后一行的y坐标
                if(end >= bottom){
                    end = bottom;
                }

                // 获取上一个显示缓冲区
                let db = this._term.bufferSet.getDisplayBuffer(topIndex2, end);

                // 从左上角开始选择
                return this.findDown(0, db, topIndex2);

            }

            // 当前行如果lineId>0的话，代表存在硬换行。
            if(!(loop = displayBuffer.lineIds[downIndex] < 0)){
                // 结束软换行
                // 包含当前行被选择
                downIndex += 1;
                break;
            }

            downIndex += 1;

        }

        return new CanvasSelectionPoint(0, downIndex * this.height, offsetTop);
    }

}