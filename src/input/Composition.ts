
export class Composition {

    /**
     * 是否事件产生
     */
    events: boolean = false;

    /**
     * 状态：0：默认，1：开始输入，2：更新中，3：输入完成
     */
    state: number = 0;

    /**
     * 更新的内容，代表正在输入的字符
     */
    update: string = "";

    /**
     * 是否输入完成
     */
    done: boolean = false;

    /**
     * 是否正在输入
     */
    running: boolean = false;

    /**
     * 输入完成的时候，最后输入的字符
     */
    end: string = "";

    /**
     * 重置
     */
    reset(){
        this.events = false;
        this.state = 0;
        this.update = "";
        this.done = false;
        this.running = false;
        this.end = "";
    }

}