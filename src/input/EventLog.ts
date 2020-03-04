/**
 * 输入历史记录
 */
export class EventLog {

    /**
     * 输入记录
     * 如果出现空行，则代表按了回车。。。
     */
    private logs: object[][] = [];

    private pos: number = 0;

    constructor() {
        this.logs[this.pos] = [];
    }

    add(){
        this.logs[++this.pos] = [];
    }

    append(item: string){
        // if(item === "\x7f"){
        //     // backspace
        //     this.logs[this.pos]
        // } else {
        //
        // }
        let array = this.logs[this.pos];

        switch (item) {
            case "\x7f":
                // backspace
                array.splice(array.length - 1, 1);
                break;
            case "\x1b[A":
                // arrow up
                // 更换命令
                array = [];
                this.logs[this.pos] = array;

                break;
            case "\x1b[B":
                // arrow down
                // 更换命令

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