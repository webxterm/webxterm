"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ATTR_MODE_NONE = 0, exports.ATTR_MODE_BOLD = 1, exports.ATTR_MODE_INVERSE = 2, exports.ATTR_MODE_ITALIC = 4, exports.ATTR_MODE_FAINT = 8, exports.ATTR_MODE_UNDERLINE = 16, exports.ATTR_MODE_SLOW_BLINK = 32, exports.ATTR_MODE_INVISIBLE = 64;
class DataBlockAttribute {
    constructor() {
        this.bold = 0;
        this.faint = 0;
        this.italic = 0;
        this.underline = 0;
        this.slowBlink = 0;
        this.inverse = 0;
        this.invisible = 0;
        this.colorClass = "";
        this.backgroundColorClass = "";
    }
    get sum() {
        return this.bold
            + this.inverse
            + this.italic
            + this.faint
            + this.underline
            + this.slowBlink
            + this.invisible;
    }
    reset() {
        if (this.bold != 0)
            this.bold = 0;
        if (this.inverse != 0)
            this.inverse = 0;
        if (this.italic != 0)
            this.italic = 0;
        if (this.faint != 0)
            this.faint = 0;
        if (this.underline != 0)
            this.underline = 0;
        if (this.slowBlink != 0)
            this.slowBlink = 0;
        if (this.invisible != 0)
            this.invisible = 0;
        if (this.colorClass != "")
            this.colorClass = "";
        if (this.backgroundColorClass != "")
            this.backgroundColorClass = "";
    }
}
exports.DataBlockAttribute = DataBlockAttribute;
