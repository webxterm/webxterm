enum LogLevel {
    NOTSET,
    DEBUG,
    INFO,
    WARNING,
    ERROR,
    CRITICAL,
    FATAL
}

export class Logger {

    private readonly resourceName: string = "";

    private level: number = LogLevel.DEBUG;

    public static getLogger(resourceName: string): Logger {
        return new Logger(resourceName);
    }

    constructor(resourceName: string) {
        this.resourceName = resourceName;
    }

    debug(message: string, ...args: any[]): void {
        if (this.level !== LogLevel.DEBUG) return;

        if (args) {
            for (let item of args) {
                message = message.replace(/\{}/, item);
            }
        }
        console.log(this.resourceName + ": " + message);
    }


}