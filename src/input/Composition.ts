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
     * 如果是Safari，并且使用了中文输入法了。在选择候选字符后一个keydown事件不处理。因为那个事件是回调选择候选字符的事件。
     */
    flag: boolean = false;

    // 判断是否为Safari浏览器
    isSafari: boolean = false;

    // 判断是否为桌面浏览器
    isPC: boolean = true;

    // e.keyCode | e.which = 229
    isProcess: boolean = false;

    // // 联想输入输入开始点
    // startX: number = 0;
    // startY: number = 0;     // y是相对于 this.terminal.bufferSet.activeBuffer.change_buffer.size + saved_buffer.size
    //
    // // 结束点
    // stopX: number = 0;
    // stopY: number = 0;      // y是相对于 this.terminal.bufferSet.activeBuffer.change_buffer.size + saved_buffer.size
    //
    // // 上一次插入的情况
    // last_len: number = 0;

    x: number = 0;
    y: number = 0;


    /**
     * 重置
     */
    reset() {
        this.events = false;
        this.state = 0;
        this.update = "";
        this.done = false;
        this.running = false;
        this.end = "";

        this.flag = false;
        this.isPC = false;
        this.isProcess = false;
    }


    // /**
    //  * 是否是联想输入点
    //  * @param xIndex
    //  * @param yIndex
    //  * @param saved_buffer_size
    //  */
    // isCompositionPoint(xIndex: number, yIndex: number, saved_buffer_size: number): boolean{
    //     const y = yIndex;
    //
    //     if(this.startY == y){
    //         // 第一行
    //         if(xIndex >= this.startX - 1){
    //             // 在这个区间范围
    //             return true;
    //         }
    //     } else if(this.stopY == y) {
    //         // 最后一行
    //         if(xIndex <= this.stopX - 1){
    //             // 在这个区间范围
    //             return true;
    //         }
    //     } else if(this.startY < y && y < this.stopY){
    //         // 中间的行
    //         return true;
    //     }
    //     return false;
    // }
}