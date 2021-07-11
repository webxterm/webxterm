export class Logger {

    private className: string;

    constructor(className: string) {
        this.className = className;
    }

    info(msg: string, ...args: any) {
        const err = new Error("getFunctionName");
        if (err.stack) {
            // Firefox:
            // info@http://localhost:9988/webxterm/dist/webxterm.js?version=1.88:1352:21
            // getDisplayLines@http://localhost:9988/webxterm/dist/webxterm.js?version=1.88:100:16
            // listen/<@http://localhost:9988/webxterm/dist/webxterm.js?version=1.88:4625:43

            // Safari:
            // info@http://localhost:9988/webxterm/dist/webxterm.js?version=1.88:1352:30
            // getDisplayLines@http://localhost:9988/webxterm/dist/webxterm.js?version=1.88:100:20
            // http://localhost:9988/webxterm/dist/webxterm.js?version=1.88:4627:58

            // Chrome:
            // Error: getFunctionName
            //     at Logger.info (webxterm.js?version=1.88:1352)
            //     at CanvasRenderer.getDisplayLines (webxterm.js?version=1.88:100)
            //     at HTMLDivElement.<anonymous> (webxterm.js?version=1.88:4625)

            // Opera:
            // Error: getFunctionName
            //     at Logger.info (webxterm.js?version=1.88:1352)
            //     at CanvasRenderer.getDisplayLines (webxterm.js?version=1.88:100)
            //     at HTMLDivElement.<anonymous> (webxterm.js?version=1.88:4627)
            const rows = err.stack.split("\n");
            let funcName;
            if (/^Error: getFunctionName$/.test(rows[0])) {
                // 获取第二行的
                funcName = rows[2].replace(/^\s+at\s+(.+?)\s.+/g, '$1');
            } else {
                funcName = rows[1].split("@")[0];
            }

            console.info("funcName:" + funcName);


            // 判断是否为火狐。
            // err.stack.split("\n")[1]
            console.info(err.stack)
        }
        console.info(typeof err.stack)
        console.info(msg);
        console.info(args);
    }

}