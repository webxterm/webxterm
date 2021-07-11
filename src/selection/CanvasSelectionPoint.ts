/**
 * 选择器的点
 */
export class CanvasSelectionPoint {

    // private _x: number = 0;
    // private _y: number = 0;

    // 光标在页面上可视区域的位置，从浏览器可视区域左上角开始
    private readonly _clientX: number = 0;
    private readonly _clientY: number = 0;

    // 光标在页面上的位置,从页面左上角开始
    private readonly _pageX: number = 0;
    private readonly _pageY: number = 0;

    private readonly _offsetTop: number = 0;


    constructor(clientX: number = 0, clientY: number = 0, offsetTop: number = 0) {
        // this._x = x;
        // this._y = y;
        this._clientX = clientX;
        this._clientY = clientY;

        this._pageX = clientX;
        this._pageY = offsetTop + clientY;

        this._offsetTop = offsetTop;
    }

    get x(): number {
        return this._clientX;
    }

    get y(): number {
        return this._clientY;
    }

    get clientX(): number {
        return this._clientX;
    }

    get clientY(): number {
        return this._clientY;
    }

    get pageX(): number {
        return this._pageX;
    }

    get pageY(): number {
        return this._pageY;
    }

    get offsetTop(): number {
        return this._offsetTop;
    }

//
    // reset() {
    //     // this._x = 0;
    //     // this._y = 0;
    //
    //     this._clientX = this._clientY = this._pageX = this._pageY = 0;
    // }





}