"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DataBlock_1 = require("../buffer/DataBlock");
var State;
(function (State) {
    State[State["NORMAL"] = 0] = "NORMAL";
    State[State["ESC"] = 1] = "ESC";
    State[State["CSI"] = 2] = "CSI";
    State[State["OSC"] = 3] = "OSC";
    State[State["CHARSET"] = 4] = "CHARSET";
    State[State["DCS"] = 5] = "DCS";
    State[State["IGNORE"] = 6] = "IGNORE";
    State[State["PM"] = 7] = "PM";
    State[State["APC"] = 8] = "APC";
})(State || (State = {}));
const C0 = {
    NUL: "\x00",
    SOH: "\x01",
    STX: "\x02",
    ETX: "\x03",
    EOT: "\x04",
    ENQ: "\x05",
    ACK: "\x06",
    BEL: "\x07",
    BS: "\x08",
    HT: "\x09",
    LF: "\x0a",
    VT: "\x0b",
    FF: "\x0c",
    CR: "\x0d",
    SO: "\x0e",
    SI: "\x0f",
    DLE: "\x10",
    DC1: "\x11",
    DC2: "\x12",
    DC3: "\x13",
    DC4: "\x14",
    NAK: "\x15",
    SYN: "\x16",
    ETB: "\x17",
    CAN: "\x18",
    EM: "\x19",
    SUB: "\x1a",
    ESC: "\x1b",
    FS: "\x1c",
    GS: "\x1d",
    RS: "\x1e",
    US: "\x1f",
    SP: "\x20",
    DEL: "\x7F"
};
const charsets = {};
charsets.SCLD = {
    "`": "\u25c6",
    "a": "\u2592",
    "b": "\u0009",
    "c": "\u000c",
    "d": "\u000d",
    "e": "\u000a",
    "f": "\u00b0",
    "g": "\u00b1",
    "h": "\u2424",
    "i": "\u000b",
    "j": "\u2518",
    "k": "\u2510",
    "l": "\u250c",
    "m": "\u2514",
    "n": "\u253c",
    "o": "\u23ba",
    "p": "\u23bb",
    "q": "\u2500",
    "r": "\u23bc",
    "s": "\u23bd",
    "t": "\u251c",
    "u": "\u2524",
    "v": "\u2534",
    "w": "\u252c",
    "x": "\u2502",
    "y": "\u2264",
    "z": "\u2265",
    "{": "\u03c0",
    "|": "\u2260",
    "}": "\u00a3",
    "~": "\u00b7"
};
charsets.UK = null;
charsets.US = null;
charsets.Dutch = null;
charsets.Finnish = null;
charsets.French = null;
charsets.FrenchCanadian = null;
charsets.German = null;
charsets.Italian = null;
charsets.NorwegianDanish = null;
charsets.Spanish = null;
charsets.Swedish = null;
charsets.Swiss = null;
charsets.ISOLatin = null;
class Parser {
    constructor(terminal) {
        this.charsets = [null];
        this.params = [];
        this.currentParam = 0;
        this.prefix = "";
        this.suffix = "";
        this.state = State.NORMAL;
        this._gLevel = 0;
        this._gCharset = 0;
        this._applicationKeypad = false;
        this._normalKeypad = true;
        this.promptSize = 0;
        this.terminal = terminal;
        this.promptSize = terminal.prompt.length;
    }
    get x() {
        return this.activeBuffer.x;
    }
    set x(value) {
        if (value < 1) {
            value = 1;
        }
        this.activeBuffer.x = value;
    }
    get y() {
        return this.activeBuffer.y;
    }
    set y(value) {
        if (value > this.terminal.rows) {
            value = this.terminal.rows;
        }
        else if (value < 1) {
            value = 1;
        }
        this.activeBuffer.y = value;
        if (!this.activeBufferLine.dirty)
            this.activeBufferLine.dirty = true;
    }
    get bufferSet() {
        return this.terminal.bufferSet;
    }
    get printer() {
        return this.terminal.printer;
    }
    get applicationKeypad() {
        return this._applicationKeypad;
    }
    set applicationKeypad(value) {
        this._applicationKeypad = value;
    }
    set gLevel(value) {
        this._gLevel = value;
    }
    set gCharset(value) {
        this._gCharset = value;
    }
    get viewport() {
        return this.terminal.viewport;
    }
    get activeBufferLine() {
        return this.activeBuffer.activeBufferLine;
    }
    get activeBuffer() {
        return this.bufferSet.activeBuffer;
    }
    activateAltBuffer() {
        const len = this.activeBuffer.size;
        for (let y = 1; y <= len; y++) {
            const line = this.activeBuffer.get(y);
            this.printer.printLine(line, false);
        }
        this.bufferSet.activateAltBuffer();
        this.terminal.addBufferFillRows();
    }
    activateNormalBuffer() {
        const lines = this.bufferSet.activeBuffer.lines;
        for (let i = 0, len = lines.length; i < len; i++) {
            lines[i].element.remove();
        }
        this.bufferSet.activateNormalBuffer();
        let fragment = document.createDocumentFragment();
        for (let y = 1; y <= this.activeBuffer.size; y++) {
            let line = this.activeBuffer.get(y);
            if (line && !line.used) {
                fragment.appendChild(line.element);
            }
        }
        this.viewport.appendChild(fragment);
    }
    parse(text) {
        let leftChr = "", chr = "";
        const len = text.length;
        for (let i = 0; i < len; i++) {
            chr = text[i];
            switch (this.state) {
                case State.NORMAL:
                    switch (chr) {
                        case C0.NUL:
                            break;
                        case C0.BEL:
                            this.terminal.bell();
                            break;
                        case C0.BS:
                            if (this.x > (this.promptSize + 1)) {
                                this.x--;
                            }
                            else {
                                this.terminal.bell();
                            }
                            break;
                        case C0.CR:
                            this.x = 1;
                            break;
                        case C0.ENQ:
                            break;
                        case C0.FF:
                        case C0.LF:
                            this.nextLine();
                            break;
                        case C0.SI:
                            break;
                        case C0.SO:
                            break;
                        case C0.HT:
                            this.tab();
                            break;
                        case C0.VT:
                            this.nextLine();
                            break;
                        case C0.ESC:
                            this.state = State.ESC;
                            break;
                        default:
                            if (!this.handleDoubleChars(chr)) {
                                this.update(chr);
                            }
                            break;
                    }
                    break;
                case State.CHARSET:
                    let cs;
                    switch (chr) {
                        case '0':
                            cs = charsets.SCLD;
                            break;
                        case 'A':
                            cs = charsets.UK;
                            break;
                        case 'B':
                            cs = charsets.US;
                            break;
                        case '5':
                        case 'C':
                            cs = charsets.Finnish;
                            break;
                        case '7':
                        case 'H':
                            cs = charsets.Swedish;
                            break;
                        case 'K':
                            cs = charsets.German;
                            break;
                        case '9':
                        case 'Q':
                            cs = charsets.FrenchCanadian;
                            break;
                        case 'f':
                        case 'R':
                            cs = charsets.French;
                            break;
                        case 'Y':
                            cs = charsets.Italian;
                            break;
                        case 'Z':
                            cs = charsets.Spanish;
                            break;
                        case '4':
                            cs = charsets.Dutch;
                            break;
                        case '"':
                            i++;
                            break;
                        case '%':
                            i++;
                            break;
                        case '=':
                            cs = charsets.Swiss;
                            break;
                        case '`':
                        case 'E':
                        case '6':
                            cs = charsets.NorwegianDanish;
                            break;
                        case '<':
                            break;
                        case '>':
                            break;
                        case '&':
                            i++;
                            break;
                        default:
                            cs = charsets.US;
                            break;
                    }
                    this.state = State.NORMAL;
                    break;
                case State.CSI:
                    if (this.params.length === 0) {
                        if (chr === " "
                            || chr === "?"
                            || chr === ">"
                            || chr === "="
                            || chr === "!"
                            || chr === "#") {
                            this.prefix = chr;
                            break;
                        }
                    }
                    else {
                        if (chr === "@"
                            || chr === "`"
                            || chr === "$"
                            || chr === "\""
                            || chr === "*"
                            || chr === "#") {
                            this.suffix = chr;
                            break;
                        }
                    }
                    if (chr >= "0" && chr <= "9") {
                        this.currentParam = this.currentParam * 10 + chr.charCodeAt(0) - 48;
                        break;
                    }
                    this.params.push(this.currentParam);
                    this.currentParam = 0;
                    if (chr === ";")
                        break;
                    this.terminal.esParser.parse(chr, this.params, this.prefix, this.suffix);
                    this.params = [];
                    this.currentParam = 0;
                    this.prefix = "";
                    this.suffix = "";
                    this.state = State.NORMAL;
                    break;
                case State.DCS:
                    break;
                case State.ESC:
                    switch (chr) {
                        case "D":
                            this.index();
                            this.state = State.NORMAL;
                            break;
                        case "E":
                            this.nextLine();
                            this.state = State.NORMAL;
                            break;
                        case "H":
                            this.state = State.NORMAL;
                            break;
                        case "M":
                            this.reverseIndex();
                            this.state = State.NORMAL;
                            break;
                        case "N":
                            this.state = State.NORMAL;
                            break;
                        case "O":
                            this.state = State.NORMAL;
                            break;
                        case "P":
                            this.state = State.NORMAL;
                            break;
                        case "V":
                            this.state = State.NORMAL;
                            break;
                        case "X":
                            this.state = State.NORMAL;
                            break;
                        case "Z":
                            this.state = State.NORMAL;
                            break;
                        case "[":
                            this.params = [];
                            this.currentParam = 0;
                            this.prefix = "";
                            this.suffix = "";
                            this.state = State.CSI;
                            break;
                        case "\"":
                            break;
                        case "]":
                            this.params = [];
                            this.currentParam = 0;
                            this.prefix = "";
                            this.suffix = "";
                            this.state = State.OSC;
                            break;
                        case "^":
                            this.state = State.PM;
                            break;
                        case "_":
                            this.state = State.APC;
                            break;
                        case C0.SP:
                            this.state = State.NORMAL;
                            i++;
                            break;
                        case "#":
                            this.state = State.NORMAL;
                            i++;
                            break;
                        case "%":
                            this.gLevel = 0;
                            this.gCharset = 0;
                            this.charsets[0] = charsets.US;
                            this.state = State.NORMAL;
                            i++;
                            break;
                        case "(":
                            this.gCharset = 0;
                            this.state = State.CHARSET;
                            break;
                        case ")":
                            this.gCharset = 1;
                            this.state = State.CHARSET;
                            break;
                        case "*":
                            this.gCharset = 2;
                            this.state = State.CHARSET;
                            break;
                        case "+":
                            this.gCharset = 3;
                            this.state = State.CHARSET;
                            break;
                        case "-":
                            this.gCharset = 1;
                            this.state = State.CHARSET;
                            break;
                        case ".":
                            this.gCharset = 2;
                            this.state = State.CHARSET;
                            break;
                        case "/":
                            this.gCharset = 3;
                            this.state = State.CHARSET;
                            break;
                        case "6":
                            this.state = State.NORMAL;
                            break;
                        case "7":
                            this.state = State.NORMAL;
                            break;
                        case "8":
                            this.state = State.NORMAL;
                            break;
                        case "9":
                            this.state = State.NORMAL;
                            break;
                        case "=":
                            this._applicationKeypad = true;
                            this._normalKeypad = false;
                            this.state = State.NORMAL;
                            break;
                        case ">":
                            this._applicationKeypad = false;
                            this._normalKeypad = true;
                            this.state = State.NORMAL;
                            break;
                        case "F":
                            this.state = State.NORMAL;
                            break;
                        case "c":
                            this.state = State.NORMAL;
                            break;
                        case "l":
                            this.state = State.NORMAL;
                            break;
                        case "m":
                            this.state = State.NORMAL;
                            break;
                        case "n":
                            this.state = State.NORMAL;
                            break;
                        case "o":
                            this.state = State.NORMAL;
                            break;
                        case "|":
                            this.state = State.NORMAL;
                            break;
                        case "}":
                            this.state = State.NORMAL;
                            break;
                        case "~":
                            this.state = State.NORMAL;
                            break;
                    }
                    break;
                case State.IGNORE:
                    break;
                case State.OSC:
                    leftChr = text[i - 1];
                    if ((leftChr === C0.ESC && chr === '\\') || chr === C0.BEL) {
                        if (leftChr === C0.ESC) {
                            if (typeof this.currentParam === 'string') {
                                this.currentParam = this.currentParam.slice(0, -1);
                            }
                            else if (typeof this.currentParam == 'number') {
                                this.currentParam = (this.currentParam - ('\x1b'.charCodeAt(0) - 48)) / 10;
                            }
                        }
                        this.params.push(this.currentParam);
                        this.terminal.oscParser.parse(this.params);
                        this.params = [];
                        this.currentParam = 0;
                        this.state = State.NORMAL;
                    }
                    else {
                        if (!this.params.length) {
                            if (chr >= '0' && chr <= '9') {
                                this.currentParam =
                                    this.currentParam * 10 + chr.charCodeAt(0) - 48;
                            }
                            else if (chr === ';') {
                                this.params.push(this.currentParam);
                                this.currentParam = '';
                            }
                            else {
                                if (this.currentParam === 0) {
                                    this.currentParam = '';
                                }
                                this.currentParam += chr;
                            }
                        }
                        else {
                            this.currentParam += chr;
                        }
                    }
                    break;
                case State.PM:
                    leftChr = text[i - 1];
                    if ((leftChr === C0.ESC && chr === '\\') || chr === C0.BEL) {
                        if (leftChr === C0.ESC) {
                            if (typeof this.currentParam === 'string') {
                                this.currentParam = this.currentParam.slice(0, -1);
                            }
                            else if (typeof this.currentParam == 'number') {
                                this.currentParam = (this.currentParam - ('\x1b'.charCodeAt(0) - 48)) / 10;
                            }
                        }
                        this.params.push(this.currentParam);
                        switch (this.params[0]) {
                            case 0:
                            case 1:
                                this.terminal.registerConnect();
                                this.terminal.cursor.enable = false;
                                break;
                            case 2:
                                break;
                            case 3:
                                if (this.terminal.eventMap["heartbeat"])
                                    this.terminal.eventMap["heartbeat"](this.params[1]);
                                break;
                        }
                        this.params = [];
                        this.currentParam = 0;
                        this.state = State.NORMAL;
                    }
                    else {
                        if (!this.params.length) {
                            if (chr >= '0' && chr <= '9') {
                                this.currentParam =
                                    this.currentParam * 10 + chr.charCodeAt(0) - 48;
                            }
                            else if (chr === ';') {
                                this.params.push(this.currentParam);
                                this.currentParam = '';
                            }
                            else {
                                if (this.currentParam === 0) {
                                    this.currentParam = '';
                                }
                                this.currentParam += chr;
                            }
                        }
                        else {
                            this.currentParam += chr;
                        }
                    }
                    break;
            }
        }
        if (!this.activeBufferLine.dirty)
            this.activeBufferLine.dirty = true;
        this.printer.printBuffer();
        this.terminal.scrollToBottomOnInput();
    }
    handleDoubleChars(chr, href = "") {
        if (/[\u4E00-\u9FA5]|[\uFE30-\uFFA0]/gi.test(chr)) {
            if (this.x > this.activeBuffer.columns) {
                this.nextLine();
                this.x = 1;
            }
            let block = DataBlock_1.DataBlock.newBlock(chr, this.terminal.esParser.attribute);
            block.attribute.len2 = true;
            if (!!href) {
                block.href = href;
            }
            let block2 = DataBlock_1.DataBlock.newEmptyBlock();
            block2.empty = true;
            if (this.terminal.esParser.insertMode) {
                this.activeBufferLine.insert(this.x, block, block2);
            }
            else if (this.terminal.esParser.replaceMode) {
                this.activeBufferLine.replace(this.x, block, block2);
            }
            if (!this.activeBufferLine.dirty)
                this.activeBufferLine.dirty = true;
            this.x += 2;
            return true;
        }
        return false;
    }
    tab() {
        const tabSize = this.terminal.preferences.tabSize;
        let spCount = tabSize - ((this.x - 1) % tabSize);
        for (let i = 0; i < spCount; i++) {
            this.update(" ");
        }
    }
    index() {
        if (++this.y > this.activeBuffer.scrollBottom) {
            this.y = this.activeBuffer.scrollBottom;
            this.scrollUp();
        }
        else {
            if (!this.bufferSet.activeBuffer.get(this.y)) {
                this.newLine();
            }
        }
    }
    reverseIndex() {
        if (this.y <= this.activeBuffer.scrollTop) {
            this.scrollDown();
        }
        else {
            this.y--;
        }
    }
    nextLine() {
        if (this.y === this.activeBuffer.scrollBottom) {
            this.scrollUp();
        }
        else {
            this.y += 1;
        }
    }
    saveCursor() {
        this.printer.printLine(this.activeBuffer.get(this.y));
        this.activeBuffer.savedY = this.y;
        this.activeBuffer.savedX = this.x;
    }
    restoreCursor() {
        this.y = this.activeBuffer.savedY;
        this.x = this.activeBuffer.savedX;
    }
    newLine() {
        let line = this.activeBuffer.getBlankLine();
        this.activeBuffer.append(line);
        this.viewport.appendChild(line.element);
    }
    update(chr, href = "") {
        if (this.x > this.activeBuffer.columns) {
            this.nextLine();
            this.x = 1;
        }
        let block = DataBlock_1.DataBlock.newBlock(chr, this.terminal.esParser.attribute);
        if (!!href) {
            block.href = href;
        }
        if (this.terminal.esParser.insertMode) {
            this.activeBufferLine.insert(this.x, block);
        }
        else if (this.terminal.esParser.replaceMode) {
            this.activeBufferLine.replace(this.x, block);
            this.x += 1;
        }
        if (!this.activeBufferLine.dirty) {
            this.activeBufferLine.dirty = true;
        }
    }
    insertLine() {
        let line = this.activeBuffer.getBlankLine();
        let afterNode = this.activeBuffer.insert(this.y, line)[0];
        this.viewport.insertBefore(line.element, afterNode);
        const y = this.activeBuffer.scrollBottom + 1;
        this.activeBuffer.delete(y, 1, false);
    }
    deleteLine() {
        const line = this.activeBuffer.getBlankLine();
        if (this.activeBuffer.scrollBottom === this.terminal.rows) {
            this.activeBuffer.append(line);
            this.viewport.appendChild(line.element);
        }
        else {
            const y = this.activeBuffer.scrollBottom + 1;
            let afterNode = this.activeBuffer.insert(y, line)[0];
            this.viewport.insertBefore(line.element, afterNode);
        }
        this.activeBuffer.delete(this.y, 1, false);
    }
    scrollUp() {
        let line = this.activeBuffer.getBlankLine();
        if (this.activeBuffer.scrollBottom === this.terminal.rows) {
            this.activeBuffer.append(line);
            this.viewport.appendChild(line.element);
        }
        else {
            const y = this.activeBuffer.scrollBottom + 1;
            let afterNode = this.activeBuffer.insert(y, line)[0];
            this.viewport.insertBefore(line.element, afterNode);
        }
        const saveLines = this.activeBuffer.scrollTop === 1;
        const savedLines = this.activeBuffer.delete(this.activeBuffer.scrollTop, 1, saveLines);
        for (let savedLine of savedLines) {
            this.printer.printLine(savedLine, false);
        }
    }
    scrollDown() {
        let line = this.activeBuffer.getBlankLine();
        this.activeBuffer.delete(this.activeBuffer.scrollBottom, 1, false);
        let afterNode = this.activeBuffer.insert(this.activeBuffer.scrollTop, line)[0];
        this.viewport.insertBefore(line.element, afterNode);
    }
}
exports.Parser = Parser;
