"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DataBlockAttribute {
    constructor() {
        this._len2 = false;
        this._bold = false;
        this._faint = false;
        this._italic = false;
        this._underline = false;
        this._slowBlink = false;
        this._rapidBlink = false;
        this._inverse = false;
        this._invisible = false;
        this._crossedOut = false;
        this._colorClass = "";
        this._backgroundColorClass = "";
        this._version = 0;
    }
    get len2() {
        return this._len2;
    }
    set len2(value) {
        if (value == this._len2)
            return;
        this._len2 = value;
        this._version += 1;
    }
    get bold() {
        return this._bold;
    }
    set bold(value) {
        if (value == this._bold)
            return;
        this._bold = value;
        this._version += 1;
    }
    get faint() {
        return this._faint;
    }
    set faint(value) {
        if (value == this._faint)
            return;
        this._faint = value;
        this._version += 1;
    }
    get italic() {
        return this._italic;
    }
    set italic(value) {
        if (value == this._italic)
            return;
        this._italic = value;
        this._version += 1;
    }
    get underline() {
        return this._underline;
    }
    set underline(value) {
        if (value == this._underline)
            return;
        this._underline = value;
        this._version += 1;
    }
    get slowBlink() {
        return this._slowBlink;
    }
    set slowBlink(value) {
        if (value == this._slowBlink)
            return;
        this._slowBlink = value;
        this._version += 1;
    }
    get rapidBlink() {
        return this._rapidBlink;
    }
    set rapidBlink(value) {
        if (value == this._rapidBlink)
            return;
        this._rapidBlink = value;
        this._version += 1;
    }
    get inverse() {
        return this._inverse;
    }
    set inverse(value) {
        if (value == this._inverse)
            return;
        this._inverse = value;
        this._version += 1;
    }
    get invisible() {
        return this._invisible;
    }
    set invisible(value) {
        if (value == this._invisible)
            return;
        this._invisible = value;
        this._version += 1;
    }
    get crossedOut() {
        return this._crossedOut;
    }
    set crossedOut(value) {
        if (value == this._crossedOut)
            return;
        this._crossedOut = value;
        this._version += 1;
    }
    get colorClass() {
        return this._colorClass;
    }
    set colorClass(value) {
        if (value == this._colorClass)
            return;
        this._colorClass = value;
        this._version += 1;
    }
    get backgroundColorClass() {
        return this._backgroundColorClass;
    }
    set backgroundColorClass(value) {
        if (value == this._backgroundColorClass)
            return;
        this._backgroundColorClass = value;
        this._version += 1;
    }
    get version() {
        return this._version;
    }
}
exports.DataBlockAttribute = DataBlockAttribute;
