import {BufferLine} from "./buffer/BufferLine";
import {Parser} from "./parser/Parser";
import {Terminal} from "./Terminal";
import {Buffer} from "./buffer/Buffer";

export class Printer {

    private parser: Parser;
    private terminal: Terminal;
    // private timerId: number = 0;
    // private dirtyLines: BufferLine[] = [];

    constructor(terminal: Terminal) {
        this.terminal = terminal;
        this.parser = this.terminal.parser;
    }

    get activeBuffer(): Buffer {
        return this.parser.bufferSet.activeBuffer;
    }

    get cursorLine(): BufferLine {
        return this.activeBuffer.get(this.parser.y);
    }

    // /**
    //  * 启动打印机
    //  */
    // printDirty(){
    //
    //     if(this.timerId){
    //         return;
    //     }
    //
    //     console.info("创建定时器");
    //
    //     //
    //     this.timerId = setInterval(() => {
    //
    //         const dirtyLines = this.dirtyLines.splice(0, this.dirtyLines.length);
    //         const len = dirtyLines.length;
    //         if(len === 0) {
    //             console.info("删除定时器");
    //             clearInterval(this.timerId);
    //             this.timerId = 0;
    //             return;
    //         }
    //
    //         for(let i = 0; i < len; i++){
    //             if(dirtyLines[i] === this.cursorLine){
    //                 this.printLine(dirtyLines[i], true);
    //             } else {
    //                 this.printLine(dirtyLines[i], false);
    //             }
    //         }
    //
    //     }, 0);
    // }

    /**
     * 刷新数据到元素中
     * 刷新方式：通过判断当前缓冲区的所有脏链isDirty == true，
     */
    printBuffer(){

        const len = this.activeBuffer.size;

        for (let y = 1; y <= len; y++) {

            const line = this.activeBuffer.get(y);
            this.printLine(line, true);

        }

    }

    /**
     * 打印脏行
     * @param line
     * @param displayCursor 是否显示光标
     */
    printLine(line: BufferLine, displayCursor: boolean = false){

        // 如果没有脏块的话，直接返回。
        if(!line.dirty){
            return;
        }

        if(line !== this.cursorLine){
            line.dirty = false;
        }

        // 超链接 - 锚点
        // let anchor: HTMLAnchorElement | undefined;
        let element: HTMLSpanElement | undefined;
        let leftClassName: string = "";
        let strings: string[] = [];

        // 当前行是否已经打印了光标，
        // 这个需要判断是否在中间已经打印过，如果没有打印的话，需要在末尾打印。
        // let printedCursor: boolean = false;

        for (let x = 1; x <= line.blocks.length; x++) {

            let block = line.get(x);

            if (block.empty) {
                continue;
            }

            let value = block.data,
                className = block.getClassName();

            // 超链接定义
            // if(!!block.href){
            //     anchor = document.createElement("a");
            //     anchor.href = block.href;
            // } else {
            //     anchor = undefined;
            // }

            // 特殊字符处理。
            switch (value) {
                case ' ':
                    value = '&nbsp;';
                    break;
                case '>':
                    value = '&gt;';
                    break;
                case '<':
                    value = '&lt;';
                    break;
                // case '\t':
                //     block.attribute.tab = true;
                //     break;
            }

            if(displayCursor
                && this.parser.x === x
                && line === this.cursorLine){

                if(!!leftClassName && element){
                    // 结束上一个。
                    strings.push(element.outerHTML);
                    element = undefined;
                    leftClassName = "";
                }

                // 当前行需要制作光标
                this.terminal.cursor.value = value;

                const pref = this.terminal.preferences;
                const attr = this.terminal.esParser.attribute;

                // 光标的颜色。
                // 需要先设置背景
                if(!!block.attribute.backgroundColorClass || !!attr.backgroundColorClass){
                    this.terminal.cursor.backgroundColor = pref.getColor(block.attribute.backgroundColorClass || attr.backgroundColorClass);
                } else {
                    this.terminal.cursor.backgroundColor = pref.defaultCursorColor ? pref.backgroundColor : pref.cursorBackgroundColor;
                }

                // 后设置前景
                if(!!block.attribute.colorClass || !!attr.colorClass){
                    this.terminal.cursor.color = pref.getColor(block.attribute.colorClass || attr.colorClass);
                } else {
                    this.terminal.cursor.color = pref.defaultCursorColor ? pref.color : pref.cursorColor;
                }

                this.terminal.cursor.extraClass = className;
                // printedCursor = true;
                strings.push(this.terminal.cursor.html);

                continue;
            }

            // 样式不同
            // 含有len2(由于间隙问题，要求每一个字符一个span存储)
            // 不存在样式。
            if(!!className){

                // 存在样式
                if(!element){
                    element = document.createElement("span");
                    element.className = className;
                }

                if(block.attribute.len2){
                    if(!!leftClassName)
                        strings.push(element.outerHTML);

                    element.className = className;
                    element.innerHTML = value;
                } else {
                    // 普通的样式
                    if(!!leftClassName && leftClassName !== className){
                        strings.push(element.outerHTML);

                        element.className = className;
                    }

                    if(leftClassName === className){
                        element.innerHTML = element.innerHTML + value;
                    } else {
                        element.innerHTML = value;
                    }

                }


            } else {

                if(!!leftClassName && element){
                    // 之前含有样式
                    strings.push(element.outerHTML);

                    element = undefined;
                }

                // 没有存在样式
                strings.push(value);

            }

            leftClassName = className;
        }

        if(!!leftClassName && element){
            strings.push(element.outerHTML);
        }

        // if(displayCursor
        //     && line === this.cursorLine
        //     && !printedCursor){
        //
        //     this.terminal.cursor.value = "&nbsp;";
        //
        //
        //     // 光标的颜色。
        //     // 需要先设置背景
        //     if(!!this.terminal.esParser.attribute.backgroundColorClass){
        //         this.terminal.cursor.backgroundColor =
        //             this.terminal.preferences.getColor(this.terminal.esParser.attribute.backgroundColorClass);
        //     } else {
        //         if(this.terminal.preferences.defaultCursorColor){
        //             this.terminal.cursor.backgroundColor = this.terminal.preferences.backgroundColor;
        //         } else {
        //             this.terminal.cursor.backgroundColor = this.terminal.preferences.cursorBackgroundColor;
        //         }
        //     }
        //
        //     // 后设置前景
        //     if(!!this.terminal.esParser.attribute.colorClass){
        //         this.terminal.cursor.color =
        //             this.terminal.preferences.getColor(this.terminal.esParser.attribute.colorClass);
        //     } else {
        //         if(this.terminal.preferences.defaultCursorColor){
        //             this.terminal.cursor.color = this.terminal.preferences.color;
        //         } else {
        //             this.terminal.cursor.color = this.terminal.preferences.cursorColor;
        //         }
        //     }
        //
        //     strings.push(this.terminal.cursor.html);
        // }

        line.element.innerHTML = strings.join("");

    }

}