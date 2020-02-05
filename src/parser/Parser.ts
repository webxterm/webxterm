import {Terminal} from "../Terminal";
import {EscapeSequenceParser} from "./EscapeSequenceParser";
import {BufferChain} from "./buffer/BufferChain";
import {ScreenBuffer} from "./buffer/ScreenBuffer";
import {DataBlock} from "./buffer/DataBlock";
import {MetaDataBlock} from "./buffer/MetaDataBlock";
import {PlaceholderBlock} from "./buffer/PlaceholderBlock";
import {OscParser} from "./OscParser";

// http://www.inwap.com/pdp10/ansicode.txt
// https://vt100.net/docs/vt102-ug/table5-13.html

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
const CHARSETS: { [key: string]: object | null } = {};
CHARSETS.SCLD = { // (0
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

CHARSETS.UK = null; // (A
CHARSETS.US = null; // (B (USASCII)
CHARSETS.Dutch = null; // (4
CHARSETS.Finnish = null; // (C or (5
CHARSETS.French = null; // (R
CHARSETS.FrenchCanadian = null; // (Q
CHARSETS.German = null; // (K
CHARSETS.Italian = null; // (Y
CHARSETS.NorwegianDanish = null; // (E or (6
CHARSETS.Spanish = null; // (Z
CHARSETS.Swedish = null; // (H or (7
CHARSETS.Swiss = null; // (=
CHARSETS.ISOLatin = null; // /A


export class Parser {

    private charsets: null[] | object[] = [null];

    // 缓冲区
    private buffer1: ScreenBuffer;

    // 备用缓冲区
    private buffer2: ScreenBuffer;

    // 当前活跃的缓冲区
    private buffer: ScreenBuffer;

    // x轴: 列
    public x: number = 1;

    // y轴: 行
    public y: number = 1;

    // 行号
    private line: number = 1;

    // 当前终端
    private terminal: Terminal;

    // 碎片
    private fragment: DocumentFragment;

    // 滚动区域顶部
    private scrollTop: number = 1;
    // 滚动区域底部
    private scrollBottom: number = 0;

    // 解析参数
    private params: number[] = [];
    private currentParam: number = 0;
    private prefix: string = "";
    private suffix: string = "";

    private params2: string[] = [];
    private currentParam2: string = "";

    // 当前的状态
    private state: State = State.NORMAL;

    private _gLevel: number = 0;
    private _gCharset: number = 0;

    private esParser: EscapeSequenceParser;
    private oscParser: OscParser;

    private _className: string = "";
    private _color: string = "";
    private _backgroundColor: string = "";

    constructor(terminal: Terminal) {
        this.terminal = terminal;
        // 设置活跃缓冲区为当前的默认缓冲区
        this.buffer1 = new ScreenBuffer();
        this.buffer2 = new ScreenBuffer();
        this.buffer = this.buffer1;

        this.fragment = document.createDocumentFragment();

        this.newBufferChain();

        //
        this.esParser = new EscapeSequenceParser(terminal, this);
        this.oscParser = new OscParser(terminal, this);

    }

    /**
     * 判断当前缓冲区是否为备用缓冲区
     */
    get isAlternate(): boolean {
        return this.buffer === this.buffer2;
    }

    /**
     * 热链
     */
    get hotChain(): BufferChain {
        return this.buffer.get(this.y - 1);
    }

    /**
     * 切换到备用缓冲区、
     */
    public switch2Buffer2(): Parser {
        return this;
    }

    public resetBuffer(): Parser {
        return this;
    }

    /**
     * 创建缓冲区链
     */
    newBufferChain(): BufferChain {

        let chain = new BufferChain();
        this.buffer.addChain(chain, this.y - 1);

        let el = document.createElement("div");
        el.className = "viewport-row";
        el.id = "terminal-viewport-row-" + this.line++;

        this.fragment.appendChild(el);

        chain.addBlock(new MetaDataBlock(el));

        return chain;
    }

    /**
     * 解析数据
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

                        // https://invisible-island.net/xterm/ctlseqs/ctlseqs.html#h3-Single-character-functions
                        case C0.BEL:
                            // Bell (BEL  is Ctrl-G).
                            this.terminal.bell();
                            break;
                        case C0.BS:
                            // Backspace (BS  is Ctrl-H).
                            this.x--;
                            break;
                        case C0.CR:
                            // Carriage Return (CR  is Ctrl-M).
                            // 将"字车"归位(回车)
                            this.x = 1;
                            break;
                        case C0.ENQ:
                            // Return Terminal Status (ENQ  is Ctrl-E).
                            break;
                        case C0.FF:
                            // Form Feed or New Page (NP ).  (FF  is Ctrl-L).
                            this.newPage();
                            break;
                        case C0.LF:
                            // Line Feed or New Line (NL).  (LF  is Ctrl-J).
                            this.newLine();
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
                        // case C0.HT:
                        //     // Horizontal Tab (HTS  is Ctrl-I).
                        //     break;
                        case C0.VT:
                            // Vertical Tab (VT  is Ctrl-K).
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

                    switch (chr) {

                        case "@":
                            this.esParser.insertChars(this.params, this.prefix);
                            break;
                        case "A":
                            this.esParser.cursorUp(this.params);
                            break;
                        case "B":
                            this.esParser.cursorDown(this.params);
                            break;
                        case "C":
                            this.esParser.cursorForward(this.params);
                            break;
                        case "D":
                            this.esParser.cursorBackward(this.params);
                            break;
                        case "E":
                            this.esParser.cursorNextLine(this.params);
                            break;
                        case "F":
                            this.esParser.cursorPrecedingLine(this.params);
                            break;
                        case "G":
                            this.esParser.cursorPosition(undefined, this.params[0] || 1);
                            break;
                        case "H":
                            this.esParser.cursorPosition(this.params[0] || 1, this.params[1] || 1);
                            break;
                        case "I":
                            this.esParser.cursorForwardTabulation(this.params);
                            break;
                        case "J":
                            this.esParser.eraseInDisplay(this.params, this.prefix === "?");
                            break;
                        case "K":
                            this.esParser.eraseInLine(this.params, this.prefix === "?");
                            break;
                        case "L":
                            this.esParser.insertLines(this.params);
                            break;
                        case "M":
                            this.esParser.deleteLines(this.params);
                            break;
                        case "P":
                            this.esParser.deleteChars(this.params);
                            break;
                        case "S":
                            if (this.prefix === "?") {
                                this.esParser.setOrRequestGraphicsAttr(this.params);
                            } else {
                                this.esParser.scrollUpLines(this.params);
                            }
                            break;
                        case "T":
                            if (this.prefix === ">") {
                                this.esParser.resetTitleModeFeatures(this.params);
                            } else if (this.params.length > 1) {
                                this.esParser.initiateHighlightMouseTacking(this.params);
                            } else {
                                this.esParser.scrollDownLines(this.params);
                            }
                            break;
                        case "X":
                            this.esParser.eraseChars(this.params);
                            break;
                        case "Z":
                            this.esParser.cursorBackwardTabulation(this.params);
                            break;
                        case "^":
                            this.esParser.scrollDownLines(this.params);
                            break;
                        case "`":
                            this.esParser.cursorPosition(undefined, this.params[0] || 1);
                            break;
                        case "a":
                            this.esParser.cursorPosition(undefined, this.x + (this.params[0] || 1));
                            break;
                        case "b":
                            this.esParser.repeatPrecedingGraphicChars(this.params);
                            break;
                        case "c":
                            if (this.prefix === "=") {
                                this.esParser.sendTertiaryDeviceAttrs(this.params);
                            } else if (this.prefix === ">") {
                                this.esParser.sendSecondaryDeviceAttrs(this.params);
                            } else {
                                this.esParser.sendPrimaryDeviceAttrs(this.params);
                            }
                            break;
                        case "d":
                            this.esParser.cursorPosition(this.params[0] || 1);
                            break;
                        case "e":
                            this.esParser.cursorPosition(this.y + (this.params[0] || 1));
                            break;
                        case "f":
                            this.esParser.cursorPosition(this.params[0] || 1, this.params[1] || 1);
                            break;
                        case "g":
                            this.esParser.tabClear(this.params);
                            break;
                        case "h":
                            this.esParser.setMode(this.params, this.prefix === "?");
                            break;
                        case "i":
                            this.esParser.mediaCopy(this.params, this.prefix === "?");
                            break;
                        case "l":
                            this.esParser.resetMode(this.params, this.prefix === "?");
                            break;
                        case "m":
                            if (this.prefix === ">") {
                                this.esParser.updateKeyModifierOptions(this.params);
                            } else {
                                this.esParser.charAttrs(this.params);
                            }
                            break;
                        case "n":
                            if (this.prefix === ">") {
                                this.esParser.disableKeyModifierOptions(this.params);
                                break;
                            }
                            this.esParser.deviceStatusReport(this.params, this.prefix === "?");
                            break;
                        case "p":
                            if (this.prefix === ">") {
                                this.esParser.setPointerMode(this.params);
                            } else if (this.prefix === "!") {
                                this.esParser.resetSoftTerminal();
                            } else if (this.suffix === "\"") {
                                this.esParser.setConformanceLevel(this.params);
                            } else if (this.suffix === "$") {
                                this.esParser.requestANSIMode(this.params, this.prefix === "?");
                            } else if (this.prefix === "#") {
                                this.esParser.pushVideoAttrsOntoStack(this.params);
                            } else if (this.suffix === "#") {
                                this.esParser.pushVideoAttrsOntoStack(this.params);
                            }
                            break;
                        case "q":
                            if (this.prefix === "#") {
                                this.esParser.popVideoAttrsFromStack();
                            } else if (this.suffix === "\"") {
                                this.esParser.selectCharProtectionAttr(this.params);
                            } else if (this.suffix === " ") {
                                this.esParser.setCursorStyle(this.params);
                            } else {
                                this.esParser.loadLeds(this.params);
                            }
                            break;
                        case "r":
                            if (this.prefix === "?") {
                                this.esParser.restoreDECPrivateMode(this.params);
                            } else if (this.suffix === "$") {
                                this.esParser.changeAttrsInRectangularArea(this.params);
                            } else {
                                this.esParser.setScrollingRegion(this.params);
                            }
                            break;
                        case "s":
                            if (this.prefix === "?") {
                                this.esParser.saveDECPrivateMode(this.params);
                            } else if (this.params.length > 1) {
                                this.esParser.setMargins(this.params);
                            } else {
                                this.saveCursor();
                            }
                            break;
                        case "t":
                            if (this.prefix === ">") {
                                this.esParser.setTitleModeFeatures(this.params);
                            } else if (this.suffix === " ") {
                                this.esParser.setWarningBellVolume(this.params);
                            } else if (this.suffix === "$") {
                                this.esParser.reverseAttrsInRectArea(this.params);
                            } else {
                                this.esParser.windowManipulation(this.params);
                            }
                            break;
                        case "u":
                            if (this.suffix === " ") {
                                this.esParser.setWarningBellVolume(this.params);
                            } else {
                                this.restoreCursor();
                            }
                            break;
                        case "v":
                            if (this.suffix === "$") {
                                this.esParser.copyRectangularArea(this.params);
                            }
                            break;
                        case "w":
                            if (this.suffix === "$") {
                                this.esParser.requestPresentationStateReport(this.params);
                            } else if (this.suffix === "\"") {
                                this.esParser.enableFilterRectangle(this.params);
                            }
                            break;
                        case "x":
                            if (this.suffix === "*") {
                                this.esParser.selectAttrChangeExtent(this.params);
                            } else if (this.suffix === "$") {
                                this.esParser.fillRectArea(this.params);
                            }
                            break;
                        case "y":
                            if (this.suffix === "#") {
                                this.esParser.selectChecksumExtension(this.params);
                            } else if (this.suffix === "*") {
                                this.esParser.requestRectAreaChecksum(this.params);
                            }
                            break;
                        case "z":
                            if (this.suffix === "'") {
                                this.esParser.enableLocatorReporting(this.params);
                            } else if (this.suffix === "$") {
                                this.esParser.eraseRectArea(this.params);
                            }
                            break;
                        case "{":
                            if (this.suffix === "'") {
                                this.esParser.selectLocatorEvents(this.params);
                            } else if (this.prefix === "#") {
                                this.esParser.pushVideoAttrsOntoStack(this.params);
                            } else if (this.suffix === "#") {
                                this.esParser.pushVideoAttrsOntoStack(this.params);
                            } else if (this.suffix === "$") {
                                this.esParser.selectEraseRectArea(this.params);
                            }
                            break;
                        case "|":
                            if (this.suffix === "#") {
                                this.esParser.reportSelectedGraphicRendition(this.params);
                            } else if (this.suffix === "$") {
                                this.esParser.selectColumnsPerPage(this.params);
                            } else if (this.suffix === "'") {
                                this.esParser.requestLocatorPosition(this.params);
                            } else if (this.suffix === "*") {
                                this.esParser.selectNumberOfLinesPerScreen(this.params);
                            }
                            break;
                        case "}":
                            if (this.prefix === "#") {
                                this.esParser.popVideoAttrsFromStack();
                            } else if (this.suffix === "'") {
                                this.esParser.insertChars(this.params);
                            }
                            break;
                        case "~":
                            if (this.suffix === "'") {
                                this.esParser.deleteChars(this.params);
                            }
                            break;

                    }

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
                            this.charsets[0] = CHARSETS.US;
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
                            // Application Keypad (DECKPAM).
                            this.state = State.NORMAL;
                            break;
                        case ">":
                            // Normal Keypad (DECKPNM), VT100.
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
                    break;
                case State.PM:
                    break;
            }

        }

        this.terminal.viewport.appendChild(this.fragment);
        this.fragment = document.createDocumentFragment();

        this.flush();

    }

    /**
     * 处理双字节字符
     * @param chr
     */
    handleDoubleChars(chr: string) {

        if (/[\u4E00-\u9FA5]|[\uFE30-\uFFA0]/gi.test(chr)) {
            // 双字节字符
            // this.flush();
            // 超过字数自动换行
            if (this.x > this.terminal.columns) {
                this.newLine();
                this.x = 1;
            }

            // 添加数据
            // 占用两个位置
            let block = new DataBlock(chr, this.esParser.attribute);
            block.attribute.len2 = true;
            this.buffer.get(this.y - 1)
                .addOrUpdateBlock2(block, this.x)
                .addOrUpdateBlock2(new PlaceholderBlock(), this.x + 1);

            this.x += 2;

            return true;
        }

        return false;

    }


    set gLevel(value: number) {
        this._gLevel = value;
    }

    set gCharset(value: number) {
        this._gCharset = value;
    }

    private index(): void {

    }

    private nextLine(): void {

    }

    private reverseIndex(): void {

    }

    public saveCursor(): Parser {
        return this;
    }

    public restoreCursor(): Parser {
        return this;
    }

    /**
     * 新建行
     */
    private newLine(): void {

        this.y++;

        // 如果当前行不存在的话，则创建。
        let chain = this.buffer.get(this.y - 1);
        if (!chain) {
            this.newBufferChain();
        }

    }

    private newPage() {

    }


    private update(chr: string) {

        if (this.x > this.terminal.columns) {
            this.newLine();
            // 光标重置
            this.x = 1;
        }

        // 更新缓冲区的内容
        this.buffer.get(this.y - 1).addOrUpdateBlock(chr, this.esParser.attribute, this.x++);
    }

    /**
     * 刷新数据到元素中
     * 刷新方式：通过判断当前缓冲区的所有脏链isDirty == true，
     */
    private flush(): void {

        for (let i = 0; i < this.buffer.chainSize; i++) {
            const chain = this.buffer.get(i);
            if (!chain.isDirty) {
                continue;
            }

            // 刷新脏链数据
            let leftBlockClass: string = "",
                html: string = "",
                str: string = "",
                el: string = "";


            for (let i = 1; i < chain.blockSize; i++) {

                let block = chain.getDataBlock(i);
                if (block instanceof PlaceholderBlock) {
                    continue;
                }

                // 特殊字符处理。
                switch (block.data) {
                    case ' ':
                        block.data = '&nbsp;';
                        break;
                    case '>':
                        block.data = '&gt;';
                        break;
                    case '<':
                        block.data = '&lt;';
                        break;
                    case '\t':
                        block.attribute.tab = true;
                        break;
                }


                // 1，当前字符有样式
                // 2，当前字符样式和上一个字符样式不一样。
                // 3，当前字符样式含有len2(由于间隙问题，要求每一个字符一个span存储)
                // 4，当前字符不存在样式。
                const className = block.getClassName();
                if (!!className) {

                    if (leftBlockClass === className) {
                        // 上一个字符和当前字符样式相等。
                        if (block.attribute.len2) {
                            // 结束上一个字符，如果含有样式

                            if (!!el) {
                                html += el + str + "</span>";
                                str = "";
                                el = "";
                            }

                            html += `<span class="${className}">${block.data}</span>`;

                        } else {
                            if (el === "") {
                                el = `<span class="${className}">`;
                            }

                            str += block.data;
                        }

                    } else {
                        // 上一个字符和当前字符样式不相等。
                        // 结束上一个字符，如果含有样式
                        if (!!el) {
                            html += el + str + "</span>";
                            str = "";
                            el = "";
                        }

                        if (block.attribute.len2) {
                            // 结束上一个字符，如果含有样式
                            html += `<span class="${className}">${block.data}</span>`;
                        } else {
                            if (el === "") {
                                el = `<span class="${className}">`;
                            }
                            str += block.data;
                        }

                    }

                } else {
                    // 结束上一个字符，如果含有样式
                    if (!!el) {
                        html += el + str + "</span>";
                        str = "";
                        el = "";
                    }

                    // 当前字符没有样式
                    html += block.data;
                }

                leftBlockClass = className;
            }

            if (!!str) {
                if (!!el) {
                    html += el + str + "</span>";
                    str = "";
                    el = "";
                }
            }

            chain.flush(html);

        }

    }

    public getBuffer(): ScreenBuffer {
        return this.buffer;
    }

    /**
     * 创建一行
     */
    public insertLine(): void {

    }

    /**
     * 删除一行
     */
    public deleteLine(): void {

    }

    /**
     * 向上滚动（可以查看下面的内容）
     * 原理：底部添加行，顶部删除行
     * @param n 滚动行数
     * @param initChars 是否需要填充空格(&nbsp;)
     */
    public scrollUp(n: number, initChars: boolean): void {

    }

    /**
     * 向下滚动（可以查看上面的内容）
     * 原理：顶部添加行，底部删除行
     * @param n
     * @param initChars
     */
    public scrollDown(n: number, initChars: boolean): void {

    }


}