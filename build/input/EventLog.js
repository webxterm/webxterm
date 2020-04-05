"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class EventLog {
    constructor() {
        this.logs = [];
        this.pos = 0;
        this.logs[this.pos] = [];
    }
    add() {
        this.logs[++this.pos] = [];
    }
    append(item) {
        let array = this.logs[this.pos];
        switch (item) {
            case "\x7f":
                array.splice(array.length - 1, 1);
                break;
            case "\x1b[A":
                array = [];
                this.logs[this.pos] = array;
                break;
            case "\x1b[B":
                array = [];
                this.logs[this.pos] = array;
                break;
            default:
                array.push({
                    content: item,
                    timestamp: new Date().getTime()
                });
        }
    }
}
exports.EventLog = EventLog;
