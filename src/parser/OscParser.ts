import {Parser} from "./Parser";
import {Terminal} from "../Terminal";

export class OscParser {

    private terminal: Terminal;
    private parser: Parser;

    constructor(terminal: Terminal, parser: Parser) {
        this.terminal = terminal;
        this.parser = parser;
    }


}