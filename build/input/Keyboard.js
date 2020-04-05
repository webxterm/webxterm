"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const VK = {
    UP: "ArrowUp",
    DOWN: "ArrowDown",
    RIGHT: "ArrowRight",
    LEFT: "ArrowLeft",
    HOME: "Home",
    END: "End",
    TAB: "Tab",
    BACKSPACE: "Backspace",
    PAUSE: "Pause",
    ESCAPE: "Escape",
    INSERT: "Insert",
    DELETE: "Delete",
    PRIOR: "Prior",
    NEXT: "Next",
    F1: "F1",
    F2: "F2",
    F3: "F3",
    F4: "F4",
    F5: "F5",
    F6: "F6",
    F7: "F7",
    F8: "F8",
    F9: "F9",
    F10: "F10",
    F11: "F11",
    F12: "F12",
    ENTER: "Enter",
};
class Keyboard {
    constructor() {
        this.combinationKeys = {};
        this.disableEchoKeys = {};
        this.keyMap = {};
        this.composition = [];
        this.combinationKeys = {
            "CTRL+@": "\x00",
            "CTRL+A": "\x01",
            "CTRL+B": "\x02",
            "CTRL+C": "\x03",
            "CTRL+D": "\x04",
            "CTRL+E": "\x05",
            "CTRL+F": "\x06",
            "CTRL+G": "\x07",
            "CTRL+H": "\x08",
            "CTRL+I": "\x09",
            "CTRL+J": "\x0a",
            "CTRL+K": "\x0b",
            "CTRL+L": "\x0c",
            "CTRL+M": "\x0d",
            "CTRL+N": "\x0e",
            "CTRL+O": "\x0f",
            "CTRL+P": "\x10",
            "CTRL+Q": "\x11",
            "CTRL+R": "\x12",
            "CTRL+S": "\x13",
            "CTRL+T": "\x14",
            "CTRL+U": "\x15",
            "CTRL+V": "\x16",
            "CTRL+W": "\x17",
            "CTRL+X": "\x18",
            "CTRL+Y": "\x19",
            "CTRL+Z": "\x1a",
            "CTRL+[": "\x1b",
            "CTRL+\\": "\x1c",
            "CTRL+]": "\x1d",
            "CTRL+^": "\x1e",
            "CTRL+_": "\x1f",
            "CTRL+`": "\x20",
            "CTRL+BACKSPACE": "\x7f"
        };
        this.disableEchoKeys = {
            "Cancel": 3,
            "Help": 6,
            "Clear": 12,
            "Shift": 16,
            "Control": 17,
            "Alt": 18,
            "Pause": 19,
            "CapsLock": 20,
            "Convert": 28,
            "NonConvert": 29,
            "Accept": 30,
            "ModeChange": 31,
            "Select": 41,
            "Print": 42,
            "Execute": 43,
            "PrintScreen": 44,
            "Insert": 45,
            "OS": 91,
            "ContextMenu": 93,
            "NumLock": 144,
            "ScrollLock": 145,
            "VolumeMute": 181,
            "VolumeDown": 182,
            "VolumeUp": 183,
            "Meta": 224,
            "AltGraph": 225,
            "Process": 229,
            "Attn": 246,
            "CrSel": 247,
            "ExSel": 248,
            "EraseEof": 249,
            "Play": 250,
            "ZoomOut": 251
        };
    }
    cursorKeysNormalMapping() {
        this.keyMap[VK.UP] = "\x1b[A";
        this.keyMap[VK.DOWN] = "\x1b[B";
        this.keyMap[VK.RIGHT] = "\x1b[C";
        this.keyMap[VK.LEFT] = "\x1b[D";
        this.keyMap[VK.HOME] = "\x1b[H";
        this.keyMap[VK.END] = "\x1b[F";
    }
    cursorKeysApplicationMapping() {
        this.keyMap[VK.UP] = "\x1bOA";
        this.keyMap[VK.DOWN] = "\x1bOB";
        this.keyMap[VK.RIGHT] = "\x1bOC";
        this.keyMap[VK.LEFT] = "\x1bOD";
        this.keyMap[VK.HOME] = "\x1bOH";
        this.keyMap[VK.END] = "\x1bOF";
    }
    keypadNumericMapping() {
        this.keyMap[VK.ENTER] = "\x0d";
        this.keyMap[VK.TAB] = "\x09";
        this.keyMap[VK.BACKSPACE] = "\x7f";
        this.keyMap[VK.PAUSE] = "\x1a";
        this.keyMap[VK.ESCAPE] = "\x1b";
        this.keyMap[VK.INSERT] = "\x1b[2~";
        this.keyMap[VK.DELETE] = "\x1b[3~";
        this.keyMap[VK.PRIOR] = "\x1b[5~";
        this.keyMap[VK.NEXT] = "\x1b[6~";
        this.keyMap[VK.F1] = "\x1bOP";
        this.keyMap[VK.F2] = "\x1bOQ";
        this.keyMap[VK.F3] = "\x1bOR";
        this.keyMap[VK.F4] = "\x1bOS";
        this.keyMap[VK.F5] = "\x1b[15~";
        this.keyMap[VK.F6] = "\x1b[17~";
        this.keyMap[VK.F7] = "\x1b[18~";
        this.keyMap[VK.F8] = "\x1b[19~";
        this.keyMap[VK.F9] = "\x1b[20~";
        this.keyMap[VK.F10] = "\x1b[21~";
        this.keyMap[VK.F11] = "\x1b[23~";
        this.keyMap[VK.F12] = "\x1b[24~";
    }
    keypadApplicationMapping() {
        this.keyMap[VK.ENTER] = "\x0d";
        this.keyMap[VK.TAB] = "\x09";
        this.keyMap[VK.BACKSPACE] = "\x7f";
        this.keyMap[VK.PAUSE] = "\x1a";
        this.keyMap[VK.ESCAPE] = "\x1b";
        this.keyMap[VK.INSERT] = "\x1b[2~";
        this.keyMap[VK.DELETE] = "\x1b[3~";
        this.keyMap[VK.PRIOR] = "\x1b[5~";
        this.keyMap[VK.NEXT] = "\x1b[6~";
        this.keyMap[VK.F1] = "\x1bOP";
        this.keyMap[VK.F2] = "\x1bOQ";
        this.keyMap[VK.F3] = "\x1bOR";
        this.keyMap[VK.F4] = "\x1bOS";
        this.keyMap[VK.F5] = "\x1b[15~";
        this.keyMap[VK.F6] = "\x1b[17~";
        this.keyMap[VK.F7] = "\x1b[18~";
        this.keyMap[VK.F8] = "\x1b[19~";
        this.keyMap[VK.F9] = "\x1b[20~";
        this.keyMap[VK.F10] = "\x1b[21~";
        this.keyMap[VK.F11] = "\x1b[23~";
        this.keyMap[VK.F12] = "\x1b[24~";
    }
    modifierKeyMapping() {
    }
    getKeySym(e, cursorApplicationMode, keypadApplicationMode) {
        let modifiers = (e.shiftKey ? 1 : 0) | (e.altKey ? 2 : 0) | (e.ctrlKey ? 4 : 0) | (e.metaKey ? 8 : 0), keySym = "", key = e.key;
        if (this.disableEchoKeys[key]) {
            console.info("disable echo key: ", key);
            return "";
        }
        if (cursorApplicationMode) {
            this.cursorKeysApplicationMapping();
        }
        else {
            this.cursorKeysNormalMapping();
        }
        if (keypadApplicationMode) {
            this.keypadApplicationMapping();
        }
        else {
            this.keypadNumericMapping();
        }
        keySym = this.keyMap[key];
        if (modifiers > 0) {
            console.info("modifiers:" + modifiers);
            if (modifiers == 4) {
                return this.combinationKeys["CTRL+" + key.toUpperCase()];
            }
        }
        else {
        }
        return keySym || key;
    }
}
exports.Keyboard = Keyboard;
