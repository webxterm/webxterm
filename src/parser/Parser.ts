import {RenderType, Terminal} from "../Terminal";
// import {BufferLine} from "../buffer/BufferLine";
import {Buffer} from "../buffer/Buffer";
import {BufferSet} from "../buffer/BufferSet";
import {DataBlockAttribute} from "../buffer/DataBlockAttribute";

// http://www.inwap.com/pdp10/ansicode.txt
// https://vt100.net/docs/vt102-ug/table5-13.html


// ==> https://en.wikipedia.org/wiki/Category:Control_characters

// https://en.wikipedia.org/wiki/Linux_console

// https://en.wikipedia.org/wiki/ANSI_escape_code
// http://ascii-table.com/ansi-escape-sequences.php
// http://ascii-table.com/ansi-escape-sequences-vt-100.php

// const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
// const [TAB_COMPLETION_LENGTH, TAB_COMPLETION_CHAR] = [8, "&nbsp;"];

const State = {
    NORMAL: 0, ESC: 1, CSI: 2, OSC: 3, CHARSET: 4, DCS: 5, IGNORE: 6, PM: 7, APC:8
};

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


/**
 * 2020-08-01新增Emoji表情解析<br/>
 * 1, 变量选择器: VS-15 VS-16, See: https://en.wikipedia.org/wiki/Variation_Selectors_(Unicode_block)<br/>
 * 格式：<br/>
 *  VS-15: 符号+FE0E<br/>
 *  VS-16: 符号+FE0F<br/>
 * 2, (#, * 和 0–9)键帽符号<br/>
 * 格式：<br/>
 *  # + VS-16 + U+20E3<br/>
 * 3, 改变肤色 See: https://en.wikipedia.org/wiki/Emoji   [Skin color]<br/>
 *  U+1F3FB EMOJI MODIFIER FITZPATRICK TYPE-1-2<br/>
 *  U+1F3FC EMOJI MODIFIER FITZPATRICK TYPE-3<br/>
 *  U+1F3FD EMOJI MODIFIER FITZPATRICK TYPE-4<br/>
 *  U+1F3FE EMOJI MODIFIER FITZPATRICK TYPE-5<br/>
 *  U+1F3FF EMOJI MODIFIER FITZPATRICK TYPE-6<br/>
 * 格式：<br/>
 *  符号+肤色<br/>
 * 4, ZWJ(零宽度连接符), See: https://unicode.org/Public/emoji/13.0/emoji-zwj-sequences.txt<br/>
 * 执行Python脚本，查看出现的所有情况：See: http://note.youdao.com/s/bWbbU4Is<br/>
 * 格式：<br/>
 *  4.1. 符号+200D+符号+FE0F+200D+符号<br/>
 *  4.2. 符号+200D+符号+FE0F+200D+符号+200D+符号<br/>
 *  4.3. 符号+200D+符号<br/>
 *  4.4. 符号+200D+符号+200D+符号<br/>
 *  4.5. 符号+200D+符号+200D+符号+200D+符号<br/>
 *  4.6. 符号+肤色+200D+符号+200D+符号+肤色<br/>
 *  4.7. 符号+肤色+200D+符号<br/>
 *  4.8. 符号+200D+符号+FE0F<br/>
 *  4.9. 符号+肤色+200D+符号+FE0F<br/>
 *  4.10. 符号+FE0F+200D+符号+FE0F<br/>
 *  4.11. 符号+FE0F+200D+符号<br/>
 * 5, 辅助平面字符(codePointAt(1) >= 0xDC00 && codePointAt(1) <= 0xDFFF)<br/>
 */
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
    private state: number = State.NORMAL;

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



        // if(!this.activeBuffer.isDirty(value))
        //     this.activeBuffer.updateDirty(value, true);
    }

    get bufferSet(): BufferSet {
        return this.terminal.bufferSet;
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

    // get activeBufferLine(): HTMLElement {
    //     return this.activeBuffer.activeBufferLine;
    // }

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
            if(this.terminal.renderType == RenderType.HTML) {
                // this.printer.printLine(this.activeBuffer.get(y), this.activeBuffer.getBlocks(y), false);
            } else if(this.terminal.renderType == RenderType.CANVAS){
                // 将默认缓冲区的内容移动到保留区中。
                // const items = this.bufferSet.activeBuffer.slice(0, this.bufferSet.activeBuffer.y);
                // this.bufferSet.normal.cachedLines.push(...items);
            }
        }

        this.bufferSet.activateAltBuffer();

        this.terminal.addBufferFillRows();
    }

    /**
     * 切换到默认缓冲区
     */
    activateNormalBuffer() {

        // 删除备用缓冲区的内容
        // const lines = this.bufferSet.activeBuffer.lines;
        // for(let i = 0, len = lines.length; i < len; i++){
        //     lines[i].remove();
        // }

        // if(this.terminal.renderType == RenderType.CANVAS){
        //     // 删除保留区的行、
        //     const len = this.bufferSet.normal.cachedLines.length;
        //     const y = this.bufferSet.normal.y;
        //     this.bufferSet.normal.cachedLines.splice(len - y, y);
        // }

        this.bufferSet.activateNormalBuffer();

        // ==> 为了解决内容没有充满缓冲区的时候，切换切换到备用缓冲区的时候，会有一段的空白。

        // 将没有使用过的行添加到viewport的尾部
        // 由于切换到备用缓冲区的时候，被删掉。
        // See: this.bufferSet.activateAltBuffer()
       // let fragment = document.createDocumentFragment();
       // for(let y = 1; y <= this.activeBuffer.size; y++){
       //     let line = this.activeBuffer.get(y);
       //     if(line && !line.used){
       //         fragment.appendChild(line.element);
       //     }
       // }
       // this.viewport.appendChild(fragment);
    }

    /**
     * 解析数据
     * rz: 命令返回如下
     * b'rz waiting to receive.**\x18B0100000023be50\r\x8a\x11'
     * b'**\x18B0100000023be50\r\x8a\x11'
     *
     * @param strings 传入字符串
     * @param isComposition 是否为联想输入
     * @param callback
     */
    parse(strings: string, isComposition: boolean, callback: Function | undefined = undefined) {

        let leftChr: string = "";
        // 判断是否有心跳的字符返回。
        let heartBeatValue = '';

        // 2020-08-01新增emoji表情解析
        // 目前共有17个平面，整个空间大小为：2^21
        // 1个基本平面(BMP): U+0000 ~ U+FFFF(2个字节)
        // 16个辅助平面(SMP): U+010000 ~ U+10FFFF(4个字节)
        const text = Array.from(strings), len = text.length;
        // 考虑4字节字符，如Emoji表情
        for (let i = 0, s; i < len; i++) {
            s = text[i];

            switch (this.state) {

                case State.NORMAL:

                    switch (s) {

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
                            if(this.terminal.renderType == RenderType.CANVAS){
                                // \t是补全当前字符串长度到8的整数倍,最少1个最多8个空格
                                this.tab();
                            }
                            break;
                        case C0.VT:
                            // Vertical Tab (VT  is Ctrl-K).
                            this.nextLine();
                            break;
                        case C0.ESC:
                            this.state = State.ESC;
                            break;
                        default:

                            // 考虑性能问题
                            // 考虑先处理ascii码表
                            {
                                const asciiStandardCode: number | undefined = s.codePointAt(0);
                                if(asciiStandardCode && 32 <= asciiStandardCode && asciiStandardCode < 127){
                                    if(s.codePointAt(1) == undefined){
                                        // 考虑emoji
                                        this.update(s);
                                        break;
                                    }
                                }
                            }

                            // 判断是否为emoji表情
                            const result = this.handleEmoji(i, s, text);
                            if(result != -1){
                                i = result;
                                break;
                            }

                            // 判断是否为中文、双字节?
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
                            i++
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
                        if (s === " "
                            || s === "?"
                            || s === ">"
                            || s === "="
                            || s === "!"
                            || s === "#") {

                            this.prefix = s;
                            break;
                        }

                    } else {
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

                    // 设置
                    if (s >= "0" && s <= "9") {
                        this.currentParam = this.currentParam * 10 + s.charCodeAt(0) - 48;
                        break;
                    }

                    this.params.push(this.currentParam);
                    this.currentParam = 0;

                    if (s === ";") break;

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
                    // C1 (8-Bit) Control Characters
                    switch (s) {
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
                            this.currentParam = 0;
                            this.params = [];
                            this.prefix = "";
                            this.suffix = "";
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
                    if ((leftChr === C0.ESC && s === '\\') || s === C0.BEL) {
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
                            if (s >= '0' && s <= '9') {
                                this.currentParam =
                                    this.currentParam * 10 + s.charCodeAt(0) - 48;
                            } else if (s === ';') {
                                this.params.push(this.currentParam);
                                // 后面是字符串
                                this.currentParam = '';
                            } else {
                                if (this.currentParam === 0) {
                                    this.currentParam = '';
                                }
                                this.currentParam += s;
                            }
                        } else {
                            // pt
                            this.currentParam += s;
                        }
                    }

                    break;
                case State.PM:

                    // State.PM Ps ; Pt ST: 自定义消息
                    // Ps = 0  ⇒  远程服务器断开连接, 执行 exit 命令
                    // Ps = 1  ⇒  客户端断开连接，因网络抖动。
                    // Ps = 2 ; href ; Pt  ⇒  超链接
                    // Ps = 3 ; Pt  ⇒  服务器心跳

                    // 结束符
                    if ((leftChr === C0.ESC && s === '\\') || s === C0.BEL) {
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
                                return;
                            case 2:
                                // 超链接
                                // let [href, text] = (this.params[1] + "").split(";");
                                // for(let k = 0, len = text.length; k < len; k++){
                                //     let c = text.charAt(k);
                                //     if (!this.handleDoubleChars(c, href)) {
                                //         this.update(c, href);
                                //     }
                                // }
                                return;
                            case 3:
                                // 心跳
                                heartBeatValue = this.params[1];
                                if(this.terminal.eventMap["heartbeat"])
                                    this.terminal.eventMap["heartbeat"](heartBeatValue);
                        }

                        this.params = [];
                        this.currentParam = 0;
                        this.state = State.NORMAL;

                    } else {

                        if (!this.params.length) {
                            if (s >= '0' && s <= '9') {
                                this.currentParam =
                                    this.currentParam * 10 + s.charCodeAt(0) - 48;
                            } else if (s === ';') {
                                this.params.push(this.currentParam);
                                // 后面是字符串
                                this.currentParam = '';
                            } else {
                                if (this.currentParam === 0) {
                                    this.currentParam = '';
                                }
                                this.currentParam += s;
                            }
                        } else {
                            // pt
                            this.currentParam += s;
                        }
                    }

                    break;
            }

            leftChr = s;

        }

        // 心跳不处理。
        if(!!heartBeatValue && strings == '\x1b^3;'+heartBeatValue+'\x1b\\'){
            return;
        }

        // 为了确保最后一个是定位，如\x1b[H，需要将当前行设置为脏行。
        // if(!this.activeBuffer.isDirty(this.y))
        //     this.activeBuffer.updateDirty(this.y, true);
        //
        if(this.terminal.textRenderer){
            this.terminal.textRenderer.flushLines(this.activeBuffer.change_buffer, false);
        }

        console.info("Parser:x" + this.x);

        this.terminal.scrollToBottomOnInput();

        if(callback){
            callback(len, this);
        }

    }

    /**
     * emoji表情解析
     * @param codePoint
     * @param array
     */
    pushAuxCodePoint(codePoint: number, array: number[]): number[] {
        if (!codePoint) return array;
        if (!(codePoint >= 0xDC00 && codePoint <= 0xDFFF)) {
            array.push(codePoint);
        }
        return array;
    }

    /**
     * emoji表情解析
     * @param s
     * @param array
     */
    pushStr(s: string, array: number[]) {
        const codePoint0 = s.codePointAt(0),
            codePoint1 = s.codePointAt(1);
        array.push(codePoint0 || 0);
        return this.pushAuxCodePoint(codePoint1 || 0, array);
    }

    /**
     * 输出emoji表情
     * @param dataArray
     * @param isJoining
     */
    outputEmoji(dataArray: number[], isJoining: boolean = false){
        this.update(String.fromCodePoint(...dataArray));
    }

    /**
     * 解析Emoji表情
     * @param start
     * @param s
     * @param text
     */
    handleEmoji(start: number, s: string, text: string[]): number {
        let i = start;
        const codePoint0 = s.codePointAt(0) || 0;
        const codePoint1 = s.codePointAt(1) || 0;
        const nextCodePoint0 = text[i + 1] ? (text[i + 1].codePointAt(0) || 0) : 0;
        const array: number[] = [];
        // https://en.wikipedia.org/wiki/Miscellaneous_Symbols_and_Pictographs#Skin_tones
        // Emoji variation sequences
        if (nextCodePoint0 === 0xFE0E) {
            // vs-15
            // 格式：符号+FE0E
            i++;
            array.push(codePoint0, nextCodePoint0);
            this.outputEmoji(array);
            return i;
        } else if (nextCodePoint0 === 0xFE0F) {
            // vs-16 - emoji
            i++;
            array.push(codePoint0);
            // 第二个码点不是 undefined
            // 辅助平面字符
            // let H = Math.floor((codePoint0 - 0x10000) / 0x400) + 0xD800,
            //     L = (codePoint0 - 0x10000) % 0x400 + 0xDC00;
            // 实际上 String.fromCodePoint(codePoint0) = String.fromCodePoint(H, L)
            this.pushAuxCodePoint(codePoint1, array);
            array.push(nextCodePoint0);

            const codePoint = text[i + 1] ? text[i + 1].codePointAt(0) : 0;
            if (codePoint === 0x20E3) {
                // 键帽符号, 格式 #*(0-9)+FE0F+20E3
                i++;
                array.push(codePoint);
                this.outputEmoji(array);
                // console.info("键帽符号：" + String.fromCodePoint(...array));
            } else if (codePoint === 0x200D) {
                // zwj情况10. 符号+FE0F+200D+符号+FE0F
                // zwj情况11. 符号+FE0F+200D+符号
                // 下一个符号
                array.push(codePoint);
                i++;
                if (text[i + 1]) {
                    // 符合zwj情况11
                    this.pushStr(text[i + 1], array);
                    i++;
                }
                if (text[i + 1] && text[i + 1].codePointAt(0) === 0xFE0F) {
                    // 符合zwj情况10
                    this.pushStr(text[i + 1], array);
                    // output(String.fromCodePoint(...array), false, false, false, true);
                    this.outputEmoji(array, true);
                    // console.info("符合情况10：" + String.fromCodePoint(...array));
                    i++;
                } else {
                    // 符合zwj情况11
                    this.outputEmoji(array, true);
                    // console.info("符合情况11：" + array);
                }

            } else {
                // 情况3：格式：符号+FE0F
                this.outputEmoji(array);
                // console.info("VS16:" + array);
            }
            return i;
        } else if (0x1F3FB <= nextCodePoint0 && nextCodePoint0 <= 0x1F3FF) {
            // emoji
            // https://en.wikipedia.org/wiki/Miscellaneous_Symbols_and_Pictographs#Skin_tones
            // U+1F3FB EMOJI MODIFIER FITZPATRICK TYPE-1-2
            // U+1F3FC EMOJI MODIFIER FITZPATRICK TYPE-3
            // U+1F3FD EMOJI MODIFIER FITZPATRICK TYPE-4
            // U+1F3FE EMOJI MODIFIER FITZPATRICK TYPE-5
            // U+1F3FF EMOJI MODIFIER FITZPATRICK TYPE-6
            // 肤色(U+1F3FB–U+1F3FF): 🏻 🏼 🏽 🏾 🏿
            // 格式：人物+肤色(U+1F3FB–U+1F3FF)
            array.push(codePoint0);
            // 第二个码点不是 undefined
            // 辅助平面字符
            // let H = Math.floor((codePoint0 - 0x10000) / 0x400) + 0xD800,
            //     L = (codePoint0 - 0x10000) % 0x400 + 0xDC00;
            // 实际上 String.fromCodePoint(codePoint0) = String.fromCodePoint(H, L)
            this.pushAuxCodePoint(codePoint1, array);
            // 肤色
            array.push(nextCodePoint0);
            i++;

            // zwj情况7. 符号+肤色+200D+符号
            if (text[i + 1] && text[i + 1].codePointAt(0) === 0x200D) {
                // 获取下一个字符
                array.push(0x200D);
                i++;
                if (text[i + 1]) {
                    this.pushStr(text[i + 1], array);
                    i++;
                }

                if (text[i + 1]) {
                    const codePoint0 = text[i + 1].codePointAt(0) || 0;
                    if (codePoint0 === 0x200D) {
                        // zwj情况6. 符号+肤色+200D+符号+200D+符号+肤色
                        array.push(codePoint0);
                        i++;
                        if (text[i + 1] && text[i + 2]) {
                            // 人物
                            // 肤色
                            const next3CodePoint0 = text[i + 2].codePointAt(0) || 0;
                            if (0x1F3FB <= next3CodePoint0 && next3CodePoint0 <= 0x1F3FF) {
                                this.pushStr(text[i + 1], array);
                                i++;
                                array.push(next3CodePoint0);
                                i++;
                                this.outputEmoji(array, true);
                                // console.info("zwj情况6：" + array);
                            }
                        }
                    } else if (codePoint0 === 0xFE0F) {
                        // zwj情况9. 符号+肤色+200D+符号+FE0F
                        array.push(codePoint0);
                        i++;
                        this.outputEmoji(array, true);
                        // console.info("zwj情况9：" + array);
                    } else {
                        // zwj情况7. 符号+肤色+200D+符号
                        this.outputEmoji(array, true);
                        // console.info("zwj情况7：" + array);
                    }

                } else {
                    // zwj情况7. 符号+肤色+200D+符号
                    this.outputEmoji(array, true);
                    // console.info("zwj情况7：" + array);
                }
                return i;
            }

            this.outputEmoji(array, true);
            // console.info("肤色：" + array);
            i++;
            return i;
        } else if (nextCodePoint0 === 0x200D) {
            // https://en.wikipedia.org/wiki/Zero-width_joiner
            // https://emojipedia.org/emoji-zwj-sequence/
            // http://www.unicode.org/emoji/charts/emoji-zwj-sequences.html
            // https://unicode.org/Public/emoji/13.0/emoji-zwj-sequences.txt
            // zwj情况3. 符号+200D+符号
            array.push(codePoint0);
            this.pushAuxCodePoint(codePoint1, array);
            array.push(nextCodePoint0);
            i++;
            if (text[i + 1]) {
                this.pushStr(text[i + 1], array);
                i++;
            }

            // zwj情况8. 符号+200D+符号+FE0F
            // zwj情况1. 符号+200D+符号+FE0F+200D+符号
            // zwj情况2. 符号+200D+符号+FE0F+200D+符号+200D+符号
            // zwj情况4. 符号+200D+符号+200D+符号
            // zwj情况5. 符号+200D+符号+200D+符号+200D+符号
            if (text[i + 1]) {
                const codePoint0 = text[i + 1].codePointAt(0);
                if (codePoint0 === 0x200D) {
                    array.push(codePoint0);
                    // zwj情况4. 符号+200D+符号+200D+符号
                    // zwj情况5. 符号+200D+符号+200D+符号+200D+符号
                    i++;
                    if (text[i + 1]) {
                        this.pushStr(text[i + 1], array);
                        i++;
                        // zwj情况5. 符号+200D+符号+200D+符号+200D+符号
                        if (text[i + 1]) {
                            const next3CodePoint0 = text[i + 1].codePointAt(0);
                            if (next3CodePoint0 === 0x200D) {
                                array.push(next3CodePoint0);
                                i++;
                                if (text[i + 1]) {
                                    this.pushStr(text[i + 1], array);
                                    i++;
                                    this.outputEmoji(array, true);
                                    // console.info("zwj情况5：" + array);
                                }
                            } else {
                                // 非最后一个字符
                                this.outputEmoji(array, true);
                                // console.info("zwj情况4：" + array);
                            }
                        } else {
                            // 最后一个字符
                            this.outputEmoji(array, true);
                            // console.info("zwj情况4：" + array);
                        }
                    }
                } else if (codePoint0 === 0xFE0F) {
                    array.push(codePoint0);
                    i++;
                    // zwj情况8. 符号+200D+符号+FE0F
                    // zwj情况1. 符号+200D+符号+FE0F+200D+符号
                    // zwj情况2. 符号+200D+符号+FE0F+200D+符号+200D+符号
                    if (text[i + 1]) {
                        const next2CodePoint0 = text[i + 1].codePointAt(0);
                        if (next2CodePoint0 === 0x200D) {
                            array.push(next2CodePoint0);
                            i++;
                            // zwj情况1. 符号+200D+符号+FE0F+200D+符号
                            // zwj情况2. 符号+200D+符号+FE0F+200D+符号+200D+符号
                            if (text[i + 1]) {
                                this.pushStr(text[i + 1], array);
                                i++;
                                // zwj情况2. 符号+200D+符号+FE0F+200D+符号+200D+符号
                                if (text[i + 1]) {
                                    const next4CodePoint0 = text[i + 1].codePointAt(0);
                                    if (next4CodePoint0 === 0x200D) {
                                        array.push(next4CodePoint0);
                                        i++;
                                        if (text[i + 1]) {
                                            this.pushStr(text[i + 1], array);
                                            // console.info("zwj情况2：" + array);
                                            i++;
                                            this.outputEmoji(array, true);
                                        }
                                    } else {
                                        // 非最后一个字符
                                        this.outputEmoji(array, true);
                                        // console.info("zwj情况1：" + array);
                                    }
                                } else {
                                    // 最后一个字符
                                    this.outputEmoji(array, true);
                                    // console.info("zwj情况1：" + array);
                                }
                            }
                        }  else {
                            // zwj情况8. 符号+200D+符号+FE0F
                            this.outputEmoji(array, true);
                            // console.info("zwj情况1：" + array);
                        }
                    } else {
                        // zwj情况8. 符号+200D+符号+FE0F
                        this.outputEmoji(array, true);
                        // console.info("zwj情况8:" + array);
                    }
                } else {
                    // 非最后一个字符
                    this.outputEmoji(array, true);
                    // console.info("zwj情况3：" + array);
                }

            } else {
                // 最后一个字符
                this.outputEmoji(array, true);
                // console.info("zwj情况3：" + array);
            }
            return i;
        } else if (nextCodePoint0 >= 0x1F1E6 && nextCodePoint0 <= 0x1F1FF) {
            if (codePoint0 >= 0x1F1E6 && codePoint0 <= 0x1F1FF) {
                // 区域指示符号(国旗)
                // https://en.wikipedia.org/wiki/Regional_Indicator_Symbol
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

        // ES5,
        // 只要落在0xD800到0xDBFF的区间，就要连同后面2个字节一起读取。
        // See: https://www.jianshu.com/p/88cf0f773396
        // if (codePoint0 >= 0xD800 && codePoint0 <= 0xDBFF) {
        //     // 基本平面字符
        //     console.info("基本平面字符：" + String.fromCodePoint(codePoint0));
        //     continue;
        // }

        // 第二个码点是在辅助平面
        if (codePoint1 >= 0xDC00 && codePoint1 <= 0xDFFF) {
            // 辅助平面字符
            // let H = Math.floor((codePoint0 - 0x10000) / 0x400) + 0xD800,
            //     L = (codePoint0 - 0x10000) % 0x400 + 0xDC00;
            console.info("辅助平面字符：" + String.fromCodePoint(codePoint0));
            this.outputEmoji([codePoint0]);
            return i;
        }

        // 其他字符
        return -1;
    }

    /**
     * 处理双字节字符，如中文
     * @param chr
     */
    handleDoubleChars(chr: string) {

        // See:
        // https://blog.csdn.net/qq_22520587/article/details/62454354
        if (/[\u4E00-\u9FA5]|[\uFE30-\uFFA0]|[\u3000-\u303F]|[\u2E80-\u2EFF]/gi.test(chr)) {
            // 双字节字符
            // 超过字数自动换行
            if (this.x > this.activeBuffer.columns) {
                this.nextLine(true);
                this.x = 1;
            }

            // 添加数据
            // 占用两个位置
            this.activeBuffer.replace(this.y - 1, this.x - 1, 2, this.terminal.esParser.attribute, chr, "");
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
            if(!this.bufferSet.activeBuffer.change_buffer.lines[this.y]){
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
    private nextLine(isSoftWrap: boolean = false){

        if(isSoftWrap)
            console.info("isSoftWrap:" + isSoftWrap);

        // 滚筒上卷一行
        this.activeBuffer.change_buffer.line_soft_wraps[this.y - 1] = isSoftWrap? 1 : 0;

        if(this.y === this.activeBuffer.scrollBottom){
            this.scrollUp();
        } else {
            this.y += 1;
        }

    }

    /**
     * 保存光标
     */
    saveCursor() {

        if(this.terminal.cursorRenderer)
            this.terminal.cursorRenderer.clearCursor();

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

        // let line = this.activeBuffer.getBlankLine2();

        // this.activeBuffer.append2(this.activeBuffer.getBlankBlocks(), line);

        // this.append(line);

        this.activeBuffer.appendLine();

    }

    /**
     * 更新缓冲区的内容
     * @param chr
     */
    private update(chr: string) {

        // 当行内容超过指定的数量的时候，需要再次换行。
        if (this.x > this.activeBuffer.columns) {
            this.nextLine(true);
            // 光标重置
            this.x = 1;
        }

        this.activeBuffer.replace(this.y - 1, this.x - 1, 1, this.terminal.esParser.attribute, chr);

        this.x += 1;

    }

    /**
     * 创建一行，需要在滚动底部删除一行。
     */
    insertLine(){

        // 在指定的位置插入一行
        // let line = this.activeBuffer.getBlankLine2();
        //
        // let afterNode = this.activeBuffer.insert(this.y, line);
        // this.insertBefore(line, afterNode);
        this.activeBuffer.insertLine(this.y - 1, 1);

        // 删除底部的行
        const y = this.activeBuffer.scrollBottom + 1;  // index = scrollBottom
        this.activeBuffer.removeLine(y - 1, 1, false);

    }

    /**
     * 删除一行，需要在滚动底部填充一行。
     */
    deleteLine(){

        // 在滚动底部添加行
        // const line = this.activeBuffer.getBlankLine2();

        if(this.activeBuffer.scrollBottom === this.terminal.rows){
            // 在底部添加
            // this.activeBuffer.append2(this.activeBuffer.getBlankBlocks(), line);
            // this.append(line);
            this.activeBuffer.appendLine();
        } else {
            // 在后一行插入前
            const y = this.activeBuffer.scrollBottom + 1; // index = scrollBottom
            // let afterNode = this.activeBuffer.insert(y, line);
            // this.insertBefore(line, afterNode);
            this.activeBuffer.insertLine(y - 1, 1);
        }

        // 在光标的位置删除行
        this.activeBuffer.removeLine(this.y - 1, 1, false);

    }

    /**
     * 向上滚动（可以查看下面的内容）
     * 原理：底部添加行，顶部删除行
     */
    scrollUp(){

        // let line = this.activeBuffer.getBlankLine2();
        // let isUpdateScrollArea = false;
        if(this.activeBuffer.scrollBottom === this.terminal.rows){
            // 在底部添加
            // this.activeBuffer.append2(this.activeBuffer.getBlankBlocks(), line);
            // this.append(line);
            this.activeBuffer.appendLine();
            // isUpdateScrollArea = true;
        } else {
            // 在后一行插入前
            // 在底行添加空行
            // rows = 24, scrollBottom = 24, y = 24
            const y = this.activeBuffer.scrollBottom + 1; // index = scrollBottom
            // let afterNode = this.activeBuffer.insert(y, line);
            // this.insertBefore(line, afterNode);
            this.activeBuffer.insertLine(y - 1, 1);
        }

        // 删除顶行
        // 如果是备用缓冲区的话，就删除顶行。

        // 如果是缓冲区第一个是顶行的话，就保存，否则需要删除。
        this.activeBuffer.removeLine(this.activeBuffer.scrollTop - 1, 1, this.activeBuffer.scrollTop === 1);
        // savedLines['dirties']
        // savedLines['blocks']
        // savedLines['elements']

        // if(this.terminal.render == RenderType.HTML){
        //     if(savedLines['elements']){
        //         let index = 0;
        //         for(let element of savedLines['elements']){
        //             this.printer.printLine(element, savedLines['blocks'][index], false);
        //             index++;
        //         }
        //     }
        // }


        // 更新滚动区的高度。
        // if(isUpdateScrollArea && this.terminal.render == RenderType.CANVAS){
        //     // this.terminal.scrollArea.style.height =
        //     //     ((this.terminal.rows + this.terminal.bufferSet.normal.cachedLines.length) * this.terminal.charHeight) + "px";
        //     this.terminal.updateScrollAreaHeight();
        // }

    }

    /**
     * 向下滚动（可以查看上面的内容）
     * 原理：顶部添加行，底部删除行
     */
    scrollDown(){

        // let line = this.activeBuffer.getBlankLine2();

        // 删除底行
        this.activeBuffer.removeLine(this.activeBuffer.scrollBottom - 1, 1, false);

        // 顶部添加行
        // let afterNode = this.activeBuffer.insert(this.activeBuffer.scrollTop, line);
        //
        // this.insertBefore(line, afterNode);
        this.activeBuffer.insertLine(this.activeBuffer.scrollTop - 1, 1);

    }

    // /**
    //  * 添加行
    //  * @param newChild
    //  */
    // append(newChild: Node){
    //     if(this.terminal.render === RenderType.HTML) {
    //         this.viewport.appendChild(newChild);
    //     }
    // }
    //
    // /**
    //  * 插入
    //  * @param newChild
    //  * @param refChild
    //  */
    // insertBefore(newChild: Node, refChild: Node){
    //     if(this.terminal.render === RenderType.HTML) {
    //         this.viewport.insertBefore(newChild, refChild);
    //     }
    // }



}