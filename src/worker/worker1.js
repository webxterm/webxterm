//
let connected = false;      //
let websocket;              // 生成的websocket对象
let websocketUrl;           // websocket URL
let version;                // ssh版本信息
let heartbeatId;            // 心跳ID（定时器）
let nextHeartbeatSeconds;   // 心跳秒数
let enableHeartbeat;        // 是否启动心跳
let messageQueue = [];      // 消息队列
let transferTimer;          // 传输消息队列的编号（定时器）

function parseJSON(str){

    let [start, stop, i, len] = [0, 0, 0, str.length];
    let [result, chunk] = [[], []];

    for (let chr; i < len; i++) {
        chr = str.charAt(i);
        if (chr === "{") {
            start += 1;
        } else if (chr === "}") {
            stop += 1;
        }

        chunk.push(chr);

        if (start === stop && start !== 0) {
            start = 0;
            stop = 0;
            try {
                result.push(JSON.parse(chunk.join("")));
            } catch (e) {
                result.push(chunk.join(""));
            }

            chunk = []
        }
    }

    if (chunk.length > 0) {
        result.push(chunk.join(""));
    }

    return result;
}

/**
 * 停止心跳
 */
function stopHeartbeat() {

    if(heartbeatId){
        clearInterval(heartbeatId);
        heartbeatId = 0;
    }

}

/**
 * 开始心跳
 */
function startHeartbeat(){

    heartbeatId = setInterval(() => {

        if(websocket){
            // PM Pt ST
            // PM => ESC ^
            // ST => ESC \
            websocket.send("\x1b^hello!\x1b\\");
        }

    }, nextHeartbeatSeconds * 1000);

}



onmessage = function (e) {

    // 首先需要接收到websocket的地址信息
    // e.data
    // {    type: socket,
    // }
    let message = e.data;

    if(message instanceof Object){

        switch (message["type"]) {
            case "socket":
                websocketUrl = message["url"];
                break;
            case "ssh":
                websocket = new WebSocket(websocketUrl);
                websocket.onopen = () => {
                    postMessage({
                        "type": "socket",
                        "status": "success"
                    });
                    websocket.send(JSON.stringify({
                        target: message["target"],
                        size: message["size"],
                        term: message["term"],
                        type: message["sshType"]
                    }));
                };
                websocket.onclose = () => {
                    postMessage({
                        "type": "socket",
                        "status": "close"
                    });
                };
                websocket.onerror = () => {
                    postMessage({
                        "type": "socket",
                        "status": "error"
                    });
                };
                websocket.onmessage = (evt) => {

                    const data = evt.data;

                    // if(enableHeartbeat){
                    //     stopHeartbeat();
                    // }

                    if(typeof data === "string"){

                        if(!version){
                            let jsonObjects = parseJSON(data);
                            version = jsonObjects.splice(0, 1)[0];
                            postMessage({
                                "type": "sshVersion",
                                "data": version
                            });
                            if(jsonObjects.length > 0){
                                messageQueue.push(jsonObjects.join(""));
                            }
                        } else {
                            messageQueue.push(data);

                            postMessage({
                                "type": "data"
                            });
                        }
                    }

                    // if(enableHeartbeat){
                    //     startHeartbeat();
                    // }

                };

                break;
            case "get":
                // 获取数据
                if(messageQueue.length === 0){
                    break;
                }

                postMessage({
                    "type": "get",
                    "data": messageQueue.splice(0, messageQueue.length).join("")
                });

                break;

            case "put":
                if(websocket){
                    if(enableHeartbeat){
                        stopHeartbeat();
                    }
                    websocket.send(JSON.stringify(message["data"]));
                    if(enableHeartbeat){
                        startHeartbeat();
                    }
                }
                break;

            case "qsize":
                console.info("message queue size is " + messageQueue.length);
                // postMessage({
                //     "type": "qsize",
                //     "data": messageQueue.length
                // });
                break;

        }
    }
};