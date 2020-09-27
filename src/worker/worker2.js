const State = {
    NORMAL: 0, ESC: 1, CSI: 2, OSC: 3, CHARSET: 4, DCS: 5, IGNORE: 6, PM: 7, APC: 8
};

// http://vt100.net/docs/vt102-ug/table5-13.html
const charsets = {};
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

// 解析状态
let state;
let x;
let y;
let params;
let prefix;
let suffix;
let currentParam;

/**
 * 解析消息
 * @param text
 * @param buffer
 */
function parseMessage(text, buffer) {

    let leftChr = "", chr = "";
    const len = text.length;

    for (let i = 0; i < len; i++) {
        chr = text[i];
        switch (state) {

            case State.NORMAL:

                switch (chr) {

                    case "\x00":
                        // 空字符 ""，丢弃
                        break;

                    // https://invisible-island.net/xterm/ctlseqs/ctlseqs.html#h3-Single-character-functions
                    case "\x07":
                        // Bell (BEL  is Ctrl-G).
                        postMessage({
                            "type": "BEL"
                        });
                        break;
                    case "\x08":
                        // Backspace (BS  is Ctrl-H).
                        if (x > (this.promptSize + 1)) {
                            x--;
                        } else {
                            postMessage({
                                "type": "BEL"
                            });
                        }
                        break;
                    case "\x0d":
                        // Carriage Return (CR  is Ctrl-M).
                        // 将"字吧车"归位(回车)
                        x = 1;
                        break;
                    case "\x05":
                        // Return Terminal Status (ENQ  is Ctrl-E).
                        break;
                    case "\x0c":
                    // Form Feed or New Page (NP ).  (FF  is Ctrl-L). FF  is treated the same as LF .
                    case "\x0a":
                        // Line Feed or New Line (NL).  (LF  is Ctrl-J).
                        // 换行或创建新行
                        postMessage({
                            "type": "NEXT_LINE"
                        });
                        break;
                    case "\x0f":
                        // Switch to Standard Character Set (Ctrl-O is Shift In or LS0).
                        break;
                    case "\x0e":
                        // Switch to Alternate Character Set (Ctrl-N is Shift Out or LS1).
                        break;
                    // case C0.SP:
                    //     // Space.
                    //     break;
                    // case C0.HT:
                    //     // Horizontal Tab (HTS  is Ctrl-I).
                    //     // https://en.wikipedia.org/wiki/Tab_key#Tab_characters
                    //     // 制表符
                    //     // \t是补全当前字符串长度到8的整数倍,最少1个最多8个空格
                    //     this.tab();
                    //     break;
                    case "\x0b":
                        // Vertical Tab (VT  is Ctrl-K).
                        postMessage({
                            "type": "NEXT_LINE"
                        });
                        break;
                    case "\x1b":
                        state = State.ESC;
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
                state = State.NORMAL;

                break;
            case State.CSI:

                if (params.length === 0) {
                    if (chr === " "
                        || chr === "?"
                        || chr === ">"
                        || chr === "="
                        || chr === "!"
                        || chr === "#") {

                        prefix = chr;
                        break;
                    }

                } else {
                    if (chr === "@"
                        || chr === "`"
                        || chr === "$"
                        || chr === "\""
                        || chr === "*"
                        || chr === "#") {

                        suffix = chr;
                        break;
                    }
                }

                // 设置
                if (chr >= "0" && chr <= "9") {
                    currentParam = currentParam * 10 + chr.charCodeAt(0) - 48;
                    break;
                }

                params.push(currentParam);
                currentParam = 0;

                if (chr === ";") break;

                this.terminal.esParser.parse(chr, params, prefix, suffix);

                params = [];
                currentParam = 0;
                prefix = "";
                suffix = "";

                state = State.NORMAL;
                break;
            case State.DCS:
                break;
            case State.ESC:
                // C1 (8-Bit) Control Characters
                switch (chr) {
                    case "D":
                        // Index (IND  is 0x84).
                        this.index();
                        state = State.NORMAL;
                        break;
                    case "E":
                        // Next Line (NEL  is 0x85).
                        this.nextLine();
                        state = State.NORMAL;
                        break;
                    case "H":
                        // Tab Set (HTS  is 0x88).
                        state = State.NORMAL;
                        break;
                    case "M":
                        // Reverse Index (RI  is 0x8d).
                        this.reverseIndex();
                        state = State.NORMAL;
                        break;
                    case "N":
                        // Single Shift Select of G2 Character Set (SS2  is 0x8e)
                        state = State.NORMAL;
                        break;
                    case "O":
                        // Single Shift Select of G3 Character Set (SS3  is 0x8f)
                        state = State.NORMAL;
                        break;
                    case "P":
                        // Device Control String (DCS  is 0x90).
                        state = State.NORMAL;
                        break;
                    case "V":
                        // Start of Guarded Area (SPA  is 0x96).
                        state = State.NORMAL;
                        break;
                    case "X":
                        // Start of String (SOS  is 0x98).
                        state = State.NORMAL;
                        break;
                    case "Z":
                        // Return Terminal ID (DECID is 0x9a).  Obsolete form of CSI c  (DA).
                        state = State.NORMAL;
                        break;
                    case "[":
                        // Control Sequence Introducer (CSI  is 0x9b).
                        params = [];
                        currentParam = 0;
                        prefix = "";
                        suffix = "";

                        state = State.CSI;
                        break;
                    case "\"":
                        // String Terminator (ST  is 0x9c).
                        break;
                    case "]":
                        // Operating System Command (OSC  is 0x9d).
                        params = [];
                        currentParam = 0;
                        prefix = "";
                        suffix = "";

                        state = State.OSC;
                        break;
                    case "^":
                        // Privacy Message (PM  is 0x9e).
                        state = State.PM;
                        break;
                    case "_":
                        // Application Program Command (APC  is 0x9f).
                        state = State.APC;
                        break;

                    // https://en.wikipedia.org/wiki/ISO/IEC_2022#Code_structure
                    // https://invisible-island.net/xterm/ctlseqs/ctlseqs.html#h3-Controls-beginning-with-ESC
                    case C0.SP:
                        // ESC SP F  7-bit controls (S7C1T), VT220.
                        // ESC SP G  8-bit controls (S8C1T), VT220.
                        // ESC SP L  Set ANSI conformance level 1, ECMA-43.
                        // ESC SP M  Set ANSI conformance level 2, ECMA-43.
                        // ESC SP N  Set ANSI conformance level 3, ECMA-43.
                        state = State.NORMAL;
                        i++;
                        break;
                    case "#":
                        // ESC # 3   DEC double-height line, top half (DECDHL), VT100.
                        // ESC # 4   DEC double-height line, bottom half (DECDHL), VT100.
                        // ESC # 5   DEC single-width line (DECSWL), VT100.
                        // ESC # 6   DEC double-width line (DECDWL), VT100.
                        // ESC # 8   DEC Screen Alignment Test (DECALN), VT100.
                        state = State.NORMAL;
                        i++;
                        break;
                    case "%":
                        // ESC % @   Select default character set.  That is ISO 8859-1 (ISO 2022).
                        // ESC % G   Select UTF-8 character set, ISO 2022.
                        this.gLevel = 0;
                        this.gCharset = 0;
                        this.charsets[0] = charsets.US;
                        state = State.NORMAL;
                        i++;
                        break;
                    case "(":
                        this.gCharset = 0;
                        state = State.CHARSET;
                        break;
                    case ")":
                        this.gCharset = 1;
                        state = State.CHARSET;
                        break;
                    case "*":
                        this.gCharset = 2;
                        state = State.CHARSET;
                        break;
                    case "+":
                        this.gCharset = 3;
                        state = State.CHARSET;
                        break;
                    case "-":
                        this.gCharset = 1;
                        state = State.CHARSET;
                        break;
                    case ".":
                        this.gCharset = 2;
                        state = State.CHARSET;
                        break;
                    case "/":
                        this.gCharset = 3;
                        state = State.CHARSET;
                        break;

                    case "6":
                        // Back Index (DECBI), VT420 and up.
                        state = State.NORMAL;
                        break;
                    case "7":
                        // Save Cursor (DECSC), VT100.
                        state = State.NORMAL;
                        break;
                    case "8":
                        // Restore Cursor (DECRC), VT100.
                        state = State.NORMAL;
                        break;
                    case "9":
                        // Forward Index (DECFI), VT420 and up.
                        state = State.NORMAL;
                        break;
                    case "=":
                        // Set alternate keypad mode
                        // Application Keypad (DECKPAM).
                        this._applicationKeypad = true;
                        this._normalKeypad = false;
                        state = State.NORMAL;
                        break;
                    case ">":
                        // Set numeric keypad mode
                        // Normal Keypad (DECKPNM), VT100.
                        this._applicationKeypad = false;
                        this._normalKeypad = true;
                        state = State.NORMAL;
                        break;
                    case "F":
                        // Cursor to lower left corner of screen.
                        state = State.NORMAL;
                        break;
                    case "c":
                        // Full Reset (RIS), VT100.
                        state = State.NORMAL;
                        break;
                    case "l":
                        // Memory Lock (per HP terminals).
                        state = State.NORMAL;
                        break;
                    case "m":
                        // Memory Unlock (per HP terminals).
                        state = State.NORMAL;
                        break;
                    case "n":
                        // Invoke the G2 Character Set as GL (LS2) as GL.
                        state = State.NORMAL;
                        break;
                    case "o":
                        // Invoke the G3 Character Set as GL (LS3) as GL.
                        state = State.NORMAL;
                        break;
                    case "|":
                        // Invoke the G3 Character Set as GR (LS3R).
                        state = State.NORMAL;
                        break;
                    case "}":
                        // Invoke the G2 Character Set as GR (LS2R).
                        state = State.NORMAL;
                        break;
                    case "~":
                        // Invoke the G1 Character Set as GR (LS1R), VT100.
                        state = State.NORMAL;
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
                if ((leftChr === "\x1b" && chr === '\\') || chr === "\x07") {
                    // 结束符
                    if (leftChr === "\x1b") {
                        if (typeof currentParam === 'string') {
                            currentParam = currentParam.slice(0, -1);
                        } else if (typeof currentParam == 'number') {
                            currentParam = (currentParam - ('\x1b'.charCodeAt(0) - 48)) / 10;
                        }
                    }

                    params.push(currentParam);

                    this.terminal.oscParser.parse(params);

                    params = [];
                    currentParam = 0;
                    state = State.NORMAL;

                } else {

                    if (!params.length) {
                        if (chr >= '0' && chr <= '9') {
                            currentParam =
                                currentParam * 10 + chr.charCodeAt(0) - 48;
                        } else if (chr === ';') {
                            params.push(currentParam);
                            // 后面是字符串
                            currentParam = '';
                        } else {
                            if (currentParam === 0) {
                                currentParam = '';
                            }
                            currentParam += chr;
                        }
                    } else {
                        // pt
                        currentParam += chr;
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
                if ((leftChr === "\x1b" && chr === '\\') || chr === "\x07") {
                    // 结束符
                    if (leftChr === "\x1b") {
                        if (typeof currentParam === 'string') {
                            currentParam = currentParam.slice(0, -1);
                        } else if (typeof currentParam == 'number') {
                            currentParam = (currentParam - ('\x1b'.charCodeAt(0) - 48)) / 10;
                        }
                    }

                    params.push(currentParam);

                    switch (params[0]) {
                        case 0:
                        case 1:
                            this.terminal.registerConnect();
                            this.terminal.cursor.enable = false;
                            break;
                        case 2:
                            // 超链接
                            // let [href, text] = (params[1] + "").split(";");
                            // for(let k = 0, len = text.length; k < len; k++){
                            //     let c = text.charAt(k);
                            //     if (!this.handleDoubleChars(c, href)) {
                            //         this.update(c, href);
                            //     }
                            // }
                            break;
                        case 3:
                            // 心跳
                            if (this.terminal.eventMap["heartbeat"])
                                this.terminal.eventMap["heartbeat"](params[1]);
                            break;
                    }

                    params = [];
                    currentParam = 0;
                    state = State.NORMAL;

                } else {

                    if (!params.length) {
                        if (chr >= '0' && chr <= '9') {
                            currentParam =
                                currentParam * 10 + chr.charCodeAt(0) - 48;
                        } else if (chr === ';') {
                            params.push(currentParam);
                            // 后面是字符串
                            currentParam = '';
                        } else {
                            if (currentParam === 0) {
                                currentParam = '';
                            }
                            currentParam += chr;
                        }
                    } else {
                        // pt
                        currentParam += chr;
                    }
                }

                break;
        }


        // 为了确保最后一个是定位，如\x1b[H，需要将当前行设置为脏行。
        if (!this.activeBufferLine.dirty)
            this.activeBufferLine.dirty = true;

        this.printer.printBuffer();

        // this.flush();

        this.terminal.scrollToBottomOnInput();

        if (callback) {
            callback();
        }

    }

    postMessage({
        type: "resolved",
        buffer: buffer
    });
}

onmessage = function (e) {

    let message = e.data;

    if (message instanceof Object) {

        switch (message["type"]) {
            case "parse":
                // 解析message
                parseMessage(message["message"], message["buffer"]);
                break;
            case "transfer":
                // 数据解析完成需要回传、
                break;
        }

    }

};