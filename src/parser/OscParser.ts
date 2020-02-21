import {Parser} from "./Parser";
import {Terminal} from "../Terminal";

export class OscParser {

    private terminal: Terminal;
    private parser: Parser;

    constructor(terminal: Terminal, parser: Parser) {
        this.terminal = terminal;
        this.parser = parser;
    }

    /**
     * 解析Osc参数
     * @param params
     */
    parse(params: any[]) {

        switch (params[0]) {
            // Ps = 0  ⇒  Change Icon Name and Window Title to Pt.
            // Ps = 1  ⇒  Change Icon Name to Pt.
            // Ps = 2  ⇒  Change Window Title to Pt.
            // Ps = 3  ⇒  Set X property on top-level window
            case 0:
                if(this.terminal.eventMap["updateTitle"])
                    this.terminal.eventMap["updateTitle"](params[1]);
                break;
            case 1:
                break;
            case 2:
                if(this.terminal.eventMap["updateTitle"])
                    this.terminal.eventMap["updateTitle"](params[1]);
                break;
            case 3:
                break;
            case 4:
            case 5:
            case 6:

            // Ps = 1 0  ⇒  Change VT100 text foreground color to Pt.
            // Ps = 1 1  ⇒  Change VT100 text background color to Pt.
            // Ps = 1 2  ⇒  Change text cursor color to Pt.
            // Ps = 1 3  ⇒  Change mouse foreground color to Pt.
            // Ps = 1 4  ⇒  Change mouse background color to Pt.
            // Ps = 1 5  ⇒  Change Tektronix foreground color to Pt.
            // Ps = 1 6  ⇒  Change Tektronix background color to Pt.
            // Ps = 1 7  ⇒  Change highlight background color to Pt.
            // Ps = 1 8  ⇒  Change Tektronix cursor color to Pt.
            // Ps = 1 9  ⇒  Change highlight foreground color to Pt.
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
                // Change Log File to Pt.
                break;
            case 50:
                // Set Font to Pt
                break;
            case 51:
            // reserved for Emacs shell.
            case 52:
            // Manipulate Selection Data
            case 104:
                // Ps = 1 0 4 ; c ⇒  Reset Color Number c.
                break;
            case 105:
            // Ps = 1 0 5 ; c ⇒  Reset Special Color Number c
            case 106:
            // Ps = 1 0 6 ; c ; f ⇒  Enable/disable Special Color Number c.

            // Ps = 1 1 0  ⇒  Reset VT100 text foreground color.
            // Ps = 1 1 1  ⇒  Reset VT100 text background color.
            // Ps = 1 1 2  ⇒  Reset text cursor color.
            // Ps = 1 1 3  ⇒  Reset mouse foreground color.
            // Ps = 1 1 4  ⇒  Reset mouse background color.
            // Ps = 1 1 5  ⇒  Reset Tektronix foreground color.
            // Ps = 1 1 6  ⇒  Reset Tektronix background color.
            // Ps = 1 1 7  ⇒  Reset highlight color.
            // Ps = 1 1 8  ⇒  Reset Tektronix cursor color.
            // Ps = 1 1 9  ⇒  Reset highlight foreground color.
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

            // Ps = I  ; c ⇒  Set icon to file.
            // Ps = l  ; c ⇒  Set window title.
            // Ps = L  ; c ⇒  Set icon label.
            case 'I':
                break;
            case 'l':
                break;
            case 'L':
                break;
        }

    }
}