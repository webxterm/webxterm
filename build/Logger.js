"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Logger {
    constructor(className) {
        this.className = className;
    }
    info(msg, ...args) {
        const err = new Error("getFunctionName");
        if (err.stack) {
            const rows = err.stack.split("\n");
            let funcName;
            if (/^Error: getFunctionName$/.test(rows[0])) {
                funcName = rows[2].replace(/^\s+at\s+(.+?)\s.+/g, '$1');
            }
            else {
                funcName = rows[1].split("@")[0];
            }
            console.info("funcName:" + funcName);
            console.info(err.stack);
        }
        console.info(typeof err.stack);
        console.info(msg);
        console.info(args);
    }
}
exports.Logger = Logger;
