"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["NOTSET"] = 0] = "NOTSET";
    LogLevel[LogLevel["DEBUG"] = 1] = "DEBUG";
    LogLevel[LogLevel["INFO"] = 2] = "INFO";
    LogLevel[LogLevel["WARNING"] = 3] = "WARNING";
    LogLevel[LogLevel["ERROR"] = 4] = "ERROR";
    LogLevel[LogLevel["CRITICAL"] = 5] = "CRITICAL";
    LogLevel[LogLevel["FATAL"] = 6] = "FATAL";
})(LogLevel || (LogLevel = {}));
class Logger {
    constructor(resourceName) {
        this.resourceName = "";
        this.level = LogLevel.DEBUG;
        this.resourceName = resourceName;
    }
    static getLogger(resourceName) {
        return new Logger(resourceName);
    }
    debug(message, ...args) {
        if (this.level !== LogLevel.DEBUG)
            return;
        if (args) {
            for (let item of args) {
                message = message.replace(/\{}/, item);
            }
        }
        console.log(this.resourceName + ": " + message);
    }
}
exports.Logger = Logger;
