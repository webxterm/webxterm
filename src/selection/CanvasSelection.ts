import {CanvasSelectionPoint} from "./CanvasSelectionPoint";

/**
 * 选择器
 */
export class CanvasSelection {

    // 基于canvas的坐标
    // 左上角为圆点(0, 0)
    private _anchorPoint: CanvasSelectionPoint | undefined;

    /**
     * 最后定位的点，当只有双击选中的时候，该值可能和_anchorPoint不一样。
     * @private
     */
    private _anchorPoint2: CanvasSelectionPoint | undefined;

    // 基于canvas的坐标
    // 左上角为圆点(0, 0)
    private _focusPoint: CanvasSelectionPoint | undefined;

    /**
     * 最后定位的点，当只有双击选中的时候，该值可能和_focusPoint不一样。
     * @private
     */
    private _focusPoint2: CanvasSelectionPoint | undefined;

    // 是否正在选中
    private _running: boolean = false;

    // 是否启用
    private _enable: boolean = true;

    // 是否全选
    private _selectAll: boolean = false;

    // 版本号
    private _version: number = 0;

    // 是否为列模式，默认为普通模式
    private _columnMode: boolean = false;

    // 记录了从那个y开始选择，那个y结束
    private _startY: number = -1;

    private _stopY: number = -1;

    // 选中的内容
    private _selectedContent: string = "";

    get anchorPoint(): CanvasSelectionPoint {
        if(this._anchorPoint == undefined) {
            console.error("this._anchorPoint is undefined");
        }
        return <CanvasSelectionPoint>this._anchorPoint;
    }

    start(x: number, y: number, offsetTop: number): CanvasSelection{
        this._anchorPoint2 = this._anchorPoint = new CanvasSelectionPoint(x, y, offsetTop);
        return this;
    }

    start2(x: number, y: number, offsetTop: number): CanvasSelection {
        this._anchorPoint2 = new CanvasSelectionPoint(x, y, offsetTop);
        return this;
    }

    stop(x: number, y: number, offsetTop: number) {
        this._focusPoint2 = this._focusPoint = new CanvasSelectionPoint(x, y, offsetTop);
        this._version++;
    }

    /**
     * 需要重新定位的话
     * @param x
     * @param y
     * @param offsetTop
     */
    stop2(x: number, y: number, offsetTop: number) {
        this._focusPoint2 = new CanvasSelectionPoint(x, y, offsetTop);
    }

    sticky(x: number, y: number, offsetTop: number){
        if(!this._focusPoint || !this._anchorPoint){
            this.stop(x, y, offsetTop);
            return;
        }

        const pageY = y + offsetTop;
        // 中间行
        const middlePageY = Math.floor((this._anchorPoint.pageY + this._focusPoint.pageY) / 2);
        if(pageY < middlePageY){
            // 将当前的点设置为start
            this.start(x, y, offsetTop);
            this._version++;
        } else {
            // 将当前的点设置为stop
            this.stop(x, y, offsetTop);
        }
    }

    get focusPoint(): CanvasSelectionPoint {
        if(this._focusPoint == undefined) {
            throw new Error("this._focusPoint is undefined");
        }
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


    set startY(value: number) {
        this._startY = value;
    }

    set stopY(value: number) {
        this._stopY = value;
    }

    get startY(): number {
        return this._startY;
    }

    get stopY(): number {
        return this._stopY;
    }

    get selectAll(): boolean {
        return this._selectAll;
    }

    set selectAll(value: boolean) {
        this._selectAll = value;
    }

    get version(): number {
        return this._version;
    }

    get columnMode(): boolean {
        return this._columnMode;
    }

    set columnMode(value: boolean) {
        this._columnMode = value;
    }

    get anchorPoint2(): CanvasSelectionPoint {
        return <CanvasSelectionPoint> this._anchorPoint2;
    }

    get focusPoint2(): CanvasSelectionPoint {
        return <CanvasSelectionPoint> this._focusPoint2;
    }


    get selectedContent(): string {
        return this._selectedContent;
    }

    set selectedContent(value: string) {
        this._selectedContent = value;
    }

    reset() {
        this._anchorPoint = new CanvasSelectionPoint(1, 1, 0);
        this._focusPoint = new CanvasSelectionPoint(1, 1, 0);
        this._running = false;

        this._enable = true;
        this._selectAll = false;

        this._columnMode = false;

        this._selectedContent = "";
    }


}