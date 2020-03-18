"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DataBlock_1 = require("../buffer/DataBlock");
const DataBlockAttribute_1 = require("../buffer/DataBlockAttribute");
const Preferences_1 = require("../Preferences");
const Styles_1 = require("../Styles");
const Color_1 = require("../common/Color");
const builtInColorPalette = [
    "#000000", "#800000", "#008000", "#808000", "#000080", "#800080", "#008080", "#c0c0c0",
    "#808080", "#ff0000", "#00ff00", "#ffff00", "#0000ff", "#ff00ff", "#00ffff", "#ffffff",
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
    "#080808", "#121212", "#1c1c1c", "#262626", "#303030", "#3a3a3a", "#444444", "#4e4e4e",
    "#585858", "#626262", "#6c6c6c", "#767676", "#808080", "#8a8a8a", "#949494", "#9e9e9e",
    "#a8a8a8", "#b2b2b2", "#bcbcbc", "#c6c6c6", "#d0d0d0", "#dadada", "#e4e4e4", "#eeeeee"
];
class EscapeSequenceParser {
    constructor(terminal, parser) {
        this.customColorMode = 0;
        this._attribute = new DataBlockAttribute_1.DataBlockAttribute();
        this._applicationCursorKeys = false;
        this._normalCursorKeys = true;
        this._replaceMode = true;
        this._insertMode = false;
        this.cursorBlinking = false;
        this.parser = parser;
        this.terminal = terminal;
        this.cursorBlinking = this.terminal.cursor.blinking;
    }
    get attribute() {
        return this._attribute;
    }
    get preferences() {
        return this.terminal.preferences;
    }
    get applicationCursorKeys() {
        return this._applicationCursorKeys;
    }
    get normalCursorKeys() {
        return this._normalCursorKeys;
    }
    get replaceMode() {
        return this._replaceMode;
    }
    get insertMode() {
        return this._insertMode;
    }
    get activeBufferLine() {
        return this.parser.bufferSet.activeBufferLine;
    }
    get activeBuffer() {
        return this.parser.bufferSet.activeBuffer;
    }
    parse(chr, params, prefix, suffix) {
        switch (chr) {
            case "@":
                this.insertChars(params, prefix);
                break;
            case "A":
                this.cursorUp(params);
                break;
            case "B":
                this.cursorDown(params);
                break;
            case "C":
                this.cursorForward(params);
                break;
            case "D":
                this.cursorBackward(params);
                break;
            case "E":
                this.cursorNextLine(params);
                break;
            case "F":
                this.cursorPrecedingLine(params);
                break;
            case "G":
                this.cursorPosition(undefined, params[0] || 1);
                break;
            case "H":
                this.cursorPosition(params[0] || 1, params[1] || 1);
                break;
            case "I":
                this.cursorForwardTabulation(params);
                break;
            case "J":
                this.eraseInDisplay(params, prefix == "?");
                break;
            case "K":
                this.eraseInLine(params, prefix == "?");
                break;
            case "L":
                this.insertLines(params);
                break;
            case "M":
                this.deleteLines(params);
                break;
            case "P":
                this.deleteChars(params);
                break;
            case "S":
                if (prefix == "?") {
                    this.setOrRequestGraphicsAttr(params);
                }
                else {
                    this.scrollUpLines(params);
                }
                break;
            case "T":
                if (prefix == ">") {
                    this.resetTitleModeFeatures(params);
                }
                else if (params.length > 1) {
                    this.initiateHighlightMouseTacking(params);
                }
                else {
                    this.scrollDownLines(params);
                }
                break;
            case "X":
                this.eraseChars(params);
                break;
            case "Z":
                this.cursorBackwardTabulation(params);
                break;
            case "^":
                this.scrollDownLines(params);
                break;
            case "`":
                this.cursorPosition(undefined, params[0] || 1);
                break;
            case "a":
                this.cursorPosition(undefined, this.parser.x + (params[0] || 1));
                break;
            case "b":
                this.repeatPrecedingGraphicChars(params);
                break;
            case "c":
                if (prefix == "=") {
                    this.sendTertiaryDeviceAttrs(params);
                }
                else if (prefix == ">") {
                    this.sendSecondaryDeviceAttrs(params);
                }
                else {
                    this.sendPrimaryDeviceAttrs(params);
                }
                break;
            case "d":
                this.cursorPosition(params[0] || 1);
                break;
            case "e":
                this.cursorPosition(this.parser.y + (params[0] || 1));
                break;
            case "f":
                this.cursorPosition(params[0] || 1, params[1] || 1);
                break;
            case "g":
                this.tabClear(params);
                break;
            case "h":
                this.setMode(params, prefix == "?");
                break;
            case "i":
                this.mediaCopy(params, prefix == "?");
                break;
            case "l":
                this.resetMode(params, prefix == "?");
                break;
            case "m":
                if (prefix == ">") {
                    this.updateKeyModifierOptions(params);
                }
                else {
                    this.charAttrs(params);
                }
                break;
            case "n":
                if (prefix == ">") {
                    this.disableKeyModifierOptions(params);
                    break;
                }
                this.deviceStatusReport(params, prefix == "?");
                break;
            case "p":
                if (prefix == ">") {
                    this.setPointerMode(params);
                }
                else if (prefix == "!") {
                    this.resetSoftTerminal();
                }
                else if (suffix == "\"") {
                    this.setConformanceLevel(params);
                }
                else if (suffix == "$") {
                    this.requestANSIMode(params, prefix == "?");
                }
                else if (prefix == "#") {
                    this.pushVideoAttrsOntoStack(params);
                }
                else if (suffix == "#") {
                    this.pushVideoAttrsOntoStack(params);
                }
                break;
            case "q":
                if (prefix == "#") {
                    this.popVideoAttrsFromStack();
                }
                else if (suffix == "\"") {
                    this.selectCharProtectionAttr(params);
                }
                else if (suffix == " ") {
                    this.setCursorStyle(params);
                }
                else {
                    this.loadLeds(params);
                }
                break;
            case "r":
                if (prefix == "?") {
                    this.restoreDECPrivateMode(params);
                }
                else if (suffix == "$") {
                    this.changeAttrsInRectangularArea(params);
                }
                else {
                    this.setScrollingRegion(params);
                }
                break;
            case "s":
                if (prefix == "?") {
                    this.saveDECPrivateMode(params);
                }
                else if (params.length > 1) {
                    this.setMargins(params);
                }
                else {
                    this.parser.saveCursor();
                }
                break;
            case "t":
                if (prefix == ">") {
                    this.setTitleModeFeatures(params);
                }
                else if (suffix == " ") {
                    this.setWarningBellVolume(params);
                }
                else if (suffix == "$") {
                    this.reverseAttrsInRectArea(params);
                }
                else {
                    this.windowManipulation(params);
                }
                break;
            case "u":
                if (suffix == " ") {
                    this.setWarningBellVolume(params);
                }
                else {
                    this.parser.restoreCursor();
                }
                break;
            case "v":
                if (suffix == "$") {
                    this.copyRectangularArea(params);
                }
                break;
            case "w":
                if (suffix == "$") {
                    this.requestPresentationStateReport(params);
                }
                else if (suffix == "\"") {
                    this.enableFilterRectangle(params);
                }
                break;
            case "x":
                if (suffix == "*") {
                    this.selectAttrChangeExtent(params);
                }
                else if (suffix == "$") {
                    this.fillRectArea(params);
                }
                break;
            case "y":
                if (suffix == "#") {
                    this.selectChecksumExtension(params);
                }
                else if (suffix == "*") {
                    this.requestRectAreaChecksum(params);
                }
                break;
            case "z":
                if (suffix == "'") {
                    this.enableLocatorReporting(params);
                }
                else if (suffix == "$") {
                    this.eraseRectArea(params);
                }
                break;
            case "{":
                if (suffix == "'") {
                    this.selectLocatorEvents(params);
                }
                else if (prefix == "#") {
                    this.pushVideoAttrsOntoStack(params);
                }
                else if (suffix == "#") {
                    this.pushVideoAttrsOntoStack(params);
                }
                else if (suffix == "$") {
                    this.selectEraseRectArea(params);
                }
                break;
            case "|":
                if (suffix == "#") {
                    this.reportSelectedGraphicRendition(params);
                }
                else if (suffix == "$") {
                    this.selectColumnsPerPage(params);
                }
                else if (suffix == "'") {
                    this.requestLocatorPosition(params);
                }
                else if (suffix == "*") {
                    this.selectNumberOfLinesPerScreen(params);
                }
                break;
            case "}":
                if (prefix == "#") {
                    this.popVideoAttrsFromStack();
                }
                else if (suffix == "'") {
                    this.insertChars(params);
                }
                break;
            case "~":
                if (suffix == "'") {
                    this.deleteChars(params);
                }
                break;
        }
    }
    insertChars(params, prefix = "") {
        const ps = params[0] || 1;
        if (prefix == " ") {
            this.parser.x -= ps;
        }
        else {
            for (let i = 0; i < ps; i++) {
                this.activeBufferLine.insert(this.parser.x, DataBlock_1.DataBlock.newBlock(" ", this.attribute));
            }
        }
    }
    cursorUp(params, suffix = "") {
        const ps = params[0] || 1;
        if (!!suffix) {
            this.parser.x += ps;
        }
        else {
            this.parser.y -= ps;
            if (this.parser.y < 1) {
                this.parser.y = 1;
            }
        }
    }
    cursorDown(params) {
        const ps = params[0] || 1;
        this.parser.y += ps;
        if (this.parser.y > this.terminal.rows) {
            this.parser.y = this.terminal.rows;
        }
    }
    cursorForward(params) {
        const ps = params[0] || 1;
        this.parser.x += ps;
    }
    cursorBackward(params) {
        const ps = params[0] || 1;
        this.parser.x -= ps;
    }
    cursorNextLine(params) {
        this.cursorDown(params);
    }
    cursorPrecedingLine(params) {
        this.cursorUp(params);
    }
    cursorPosition(rows = 0, cols = 0) {
        if (rows !== 0) {
            this.parser.y = rows;
        }
        if (cols !== 0) {
            this.parser.x = cols;
        }
    }
    cursorForwardTabulation(params) {
        const ps = params[0] || 1;
        for (let i = 0; i < ps; i++) {
            this.activeBufferLine.replace(this.parser.x, DataBlock_1.DataBlock.newBlock("\t", this.attribute));
            this.parser.x++;
        }
    }
    eraseInDisplay(params, isDECS) {
        let begin = 1, end, scrollBack = false, fragment = document.createDocumentFragment();
        switch (params[0]) {
            case 1:
                end = this.parser.y;
                break;
            case 2:
                end = this.terminal.rows;
                break;
            case 3:
                end = this.terminal.rows;
                this.parser.bufferSet.clearSavedLines();
                break;
            default:
                begin = this.parser.y;
                end = this.terminal.rows;
                break;
        }
        if (begin == 1 && end == this.terminal.rows) {
            scrollBack = this.parser.bufferSet.isNormal;
        }
        for (let y = begin; y <= end; y++) {
            if (scrollBack) {
                const savedLines = this.activeBuffer.delete(this.activeBuffer.scrollTop, 1, scrollBack);
                for (let savedLine of savedLines) {
                    this.terminal.printer.printLine(savedLine, false);
                }
                let line = this.activeBuffer.getBlankLine();
                this.activeBuffer.append(line);
                fragment.appendChild(line.element);
            }
            else {
                const line = this.activeBuffer.get(y);
                line.erase(this.attribute);
            }
        }
        if (scrollBack)
            this.parser.viewport.appendChild(fragment);
    }
    eraseInLine(params, isDECS) {
        let begin = 1, end, blockSize = this.activeBufferLine.blocks.length;
        switch (params[0]) {
            case 1:
                end = this.parser.x;
                break;
            case 2:
                end = blockSize;
                break;
            default:
                begin = this.parser.x;
                end = blockSize;
                break;
        }
        for (let i = begin, block; i <= end; i++) {
            block = this.activeBufferLine.get(i);
            block.erase(" ", this.attribute);
        }
    }
    insertLines(params) {
        const ps = params[0] || 1;
        for (let i = 0; i < ps; i++) {
            this.parser.insertLine();
        }
    }
    deleteLines(params) {
        const ps = params[0] || 1;
        for (let i = 0; i < ps; i++) {
            this.parser.deleteLine();
        }
    }
    deleteChars(params) {
        const ps = params[0] || 1;
        this.activeBufferLine.delete(this.parser.x, ps);
    }
    setOrRequestGraphicsAttr(params) {
        let [pi, pa, pv] = params;
        console.info(`setOrRequestGraphicsAttr, pi=${pi}, pa=${pa}, pv=${pv}`);
    }
    scrollUpLines(params) {
        const ps = params[0] || 1;
        for (let i = 0; i < ps; i++) {
            this.parser.scrollUp();
        }
    }
    resetTitleModeFeatures(params) {
    }
    initiateHighlightMouseTacking(params) {
        let [func, startX, startY, firstRow, lastRow] = params;
        console.info(`initiateHighlightMouseTacking, func=${func}, startX=${startX}, startY=${startY}, firstRow=${firstRow}, lastRow=${lastRow}`);
    }
    scrollDownLines(params) {
        const ps = params[0] || 1;
        for (let i = 0; i < ps; i++) {
            this.parser.scrollDown();
        }
    }
    eraseChars(params) {
        const ps = params[0] || 1;
        for (let i = this.parser.x; i < ps; i++) {
            let block = this.activeBufferLine.get(this.parser.x);
            block.erase(" ", this.attribute);
        }
    }
    cursorBackwardTabulation(params) {
    }
    repeatPrecedingGraphicChars(params) {
    }
    sendTertiaryDeviceAttrs(params) {
    }
    sendSecondaryDeviceAttrs(params) {
    }
    sendPrimaryDeviceAttrs(params) {
    }
    tabClear(params) {
        switch (params[0]) {
            case 1:
                break;
            case 2:
                break;
            case 3:
                break;
            case 4:
                break;
            case 5:
                break;
            default:
        }
    }
    setMode(params, isDEC) {
        if (typeof params == 'object') {
            let len = params.length, i = 0;
            for (; i < len; i++) {
                this.setMode(params[i], isDEC);
            }
        }
        if (isDEC) {
            switch (params) {
                case 1:
                    this._applicationCursorKeys = true;
                    this._normalCursorKeys = false;
                    break;
                case 2:
                    break;
                case 3:
                    break;
                case 4:
                    break;
                case 5:
                    this.terminal.reverseVideo();
                    break;
                case 6:
                    break;
                case 7:
                    break;
                case 8:
                    break;
                case 9:
                    break;
                case 10:
                    break;
                case 12:
                case 13:
                    this.terminal.cursor.blinking = true;
                    break;
                case 14:
                case 18:
                    break;
                case 19:
                    break;
                case 25:
                    this.terminal.cursor.show = true;
                    break;
                case 30:
                    break;
                case 35:
                    break;
                case 38:
                    break;
                case 40:
                    break;
                case 41:
                case 42:
                    break;
                case 44:
                    break;
                case 45:
                    break;
                case 46:
                    break;
                case 47:
                    break;
                case 66:
                    break;
                case 67:
                    break;
                case 69:
                    break;
                case 80:
                    break;
                case 95:
                    break;
                case 1000:
                    break;
                case 1001:
                case 1002:
                case 1003:
                    console.info(`Binding to mouse events. ${params}`);
                    break;
                case 1004:
                    break;
                case 1005:
                    break;
                case 1006:
                    break;
                case 1007:
                    break;
                case 1010:
                    break;
                case 1011:
                    break;
                case 1015:
                    break;
                case 1034:
                    break;
                case 1035:
                    break;
                case 1036:
                    break;
                case 1037:
                    break;
                case 1039:
                    break;
                case 1040:
                    break;
                case 1041:
                    break;
                case 1042:
                    break;
                case 1043:
                    break;
                case 1044:
                    break;
                case 1046:
                    break;
                case 1047:
                    this.parser.activateAltBuffer();
                    break;
                case 1048:
                    this.parser.saveCursor();
                    break;
                case 1049:
                    this.parser.saveCursor();
                    this.parser.activateAltBuffer();
                    break;
                case 1050:
                    break;
                case 1051:
                    break;
                case 1052:
                    break;
                case 1053:
                    break;
                case 1060:
                    break;
                case 1061:
                    break;
                case 2004:
                    break;
            }
        }
        else {
            switch (params) {
                case 2:
                    break;
                case 4:
                    this._insertMode = true;
                    this._replaceMode = false;
                    break;
                case 12:
                    break;
                case 20:
                    break;
            }
        }
    }
    mediaCopy(params, isDEC) {
    }
    resetMode(params, isDEC) {
        if (typeof params == 'object') {
            let len = params.length, i = 0;
            for (; i < len; i++) {
                this.resetMode(params[i], isDEC);
            }
        }
        if (isDEC) {
            switch (params) {
                case 1:
                    this._applicationCursorKeys = false;
                    this._normalCursorKeys = true;
                    break;
                case 2:
                    break;
                case 3:
                    break;
                case 4:
                    break;
                case 5:
                    this.terminal.normalVideo();
                    break;
                case 6:
                    break;
                case 7:
                    break;
                case 8:
                    break;
                case 9:
                    break;
                case 10:
                    break;
                case 12:
                case 13:
                    this.terminal.cursor.blinking = false;
                    break;
                case 14:
                case 18:
                    break;
                case 19:
                    break;
                case 25:
                    this.terminal.cursor.show = false;
                    break;
                case 30:
                    break;
                case 35:
                    break;
                case 38:
                    break;
                case 40:
                    break;
                case 41:
                case 42:
                    break;
                case 44:
                    break;
                case 45:
                    break;
                case 46:
                    break;
                case 47:
                    this.parser.activateNormalBuffer();
                    break;
                case 66:
                    break;
                case 67:
                    break;
                case 69:
                    break;
                case 80:
                    break;
                case 95:
                    break;
                case 1000:
                    break;
                case 1001:
                case 1002:
                case 1003:
                    break;
                case 1004:
                    break;
                case 1005:
                    break;
                case 1006:
                    break;
                case 1007:
                    break;
                case 1010:
                    break;
                case 1011:
                    break;
                case 1015:
                    break;
                case 1034:
                    break;
                case 1035:
                    break;
                case 1036:
                    break;
                case 1037:
                    break;
                case 1039:
                    break;
                case 1040:
                    break;
                case 1041:
                    break;
                case 1042:
                    break;
                case 1043:
                    break;
                case 1044:
                    break;
                case 1046:
                    break;
                case 1047:
                    this.eraseInDisplay([2], false);
                    this.parser.activateNormalBuffer();
                    if (this.cursorBlinking !== this.terminal.cursor.blinking) {
                        this.terminal.cursor.blinking = this.cursorBlinking;
                    }
                    break;
                case 1048:
                    this.parser.restoreCursor();
                    break;
                case 1049:
                    this.parser.activateNormalBuffer();
                    this.parser.restoreCursor();
                    if (this.cursorBlinking !== this.terminal.cursor.blinking) {
                        this.terminal.cursor.blinking = this.cursorBlinking;
                    }
                    break;
                case 1050:
                    break;
                case 1051:
                    break;
                case 1052:
                    break;
                case 1053:
                    break;
                case 1060:
                    break;
                case 1061:
                    break;
                case 2004:
                    break;
            }
        }
        else {
            switch (params) {
                case 2:
                    break;
                case 4:
                    this._insertMode = false;
                    this._replaceMode = true;
                    break;
                case 12:
                    break;
                case 20:
                    break;
            }
        }
    }
    updateKeyModifierOptions(params) {
    }
    charAttrs(params) {
        if (typeof params == 'object') {
            for (let len = params.length, i = 0; i < len; i++) {
                if (this.customColorMode !== 0) {
                    let color = "", name = "";
                    if (params[i] == 2) {
                        name += params[i + 1].toString(16);
                        name += params[i + 2].toString(16);
                        name += params[i + 3].toString(16);
                        color = "rgba(" + params[i + 1] + "," + params[i + 2] + "," + params[i + 3] + ", 0.99)";
                        i += 4;
                    }
                    else if (params[i] == 5) {
                        color = builtInColorPalette[params[i + 1]];
                        name = color.substring(1);
                        color = Color_1.Color.parseColor(color);
                        i += 2;
                    }
                    if (this.customColorMode == 38) {
                        this.attribute.colorClass = "color_" + name;
                        Styles_1.Styles.add("." + this.attribute.colorClass, {
                            color: color,
                        }, this.terminal.instanceId);
                        Styles_1.Styles.add([
                            "." + this.attribute.colorClass + "::selection",
                            "." + this.attribute.colorClass + "::-moz-selection",
                            "." + this.attribute.colorClass + "::-webkit-selection"
                        ], {
                            color: this.preferences.backgroundColor,
                            "background-color": color
                        }, this.terminal.instanceId);
                    }
                    else if (this.customColorMode == 48) {
                        this.attribute.backgroundColorClass = "_color_" + name;
                        Styles_1.Styles.add("." + this.attribute.backgroundColorClass, {
                            "background-color": color,
                        }, this.terminal.instanceId);
                        Styles_1.Styles.add([
                            "." + this.attribute.backgroundColorClass + "::selection",
                            "." + this.attribute.backgroundColorClass + "::-moz-selection",
                            "." + this.attribute.backgroundColorClass + "::-webkit-selection"
                        ], {
                            color: color,
                            "background-color": this.preferences.color
                        }, this.terminal.instanceId);
                    }
                    this.customColorMode = 0;
                }
                this.charAttrs(params[i]);
            }
        }
        if (typeof params !== "number")
            return;
        switch (params) {
            case 0:
                this._attribute = new DataBlockAttribute_1.DataBlockAttribute();
                break;
            case 1:
                this._attribute.bold = true;
                if (this.preferences.showBoldTextInBrightColor) {
                    if (!!this.attribute.colorClass) {
                        const index = Preferences_1.Preferences.paletteColorNames.indexOf(this.attribute.colorClass);
                        this.attribute.colorClass = Preferences_1.Preferences.paletteColorNames[index + 8];
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
                this.customColorMode = params;
                break;
            case 48:
                this.customColorMode = params;
                break;
            default:
                let num = 0, colorName;
                if (30 <= params && params <= 37) {
                    num = 30;
                }
                else if (90 <= params && params <= 97) {
                    num = 90;
                }
                else if (40 <= params && params <= 47) {
                    num = 40;
                }
                else if (100 <= params && params <= 107) {
                    num = 100;
                }
                switch (num) {
                    case 30:
                    case 90:
                        if (num == 90 || (this.attribute.bold && this.preferences.showBoldTextInBrightColor)) {
                            colorName = Preferences_1.Preferences.paletteColorNames[params - num + 8];
                        }
                        else {
                            colorName = Preferences_1.Preferences.paletteColorNames[params - num];
                        }
                        this.attribute.colorClass = colorName;
                        break;
                    case 40:
                        this.attribute.backgroundColorClass = "_" + Preferences_1.Preferences.paletteColorNames[params - num];
                        break;
                    case 100:
                        this.attribute.backgroundColorClass = "_" + Preferences_1.Preferences.paletteColorNames[params - num + 8];
                        break;
                    default:
                        break;
                }
        }
    }
    disableKeyModifierOptions(params) {
    }
    deviceStatusReport(params, isDEC) {
    }
    setPointerMode(params) {
    }
    resetSoftTerminal() {
        this.terminal.showCursor();
        this._applicationCursorKeys = false;
        this.activeBuffer.scrollTop = 1;
        this.activeBuffer.scrollBottom = this.terminal.rows;
        this.parser.x = 1;
        this.parser.y = 1;
    }
    setConformanceLevel(params) {
        let [pl, pc] = params;
        console.info(`setConformanceLevel: pl=${pl}, pc=${pc}`);
    }
    requestANSIMode(params, isDEC) {
    }
    pushVideoAttrsOntoStack(params) {
    }
    popVideoAttrsFromStack() {
    }
    selectCharProtectionAttr(params) {
    }
    setCursorStyle(params) {
    }
    loadLeds(params) {
    }
    restoreDECPrivateMode(params) {
    }
    changeAttrsInRectangularArea(params) {
    }
    setScrollingRegion(params) {
        [this.activeBuffer.scrollTop, this.activeBuffer.scrollBottom] = params;
    }
    saveDECPrivateMode(params) {
    }
    setMargins(params) {
        const [pl, pr] = params;
        console.info(`pl: ${pl}, pr: ${pr}`);
    }
    setTitleModeFeatures(params) {
    }
    setWarningBellVolume(params) {
        switch (params[0]) {
            case 0:
            case 1:
                break;
            case 2:
            case 3:
            case 4:
                break;
            case 5:
            case 6:
            case 7:
            case 8:
                break;
        }
    }
    reverseAttrsInRectArea(params) {
    }
    windowManipulation(params) {
        switch (params[0]) {
            case 1:
                break;
            case 2:
                break;
            case 3:
                break;
            case 4:
                break;
            case 5:
                break;
            case 6:
                break;
            case 7:
                break;
            case 8:
                break;
            case 9:
                if (params[1] == 0) {
                }
                else if (params[1] == 1) {
                }
                else if (params[1] == 2) {
                }
                else if (params[1] == 3) {
                }
                break;
            case 10:
                if (params[1] == 0) {
                }
                else if (params[1] == 1) {
                }
                else if (params[1] == 2) {
                }
                break;
            case 11:
                break;
            case 13:
                break;
            case 14:
                break;
            case 15:
                break;
            case 16:
                break;
            case 18:
                break;
            case 19:
                break;
            case 20:
                break;
            case 21:
                break;
            case 22:
                if (params[1] == 0) {
                }
                else if (params[1] == 1) {
                    console.info("Save xterm icon title on stack.");
                }
                else if (params[1] == 2) {
                    console.info("Save xterm window title on stack.");
                }
                break;
            case 23:
                if (params[1] == 0) {
                }
                else if (params[1] == 1) {
                }
                else if (params[1] == 2) {
                }
                break;
            default:
        }
    }
    copyRectangularArea(params) {
    }
    requestPresentationStateReport(params) {
    }
    enableFilterRectangle(params) {
    }
    selectAttrChangeExtent(params) {
    }
    fillRectArea(params) {
    }
    selectChecksumExtension(params) {
    }
    requestRectAreaChecksum(params) {
    }
    enableLocatorReporting(params) {
        const [ps, pu] = params;
        console.info(`enableLocatorReporting, pt=${ps}, pl=${pu}`);
    }
    eraseRectArea(params) {
        const [pt, pl, pb, pr] = params;
        console.info(`eraseRectArea, pt=${pt}, pl=${pl}, pb=${pb}, pr=${pr}`);
    }
    selectLocatorEvents(params) {
    }
    selectEraseRectArea(params) {
        const [pt, pl, pb, pr] = params;
        console.info(`selectEraseRectArea, pt=${pt}, pl=${pl}, pb=${pb}, pr=${pr}`);
    }
    reportSelectedGraphicRendition(params) {
    }
    selectColumnsPerPage(params) {
    }
    requestLocatorPosition(params) {
    }
    selectNumberOfLinesPerScreen(params) {
    }
}
exports.EscapeSequenceParser = EscapeSequenceParser;
