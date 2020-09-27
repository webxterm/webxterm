"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Terminal_1 = require("../Terminal");
const State = {
    NORMAL: 0, ESC: 1, CSI: 2, OSC: 3, CHARSET: 4, DCS: 5, IGNORE: 6, PM: 7, APC: 8
};
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
    }
    get bufferSet() {
        return this.terminal.bufferSet;
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
    get activeBuffer() {
        return this.bufferSet.activeBuffer;
    }
    activateAltBuffer() {
        const len = this.activeBuffer.size;
        for (let y = 1; y <= len; y++) {
            if (this.terminal.renderType == Terminal_1.RenderType.HTML) {
            }
            else if (this.terminal.renderType == Terminal_1.RenderType.CANVAS) {
            }
        }
        this.bufferSet.activateAltBuffer();
        this.terminal.addBufferFillRows();
    }
    activateNormalBuffer() {
        this.bufferSet.activateNormalBuffer();
    }
    parse(strings, isComposition, callback = undefined) {
        let leftChr = "";
        let heartBeatValue = '';
        const text = Array.from(strings), len = text.length;
        for (let i = 0, s; i < len; i++) {
            s = text[i];
            switch (this.state) {
                case State.NORMAL:
                    switch (s) {
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
                            if (this.terminal.renderType == Terminal_1.RenderType.CANVAS) {
                                this.tab();
                            }
                            break;
                        case C0.VT:
                            this.nextLine();
                            break;
                        case C0.ESC:
                            this.state = State.ESC;
                            break;
                        default:
                            {
                                const asciiStandardCode = s.codePointAt(0);
                                if (asciiStandardCode && 32 <= asciiStandardCode && asciiStandardCode < 127) {
                                    if (s.codePointAt(1) == undefined) {
                                        this.update(s);
                                        break;
                                    }
                                }
                            }
                            const result = this.handleEmoji(i, s, text);
                            if (result != -1) {
                                i = result;
                                break;
                            }
                            if (!this.handleDoubleChars(s)) {
                                this.update(s);
                            }
                            break;
                    }
                    break;
                case State.CHARSET:
                    let cs;
                    switch (s) {
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
                        if (s === " "
                            || s === "?"
                            || s === ">"
                            || s === "="
                            || s === "!"
                            || s === "#") {
                            this.prefix = s;
                            break;
                        }
                    }
                    else {
                        if (s === "@"
                            || s === "`"
                            || s === "$"
                            || s === "\""
                            || s === "*"
                            || s === "#") {
                            this.suffix = s;
                            break;
                        }
                    }
                    if (s >= "0" && s <= "9") {
                        this.currentParam = this.currentParam * 10 + s.charCodeAt(0) - 48;
                        break;
                    }
                    this.params.push(this.currentParam);
                    this.currentParam = 0;
                    if (s === ";")
                        break;
                    this.terminal.esParser.parse(s, this.params, this.prefix, this.suffix);
                    this.params = [];
                    this.currentParam = 0;
                    this.prefix = "";
                    this.suffix = "";
                    this.state = State.NORMAL;
                    break;
                case State.DCS:
                    break;
                case State.ESC:
                    switch (s) {
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
                            this.currentParam = 0;
                            this.params = [];
                            this.prefix = "";
                            this.suffix = "";
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
                    if ((leftChr === C0.ESC && s === '\\') || s === C0.BEL) {
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
                            if (s >= '0' && s <= '9') {
                                this.currentParam =
                                    this.currentParam * 10 + s.charCodeAt(0) - 48;
                            }
                            else if (s === ';') {
                                this.params.push(this.currentParam);
                                this.currentParam = '';
                            }
                            else {
                                if (this.currentParam === 0) {
                                    this.currentParam = '';
                                }
                                this.currentParam += s;
                            }
                        }
                        else {
                            this.currentParam += s;
                        }
                    }
                    break;
                case State.PM:
                    if ((leftChr === C0.ESC && s === '\\') || s === C0.BEL) {
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
                                return;
                            case 2:
                                return;
                            case 3:
                                heartBeatValue = this.params[1];
                                if (this.terminal.eventMap["heartbeat"])
                                    this.terminal.eventMap["heartbeat"](heartBeatValue);
                        }
                        this.params = [];
                        this.currentParam = 0;
                        this.state = State.NORMAL;
                    }
                    else {
                        if (!this.params.length) {
                            if (s >= '0' && s <= '9') {
                                this.currentParam =
                                    this.currentParam * 10 + s.charCodeAt(0) - 48;
                            }
                            else if (s === ';') {
                                this.params.push(this.currentParam);
                                this.currentParam = '';
                            }
                            else {
                                if (this.currentParam === 0) {
                                    this.currentParam = '';
                                }
                                this.currentParam += s;
                            }
                        }
                        else {
                            this.currentParam += s;
                        }
                    }
                    break;
            }
            leftChr = s;
        }
        if (!!heartBeatValue && strings == '\x1b^3;' + heartBeatValue + '\x1b\\') {
            return;
        }
        if (this.terminal.textRenderer) {
            this.terminal.textRenderer.flushLines(this.activeBuffer.change_buffer, false);
        }
        console.info("Parser:x" + this.x);
        this.terminal.scrollToBottomOnInput();
        if (callback) {
            callback(len, this);
        }
    }
    pushAuxCodePoint(codePoint, array) {
        if (!codePoint)
            return array;
        if (!(codePoint >= 0xDC00 && codePoint <= 0xDFFF)) {
            array.push(codePoint);
        }
        return array;
    }
    pushStr(s, array) {
        const codePoint0 = s.codePointAt(0), codePoint1 = s.codePointAt(1);
        array.push(codePoint0 || 0);
        return this.pushAuxCodePoint(codePoint1 || 0, array);
    }
    outputEmoji(dataArray, isJoining = false) {
        this.update(String.fromCodePoint(...dataArray));
    }
    handleEmoji(start, s, text) {
        let i = start;
        const codePoint0 = s.codePointAt(0) || 0;
        const codePoint1 = s.codePointAt(1) || 0;
        const nextCodePoint0 = text[i + 1] ? (text[i + 1].codePointAt(0) || 0) : 0;
        const array = [];
        if (nextCodePoint0 === 0xFE0E) {
            i++;
            array.push(codePoint0, nextCodePoint0);
            this.outputEmoji(array);
            return i;
        }
        else if (nextCodePoint0 === 0xFE0F) {
            i++;
            array.push(codePoint0);
            this.pushAuxCodePoint(codePoint1, array);
            array.push(nextCodePoint0);
            const codePoint = text[i + 1] ? text[i + 1].codePointAt(0) : 0;
            if (codePoint === 0x20E3) {
                i++;
                array.push(codePoint);
                this.outputEmoji(array);
            }
            else if (codePoint === 0x200D) {
                array.push(codePoint);
                i++;
                if (text[i + 1]) {
                    this.pushStr(text[i + 1], array);
                    i++;
                }
                if (text[i + 1] && text[i + 1].codePointAt(0) === 0xFE0F) {
                    this.pushStr(text[i + 1], array);
                    this.outputEmoji(array, true);
                    i++;
                }
                else {
                    this.outputEmoji(array, true);
                }
            }
            else {
                this.outputEmoji(array);
            }
            return i;
        }
        else if (0x1F3FB <= nextCodePoint0 && nextCodePoint0 <= 0x1F3FF) {
            array.push(codePoint0);
            this.pushAuxCodePoint(codePoint1, array);
            array.push(nextCodePoint0);
            i++;
            if (text[i + 1] && text[i + 1].codePointAt(0) === 0x200D) {
                array.push(0x200D);
                i++;
                if (text[i + 1]) {
                    this.pushStr(text[i + 1], array);
                    i++;
                }
                if (text[i + 1]) {
                    const codePoint0 = text[i + 1].codePointAt(0) || 0;
                    if (codePoint0 === 0x200D) {
                        array.push(codePoint0);
                        i++;
                        if (text[i + 1] && text[i + 2]) {
                            const next3CodePoint0 = text[i + 2].codePointAt(0) || 0;
                            if (0x1F3FB <= next3CodePoint0 && next3CodePoint0 <= 0x1F3FF) {
                                this.pushStr(text[i + 1], array);
                                i++;
                                array.push(next3CodePoint0);
                                i++;
                                this.outputEmoji(array, true);
                            }
                        }
                    }
                    else if (codePoint0 === 0xFE0F) {
                        array.push(codePoint0);
                        i++;
                        this.outputEmoji(array, true);
                    }
                    else {
                        this.outputEmoji(array, true);
                    }
                }
                else {
                    this.outputEmoji(array, true);
                }
                return i;
            }
            this.outputEmoji(array, true);
            i++;
            return i;
        }
        else if (nextCodePoint0 === 0x200D) {
            array.push(codePoint0);
            this.pushAuxCodePoint(codePoint1, array);
            array.push(nextCodePoint0);
            i++;
            if (text[i + 1]) {
                this.pushStr(text[i + 1], array);
                i++;
            }
            if (text[i + 1]) {
                const codePoint0 = text[i + 1].codePointAt(0);
                if (codePoint0 === 0x200D) {
                    array.push(codePoint0);
                    i++;
                    if (text[i + 1]) {
                        this.pushStr(text[i + 1], array);
                        i++;
                        if (text[i + 1]) {
                            const next3CodePoint0 = text[i + 1].codePointAt(0);
                            if (next3CodePoint0 === 0x200D) {
                                array.push(next3CodePoint0);
                                i++;
                                if (text[i + 1]) {
                                    this.pushStr(text[i + 1], array);
                                    i++;
                                    this.outputEmoji(array, true);
                                }
                            }
                            else {
                                this.outputEmoji(array, true);
                            }
                        }
                        else {
                            this.outputEmoji(array, true);
                        }
                    }
                }
                else if (codePoint0 === 0xFE0F) {
                    array.push(codePoint0);
                    i++;
                    if (text[i + 1]) {
                        const next2CodePoint0 = text[i + 1].codePointAt(0);
                        if (next2CodePoint0 === 0x200D) {
                            array.push(next2CodePoint0);
                            i++;
                            if (text[i + 1]) {
                                this.pushStr(text[i + 1], array);
                                i++;
                                if (text[i + 1]) {
                                    const next4CodePoint0 = text[i + 1].codePointAt(0);
                                    if (next4CodePoint0 === 0x200D) {
                                        array.push(next4CodePoint0);
                                        i++;
                                        if (text[i + 1]) {
                                            this.pushStr(text[i + 1], array);
                                            i++;
                                            this.outputEmoji(array, true);
                                        }
                                    }
                                    else {
                                        this.outputEmoji(array, true);
                                    }
                                }
                                else {
                                    this.outputEmoji(array, true);
                                }
                            }
                        }
                        else {
                            this.outputEmoji(array, true);
                        }
                    }
                    else {
                        this.outputEmoji(array, true);
                    }
                }
                else {
                    this.outputEmoji(array, true);
                }
            }
            else {
                this.outputEmoji(array, true);
            }
            return i;
        }
        else if (nextCodePoint0 >= 0x1F1E6 && nextCodePoint0 <= 0x1F1FF) {
            if (codePoint0 >= 0x1F1E6 && codePoint0 <= 0x1F1FF) {
                array.push(codePoint0);
                this.pushAuxCodePoint(codePoint1 || 0, array);
                array.push(nextCodePoint0);
                const nextCodePoint1 = text[i + 1] ? (text[i + 1].codePointAt(1) || 0) : 0;
                this.pushAuxCodePoint(nextCodePoint1 || 0, array);
                this.outputEmoji(array);
                i++;
            }
            return i;
        }
        if (codePoint1 >= 0xDC00 && codePoint1 <= 0xDFFF) {
            console.info("辅助平面字符：" + String.fromCodePoint(codePoint0));
            this.outputEmoji([codePoint0]);
            return i;
        }
        return -1;
    }
    handleDoubleChars(chr) {
        if (/[\u4E00-\u9FA5]|[\uFE30-\uFFA0]|[\u3000-\u303F]|[\u2E80-\u2EFF]/gi.test(chr)) {
            if (this.x > this.activeBuffer.columns) {
                this.nextLine(true);
                this.x = 1;
            }
            this.activeBuffer.replace(this.y - 1, this.x - 1, 2, this.terminal.esParser.attribute, chr, "");
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
            if (!this.bufferSet.activeBuffer.change_buffer.lines[this.y]) {
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
    nextLine(isSoftWrap = false) {
        if (isSoftWrap)
            console.info("isSoftWrap:" + isSoftWrap);
        this.activeBuffer.change_buffer.line_soft_wraps[this.y - 1] = isSoftWrap ? 1 : 0;
        if (this.y === this.activeBuffer.scrollBottom) {
            this.scrollUp();
        }
        else {
            this.y += 1;
        }
    }
    saveCursor() {
        if (this.terminal.cursorRenderer)
            this.terminal.cursorRenderer.clearCursor();
        this.activeBuffer.savedY = this.y;
        this.activeBuffer.savedX = this.x;
    }
    restoreCursor() {
        this.y = this.activeBuffer.savedY;
        this.x = this.activeBuffer.savedX;
    }
    newLine() {
        this.activeBuffer.appendLine();
    }
    update(chr) {
        if (this.x > this.activeBuffer.columns) {
            this.nextLine(true);
            this.x = 1;
        }
        this.activeBuffer.replace(this.y - 1, this.x - 1, 1, this.terminal.esParser.attribute, chr);
        this.x += 1;
    }
    insertLine() {
        this.activeBuffer.insertLine(this.y - 1, 1);
        const y = this.activeBuffer.scrollBottom + 1;
        this.activeBuffer.removeLine(y - 1, 1, false);
    }
    deleteLine() {
        if (this.activeBuffer.scrollBottom === this.terminal.rows) {
            this.activeBuffer.appendLine();
        }
        else {
            const y = this.activeBuffer.scrollBottom + 1;
            this.activeBuffer.insertLine(y - 1, 1);
        }
        this.activeBuffer.removeLine(this.y - 1, 1, false);
    }
    scrollUp() {
        if (this.activeBuffer.scrollBottom === this.terminal.rows) {
            this.activeBuffer.appendLine();
        }
        else {
            const y = this.activeBuffer.scrollBottom + 1;
            this.activeBuffer.insertLine(y - 1, 1);
        }
        this.activeBuffer.removeLine(this.activeBuffer.scrollTop - 1, 1, this.activeBuffer.scrollTop === 1);
    }
    scrollDown() {
        this.activeBuffer.removeLine(this.activeBuffer.scrollBottom - 1, 1, false);
        this.activeBuffer.insertLine(this.activeBuffer.scrollTop - 1, 1);
    }
}
exports.Parser = Parser;
