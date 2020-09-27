"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Font {
    constructor() {
        this.fontSizes = {};
    }
    getFontSize(pt) {
        return this.fontSizes[pt];
    }
    getFontName() {
        return "";
    }
    getLineHeight() {
        return 1;
    }
}
exports.Font = Font;
