"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const VK = {
    SHIFT: "SHIFT"
};
class KeyMap {
    constructor() {
        this.columnMode = {
            map: VK.SHIFT,
            description: "column mode"
        };
    }
}
exports.KeyMap = KeyMap;
