"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class OscParser {
    constructor(terminal, parser) {
        this.terminal = terminal;
        this.parser = parser;
    }
    parse(params) {
        switch (params[0]) {
            case 0:
                if (this.terminal.eventMap["updateTitle"])
                    this.terminal.eventMap["updateTitle"](params[1]);
                break;
            case 1:
                break;
            case 2:
                if (this.terminal.eventMap["updateTitle"])
                    this.terminal.eventMap["updateTitle"](params[1]);
                break;
            case 3:
                break;
            case 4:
            case 5:
            case 6:
            case 10:
                console.info("Change VT100 text foreground color to Pt.");
                break;
            case 11:
                console.info("Change VT100 text background color to Pt.");
                break;
            case 12:
            case 13:
            case 14:
            case 15:
            case 16:
            case 17:
            case 18:
            case 19:
                break;
            case 46:
                break;
            case 50:
                break;
            case 51:
            case 52:
            case 104:
                break;
            case 105:
            case 106:
            case 110:
            case 111:
            case 112:
            case 113:
            case 114:
            case 115:
            case 116:
            case 117:
            case 118:
            case 119:
                break;
            case 'I':
                break;
            case 'l':
                break;
            case 'L':
                break;
        }
    }
}
exports.OscParser = OscParser;
