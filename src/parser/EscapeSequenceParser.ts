import {Terminal} from "../Terminal";
import {Parser} from "./Parser";
import {DataBlock} from "./buffer/DataBlock";
import {BufferChain} from "./buffer/BufferChain";
import {DataBlockAttribute} from "./buffer/DataBlockAttribute";
import {CommonUtils} from "../common/CommonUtils";
import {Preferences} from "../Preferences";
import {Styles} from "../Styles";


// 8-bit
// 256-color lookup tables
// ref: https://en.wikipedia.org/wiki/ANSI_escape_code
// https://en.wikipedia.org/wiki/Line_wrap_and_word_wrap
const builtInColorPalette = [
    /** Standard colors */
    "#000000", "#800000", "#008000", "#808000", "#000080", "#800080", "#008080", "#c0c0c0",
    /** High-intensity colors */
    "#808080", "#ff0000", "#00ff00", "#ffff00", "#0000ff", "#ff00ff", "#00ffff", "#ffffff",
    /** 216 colors  */
    "#000000", "#00005f", "#000087", "#0000af", "#0000d7", "#0000ff", "#005f00", "#005f5f",
    "#005f87", "#005faf", "#005fd7", "#005fff", "#008700", "#00875f", "#008787", "#0087af",
    "#0087d7", "#0087ff", "#00af00", "#00af5f", "#00af87", "#00afaf", "#00afd7", "#00afff",
    "#00d700", "#00d75f", "#00d787", "#00d7af", "#00d7d7", "#00d7ff", "#00ff00", "#00ff5f",
    "#00ff87", "#00ffaf", "#00ffd7", "#00ffff", "#5f0000", "#5f005f", "#5f0087", "#5f00af",
    "#5f00d7", "#5f00ff", "#5f5f00", "#5f5f5f", "#5f5f87", "#5f5faf", "#5f5fd7", "#5f5fff",
    "#5f8700", "#5f875f", "#5f8787", "#5f87af", "#5f87d7", "#5f87ff", "#5faf00", "#5faf5f",
    "#5faf87", "#5fafaf", "#5fafd7", "#5fafff", "#5fd700", "#5fd75f", "#5fd787", "#5fd7af",
    "#5fd7d7", "#5fd7ff", "#5fff00", "#5fff5f", "#5fff87", "#5fffaf", "#5fffd7", "#5fffff",
    "#870000", "#87005f", "#870087", "#8700af", "#8700d7", "#8700ff", "#875f00", "#875f5f",
    "#875f87", "#875faf", "#875fd7", "#875fff", "#878700", "#87875f", "#878787", "#8787af",
    "#8787d7", "#8787ff", "#87af00", "#87af5f", "#87af87", "#87afaf", "#87afd7", "#87afff",
    "#87d700", "#87d75f", "#87d787", "#87d7af", "#87d7d7", "#87d7ff", "#87ff00", "#87ff5f",
    "#87ff87", "#87ffaf", "#87ffd7", "#87ffff", "#af0000", "#af005f", "#af0087", "#af00af",
    "#af00d7", "#af00ff", "#af5f00", "#af5f5f", "#af5f87", "#af5faf", "#af5fd7", "#af5fff",
    "#af8700", "#af875f", "#af8787", "#af87af", "#af87d7", "#af87ff", "#afaf00", "#afaf5f",
    "#afaf87", "#afafaf", "#afafd7", "#afafff", "#afd700", "#afd75f", "#afd787", "#afd7af",
    "#afd7d7", "#afd7ff", "#afff00", "#afff5f", "#afff87", "#afffaf", "#afffd7", "#afffff",
    "#d70000", "#d7005f", "#d70087", "#d700af", "#d700d7", "#d700ff", "#d75f00", "#d75f5f",
    "#d75f87", "#d75faf", "#d75fd7", "#d75fff", "#d78700", "#d7875f", "#d78787", "#d787af",
    "#d787d7", "#d787ff", "#d7af00", "#d7af5f", "#d7af87", "#d7afaf", "#d7afd7", "#d7afff",
    "#d7d700", "#d7d75f", "#d7d787", "#d7d7af", "#d7d7d7", "#d7d7ff", "#d7ff00", "#d7ff5f",
    "#d7ff87", "#d7ffaf", "#d7ffd7", "#d7ffff", "#ff0000", "#ff005f", "#ff0087", "#ff00af",
    "#ff00d7", "#ff00ff", "#ff5f00", "#ff5f5f", "#ff5f87", "#ff5faf", "#ff5fd7", "#ff5fff",
    "#ff8700", "#ff875f", "#ff8787", "#ff87af", "#ff87d7", "#ff87ff", "#ffaf00", "#ffaf5f",
    "#ffaf87", "#ffafaf", "#ffafd7", "#ffafff", "#ffd700", "#ffd75f", "#ffd787", "#ffd7af",
    "#ffd7d7", "#ffd7ff", "#ffff00", "#ffff5f", "#ffff87", "#ffffaf", "#ffffd7", "#ffffff",
    /** Grayscale colors */
    "#080808", "#121212", "#1c1c1c", "#262626", "#303030", "#3a3a3a", "#444444", "#4e4e4e",
    "#585858", "#626262", "#6c6c6c", "#767676", "#808080", "#8a8a8a", "#949494", "#9e9e9e",
    "#a8a8a8", "#b2b2b2", "#bcbcbc", "#c6c6c6", "#d0d0d0", "#dadada", "#e4e4e4", "#eeeeee"
];

export class EscapeSequenceParser {

    private parser: Parser;
    private terminal: Terminal;

    // 自定义颜色，默认为0，可用值 38 & 48
    private customColorMode: number = 0;

    // 字符属性
    private _attribute: DataBlockAttribute = new DataBlockAttribute();

    constructor(terminal: Terminal, parser: Parser) {
        this.parser = parser;
        this.terminal = terminal;
    }

    get attribute(): DataBlockAttribute {
        return this._attribute;
    }

    get preferences(): Preferences {
        return this.terminal.preferences;
    }

    /**
     * 抹除数据块的内容
     * @param block
     * @param data
     */
    public eraseDataBlock(block: DataBlock, data: string = " "): void {

        if (!block) {
            block = new DataBlock("", this.attribute);
        }

        block.erase(data, this.attribute);
    }

    /**
     * 抹除当前行
     * @param chain
     * @param createIfNotExists 如果不存在则创建
     */
    public eraseChainDataBlock(chain: BufferChain, createIfNotExists: boolean): void {

        if (createIfNotExists) {
            const len = this.terminal.columns - chain.blockSize;
            if (len > 0) {
                for (let i = 0; i < len; i++) {
                    chain.addBlankBlock();
                }
            }
        }

        chain.eraseBlock(this.attribute);

    }

    /**
     * 插入字符（空格）
     * @param params
     * @param prefix
     */
    // CSI Ps @  Insert Ps (Blank) Character(s) (default = 1) (ICH).
    //
    // CSI Ps SP @
    //           Shift left Ps columns(s) (default = 1) (SL), ECMA-48.
    public insertChars(params: number[], prefix: string = ""): void {

        if (prefix === " ") {

        } else {
            for (let i = 0, ps = params[0] || 1; i < ps; i++) {
                this.parser.hotChain.addBlankBlock(this.parser.x++);
            }
        }

    }

    /**
     * 光标上移
     * @param params
     * @param suffix
     */
    // CSI Ps A  Cursor Up Ps Times (default = 1) (CUU).
    //
    // CSI Ps SP A
    //           Shift right Ps columns(s) (default = 1) (SR), ECMA-48.
    public cursorUp(params: number[], suffix: string = ""): void {
        if (!!suffix) {

        } else {
            this.parser.y -= params[0] || 1;
            if (this.parser.y < 1) {
                this.parser.y = 1;
            }
        }
    }

    /**
     * 光标下移
     * @param params
     */
    // CSI Ps B  Cursor Down Ps Times (default = 1) (CUD).
    public cursorDown(params: number[]): void {
        this.parser.y += params[0] || 1;
        if (this.parser.y > this.terminal.rows) {
            this.parser.y = this.terminal.rows;
        }
    }

    /**
     * 光标右移
     * @param params
     */
    // CSI Ps C  Cursor Forward Ps Times (default = 1) (CUF).
    public cursorForward(params: number[]): void {
        const ps = params[0] || 1;
        for (let i = 0; i < ps; i++) {
            // 如果右移的时候，出现 block = undefined 的话，则需要填充、
            this.parser.hotChain.addBlockIfNotExists(" ", this.attribute, this.parser.x + i);
        }
        this.parser.x += ps;
    }

    /**
     * 光标左移
     * @param params
     */
    // CSI Ps D  Cursor Backward Ps Times (default = 1) (CUB).
    public cursorBackward(params: number[]): void {
        this.parser.x -= params[0] || 1;
    }

    /**
     * 光标下一行
     * @param params
     */
    // CSI Ps E  Cursor Next Line Ps Times (default = 1) (CNL).
    public cursorNextLine(params: number[]): void {
        this.cursorDown(params);
    }

    /**
     * 光标前一行
     * @param params
     */
    // CSI Ps F  Cursor Preceding Line Ps Times (default = 1) (CPL).
    public cursorPrecedingLine(params: number[]): void {
        this.cursorUp(params);
    }

    /**
     * 光标定位
     * @param rows
     * @param cols
     */
    // CSI Ps G  Cursor Character Absolute  [column] (default = [row,1]) (CHA).
    // CSI Ps ; Ps H
    //           Cursor Position [row;column] (default = [1,1]) (CUP).
    // CSI Pm `  Character Position Absolute  [column] (default = [row,1])
    //           (HPA).
    // CSI Pm a  Character Position Relative  [columns] (default = [row,col+1])
    //           (HPR).
    // CSI Pm d  Line Position Absolute  [row] (default = [1,column]) (VPA).
    //
    // CSI Pm e  Line Position Relative  [rows] (default = [row+1,column])
    //           (VPR).
    //
    // CSI Ps ; Ps f
    //           Horizontal and Vertical Position [row;column] (default =
    //           [1,1]) (HVP).
    public cursorPosition(rows: number = 0, cols: number = 0): void {

        if (rows !== 0) {
            this.parser.y = rows;
        }

        if (cols !== 0) {
            this.parser.x = cols;
        }
    }

    /**
     * 光标前进Tab
     * @param params
     */
    // CSI Ps I  Cursor Forward Tabulation Ps tab stops (default = 1) (CHT).
    public cursorForwardTabulation(params: number[]): void {

        for (let i = 0; i < params[0] || 1; i++) {
            this.parser.hotChain.addOrUpdateBlock("\t", this.attribute, this.parser.x++);
        }
    }

    /**
     * 抹除屏幕
     * @param params
     * @param isDECS
     */
    // CSI Ps J  Erase in Display (ED), VT100.
    //             Ps = 0  ⇒  Erase Below (default).
    //             Ps = 1  ⇒  Erase Above.
    //             Ps = 2  ⇒  Erase All.
    //             Ps = 3  ⇒  Erase Saved Lines, xterm.
    //
    // CSI ? Ps J
    //           Erase in Display (DECSED), VT220.
    //             Ps = 0  ⇒  Selective Erase Below (default).
    //             Ps = 1  ⇒  Selective Erase Above.
    //             Ps = 2  ⇒  Selective Erase All.
    //             Ps = 3  ⇒  Selective Erase Saved Lines, xterm.
    public eraseInDisplay(params: number[], isDECS: boolean): void {

        let beginIndex: number = 0,
            end: number = 0,
            scrollBack: boolean = false;
        switch (params[0]) {
            case 1:
                end = this.parser.y - 1;
                break;
            case 2:
                end = this.terminal.rows - 1;
                break;
            case 3:
                break;
            default:
                beginIndex = this.parser.y - 1;
                end = this.terminal.rows - 1;
                break;
        }

        if (beginIndex === 0 && end === this.terminal.rows) {
            // 如果是全屏的话，那就滚动。
            scrollBack = !this.parser.isAlternate;
        }

        for (let i = beginIndex; i < end; i++) {
            if (scrollBack) {
                this.parser.newBufferChain();
            } else {
                // 判断行是否存在
                const chains = this.parser.getBuffer().getChains();
                if (chains[i]) {
                    // 删除数据
                    chains[i].flush("");
                } else {
                    continue;
                }
            }

            // 抹除当前行，抹除当前链数据
            const chain = this.parser.getBuffer().getChains()[i];
            this.eraseChainDataBlock(chain, true);
        }
    }

    /**
     * 抹除行内容
     * @param params
     * @param isDECS
     */
    // CSI Ps K  Erase in Line (EL), VT100.
    //             Ps = 0  ⇒  Erase to Right (default).
    //             Ps = 1  ⇒  Erase to Left.
    //             Ps = 2  ⇒  Erase All.
    //
    // CSI ? Ps K
    //           Erase in Line (DECSEL), VT220.
    //             Ps = 0  ⇒  Selective Erase to Right (default).
    //             Ps = 1  ⇒  Selective Erase to Left.
    //             Ps = 2  ⇒  Selective Erase All.
    public eraseInLine(params: number[], isDECS: boolean): void {

        let index: number,
            end: number,
            blockSize: number = this.parser.hotChain.blockSize;
        switch (params[0]) {
            case 1:
                index = 1;
                end = this.parser.x;
                break;
            case 2:
                index = 1;
                end = blockSize;
                break;
            default:
                index = this.parser.x;
                end = blockSize;
                break;
        }

        for (let i = index, block; i < end; i++) {
            block = this.parser.hotChain.getDataBlock(i);
            this.eraseDataBlock(block);
        }
    }

    /**
     * 在光标的位置插入行
     * @param params
     */
    // CSI Ps L  Insert Ps Line(s) (default = 1) (IL).
    public insertLines(params: number[]): void {

        console.info('insertLines..', params);

        for (let i = 0; i < (params[0] || 1); i++) {
            // 删除当前行
            this.parser.insertLine();
        }

    }

    /**
     * 删除行
     * @param params
     */
    // CSI Ps M  Delete Ps Line(s) (default = 1) (DL).
    public deleteLines(params: number[]): void {

        //
        console.info('deleteLines..', params);

        for (let i = 0; i < (params[0] || 1); i++) {
            // 删除当前行
            this.parser.deleteLine();
        }

    }

    /**
     * 删除字符
     * @param params
     */
    // CSI Ps P  Delete Ps Character(s) (default = 1) (DCH).
    public deleteChars(params: number[]): void {
        console.info('deleteChars.params' + JSON.stringify(params));
        const deleted = this.parser.hotChain.removeBlock2(this.parser.x, params[0] || 1);
        console.info('P.deleted', deleted);
    }

    /**
     * 设置或请求图形属性
     * @param params
     */
    // CSI ? Pi ; Pa ; Pv S
    //           Set or request graphics attribute, xterm.  If configured to
    //           support either Sixel Graphics or ReGIS Graphics, xterm accepts
    //           a three-parameter control sequence, where Pi, Pa and Pv are
    //           the item, action and value:
    //
    //             Pi = 1  ⇒  item is number of color registers.
    //             Pi = 2  ⇒  item is Sixel graphics geometry (in pixels).
    //             Pi = 3  ⇒  item is ReGIS graphics geometry (in pixels).
    //
    //             Pa = 1  ⇒  read attribute.
    //             Pa = 2  ⇒  reset to default.
    //             Pa = 3  ⇒  set to value in Pv.
    //             Pa = 4  ⇒  read the maximum allowed value.
    //
    //             Pv can be omitted except when setting (Pa == 3 ).
    //             Pv = n ⇐  A single integer is used for color registers.
    //             Pv = width ; height ⇐  Two integers for graphics geometry.
    //
    //           xterm replies with a control sequence of the same form:
    //
    //                CSI ? Pi ; Ps ; Pv S
    //
    //           where Ps is the status:
    //             Ps = 0  ⇐  success.
    //             Ps = 1  ⇐  error in Pi.
    //             Ps = 2  ⇐  error in Pa.
    //             Ps = 3  ⇐  failure.
    //
    //           On success, Pv represents the value read or set.
    //
    //           Notes:
    //           o   The current implementation allows reading the graphics
    //               sizes, but disallows modifying those sizes because that is
    //               done once, using resource-values.
    //           o   Graphics geometry is not necessarily the same as "window
    //               size" (see the dtterm window manipulation extensions).
    //               For example, xterm limits the maximum graphics geometry at
    //               compile time (1000x1000 as of version 328) although the
    //               window size can be larger.
    //           o   While resizing a window will always change the current
    //               graphics geometry, the reverse is not true.  Setting
    //               graphics geometry does not affect the window size.
    public setOrRequestGraphicsAttr(params: number[]): void {
        let [pi, pa, pv] = params;
        console.info(`setOrRequestGraphicsAttr, pi=${pi}, pa=${pa}, pv=${pv}`);
    }

    /**
     * 向上滚动Ps行
     * @param params
     */
    // CSI Ps S  Scroll up Ps lines (default = 1) (SU), VT420, ECMA-48.
    public scrollUpLines(params: number[]): void {
        console.info("scrollUpLines", params);
        this.parser.scrollUp(params[0] || 1, true);
    }

    /**
     * 将标题模式功能重置为默认值
     * @param params
     */
    // CSI > Pm T
    //           Reset title mode features to default value, xterm.  Normally,
    //           "reset" disables the feature.  It is possible to disable the
    //           ability to reset features by compiling a different default for
    //           the title modes into xterm.
    //             Ps = 0  ⇒  Do not set window/icon labels using hexadecimal.
    //             Ps = 1  ⇒  Do not query window/icon labels using hexadecimal.
    //             Ps = 2  ⇒  Do not set window/icon labels using UTF-8.
    //             Ps = 3  ⇒  Do not query window/icon labels using UTF-8.
    //           (See discussion of Title Modes).
    public resetTitleModeFeatures(params: number[]): void {

    }

    /**
     * 启动高亮鼠标跟踪
     * @param params
     */
    // CSI Ps ; Ps ; Ps ; Ps ; Ps T
    //           Initiate highlight mouse tracking.  Parameters are
    //           [func;startx;starty;firstrow;lastrow].  See the section Mouse
    //           Tracking.
    //
    public initiateHighlightMouseTacking(params: number[]): void {
        let [func, startX, startY, firstRow, lastRow] = params;
        console.info(
            `initiateHighlightMouseTacking, func=${func}, startX=${startX}, startY=${startY}, firstRow=${firstRow}, lastRow=${lastRow}`);
    }

    /**
     * 向下滚动Ps行
     * @param params
     */
    // CSI Ps T  Scroll down Ps lines (default = 1) (SD), VT420.
    // CSI Ps ^  Scroll down Ps lines (default = 1) (SD), ECMA-48.
    public scrollDownLines(params: number[]) {
        console.info("scrollDownLines:", params);
        this.parser.scrollDown(params[0] || 1, true);
    }

    /**
     * 抹除ps个字符
     * @param params
     */
    // CSI Ps X  Erase Ps Character(s) (default = 1) (ECH).
    public eraseChars(params: number[]): void {

        for (let i = this.parser.x; i < params[0] || 1; i++) {
            this.eraseDataBlock(this.parser.hotChain.getDataBlock(i));
        }

    }

    /**
     * 光标向左移ps tab
     * @param params
     */
    // CSI Ps Z  Cursor Backward Tabulation Ps tab stops (default = 1) (CBT).
    public cursorBackwardTabulation(params: number[]): void {

    }

    /**
     * 重复前ps个图形字符
     * @param params
     */
    // CSI Ps b  Repeat the preceding graphic character Ps times (REP).
    repeatPrecedingGraphicChars(params: number[]) {

    }

    /**
     * 发送第三设备属性
     * @param params
     */
    // CSI = Ps c
    //           Send Device Attributes (Tertiary DA).
    //             Ps = 0  ⇒  report Terminal Unit ID (default), VT400.  XTerm
    //           uses zeros for the site code and serial number in its DECRPTUI
    //           response.
    public sendTertiaryDeviceAttrs(params: number[]): void {

    }

    /**
     * 发送次设备属性
     * @param params
     */
    // CSI > Ps c
    //           Send Device Attributes (Secondary DA).
    //             Ps = 0  or omitted ⇒  request the terminal's identification
    //           code.  The response depends on the decTerminalID resource set-
    //           ting.  It should apply only to VT220 and up, but xterm extends
    //           this to VT100.
    //             ⇒  CSI  > Pp ; Pv ; Pc c
    //           where Pp denotes the terminal type
    //             Pp = 0  ⇒  "VT100".
    //             Pp = 1  ⇒  "VT220".
    //             Pp = 2  ⇒  "VT240".
    //             Pp = 1 8  ⇒  "VT330".
    //             Pp = 1 9  ⇒  "VT340".
    //             Pp = 2 4  ⇒  "VT320".
    //             Pp = 4 1  ⇒  "VT420".
    //             Pp = 6 1  ⇒  "VT510".
    //             Pp = 6 4  ⇒  "VT520".
    //             Pp = 6 5  ⇒  "VT525".
    //
    //           and Pv is the firmware version (for xterm, this was originally
    //           the XFree86 patch number, starting with 95).  In a DEC termi-
    //           nal, Pc indicates the ROM cartridge registration number and is
    //           always zero.
    public sendSecondaryDeviceAttrs(params: number[]): void {

    }

    /**
     * 发送主设备属性
     * @param params
     */
    // CSI Ps c  Send Device Attributes (Primary DA).
    //             Ps = 0  or omitted ⇒  request attributes from terminal.  The
    //           response depends on the decTerminalID resource setting.
    //             ⇒  CSI ? 1 ; 2 c  ("VT100 with Advanced Video Option")
    //             ⇒  CSI ? 1 ; 0 c  ("VT101 with No Options")
    //             ⇒  CSI ? 6 c  ("VT102")
    //             ⇒  CSI ? 6 2 ; Psc  ("VT220")
    //             ⇒  CSI ? 6 3 ; Psc  ("VT320")
    //             ⇒  CSI ? 6 4 ; Psc  ("VT420")
    //
    //           The VT100-style response parameters do not mean anything by
    //           themselves.  VT220 (and higher) parameters do, telling the
    //           host what features the terminal supports:
    //             Ps = 1  ⇒  132-columns.
    //             Ps = 2  ⇒  Printer.
    //             Ps = 3  ⇒  ReGIS graphics.
    //             Ps = 4  ⇒  Sixel graphics.
    //             Ps = 6  ⇒  Selective erase.
    //             Ps = 8  ⇒  User-defined keys.
    //             Ps = 9  ⇒  National Replacement Character sets.
    //             Ps = 1 5  ⇒  Technical characters.
    //             Ps = 1 6  ⇒  Locator port.
    //             Ps = 1 7  ⇒  Terminal state interrogation.
    //             Ps = 1 8  ⇒  User windows.
    //             Ps = 2 1  ⇒  Horizontal scrolling.
    //             Ps = 2 2  ⇒  ANSI color, e.g., VT525.
    //             Ps = 2 8  ⇒  Rectangular editing.
    //             Ps = 2 9  ⇒  ANSI text locator (i.e., DEC Locator mode).
    //
    //           XTerm supports part of the User windows feature, providing a
    //           single page (which corresponds to its visible window).  Rather
    //           than resizing the font to change the number of lines/columns
    //           in a fixed-size display, xterm uses the window extension con-
    //           trols (DECSNLS, DECSCPP, DECSLPP) to adjust its visible win-
    //           dow's size.  The "cursor coupling" controls (DECHCCM, DECPCCM,
    //           DECVCCM) are ignored.
    public sendPrimaryDeviceAttrs(params: number[]): void {

    }

    /**
     * 删除tab
     * @param params
     */
    // CSI Ps g  Tab Clear (TBC).
    //             Ps = 0  ⇒  Clear Current Column (default).
    //             Ps = 3  ⇒  Clear All.
    // Ecma-048
    // 8.3.154 TBC - TABULATION CLEAR
    public tabClear(params: number[]): void {

        switch (params[0]) {
            case 1:
                // 1 the line tabulation stop at the active line is cleared
                break;
            case 2:
                // 2 all character tabulation stops in the active line are cleared
                break;
            case 3:
                // 3 all character tabulation stops are cleared
                break;
            case 4:
                // 4 all line tabulation stops are cleared
                break;
            case 5:
                // 5 all tabulation stops are cleared
                break;
            default:
            // 0 the character tabulation stop at the active presentation position is cleared
        }
    }

    /**
     * 模式设置
     * @param params
     * @param isDEC
     */
    // CSI Pm h  Set Mode (SM).
    //             Ps = 2  ⇒  Keyboard Action Mode (AM).
    //             Ps = 4  ⇒  Insert Mode (IRM).
    //             Ps = 1 2  ⇒  Send/receive (SRM).
    //             Ps = 2 0  ⇒  Automatic Newline (LNM).
    // CSI ? Pm h
    //           DEC Private Mode Set (DECSET).
    //             Ps = 1  ⇒  Application Cursor Keys (DECCKM), VT100.
    //             Ps = 2  ⇒  Designate USASCII for character sets G0-G3
    //           (DECANM), VT100, and set VT100 mode.
    //             Ps = 3  ⇒  132 Column Mode (DECCOLM), VT100.
    //             Ps = 4  ⇒  Smooth (Slow) Scroll (DECSCLM), VT100.
    //             Ps = 5  ⇒  Reverse Video (DECSCNM), VT100.
    //             Ps = 6  ⇒  Origin Mode (DECOM), VT100.
    //             Ps = 7  ⇒  Auto-wrap Mode (DECAWM), VT100.
    //             Ps = 8  ⇒  Auto-repeat Keys (DECARM), VT100.
    //             Ps = 9  ⇒  Send Mouse X & Y on button press.  See the sec-
    //           tion Mouse Tracking.  This is the X10 xterm mouse protocol.
    //             Ps = 1 0  ⇒  Show toolbar (rxvt).
    //             Ps = 1 2  ⇒  Start Blinking Cursor (AT&T 610).
    //             Ps = 1 3  ⇒  Start Blinking Cursor (set only via resource or
    //           menu).
    //             Ps = 1 4  ⇒  Enable XOR of Blinking Cursor control sequence
    //           and menu.
    //             Ps = 1 8  ⇒  Print form feed (DECPFF), VT220.
    //             Ps = 1 9  ⇒  Set print extent to full screen (DECPEX),
    //           VT220.
    //             Ps = 2 5  ⇒  Show Cursor (DECTCEM), VT220.
    //             Ps = 3 0  ⇒  Show scrollbar (rxvt).
    //             Ps = 3 5  ⇒  Enable font-shifting functions (rxvt).
    //             Ps = 3 8  ⇒  Enter Tektronix Mode (DECTEK), VT240, xterm.
    //             Ps = 4 0  ⇒  Allow 80 ⇒  132 Mode, xterm.
    //             Ps = 4 1  ⇒  more(1) fix (see curses resource).
    //             Ps = 4 2  ⇒  Enable National Replacement Character sets
    //           (DECNRCM), VT220.
    //             Ps = 4 4  ⇒  Turn On Margin Bell, xterm.
    //             Ps = 4 5  ⇒  Reverse-wraparound Mode, xterm.
    //             Ps = 4 6  ⇒  Start Logging, xterm.  This is normally dis-
    //           abled by a compile-time option.
    //             Ps = 4 7  ⇒  Use Alternate Screen Buffer, xterm.  This may
    //           be disabled by the titeInhibit resource.
    //             Ps = 6 6  ⇒  Application keypad (DECNKM), VT320.
    //             Ps = 6 7  ⇒  Backarrow key sends backspace (DECBKM), VT340,
    //           VT420.  This sets the backarrowKey resource to "true".
    //             Ps = 6 9  ⇒  Enable left and right margin mode (DECLRMM),
    //           VT420 and up.
    //             Ps = 8 0  ⇒  Enable Sixel Scrolling (DECSDM).
    //             Ps = 9 5  ⇒  Do not clear screen when DECCOLM is set/reset
    //           (DECNCSM), VT510 and up.
    //             Ps = 1 0 0 0  ⇒  Send Mouse X & Y on button press and
    //           release.  See the section Mouse Tracking.  This is the X11
    //           xterm mouse protocol.
    //             Ps = 1 0 0 1  ⇒  Use Hilite Mouse Tracking, xterm.
    //             Ps = 1 0 0 2  ⇒  Use Cell Motion Mouse Tracking, xterm.  See
    //           the section Button-event tracking.
    //             Ps = 1 0 0 3  ⇒  Use All Motion Mouse Tracking, xterm.  See
    //           the section Any-event tracking.
    //             Ps = 1 0 0 4  ⇒  Send FocusIn/FocusOut events, xterm.
    //             Ps = 1 0 0 5  ⇒  Enable UTF-8 Mouse Mode, xterm.
    //             Ps = 1 0 0 6  ⇒  Enable SGR Mouse Mode, xterm.
    //             Ps = 1 0 0 7  ⇒  Enable Alternate Scroll Mode, xterm.  This
    //           corresponds to the alternateScroll resource.
    //             Ps = 1 0 1 0  ⇒  Scroll to bottom on tty output (rxvt).
    //           This sets the scrollTtyOutput resource to "true".
    //             Ps = 1 0 1 1  ⇒  Scroll to bottom on key press (rxvt).  This
    //           sets the scrollKey resource to "true".
    //             Ps = 1 0 1 5  ⇒  Enable urxvt Mouse Mode.
    //             Ps = 1 0 3 4  ⇒  Interpret "meta" key, xterm.  This sets the
    //           eighth bit of keyboard input (and enables the eightBitInput
    //           resource).
    //             Ps = 1 0 3 5  ⇒  Enable special modifiers for Alt and Num-
    //           Lock keys, xterm.  This enables the numLock resource.
    //             Ps = 1 0 3 6  ⇒  Send ESC   when Meta modifies a key, xterm.
    //           This enables the metaSendsEscape resource.
    //             Ps = 1 0 3 7  ⇒  Send DEL from the editing-keypad Delete
    //           key, xterm.
    //             Ps = 1 0 3 9  ⇒  Send ESC  when Alt modifies a key, xterm.
    //           This enables the altSendsEscape resource, xterm.
    //             Ps = 1 0 4 0  ⇒  Keep selection even if not highlighted,
    //           xterm.  This enables the keepSelection resource.
    //             Ps = 1 0 4 1  ⇒  Use the CLIPBOARD selection, xterm.  This
    //           enables the selectToClipboard resource.
    //             Ps = 1 0 4 2  ⇒  Enable Urgency window manager hint when
    //           Control-G is received, xterm.  This enables the bellIsUrgent
    //           resource.
    //             Ps = 1 0 4 3  ⇒  Enable raising of the window when Control-G
    //           is received, xterm.  This enables the popOnBell resource.
    //             Ps = 1 0 4 4  ⇒  Reuse the most recent data copied to CLIP-
    //           BOARD, xterm.  This enables the keepClipboard resource.
    //             Ps = 1 0 4 6  ⇒  Enable switching to/from Alternate Screen
    //           Buffer, xterm.  This works for terminfo-based systems, updat-
    //           ing the titeInhibit resource.
    //             Ps = 1 0 4 7  ⇒  Use Alternate Screen Buffer, xterm.  This
    //           may be disabled by the titeInhibit resource.
    //             Ps = 1 0 4 8  ⇒  Save cursor as in DECSC, xterm.  This may
    //           be disabled by the titeInhibit resource.
    //             Ps = 1 0 4 9  ⇒  Save cursor as in DECSC, xterm.  After sav-
    //           ing the cursor, switch to the Alternate Screen Buffer, clear-
    //           ing it first.  This may be disabled by the titeInhibit
    //           resource.  This control combines the effects of the 1 0 4 7
    //           and 1 0 4 8  modes.  Use this with terminfo-based applications
    //           rather than the 4 7  mode.
    //             Ps = 1 0 5 0  ⇒  Set terminfo/termcap function-key mode,
    //           xterm.
    //             Ps = 1 0 5 1  ⇒  Set Sun function-key mode, xterm.
    //             Ps = 1 0 5 2  ⇒  Set HP function-key mode, xterm.
    //             Ps = 1 0 5 3  ⇒  Set SCO function-key mode, xterm.
    //             Ps = 1 0 6 0  ⇒  Set legacy keyboard emulation, i.e, X11R6,
    //           xterm.
    //             Ps = 1 0 6 1  ⇒  Set VT220 keyboard emulation, xterm.
    //             Ps = 2 0 0 4  ⇒  Set bracketed paste mode, xterm.
    public setMode(params: number[] | number, isDEC: boolean): void {
        if (typeof params === 'object') {
            let len = params.length,
                i = 0;

            for (; i < len; i++) {
                this.setMode(params[i], isDEC);
            }
        }

        if (isDEC) {

            switch (params) {

                case 1:
                    // this.applicationCursor = true;
                    break;
                case 2:
                    // this.p.setGCharset(0, this.t.charsets.US);
                    // this.p.setGCharset(1, this.t.charsets.US);
                    // this.p.setGCharset(2, this.t.charsets.US);
                    // this.p.setGCharset(3, this.t.charsets.US);
                    break;
                case 3:
                    // this.t.onResize({
                    //     columns: 132,
                    //     rows: this.t.rows
                    // });
                    break;
                case 4:
                    break;
                case 5:
                    // Reverse Video (DECSCNM), VT100.
                    this.terminal.reverseVideo();
                    break;
                case 6:
                    // 光标原点模式
                    // this.originMode = true;
                    break;
                case 7:
                    // 自动换行
                    // this.autoWrap = true;
                    break;
                case 8:
                    // this.autoRepeatKeys = true;
                    break;
                case 9:
                    //
                    // this.x10Mouse = true;
                    // this.mouseEvents = true;
                    break;
                case 10:
                    break;
                case 12:
                case 13:
                    // Start Blinking Cursor (AT&T 610).
                    // Start Blinking Cursor (set only via resource or menu).
                    // this.t.startBlinkingCursor();
                    break;
                case 14:
                case 18:
                    // this.printFormFeed = true;
                    break;
                case 19:
                    break;
                case 25:
                    // show cursor
                    // console.info('show cursor....25h');
                    this.terminal.showCursor();
                    break;
                case 30:
                    // this.showScrollbar = true;
                    break;
                case 35:
                    // this.fontShiftingFunctions = true;
                    break;
                case 38:
                    break;
                case 40:
                    // this.allow80To132Mode = true;
                    break;
                case 41:
                case 42:
                    break;
                case 44:
                    // this.marginBell = true;
                    break;
                case 45:
                    // this.reverseWraparoundMode = true;
                    break;
                case 46:
                    // this.startLogging = true;
                    break;
                case 47:
                    // this.p.switch2ScreenBuffer2();
                    break;
                case 66:
                    // this.t.applicationKeypad = true;
                    break;
                case 67:
                    // https://en.wikipedia.org/wiki/Delete_character
                    // this.backarrowKey = true;
                    break;
                case 69:
                    // this.leftAndrightMarginMode = true;
                    break;
                case 80:
                    // this.sixelScrolling = true;
                    break;
                case 95:
                    // Do not clear screen when DECCOLM is set/reset
                    break;
                case 1000:
                    // this.vt200Mouse = true;
                    // this.mouseEvents = true;
                    break;
                case 1001:
                case 1002:
                case 1003:
                    // this.normalMouse = true;
                    // this.mouseEvents = true;
                    console.info(`Binding to mouse events. ${params}`);
                    break;
                case 1004:
                    // focusin: ^[[I
                    // focusout: ^[[O
                    // this.sendFocus = true;
                    break;
                case 1005:
                    // this.utf8Mouse = true;
                    break;
                case 1006:
                    // this.sgrMouse = true;
                    break;
                case 1007:
                    // this.alternateScroll = true;
                    break;
                case 1010:
                    // this.scrollTtyOutput = true;
                    break;
                case 1011:
                    // this.scrollKey = true;
                    break;
                case 1015:
                    // this.urxvtMouse = true;
                    break;
                case 1034:
                    // this.eightBitInput = true;
                    break;
                case 1035:
                    // this.numLock = true;
                    break;
                case 1036:
                    // this.metaSendsEscape = true;
                    break;
                case 1037:
                    break;
                case 1039:
                    // this.altSendsEscape = true;
                    break;
                case 1040:
                    // this.keepSelection = true;
                    break;
                case 1041:
                    // this.selectToClipboard = true;
                    break;
                case 1042:
                    // this.bellIsUrgent = true;
                    break;
                case 1043:
                    // this.popOnBell = true;
                    break;
                case 1044:
                    // this.keepClipboard = true;
                    break;
                case 1046:
                    // this.p.disableAlternateBuffer = false;
                    break;
                case 1047:
                    this.parser.switch2Buffer2();
                    // this.titeInhibit = true;
                    break;
                case 1048:
                    this.parser.saveCursor();
                    // this.titeInhibit = false;
                    break;
                case 1049:
                    this.parser.saveCursor().switch2Buffer2();
                    // this.titeInhibit = false;
                    break;
                case 1050:
                    // this.terminfoTermcapFunctionKey = true;
                    break;
                case 1051:
                    // this.sunFunctionKey = true;
                    break;
                case 1052:
                    // this.hpFunctionKey = true;
                    break;
                case 1053:
                    // this.scoFunctionKey = true;
                    break;
                case 1060:
                    // this.legacyKeyboard = true;
                    break;
                case 1061:
                    // this.vt220Keyboard = true;
                    break;
                case 2004:
                    // this.bracketedPaste = true;
                    break;
            }

        } else {

            switch (params) {

                case 2:
                    break;
                case 4:
                    break;
                case 12:
                    break;
                case 20:
                    break;

            }

        }
    }

    /**
     * 媒体复制
     * @param params
     * @param isDEC
     */
    // CSI ? Pm i
    //           Media Copy (MC), DEC-specific.
    //             Ps = 1  ⇒  Print line containing cursor.
    //             Ps = 4  ⇒  Turn off autoprint mode.
    //             Ps = 5  ⇒  Turn on autoprint mode.
    //             Ps = 1 0  ⇒  Print composed display, ignores DECPEX.
    //             Ps = 1 1  ⇒  Print all pages.
    // CSI Pm i  Media Copy (MC).
    //             Ps = 0  ⇒  Print screen (default).
    //             Ps = 4  ⇒  Turn off printer controller mode.
    //             Ps = 5  ⇒  Turn on printer controller mode.
    //             Ps = 1 0  ⇒  HTML screen dump, xterm.
    //             Ps = 1 1  ⇒  SVG screen dump, xterm.
    public mediaCopy(params: number[], isDEC: boolean): void {

    }

    /**
     * 重置模式
     * @param params
     * @param isDEC
     */

    // CSI Pm l  Reset Mode (RM).
    //             Ps = 2  ⇒  Keyboard Action Mode (AM).
    //             Ps = 4  ⇒  Replace Mode (IRM).
    //             Ps = 1 2  ⇒  Send/receive (SRM).
    //             Ps = 2 0  ⇒  Normal Linefeed (LNM).
    // CSI ? Pm l
    //           DEC Private Mode Reset (DECRST).
    //             Ps = 1  ⇒  Normal Cursor Keys (DECCKM), VT100.
    //             Ps = 2  ⇒  Designate VT52 mode (DECANM), VT100.
    //             Ps = 3  ⇒  80 Column Mode (DECCOLM), VT100.
    //             Ps = 4  ⇒  Jump (Fast) Scroll (DECSCLM), VT100.
    //             Ps = 5  ⇒  Normal Video (DECSCNM), VT100.
    //             Ps = 6  ⇒  Normal Cursor Mode (DECOM), VT100.
    //             Ps = 7  ⇒  No Auto-wrap Mode (DECAWM), VT100.
    //             Ps = 8  ⇒  No Auto-repeat Keys (DECARM), VT100.
    //             Ps = 9  ⇒  Don't send Mouse X & Y on button press, xterm.
    //             Ps = 1 0  ⇒  Hide toolbar (rxvt).
    //             Ps = 1 2  ⇒  Stop Blinking Cursor (AT&T 610).
    //             Ps = 1 3  ⇒  Disable Blinking Cursor (reset only via
    //           resource or menu).
    //             Ps = 1 4  ⇒  Disable XOR of Blinking Cursor control sequence
    //           and menu.
    //             Ps = 1 8  ⇒  Don't print form feed (DECPFF).
    //             Ps = 1 9  ⇒  Limit print to scrolling region (DECPEX).
    //             Ps = 2 5  ⇒  Hide Cursor (DECTCEM), VT220.
    //             Ps = 3 0  ⇒  Don't show scrollbar (rxvt).
    //             Ps = 3 5  ⇒  Disable font-shifting functions (rxvt).
    //             Ps = 4 0  ⇒  Disallow 80 ⇒  132 Mode, xterm.
    //             Ps = 4 1  ⇒  No more(1) fix (see curses resource).
    //             Ps = 4 2  ⇒  Disable National Replacement Character sets
    //           (DECNRCM), VT220.
    //             Ps = 4 4  ⇒  Turn Off Margin Bell, xterm.
    //             Ps = 4 5  ⇒  No Reverse-wraparound Mode, xterm.
    //             Ps = 4 6  ⇒  Stop Logging, xterm.  This is normally disabled
    //           by a compile-time option.
    //             Ps = 4 7  ⇒  Use Normal Screen Buffer, xterm.
    //             Ps = 6 6  ⇒  Numeric keypad (DECNKM), VT320.
    //             Ps = 6 7  ⇒  Backarrow key sends delete (DECBKM), VT340,
    //           VT420.  This sets the backarrowKey resource to "false".
    //             Ps = 6 9  ⇒  Disable left and right margin mode (DECLRMM),
    //           VT420 and up.
    //             Ps = 8 0  ⇒  Disable Sixel Scrolling (DECSDM).
    //             Ps = 9 5  ⇒  Clear screen when DECCOLM is set/reset (DEC-
    //           NCSM), VT510 and up.
    //             Ps = 1 0 0 0  ⇒  Don't send Mouse X & Y on button press and
    //           release.  See the section Mouse Tracking.
    //             Ps = 1 0 0 1  ⇒  Don't use Hilite Mouse Tracking, xterm.
    //             Ps = 1 0 0 2  ⇒  Don't use Cell Motion Mouse Tracking,
    //           xterm.  See the section Button-event tracking.
    //             Ps = 1 0 0 3  ⇒  Don't use All Motion Mouse Tracking, xterm.
    //           See the section Any-event tracking.
    //             Ps = 1 0 0 4  ⇒  Don't send FocusIn/FocusOut events, xterm.
    //             Ps = 1 0 0 5  ⇒  Disable UTF-8 Mouse Mode, xterm.
    //             Ps = 1 0 0 6  ⇒  Disable SGR Mouse Mode, xterm.
    //             Ps = 1 0 0 7  ⇒  Disable Alternate Scroll Mode, xterm.  This
    //           corresponds to the alternateScroll resource.
    //             Ps = 1 0 1 0  ⇒  Don't scroll to bottom on tty output
    //           (rxvt).  This sets the scrollTtyOutput resource to "false".
    //             Ps = 1 0 1 1  ⇒  Don't scroll to bottom on key press (rxvt).
    //           This sets the scrollKey resource to "false".
    //             Ps = 1 0 1 5  ⇒  Disable urxvt Mouse Mode.
    //             Ps = 1 0 3 4  ⇒  Don't interpret "meta" key, xterm.  This
    //           disables the eightBitInput resource.
    //             Ps = 1 0 3 5  ⇒  Disable special modifiers for Alt and Num-
    //           Lock keys, xterm.  This disables the numLock resource.
    //             Ps = 1 0 3 6  ⇒  Don't send ESC  when Meta modifies a key,
    //           xterm.  This disables the metaSendsEscape resource.
    //             Ps = 1 0 3 7  ⇒  Send VT220 Remove from the editing-keypad
    //           Delete key, xterm.
    //             Ps = 1 0 3 9  ⇒  Don't send ESC when Alt modifies a key,
    //           xterm.  This disables the altSendsEscape resource.
    //             Ps = 1 0 4 0  ⇒  Do not keep selection when not highlighted,
    //           xterm.  This disables the keepSelection resource.
    //             Ps = 1 0 4 1  ⇒  Use the PRIMARY selection, xterm.  This
    //           disables the selectToClipboard resource.
    //             Ps = 1 0 4 2  ⇒  Disable Urgency window manager hint when
    //           Control-G is received, xterm.  This disables the bellIsUrgent
    //           resource.
    //             Ps = 1 0 4 3  ⇒  Disable raising of the window when Control-
    //           G is received, xterm.  This disables the popOnBell resource.
    //             Ps = 1 0 4 6  ⇒  Disable switching to/from Alternate Screen
    //           Buffer, xterm.  This works for terminfo-based systems, updat-
    //           ing the titeInhibit resource.  If currently using the Alter-
    //           nate Screen Buffer, xterm switches to the Normal Screen Buf-
    //           fer.
    //             Ps = 1 0 4 7  ⇒  Use Normal Screen Buffer, xterm.  Clear the
    //           screen first if in the Alternate Screen Buffer.  This may be
    //           disabled by the titeInhibit resource.
    //             Ps = 1 0 4 8  ⇒  Restore cursor as in DECRC, xterm.  This
    //           may be disabled by the titeInhibit resource.
    //             Ps = 1 0 4 9  ⇒  Use Normal Screen Buffer and restore cursor
    //           as in DECRC, xterm.  This may be disabled by the titeInhibit
    //           resource.  This combines the effects of the 1 0 4 7  and 1 0 4
    //           8  modes.  Use this with terminfo-based applications rather
    //           than the 4 7  mode.
    //             Ps = 1 0 5 0  ⇒  Reset terminfo/termcap function-key mode,
    //           xterm.
    //             Ps = 1 0 5 1  ⇒  Reset Sun function-key mode, xterm.
    //             Ps = 1 0 5 2  ⇒  Reset HP function-key mode, xterm.
    //             Ps = 1 0 5 3  ⇒  Reset SCO function-key mode, xterm.
    //             Ps = 1 0 6 0  ⇒  Reset legacy keyboard emulation, i.e,
    //           X11R6, xterm.
    //             Ps = 1 0 6 1  ⇒  Reset keyboard emulation to Sun/PC style,
    //           xterm.
    //             Ps = 2 0 0 4  ⇒  Reset bracketed paste mode, xterm.
    public resetMode(params: number[] | number, isDEC: boolean) {

        if (typeof params === 'object') {
            let len = params.length,
                i = 0;

            for (; i < len; i++) {
                this.setMode(params[i], isDEC);
            }
        }

        if (isDEC) {

            switch (params) {

                case 1:
                    // this.applicationCursor = true;
                    break;
                case 2:
                    // this.p.setGCharset(0, this.t.charsets.US);
                    // this.p.setGCharset(1, this.t.charsets.US);
                    // this.p.setGCharset(2, this.t.charsets.US);
                    // this.p.setGCharset(3, this.t.charsets.US);
                    break;
                case 3:
                    // this.t.onResize({
                    //     columns: 132,
                    //     rows: this.t.rows
                    // });
                    break;
                case 4:
                    break;
                case 5:
                    // Reverse Video (DECSCNM), VT100.
                    this.terminal.normalVideo();
                    break;
                case 6:
                    // 光标原点模式
                    // this.originMode = true;
                    break;
                case 7:
                    // 自动换行
                    // this.autoWrap = true;
                    break;
                case 8:
                    // this.autoRepeatKeys = true;
                    break;
                case 9:
                    //
                    // this.x10Mouse = true;
                    // this.mouseEvents = true;
                    break;
                case 10:
                    break;
                case 12:
                case 13:
                    // Start Blinking Cursor (AT&T 610).
                    // Start Blinking Cursor (set only via resource or menu).
                    // this.t.startBlinkingCursor();
                    break;
                case 14:
                case 18:
                    // this.printFormFeed = true;
                    break;
                case 19:
                    break;
                case 25:
                    // hide cursor
                    // console.info('hide cursor....25l');
                    this.terminal.hideCursor();
                    break;
                case 30:
                    // this.showScrollbar = true;
                    break;
                case 35:
                    // this.fontShiftingFunctions = true;
                    break;
                case 38:
                    break;
                case 40:
                    // this.allow80To132Mode = true;
                    break;
                case 41:
                case 42:
                    break;
                case 44:
                    // this.marginBell = true;
                    break;
                case 45:
                    // this.reverseWraparoundMode = true;
                    break;
                case 46:
                    // this.startLogging = true;
                    break;
                case 47:
                    this.parser.resetBuffer();
                    break;
                case 66:
                    // this.t.applicationKeypad = true;
                    break;
                case 67:
                    // https://en.wikipedia.org/wiki/Delete_character
                    // this.backarrowKey = true;
                    break;
                case 69:
                    // this.leftAndrightMarginMode = true;
                    break;
                case 80:
                    // this.sixelScrolling = true;
                    break;
                case 95:
                    // Do not clear screen when DECCOLM is set/reset
                    break;
                case 1000:
                    // this.vt200Mouse = true;
                    // this.mouseEvents = true;
                    break;
                case 1001:
                case 1002:
                case 1003:
                    // this.normalMouse = true;
                    // this.mouseEvents = true;
                    break;
                case 1004:
                    // focusin: ^[[I
                    // focusout: ^[[O
                    // this.sendFocus = true;
                    break;
                case 1005:
                    // this.utf8Mouse = true;
                    break;
                case 1006:
                    // this.sgrMouse = true;
                    break;
                case 1007:
                    // this.alternateScroll = true;
                    break;
                case 1010:
                    // this.scrollTtyOutput = true;
                    break;
                case 1011:
                    // this.scrollKey = true;
                    break;
                case 1015:
                    // this.urxvtMouse = true;
                    break;
                case 1034:
                    // this.eightBitInput = true;
                    break;
                case 1035:
                    // this.numLock = true;
                    break;
                case 1036:
                    // this.metaSendsEscape = true;
                    break;
                case 1037:
                    break;
                case 1039:
                    // this.altSendsEscape = true;
                    break;
                case 1040:
                    // this.keepSelection = true;
                    break;
                case 1041:
                    // this.selectToClipboard = true;
                    break;
                case 1042:
                    // this.bellIsUrgent = true;
                    break;
                case 1043:
                    // this.popOnBell = true;
                    break;
                case 1044:
                    // this.keepClipboard = true;
                    break;
                case 1046:
                    // this.p.disableAlternateBuffer = false;
                    break;
                case 1047:
                    // 清除备用缓冲区
                    this.eraseInDisplay([2], false);
                    // 切换到默认缓冲区
                    this.parser.resetBuffer();
                    // this.titeInhibit = false;
                    break;
                case 1048:
                    this.parser.restoreCursor();
                    // this.titeInhibit = false;
                    break;
                case 1049:
                    // 切换到默认缓冲区&恢复光标
                    this.parser.resetBuffer().restoreCursor();
                    // this.titeInhibit = false;
                    break;
                case 1050:
                    // this.terminfoTermcapFunctionKey = true;
                    break;
                case 1051:
                    // this.sunFunctionKey = true;
                    break;
                case 1052:
                    // this.hpFunctionKey = true;
                    break;
                case 1053:
                    // this.scoFunctionKey = true;
                    break;
                case 1060:
                    // this.legacyKeyboard = true;
                    break;
                case 1061:
                    // this.vt220Keyboard = true;
                    break;
                case 2004:
                    // this.bracketedPaste = true;
                    break;
            }

        } else {

            switch (params) {

                case 2:
                    break;
                case 4:
                    break;
                case 12:
                    break;
                case 20:
                    break;

            }

        }
    }

    /**
     * 更新修改键选项
     * @param params
     */
    // CSI > Pp ; Pv m
    // CSI > Pp m
    //           Set/reset key modifier options, xterm.  Set or reset resource-
    //           values used by xterm to decide whether to construct escape
    //           sequences holding information about the modifiers pressed with
    //           a given key.
    //
    //           The first parameter Pp identifies the resource to set/reset.
    //           The second parameter Pv is the value to assign to the
    //           resource.
    //
    //           If the second parameter is omitted, the resource is reset to
    //           its initial value.  Values 3  and 5  are reserved for keypad-
    //           keys and string-keys.
    //
    //             Pp = 0  ⇒  modifyKeyboard.
    //             Pp = 1  ⇒  modifyCursorKeys.
    //             Pp = 2  ⇒  modifyFunctionKeys.
    //             Pp = 4  ⇒  modifyOtherKeys.
    //
    //           If no parameters are given, all resources are reset to their
    //           initial values.
    public updateKeyModifierOptions(params: number[]): void {

    }

    /**
     * 设置字符属性
     * @param params
     */
    // CSI Pm m  Character Attributes (SGR).
    //             Ps = 0  ⇒  Normal (default), VT100.
    //             Ps = 1  ⇒  Bold, VT100.
    //             Ps = 2  ⇒  Faint, decreased intensity, ECMA-48 2nd.
    //             Ps = 3  ⇒  Italicized, ECMA-48 2nd.
    //             Ps = 4  ⇒  Underlined, VT100.
    //             Ps = 5  ⇒  Blink, VT100.
    //           This appears as Bold in X11R6 xterm.
    //             Ps = 7  ⇒  Inverse, VT100.
    //             Ps = 8  ⇒  Invisible, i.e., hidden, ECMA-48 2nd, VT300.
    //             Ps = 9  ⇒  Crossed-out characters, ECMA-48 3rd.
    //             Ps = 2 1  ⇒  Doubly-underlined, ECMA-48 3rd.
    //             Ps = 2 2  ⇒  Normal (neither bold nor faint), ECMA-48 3rd.
    //             Ps = 2 3  ⇒  Not italicized, ECMA-48 3rd.
    //             Ps = 2 4  ⇒  Not underlined, ECMA-48 3rd.
    //             Ps = 2 5  ⇒  Steady (not blinking), ECMA-48 3rd.
    //             Ps = 2 7  ⇒  Positive (not inverse), ECMA-48 3rd.
    //             Ps = 2 8  ⇒  Visible, i.e., not hidden, ECMA-48 3rd, VT300.
    //             Ps = 2 9  ⇒  Not crossed-out, ECMA-48 3rd.
    //             Ps = 3 0  ⇒  Set foreground color to Black.
    //             Ps = 3 1  ⇒  Set foreground color to Red.
    //             Ps = 3 2  ⇒  Set foreground color to Green.
    //             Ps = 3 3  ⇒  Set foreground color to Yellow.
    //             Ps = 3 4  ⇒  Set foreground color to Blue.
    //             Ps = 3 5  ⇒  Set foreground color to Magenta.
    //             Ps = 3 6  ⇒  Set foreground color to Cyan.
    //             Ps = 3 7  ⇒  Set foreground color to White.
    //             Ps = 3 9  ⇒  Set foreground color to default, ECMA-48 3rd.
    //             Ps = 4 0  ⇒  Set background color to Black.
    //             Ps = 4 1  ⇒  Set background color to Red.
    //             Ps = 4 2  ⇒  Set background color to Green.
    //             Ps = 4 3  ⇒  Set background color to Yellow.
    //             Ps = 4 4  ⇒  Set background color to Blue.
    //             Ps = 4 5  ⇒  Set background color to Magenta.
    //             Ps = 4 6  ⇒  Set background color to Cyan.
    //             Ps = 4 7  ⇒  Set background color to White.
    //             Ps = 4 9  ⇒  Set background color to default, ECMA-48 3rd.
    //
    //           Some of the above note the edition of ECMA-48 which first
    //           describes a feature.  In its successive editions from 1979 to
    //           1991 (2nd 1979, 3rd 1984, 4th 1986, and 5th 1991), ECMA-48
    //           listed codes through 6 5 (skipping several toward the end of
    //           the range).  Most of the ECMA-48 codes not implemented in
    //           xterm were never implemented in a hardware terminal.  Several
    //           (such as 3 9  and 4 9 ) are either noted in ECMA-48 as imple-
    //           mentation defined, or described in vague terms.
    //
    //           The successive editions of ECMA-48 give little attention to
    //           changes from one edition to the next, except to comment on
    //           features which have become obsolete.  ECMA-48 1st (1976) is
    //           unavailable; there is no reliable source of information which
    //           states whether "ANSI" color was defined in that edition, or
    //           later (1979).  The VT100 (1978) implemented the most commonly
    //           used non-color video attributes which are given in the 2nd
    //           edition.
    //
    //           While 8-color support is described in ECMA-48 2nd edition, the
    //           VT500 series (introduced in 1993) were the first DEC terminals
    //           implementing "ANSI" color.  The DEC terminal's use of color is
    //           known to differ from xterm; useful documentation on this
    //           series became available too late to influence xterm.
    //
    //           If 16-color support is compiled, the following aixterm con-
    //           trols apply.  Assume that xterm's resources are set so that
    //           the ISO color codes are the first 8 of a set of 16.  Then the
    //           aixterm colors are the bright versions of the ISO colors:
    //
    //             Ps = 9 0  ⇒  Set foreground color to Black.
    //             Ps = 9 1  ⇒  Set foreground color to Red.
    //             Ps = 9 2  ⇒  Set foreground color to Green.
    //             Ps = 9 3  ⇒  Set foreground color to Yellow.
    //             Ps = 9 4  ⇒  Set foreground color to Blue.
    //             Ps = 9 5  ⇒  Set foreground color to Magenta.
    //             Ps = 9 6  ⇒  Set foreground color to Cyan.
    //             Ps = 9 7  ⇒  Set foreground color to White.
    //             Ps = 1 0 0  ⇒  Set background color to Black.
    //             Ps = 1 0 1  ⇒  Set background color to Red.
    //             Ps = 1 0 2  ⇒  Set background color to Green.
    //             Ps = 1 0 3  ⇒  Set background color to Yellow.
    //             Ps = 1 0 4  ⇒  Set background color to Blue.
    //             Ps = 1 0 5  ⇒  Set background color to Magenta.
    //             Ps = 1 0 6  ⇒  Set background color to Cyan.
    //             Ps = 1 0 7  ⇒  Set background color to White.
    //
    //           If xterm is compiled with the 16-color support disabled, it
    //           supports the following, from rxvt:
    //             Ps = 1 0 0  ⇒  Set foreground and background color to
    //           default.
    //
    //           XTerm maintains a color palette whose entries are identified
    //           by an index beginning with zero.  If 88- or 256-color support
    //           is compiled, the following apply:
    //           o   All parameters are decimal integers.
    //           o   RGB values range from zero (0) to 255.
    //           o   ISO-8613-6 has been interpreted in more than one way;
    //               xterm allows the semicolons separating the subparameters
    //               in this control to be replaced by colons (but after the
    //               first colon, colons must be used).
    //
    //           These ISO-8613-6 controls (marked in ECMA-48 5th edition as
    //           "reserved for future standardization") are supported by xterm:
    //             Pm = 3 8 ; 2 ; Pi ; Pr ; Pg ; Pb ⇒  Set foreground color
    //           using RGB values.  If xterm is not compiled with direct-color
    //           support, it uses the closest match in its palette for the
    //           given RGB Pr/Pg/Pb.  The color space identifier Pi is ignored.
    //             Pm = 3 8 ; 5 ; Ps ⇒  Set foreground color to Ps, using
    //           indexed color.
    //             Pm = 4 8 ; 2 ; Pi ; Pr ; Pg ; Pb ⇒  Set background color
    //           using RGB values.  If xterm is not compiled with direct-color
    //           support, it uses the closest match in its palette for the
    //           given RGB Pr/Pg/Pb.  The color space identifier Pi is ignored.
    //             Pm = 4 8 ; 5 ; Ps ⇒  Set background color to Ps, using
    //           indexed color.
    //
    //           This variation on ISO-8613-6 is supported for compatibility
    //           with KDE konsole:
    //             Pm = 3 8 ; 2 ; Pr ; Pg ; Pb ⇒  Set foreground color using
    //           RGB values.  If xterm is not compiled with direct-color sup-
    //           port, it uses the closest match in its palette for the given
    //           RGB Pr/Pg/Pb.
    //             Pm = 4 8 ; 2 ; Pr ; Pg ; Pb ⇒  Set background color using
    //           RGB values.  If xterm is not compiled with direct-color sup-
    //           port, it uses the closest match in its palette for the given
    //           RGB Pr/Pg/Pb.
    //
    //           In each case, if xterm is compiled with direct-color support,
    //           and the resource directColor is true, then rather than choos-
    //           ing the closest match, xterm asks the X server to directly
    //           render a given color.

    // (SGR parameters) https://en.wikipedia.org/wiki/ANSI_escape_code
    // (8.3.117) http://www.ecma-international.org/publications/files/ECMA-ST/Ecma-048.pdf
    public charAttrs(params: number[] | number): void {

        if (typeof params === 'object') {

            for (let len = params.length, i = 0; i < len; i++) {
                if (this.customColorMode !== 0) {
                    let color = "", name = "";
                    if (params[i] === 2) {
                        name += params[i + 1].toString(16);
                        name += params[i + 2].toString(16);
                        name += params[i + 3].toString(16);
                        color = "rgba(" + params[i + 1] + "," + params[i + 2] + "," + params[i + 3] + ", 0.99)";
                    } else if (params[i] === 5) {
                        color = builtInColorPalette[params[i + 1]];
                        name = color.substring(1);
                        color = CommonUtils.parseColor(color, 0.99);
                    }

                    if (this.customColorMode === 38) {
                        // 38;5;2m
                        // 38;2;100;100;100m
                        this.attribute.color = "color_" + name;

                        Styles.add("." + this.attribute.color, {
                            color: color,
                        }, this.terminal.instanceId);

                        // 选择颜色
                        Styles.add([
                            "." + this.attribute.color + "::selection",
                            "." + this.attribute.color + "::-moz-selection",
                            "." + this.attribute.color + "::-webkit-selection"], {
                            color: this.preferences.backgroundColor,
                            "background-color": color
                        }, this.terminal.instanceId);


                    } else if (this.customColorMode === 48) {
                        // 48;5;2m
                        // 48;2;100;100;100m
                        this.attribute.backgroundColor = "_color_" + name;

                        Styles.add("." + this.attribute.backgroundColor, {
                            "background-color": color,
                        }, this.terminal.instanceId);

                        // 选择颜色
                        Styles.add([
                            "." + this.attribute.backgroundColor + "::selection",
                            "." + this.attribute.backgroundColor + "::-moz-selection",
                            "." + this.attribute.backgroundColor + "::-webkit-selection"], {
                            color: color,
                            "background-color": this.preferences.color
                        }, this.terminal.instanceId);

                    }

                    this.customColorMode = 0;

                    break;
                }
                this.charAttrs(params[i]);
            }

        }

        if(typeof params !== "number") return;

        switch (params) {
            case 0:
                // 重置。
                this._attribute = new DataBlockAttribute();
                break;
            case 1:
                this._attribute.bold = true;
                // 加粗高亮配置
                if(this.preferences.showBoldTextInBrightColor){
                    if(!!this.attribute.color){
                        const index = Preferences.paletteColorNames.indexOf(this.attribute.color);
                        this.attribute.color = Preferences.paletteColorNames[index + 8];
                    }
                }
                break;
            case 2:
                this._attribute.faint = true;
                break;
            case 3:
                this._attribute.italic = true;
                break;
            case 4:
                this._attribute.underline = true;
                break;
            case 5:
                this._attribute.slowBlink = true;
                break;
            case 6:
                this._attribute.rapidBlink = true;
                break;
            case 7:
                this._attribute.inverse = true;
                break;
            case 8:
                this._attribute.invisible = true;
                break;
            case 9:
                this._attribute.crossedOut = true;
                break;
            case 21:
                this._attribute.bold = false;
                break;
            case 22:
                this._attribute.bold = false;
                this._attribute.faint = false;
                break;
            case 23:
                this._attribute.italic = false;
                break;
            case 24:
                this._attribute.underline = false;
                break;
            case 25:
                this._attribute.slowBlink = false;
                break;
            case 26:
                this._attribute.rapidBlink = false;
                break;
            case 27:
                this._attribute.inverse = false;
                break;
            case 28:
                this._attribute.invisible = false;
                break;
            case 29:
                this._attribute.crossedOut = false;
                break;
            case 38:
                // 38;5;2m
                // 38;2;100;100;100m
                this.customColorMode = params;
                break;
            case 48:
                // 48;5;2m
                // 48;2;100;100;100m
                this.customColorMode = params;
                break;
            default:

                // 8-bit
                // ESC[ 38;5;⟨n⟩ m Select foreground color
                // ESC[ 48;5;⟨n⟩ m Select background color
                //      0-  7:  standard colors (as in ESC [ 30–37 m)
                //      8- 15:  high intensity colors (as in ESC [ 90–97 m)
                //     16-231:  6 × 6 × 6 cube (216 colors): 16 + 36 × r + 6 × g + b (0 ≤ r, g, b ≤ 5)
                //    232-255:  grayscale from black to white in 24 steps
                //
                // 24-bit
                // ESC[ 38;2;⟨r⟩;⟨g⟩;⟨b⟩ m Select RGB foreground color
                // ESC[ 48;2;⟨r⟩;⟨g⟩;⟨b⟩ m Select RGB background color

                // (SGR parameters) https://en.wikipedia.org/wiki/ANSI_escape_code
                // (8.3.117) http://www.ecma-international.org/publications/files/ECMA-ST/Ecma-048.pdf

                let num = 0, colorName;
                if(30 <= params && params <= 37){
                    num = 30;
                } else if(90 <= params && params <= 97){
                    num = 90;
                } else if(40 <= params && params <= 47){
                    num = 40;
                } else if(100 <= params && params <= 107){
                    num = 100;
                }

                switch (num) {
                    case 30:
                    case 90:
                        // 高亮字体颜色
                        // 以亮色显示粗体文本
                        if(num === 90 || (this.attribute.bold && this.preferences.showBoldTextInBrightColor)){
                            colorName = Preferences.paletteColorNames[params - num + 8];
                        } else {
                            colorName = Preferences.paletteColorNames[params - num];
                        }
                        this.attribute.color = colorName;
                        break;
                    case 40:
                        // 背景颜色
                        this.attribute.backgroundColor =  "_" + Preferences.paletteColorNames[params - num];
                        break;
                    case 100:
                        // 背景颜色
                        // 高亮字体颜色
                        this.attribute.backgroundColor =  "_" + Preferences.paletteColorNames[params - num + 8];
                        break;
                    default:
                        // 0
                        break;

                }

        }
    }

    disableKeyModifierOptions(params: number[]) {

    }

    deviceStatusReport(params: number[], b: boolean) {

    }

    setPointerMode(params: number[]) {

    }

    resetSoftTerminal() {

    }

    setConformanceLevel(params: number[]) {

    }

    requestANSIMode(params: number[], b: boolean) {

    }

    pushVideoAttrsOntoStack(params: number[]) {

    }

    popVideoAttrsFromStack() {

    }

    selectCharProtectionAttr(params: number[]) {

    }

    setCursorStyle(params: number[]) {

    }

    loadLeds(params: number[]) {

    }

    restoreDECPrivateMode(params: number[]) {

    }

    changeAttrsInRectangularArea(params: number[]) {

    }

    setScrollingRegion(params: number[]) {

    }

    saveDECPrivateMode(params: number[]) {

    }

    setMargins(params: number[]) {

    }

    setTitleModeFeatures(params: number[]) {

    }

    setWarningBellVolume(params: number[]) {

    }

    reverseAttrsInRectArea(params: number[]) {

    }

    windowManipulation(params: number[]) {

    }

    copyRectangularArea(params: number[]) {

    }

    requestPresentationStateReport(params: number[]) {

    }

    enableFilterRectangle(params: number[]) {

    }

    selectAttrChangeExtent(params: number[]) {

    }

    fillRectArea(params: number[]) {

    }

    selectChecksumExtension(params: number[]) {

    }

    requestRectAreaChecksum(params: number[]) {

    }

    enableLocatorReporting(params: number[]) {

    }

    eraseRectArea(params: number[]) {

    }

    selectLocatorEvents(params: number[]) {

    }

    selectEraseRectArea(params: number[]) {

    }

    reportSelectedGraphicRendition(params: number[]) {

    }

    selectColumnsPerPage(params: number[]) {

    }

    requestLocatorPosition(params: number[]) {

    }

    selectNumberOfLinesPerScreen(params: number[]) {

    }

}