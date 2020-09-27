"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DataBlock {
    constructor() {
        this._data = " ";
        this._isEmpty = true;
        this._length = 0;
        this._displaySize = 1;
        this._isDefaultAttrs = true;
        this._colorClass = "";
        this._backgroundColorClass = "";
        this._className = "";
        this._isBold = false;
        this._isFaint = false;
        this._isUnderline = false;
        this._isItalic = false;
        this._isSlowBlink = false;
        this._isRapidBlink = false;
        this._isInverse = false;
        this._isInvisible = false;
        this._isCrossedOut = false;
    }
    static getDataBlock() {
        if (DataBlock.instance == null) {
            DataBlock.instance = new DataBlock();
        }
        else {
            DataBlock.instance.reset();
        }
        return DataBlock.instance;
    }
    reset() {
        if (this._data != " ")
            this._data = " ";
        if (!this._isEmpty)
            this._isEmpty = true;
        if (this._length != 0)
            this._length = 0;
        if (this._displaySize != 1)
            this._displaySize = 1;
        if (!this._isDefaultAttrs)
            this._isDefaultAttrs = true;
        if (this._colorClass != "")
            this._colorClass = "";
        if (this._backgroundColorClass != "")
            this._backgroundColorClass = "";
        if (this._className)
            this._className = "";
        if (this._isBold)
            this._isBold = false;
        if (this._isFaint)
            this._isFaint = false;
        if (this._isUnderline)
            this._isUnderline = false;
        if (this._isItalic)
            this._isItalic = false;
        if (this._isSlowBlink)
            this._isSlowBlink = false;
        if (this._isRapidBlink)
            this._isRapidBlink = false;
        if (this._isInverse)
            this._isInverse = false;
        if (this._isInvisible)
            this._isInvisible = false;
        if (this._isCrossedOut)
            this._isCrossedOut = false;
    }
    get data() {
        return this._data;
    }
    set data(value) {
        this._data = value;
    }
    get isEmpty() {
        return this._isEmpty;
    }
    set isEmpty(value) {
        this._isEmpty = value;
    }
    get length() {
        return this._length;
    }
    set length(value) {
        this._length = value;
    }
    get displaySize() {
        return this._displaySize;
    }
    set displaySize(value) {
        this._displaySize = value;
    }
    get colorClass() {
        return this._colorClass;
    }
    set colorClass(value) {
        this._colorClass = value;
    }
    get backgroundColorClass() {
        return this._backgroundColorClass;
    }
    set backgroundColorClass(value) {
        this._backgroundColorClass = value;
    }
    get isBold() {
        return this._isBold;
    }
    set isBold(value) {
        this._isBold = value;
    }
    get isFaint() {
        return this._isFaint;
    }
    set isFaint(value) {
        this._isFaint = value;
    }
    get isUnderline() {
        return this._isUnderline;
    }
    set isUnderline(value) {
        this._isUnderline = value;
    }
    get isItalic() {
        return this._isItalic;
    }
    set isItalic(value) {
        this._isItalic = value;
    }
    get isSlowBlink() {
        return this._isSlowBlink;
    }
    set isSlowBlink(value) {
        this._isSlowBlink = value;
    }
    get isRapidBlink() {
        return this._isRapidBlink;
    }
    set isRapidBlink(value) {
        this._isRapidBlink = value;
    }
    get isInverse() {
        return this._isInverse;
    }
    set isInverse(value) {
        this._isInverse = value;
    }
    get isInvisible() {
        return this._isInvisible;
    }
    set isInvisible(value) {
        this._isInvisible = value;
    }
    get isCrossedOut() {
        return this._isCrossedOut;
    }
    set isCrossedOut(value) {
        this._isCrossedOut = value;
    }
    get isDefaultAttrs() {
        return this._isDefaultAttrs;
    }
    set isDefaultAttrs(value) {
        this._isDefaultAttrs = value;
    }
    get className() {
        return this._className;
    }
    set className(value) {
        this._className = value;
    }
}
exports.DataBlock = DataBlock;
