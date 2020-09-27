/**
 * 滚动区域
 */
export class ScrollingRegion {
    private _top: number = 1;
    private _bottom: number = 1;

    get top(): number {
        return this._top;
    }

    set top(value: number) {
        this._top = value;
    }

    get bottom(): number {
        return this._bottom;
    }

    set bottom(value: number) {
        this._bottom = value;
    }

    get top_index(): number {
        return this._top - 1;
    }

    get bottom_index(): number {
        return this._bottom - 1;
    }

}