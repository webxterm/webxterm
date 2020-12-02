/**
 * 选择器
 */
export class SelectionPoint {
    private _x: number = 0;
    private _y: number = 0;
    constructor(x: number = 0, y: number = 0) {
        this._x = x;
        this._y = y;
    }
    get x(): number {
        return this._x;
    }

    get y(): number {
        return this._y;
    }

    reset(){
        this._x = 0;
        this._y = 0;
    }

}

export class SelectionRange {

    // 返回一个表示 Range 的起始位置和终止位置是否相同的布尔值。
    private readonly _collapsed: boolean = false;
    // 开始的点，左上角的点. 如果选中的是中间的话，就按选中，如果选中右边的话，就前一个字符。
    private readonly _startPoint: SelectionPoint;
    // 停止的点，右下角的点
    private readonly _stopPoint: SelectionPoint;
    // 选中的内容。
    private readonly _selectedContent: string = "";

    // 真实的stopX，_stopPoint.x为预期的x值，考虑所有的字体宽度都一样。
    // 但是realStopX的值为渲染后，出现中文（2字节）字符的情况，一个中文的宽度为一个英文字符的2倍。
    // realStopX >= _stopPoint.x
    // 这个值的保存主要用来unselect（取消选中）
    // private readonly _realStopX: number = 0;

    // 是否使用过
    private readonly _unused: boolean = false;

    constructor(startX: number,
                startY: number,
                stopX: number,
                stopY: number,
                selectedContent: string,
                // realStopX: number,
                unused: boolean = false) {
        this._startPoint = new SelectionPoint(startX, startY);
        this._stopPoint = new SelectionPoint(stopX, startY);
        // this._realStopX = realStopX;

        if(this._startPoint.x == this._stopPoint.x
            && this._startPoint.y == this._stopPoint.y){
            this._collapsed = true;
        }

        this._unused = unused;
        this._selectedContent = selectedContent;

    }


    get selectedContent(): string {
        return this._selectedContent;
    }

    get collapsed(): boolean {
        return this._collapsed;
    }

    get startPoint(): SelectionPoint {
        return this._startPoint;
    }

    get stopPoint(): SelectionPoint {
        return this._stopPoint;
    }

    // get realStopX(): number {
    //     return this._realStopX;
    // }

    get unused(): boolean {
        return this._unused;
    }
}

export class SelectionPosition {
    private _row: number = 1;
    private _column: number = 1;


    constructor(row: number = 1, column: number = 1) {
        this._row = row;
        this._column = column;
    }

    get row(): number {
        return this._row;
    }

    get column(): number {
        return this._column;
    }

    reset(){
        this._row = 1;
        this._column = 1;
    }

}

export class CanvasSelection {

    // 距离顶部还有多少行，这个行是通过CanvasRenderer.displayRange.top来确定。
    private _offsetTop: number = 0;

    // 基于canvas的坐标
    // 左上角为圆点(0, 0)
    private _anchorPoint: SelectionPoint = new SelectionPoint();

    // // 起点(相对当前屏幕) 像素点
    // private _screenAnchorPoint: SelectionPoint = new SelectionPoint();
    // // 起点(相对于整个页面) 像素点
    // private _pageAnchorPoint: SelectionPoint = new SelectionPoint();

    // 基于canvas的坐标
    // 左上角为圆点(0, 0)
    private _focusPoint: SelectionPoint = new SelectionPoint();
    // // 终点(相对当前屏幕) 像素点
    // private _screenFocusPoint: SelectionPoint = new SelectionPoint();
    // // 终点(相对于整个页面) 像素点
    // private _pageFocusPoint: SelectionPoint = new SelectionPoint();

    // 选择的内容
    private _ranges: SelectionRange[] = [];

    private _full_select_lines: {} = {};
    private _fuzzy_select_lines: [] = [];

    // 是否正在选中
    private _running: boolean = false;

    // 是否启用
    private _enable: boolean = true;

    // 是否全选
    private _selectAll: boolean = false;

    get anchorPoint(): SelectionPoint {
        return this._anchorPoint;
    }

    start(x: number, y: number, offsetTop: number = -1) {
        this._anchorPoint = new SelectionPoint(x, y);
        if(offsetTop != -1) this._offsetTop = offsetTop;
    }

    stop(x: number, y: number, offsetTop: number = -1) {
        this._focusPoint = new SelectionPoint(x, y);
        if(offsetTop != -1) this._offsetTop = offsetTop;
    }

    get offsetTop(): number {
        return this._offsetTop;
    }

    get focusPoint(): SelectionPoint {
        return this._focusPoint;
    }

    get running(): boolean {
        return this._running;
    }

    set running(value: boolean) {
        this._running = value;
    }


    get enable(): boolean {
        return this._enable;
    }

    set enable(value: boolean) {
        this._enable = value;
    }

    clearRanges(){
        this._ranges = [];
    }

    get ranges(): SelectionRange[] {
        return this._ranges;
    }

    get selectAll(): boolean {
        return this._selectAll;
    }

    set selectAll(value: boolean) {
        this._selectAll = value;
    }

    /**
     * 返回该选区所包含的连续范围的数量。
     */
    get rangeCount(): number {
        return this._ranges.length;
    }

    get selectedContent(): string {
        let content = [];
        for(let range of this._ranges){
            if(range.unused) continue;

            content.push(range.selectedContent);
        }
        return content.join("\r\n");
    }

}