import {Terminal} from "../Terminal";
import {BufferLine} from "../buffer/BufferLine";
import {Buffer} from "../buffer/Buffer";
import {DataBlock} from "../buffer/DataBlock";
import {Printer} from "../Printer";
import {BufferSet} from "../buffer/BufferSet";

// http://www.inwap.com/pdp10/ansicode.txt
// https://vt100.net/docs/vt102-ug/table5-13.html


// ==> https://en.wikipedia.org/wiki/Category:Control_characters

// https://en.wikipedia.org/wiki/Linux_console

// https://en.wikipedia.org/wiki/ANSI_escape_code
// http://ascii-table.com/ansi-escape-sequences.php
// http://ascii-table.com/ansi-escape-sequences-vt-100.php

// const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
// const [TAB_COMPLETION_LENGTH, TAB_COMPLETION_CHAR] = [8, "&nbsp;"];

enum State {
    NORMAL, ESC, CSI, OSC, CHARSET, DCS, IGNORE, PM, APC
}

// https://en.wikipedia.org/wiki/C0_and_C1_control_codes


// Control functions for a wide variety of applications are specified in ECMA-48.
// A standardized primary set and supplementary set are included (identified there as C0 and C1 sets).
// Sets of control functions are also registered in the ISO International Register of Coded Character Sets (see annex B).
// Each set is registered either as a primary (C0) set only, or as a supplementary (C1) set only.

// - C0     a member of the primary set of control functions
// - C1     a member of the supplementary set of control functions,
const C0 = {
    NUL: "\x00",	// 00  Caret:^@ Null
    SOH: "\x01",	// 01  Caret:^A Start of Heading
    STX: "\x02",	// 02  Caret:^B Start of Text
    ETX: "\x03",	// 03  Caret:^C End of Text
    EOT: "\x04",	// 04  Caret:^D End of Transmission
    ENQ: "\x05",	// 05  Caret:^E Enquiry
    ACK: "\x06",	// 06  Caret:^F Acknowledge
    BEL: "\x07",	// 07  Caret:^G Bell, Alert
    BS: "\x08",	    // 08  Caret:^H Backspace
    HT: "\x09",	    // 09  Caret:^I Character Tabulation, Horizontal Tabulation
    LF: "\x0a",	    // 10  Caret:^J Line Feed
    VT: "\x0b",	    // 11  Caret:^K Line Tabulation, Vertical Tabulation
    FF: "\x0c",	    // 12  Caret:^L Form Feed
    CR: "\x0d",	    // 13  Caret:^M Carriage Return
    SO: "\x0e",	    // 14  Caret:^N Shift Out
    SI: "\x0f",	    // 15  Caret:^O Shift In
    DLE: "\x10",	// 16  Caret:^P Data Link Escape
    DC1: "\x11",	// 17  Caret:^Q Device Control One (XON)
    DC2: "\x12",	// 18  Caret:^R Device Control Two
    DC3: "\x13",	// 19  Caret:^S Device Control Three (XOFF)
    DC4: "\x14",	// 20  Caret:^T Device Control Four
    NAK: "\x15",	// 21  Caret:^U Negative Acknowledge
    SYN: "\x16",	// 22  Caret:^V Synchronous Idle
    ETB: "\x17",	// 23  Caret:^W End of Transmission Block
    CAN: "\x18",	// 24  Caret:^X Cancel
    EM: "\x19", 	// 25  Caret:^Y End of medium
    SUB: "\x1a",	// 26  Caret:^Z Substitute
    ESC: "\x1b",	// 27  Caret:^[ Escape
    FS: "\x1c",	    // 28  Caret:^\ File Separator
    GS: "\x1d",	    // 29  Caret:^] Group Separator
    RS: "\x1e",	    // 30  Caret:^^ Record Separator
    US: "\x1f",	    // 31  Caret:^_	Unit Separator
    SP: "\x20",	    // 32			Space
    DEL: "\x7F"	    // 127 Caret:^?	Delete
};


// http://vt100.net/docs/vt102-ug/table5-13.html
const charsets: { [key: string]: object | null } = {};
charsets.SCLD = { // (0
    "`": "\u25c6", // "◆"
    "a": "\u2592", // "▒"
    "b": "\u0009", // "\t"
    "c": "\u000c", // "\f"
    "d": "\u000d", // "\r"
    "e": "\u000a", // "\n"
    "f": "\u00b0", // "°"
    "g": "\u00b1", // "±"
    "h": "\u2424", // "\u2424" (NL)
    "i": "\u000b", // "\v"
    "j": "\u2518", // "┘"
    "k": "\u2510", // "┐"
    "l": "\u250c", // "┌"
    "m": "\u2514", // "└"
    "n": "\u253c", // "┼"
    "o": "\u23ba", // "⎺"
    "p": "\u23bb", // "⎻"
    "q": "\u2500", // "─"
    "r": "\u23bc", // "⎼"
    "s": "\u23bd", // "⎽"
    "t": "\u251c", // "├"
    "u": "\u2524", // "┤"
    "v": "\u2534", // "┴"
    "w": "\u252c", // "┬"
    "x": "\u2502", // "│"
    "y": "\u2264", // "≤"
    "z": "\u2265", // "≥"
    "{": "\u03c0", // "π"
    "|": "\u2260", // "≠"
    "}": "\u00a3", // "£"
    "~": "\u00b7"  // "·"
};

charsets.UK = null; // (A
charsets.US = null; // (B (USASCII)
charsets.Dutch = null; // (4
charsets.Finnish = null; // (C or (5
charsets.French = null; // (R
charsets.FrenchCanadian = null; // (Q
charsets.German = null; // (K
charsets.Italian = null; // (Y
charsets.NorwegianDanish = null; // (E or (6
charsets.Spanish = null; // (Z
charsets.Swedish = null; // (H or (7
charsets.Swiss = null; // (=
charsets.ISOLatin = null; // /A


export class Parser {

    private charsets: null[] | object[] = [null];

    // 当前终端
    readonly terminal: Terminal;

    // 解析参数
    private params: any[] = [];
    private currentParam: any = 0;
    private prefix: string = "";
    private suffix: string = "";

    // 当前的状态
    private state: State = State.NORMAL;

    private _gLevel: number = 0;
    private _gCharset: number = 0;

    private _applicationKeypad: boolean = false;
    private _normalKeypad: boolean = true;

    // 提示符的长度
    readonly promptSize: number = 0;

    constructor(terminal: Terminal) {
        this.terminal = terminal;
        this.promptSize = terminal.prompt.length;
    }

    get x(){
        return this.activeBuffer.x;
    }

    set x(value: number){
        if(value < 1){
            value = 1;
        }

        this.activeBuffer.x = value;
    }

    get y(){
        return this.activeBuffer.y;
    }

    set y(value: number){
        if(value > this.terminal.rows){
            value = this.terminal.rows;
        } else if(value < 1){
            value = 1;
        }

        this.activeBuffer.y = value;

        if(!this.activeBufferLine.dirty)
            this.activeBufferLine.dirty = true;
    }

    get bufferSet(): BufferSet {
        return this.terminal.bufferSet;
    }

    get printer(): Printer {
        return this.terminal.printer;
    }

    get applicationKeypad(): boolean {
        return this._applicationKeypad;
    }

    set applicationKeypad(value: boolean) {
        this._applicationKeypad = value;
    }

    set gLevel(value: number) {
        this._gLevel = value;
    }

    set gCharset(value: number) {
        this._gCharset = value;
    }

    get viewport(): HTMLDivElement {
        return this.terminal.viewport;
    }

    get activeBufferLine(): BufferLine{
        return this.activeBuffer.activeBufferLine;
    }

    get activeBuffer(): Buffer {
        return this.bufferSet.activeBuffer;
    }

    /**
     * 切换到备用缓冲区、并清除内容
     */
    activateAltBuffer() {

        // 需要将默认缓冲区的内容输出
        const len = this.activeBuffer.size;
        for (let y = 1; y <= len; y++) {
            const line = this.activeBuffer.get(y);
            this.printer.printLine(line, false);
        }

        this.bufferSet.activateAltBuffer();

        this.terminal.addBufferFillRows();
    }

    /**
     * 切换到默认缓冲区
     */
    activateNormalBuffer() {

        // 删除备用缓冲区的内容
        const lines = this.bufferSet.activeBuffer.lines;
        for(let i = 0, len = lines.length; i < len; i++){
            lines[i].element.remove();
        }

        this.bufferSet.activateNormalBuffer();

        // ==> 为了解决内容没有充满缓冲区的时候，切换切换到备用缓冲区的时候，会有一段的空白。

        // 将没有使用过的行添加到viewport的尾部
        // 由于切换到备用缓冲区的时候，被删掉。
        // See: this.bufferSet.activateAltBuffer()
       let fragment = document.createDocumentFragment();
       for(let y = 1; y <= this.activeBuffer.size; y++){
           let line = this.activeBuffer.get(y);
           if(line && !line.used){
               fragment.appendChild(line.element);
           }
       }
       this.viewport.appendChild(fragment);
    }

    /**
     * 解析数据
     * rz: 命令返回如下
     * b'rz waiting to receive.**\x18B0100000023be50\r\x8a\x11'
     * b'**\x18B0100000023be50\r\x8a\x11'
     *
     * @param text
     */
    parse(text: string) {

        let leftChr: string = ""
            , chr: string = "";

        const len = text.length;

        for (let i = 0; i < len; i++) {

            chr = text[i];

            switch (this.state) {

                case State.NORMAL:

                    switch (chr) {

                        case C0.NUL:
                            // 空字符 ""，丢弃
                            break;

                        // https://invisible-island.net/xterm/ctlseqs/ctlseqs.html#h3-Single-character-functions
                        case C0.BEL:
                            // Bell (BEL  is Ctrl-G).
                            this.terminal.bell();
                            break;
                        case C0.BS:
                            // Backspace (BS  is Ctrl-H).
                            if(this.x > (this.promptSize + 1)){
                                this.x--;
                            } else {
                                this.terminal.bell();
                            }
                            break;
                        case C0.CR:
                            // Carriage Return (CR  is Ctrl-M).
                            // 将"字吧车"归位(回车)
                            this.x = 1;
                            break;
                        case C0.ENQ:
                            // Return Terminal Status (ENQ  is Ctrl-E).
                            break;
                        case C0.FF:
                            // Form Feed or New Page (NP ).  (FF  is Ctrl-L). FF  is treated the same as LF .
                        case C0.LF:
                            // Line Feed or New Line (NL).  (LF  is Ctrl-J).
                            // 换行或创建新行
                            this.nextLine();
                            break;
                        case C0.SI:
                            // Switch to Standard Character Set (Ctrl-O is Shift In or LS0).
                            break;
                        case C0.SO:
                            // Switch to Alternate Character Set (Ctrl-N is Shift Out or LS1).
                            break;
                        // case C0.SP:
                        //     // Space.
                        //     break;
                        case C0.HT:
                            // Horizontal Tab (HTS  is Ctrl-I).
                            // https://en.wikipedia.org/wiki/Tab_key#Tab_characters
                            // 制表符
                            // \t是补全当前字符串长度到8的整数倍,最少1个最多8个空格
                            this.tab();
                            break;
                        case C0.VT:
                            // Vertical Tab (VT  is Ctrl-K).
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
                            // DEC Special Character and Line Drawing Set, VT100.
                            cs = charsets.SCLD;
                            break;
                        case 'A':
                            // United Kingdom (UK), VT100.
                            cs = charsets.UK;
                            break;
                        case 'B':
                            // United States (USASCII), VT100.
                            cs = charsets.US;
                            break;
                        case '5':
                        case 'C':
                            // Finnish
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
                            // " >  ⇒  Greek, VT500.
                            // " 4  ⇒  DEC Hebrew, VT500.
                            // " ?  ⇒  DEC Greek, VT500.
                            i++;
                            break;
                        case '%':
                            // % 2  ⇒  Turkish, VT500.
                            // % 6  ⇒  Portuguese, VT300.
                            // % =  ⇒  Hebrew, VT500.
                            // % 0  ⇒  DEC Turkish, VT500.
                            // % 5  ⇒  DEC Supplemental Graphics, VT300.
                            // % 3  ⇒  SCS NRCS, VT500.
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
                            // DEC Supplemental, VT200.
                            break;
                        case '>':
                            // DEC Technical, VT300.
                            break;
                        case '&':
                            // & 4  ⇒  DEC Cyrillic, VT500.
                            // & 5  ⇒  DEC Russian, VT500.
                            i++;
                            break;
                        default:
                            cs = charsets.US;
                            break;
                    }

                    // this.setGCharset(this.gcharset, cs);
                    // this.gcharset = null;
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

                    } else {
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

                    // 设置
                    if (chr >= "0" && chr <= "9") {
                        this.currentParam = this.currentParam * 10 + chr.charCodeAt(0) - 48;
                        break;
                    }

                    this.params.push(this.currentParam);
                    this.currentParam = 0;

                    if (chr === ";") break;

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
                    // C1 (8-Bit) Control Characters
                    switch (chr) {
                        case "D":
                            // Index (IND  is 0x84).
                            this.index();
                            this.state = State.NORMAL;
                            break;
                        case "E":
                            // Next Line (NEL  is 0x85).
                            this.nextLine();
                            this.state = State.NORMAL;
                            break;
                        case "H":
                            // Tab Set (HTS  is 0x88).
                            this.state = State.NORMAL;
                            break;
                        case "M":
                            // Reverse Index (RI  is 0x8d).
                            this.reverseIndex();
                            this.state = State.NORMAL;
                            break;
                        case "N":
                            // Single Shift Select of G2 Character Set (SS2  is 0x8e)
                            this.state = State.NORMAL;
                            break;
                        case "O":
                            // Single Shift Select of G3 Character Set (SS3  is 0x8f)
                            this.state = State.NORMAL;
                            break;
                        case "P":
                            // Device Control String (DCS  is 0x90).
                            this.state = State.NORMAL;
                            break;
                        case "V":
                            // Start of Guarded Area (SPA  is 0x96).
                            this.state = State.NORMAL;
                            break;
                        case "X":
                            // Start of String (SOS  is 0x98).
                            this.state = State.NORMAL;
                            break;
                        case "Z":
                            // Return Terminal ID (DECID is 0x9a).  Obsolete form of CSI c  (DA).
                            this.state = State.NORMAL;
                            break;
                        case "[":
                            // Control Sequence Introducer (CSI  is 0x9b).
                            this.params = [];
                            this.currentParam = 0;
                            this.prefix = "";
                            this.suffix = "";

                            this.state = State.CSI;
                            break;
                        case "\"":
                            // String Terminator (ST  is 0x9c).
                            break;
                        case "]":
                            // Operating System Command (OSC  is 0x9d).
                            this.params = [];
                            this.currentParam = 0;
                            this.prefix = "";
                            this.suffix = "";

                            this.state = State.OSC;
                            break;
                        case "^":
                            // Privacy Message (PM  is 0x9e).
                            this.state = State.PM;
                            break;
                        case "_":
                            // Application Program Command (APC  is 0x9f).
                            this.state = State.APC;
                            break;

                        // https://en.wikipedia.org/wiki/ISO/IEC_2022#Code_structure
                        // https://invisible-island.net/xterm/ctlseqs/ctlseqs.html#h3-Controls-beginning-with-ESC
                        case C0.SP:
                            // ESC SP F  7-bit controls (S7C1T), VT220.
                            // ESC SP G  8-bit controls (S8C1T), VT220.
                            // ESC SP L  Set ANSI conformance level 1, ECMA-43.
                            // ESC SP M  Set ANSI conformance level 2, ECMA-43.
                            // ESC SP N  Set ANSI conformance level 3, ECMA-43.
                            this.state = State.NORMAL;
                            i++;
                            break;
                        case "#":
                            // ESC # 3   DEC double-height line, top half (DECDHL), VT100.
                            // ESC # 4   DEC double-height line, bottom half (DECDHL), VT100.
                            // ESC # 5   DEC single-width line (DECSWL), VT100.
                            // ESC # 6   DEC double-width line (DECDWL), VT100.
                            // ESC # 8   DEC Screen Alignment Test (DECALN), VT100.
                            this.state = State.NORMAL;
                            i++;
                            break;
                        case "%":
                            // ESC % @   Select default character set.  That is ISO 8859-1 (ISO 2022).
                            // ESC % G   Select UTF-8 character set, ISO 2022.
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
                            // Back Index (DECBI), VT420 and up.
                            this.state = State.NORMAL;
                            break;
                        case "7":
                            // Save Cursor (DECSC), VT100.
                            this.state = State.NORMAL;
                            break;
                        case "8":
                            // Restore Cursor (DECRC), VT100.
                            this.state = State.NORMAL;
                            break;
                        case "9":
                            // Forward Index (DECFI), VT420 and up.
                            this.state = State.NORMAL;
                            break;
                        case "=":
                            // Set alternate keypad mode
                            // Application Keypad (DECKPAM).
                            this._applicationKeypad = true;
                            this._normalKeypad = false;
                            this.state = State.NORMAL;
                            break;
                        case ">":
                            // Set numeric keypad mode
                            // Normal Keypad (DECKPNM), VT100.
                            this._applicationKeypad = false;
                            this._normalKeypad = true;
                            this.state = State.NORMAL;
                            break;
                        case "F":
                            // Cursor to lower left corner of screen.
                            this.state = State.NORMAL;
                            break;
                        case "c":
                            // Full Reset (RIS), VT100.
                            this.state = State.NORMAL;
                            break;
                        case "l":
                            // Memory Lock (per HP terminals).
                            this.state = State.NORMAL;
                            break;
                        case "m":
                            // Memory Unlock (per HP terminals).
                            this.state = State.NORMAL;
                            break;
                        case "n":
                            // Invoke the G2 Character Set as GL (LS2) as GL.
                            this.state = State.NORMAL;
                            break;
                        case "o":
                            // Invoke the G3 Character Set as GL (LS3) as GL.
                            this.state = State.NORMAL;
                            break;
                        case "|":
                            // Invoke the G3 Character Set as GR (LS3R).
                            this.state = State.NORMAL;
                            break;
                        case "}":
                            // Invoke the G2 Character Set as GR (LS2R).
                            this.state = State.NORMAL;
                            break;
                        case "~":
                            // Invoke the G1 Character Set as GR (LS1R), VT100.
                            this.state = State.NORMAL;
                            break;
                    }
                    break;
                case State.IGNORE:
                    break;
                case State.OSC:

                    // States.OSC Ps ; Pt ST    ST ==> States.ESC \ String Terminator (ST  is 0x9c).
                    // States.OSC Ps ; Pt BEL
                    //   Set Text Parameters.
                    // 上一个字符
                    leftChr = text[i - 1];
                    if ((leftChr === C0.ESC && chr === '\\') || chr === C0.BEL) {
                        // 结束符
                        if (leftChr === C0.ESC) {
                            if (typeof this.currentParam === 'string') {
                                this.currentParam = this.currentParam.slice(0, -1);
                            } else if (typeof this.currentParam == 'number') {
                                this.currentParam = (this.currentParam - ('\x1b'.charCodeAt(0) - 48)) / 10;
                            }
                        }

                        this.params.push(this.currentParam);

                        this.terminal.oscParser.parse(this.params);

                        this.params = [];
                        this.currentParam = 0;
                        this.state = State.NORMAL;

                    } else {

                        if (!this.params.length) {
                            if (chr >= '0' && chr <= '9') {
                                this.currentParam =
                                    this.currentParam * 10 + chr.charCodeAt(0) - 48;
                            } else if (chr === ';') {
                                this.params.push(this.currentParam);
                                // 后面是字符串
                                this.currentParam = '';
                            } else {
                                if (this.currentParam === 0) {
                                    this.currentParam = '';
                                }
                                this.currentParam += chr;
                            }
                        } else {
                            // pt
                            this.currentParam += chr;
                        }
                    }

                    break;
                case State.PM:

                    // State.PM Ps ; Pt ST: 自定义消息
                    // Ps = 0  ⇒  远程服务器断开连接, 执行 exit 命令
                    // Ps = 1  ⇒  客户端断开连接，因网络抖动。
                    // Ps = 2 ; href ; Pt  ⇒  超链接
                    // Ps = 3 ; Pt  ⇒  服务器心跳

                    leftChr = text[i - 1];
                    if ((leftChr === C0.ESC && chr === '\\') || chr === C0.BEL) {
                        // 结束符
                        if (leftChr === C0.ESC) {
                            if (typeof this.currentParam === 'string') {
                                this.currentParam = this.currentParam.slice(0, -1);
                            } else if (typeof this.currentParam == 'number') {
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
                                // 超链接
                                // let [href, text] = (this.params[1] + "").split(";");
                                // for(let k = 0, len = text.length; k < len; k++){
                                //     let c = text.charAt(k);
                                //     if (!this.handleDoubleChars(c, href)) {
                                //         this.update(c, href);
                                //     }
                                // }
                                break;
                            case 3:
                                // 心跳
                                if(this.terminal.eventMap["heartbeat"])
                                    this.terminal.eventMap["heartbeat"](this.params[1]);
                                break;
                        }

                        this.params = [];
                        this.currentParam = 0;
                        this.state = State.NORMAL;

                    } else {

                        if (!this.params.length) {
                            if (chr >= '0' && chr <= '9') {
                                this.currentParam =
                                    this.currentParam * 10 + chr.charCodeAt(0) - 48;
                            } else if (chr === ';') {
                                this.params.push(this.currentParam);
                                // 后面是字符串
                                this.currentParam = '';
                            } else {
                                if (this.currentParam === 0) {
                                    this.currentParam = '';
                                }
                                this.currentParam += chr;
                            }
                        } else {
                            // pt
                            this.currentParam += chr;
                        }
                    }

                    break;
            }

        }

        // 为了确保最后一个是定位，如\x1b[H，需要将当前行设置为脏行。
        if(!this.activeBufferLine.dirty)
            this.activeBufferLine.dirty = true;

        this.printer.printBuffer();

        this.terminal.scrollToBottomOnInput();

    }

    /**
     * 处理双字节字符
     * @param chr
     * @param href 自定义超链接
     */
    handleDoubleChars(chr: string, href: string = "") {

        if (/[\u4E00-\u9FA5]|[\uFE30-\uFFA0]/gi.test(chr)) {
            // 双字节字符
            // 超过字数自动换行
            if (this.x > this.activeBuffer.columns) {
                this.nextLine();
                this.x = 1;
            }

            // 添加数据
            // 占用两个位置
            let block = DataBlock.newBlock(chr, this.terminal.esParser.attribute);
            block.attribute.len2 = true;
            if(!!href){
                block.href = href;
            }

            // 空块
            let block2 = DataBlock.newEmptyBlock();
            block2.empty = true;

            if(this.terminal.esParser.insertMode){
                // 在光标的面前插入
                this.activeBufferLine.insert(this.x, block, block2);
            } else if(this.terminal.esParser.replaceMode){ // 默认
                // 更新缓冲区的内容
                this.activeBufferLine.replace(this.x, block, block2);
            }

            if(!this.activeBufferLine.dirty)
                this.activeBufferLine.dirty = true;

            this.x += 2;

            return true;
        }

        return false;

    }

    /**
     * 制表符(\t)
     * 规则：\t是补全当前字符串长度到8的整数倍,最少1个最多8个空格
     */
    private tab(){
        // 需要补多少个空格
        const tabSize = this.terminal.preferences.tabSize;
        let spCount = tabSize - ((this.x - 1) % tabSize);
        for(let i = 0; i < spCount; i++){
            this.update(" ");
        }
    }

    /**
     * 正向索引
     * this.y += 1
     * 1，如果超出滚动区域的底部的话，则滚动一行
     * 2，如果没有超出滚动区域的话，并且如果行不存在的话，添加一行
     */
    private index(){

        if (++this.y > this.activeBuffer.scrollBottom) {
            this.y = this.activeBuffer.scrollBottom;
            // 如果在底部
            this.scrollUp();
        } else {
            if(!this.bufferSet.activeBuffer.get(this.y)){
                this.newLine();
            }
        }

    }

    /**
     * 反向索引
     * this.y -= 1
     */
    private reverseIndex(){

        if (this.y <= this.activeBuffer.scrollTop) {
            // 如果是在顶行...
            this.scrollDown();
        } else {
            this.y--;
        }
    }

    /**
     * 下一行
     * 如果行存在的话，则直接换行，否则创建新行。
     */

    private nextLine(){

        // 滚筒上卷一行
        if(this.y === this.activeBuffer.scrollBottom){
            this.scrollUp();
        } else {
            //
            this.y += 1;
        }

    }

    /**
     * 保存光标
     */
    saveCursor() {

        this.printer.printLine(this.activeBuffer.get(this.y));

        this.activeBuffer.savedY = this.y;
        this.activeBuffer.savedX = this.x;
    }

    /**
     * 还原光标
     */
    restoreCursor() {
        this.y = this.activeBuffer.savedY;
        this.x = this.activeBuffer.savedX;
    }

    /**
     * 新建行
     */
    newLine(){

        let line = this.activeBuffer.getBlankLine();

        this.activeBuffer.append(line);

        this.viewport.appendChild(line.element);

    }

    /**
     * 更新缓冲区的内容
     * @param chr
     * @param href 自定义超链接的功能
     */
    private update(chr: string, href: string = "") {

        // 当行内容超过指定的数量的时候，需要再次换行。
        if (this.x > this.activeBuffer.columns) {
            this.nextLine();
            // 光标重置
            this.x = 1;
        }

        let block = DataBlock.newBlock(chr, this.terminal.esParser.attribute);
        if(!!href){
            block.href = href;
        }
        if(this.terminal.esParser.insertMode){
            // 在光标的面前插入
            this.activeBufferLine.insert(this.x, block);
        } else if(this.terminal.esParser.replaceMode){ // 默认
            // 更新缓冲区的内容
            this.activeBufferLine.replace(this.x, block);
            this.x += 1;
        }

        if(!this.activeBufferLine.dirty){
            this.activeBufferLine.dirty = true;
        }



    }

    /**
     * 创建一行，需要在滚动底部删除一行。
     */
    insertLine(){

        // 在指定的位置插入一行
        let line = this.activeBuffer.getBlankLine();

        let afterNode = this.activeBuffer.insert(this.y, line)[0];
        this.viewport.insertBefore(line.element, afterNode);

        // 删除底部的行
        const y = this.activeBuffer.scrollBottom + 1;  // index = scrollBottom
        this.activeBuffer.delete(y, 1, false);

    }

    /**
     * 删除一行，需要在滚动底部填充一行。
     */
    deleteLine(){

        // 在滚动底部添加行
        const line = this.activeBuffer.getBlankLine();

        if(this.activeBuffer.scrollBottom === this.terminal.rows){
            // 在底部添加
            this.activeBuffer.append(line);
            this.viewport.appendChild(line.element);
        } else {
            // 在后一行插入前
            const y = this.activeBuffer.scrollBottom + 1; // index = scrollBottom
            let afterNode = this.activeBuffer.insert(y, line)[0];
            this.viewport.insertBefore(line.element, afterNode);
        }

        // 在光标的位置删除行
        this.activeBuffer.delete(this.y, 1, false);

    }

    /**
     * 向上滚动（可以查看下面的内容）
     * 原理：底部添加行，顶部删除行
     */
    scrollUp(){

        // let d1 = new Date().getTime();

        let line = this.activeBuffer.getBlankLine();

        if(this.activeBuffer.scrollBottom === this.terminal.rows){
            // 在底部添加
            this.activeBuffer.append(line);
            this.viewport.appendChild(line.element);
        } else {
            // 在后一行插入前
            // 在底行添加空行
            // rows = 24, scrollBottom = 24, y = 24
            const y = this.activeBuffer.scrollBottom + 1; // index = scrollBottom
            let afterNode = this.activeBuffer.insert(y, line)[0];
            this.viewport.insertBefore(line.element, afterNode);
        }

        // 删除顶行
        // 如果是备用缓冲区的话，就删除顶行。

        // 如果是缓冲区第一个是顶行的话，就保存，否则需要删除。
        const saveLines = this.activeBuffer.scrollTop === 1;
        const savedLines = this.activeBuffer.delete(this.activeBuffer.scrollTop, 1, saveLines);
        for(let savedLine of savedLines){
            this.printer.printLine(savedLine, false);
        }

        // let d2 = new Date().getTime();
        // console.info("scrollUp: d2-d1:" + (d2 - d1) + ", parent:" + parent);

    }

    /**
     * 向下滚动（可以查看上面的内容）
     * 原理：顶部添加行，底部删除行
     */
    scrollDown(){

        let line = this.activeBuffer.getBlankLine();

        // 删除底行
        this.activeBuffer.delete(this.activeBuffer.scrollBottom, 1, false);

        // 顶部添加行
        let afterNode = this.activeBuffer.insert(this.activeBuffer.scrollTop, line)[0];

        this.viewport.insertBefore(line.element, afterNode);


    }


}