import {BufferLine} from "./parser/buffer/BufferLine";
import {Parser} from "./parser/Parser";
import {Terminal} from "./Terminal";
import {PlaceholderBlock} from "./parser/buffer/PlaceholderBlock";
import {Buffer} from "./parser/buffer/Buffer";

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

            // 脏行
            if (!line.dirty) {
                continue;
            }

            this.printLine(line, true);

            // 如果不是光标的行的话，就重置脏标记
            if(line !== this.cursorLine){
                line.dirty = false;
            }

        }

    }

    /**
     * 刷新脏链
     * @param line
     * @param displayCursor 是否显示光标
     */
    printLine(line: BufferLine, displayCursor: boolean = false){


        // 刷新脏链数据
        let leftBlockClass: string = "",
            rowContent: string = "",
            values: string = "",
            outerHTML: string = "",
            printedCursor = false; // 是否已经输出了光标

        for (let x = 1; x <= line.blocks.length; x++) {

            let block = line.get(x);
            if (block instanceof PlaceholderBlock) {
                continue;
            }

            let value = block.data;

            // value.length === 0 || block.empty
            // if(block.empty) continue;

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
                case '\t':
                    block.attribute.tab = true;
                    break;
            }


            // 制作光标
            if(displayCursor
                && this.parser.x === x
                && line === this.cursorLine){

                // 光标的位置
                this.terminal.cursor.value = value;

                if(!!values){
                    if (!!outerHTML) {
                        rowContent += outerHTML.replace("{}", values);
                        values = "";
                        outerHTML = "";
                    } else {
                        rowContent += values;
                    }
                }
                this.terminal.cursor.extraClass = block.getClassName();
                rowContent += this.terminal.cursor.html;
                printedCursor = true;

                continue;

            }


            // 1，当前字符有样式
            // 2，当前字符样式和上一个字符样式不一样。
            // 3，当前字符样式含有len2(由于间隙问题，要求每一个字符一个span存储)
            // 4，当前字符不存在样式。
            const className = block.getClassName();
            if (!!className) {

                if (leftBlockClass === className) {
                    // 上一个字符和当前字符样式相等。
                    if (block.attribute.len2) {
                        // 结束上一个字符，如果含有样式
                        if (!!outerHTML) {
                            rowContent += outerHTML.replace("{}", values);
                            values = "";
                            outerHTML = "";
                        }

                        rowContent += `<span class="${className}">${value}</span>`;

                    } else {
                        if (outerHTML === "")
                            outerHTML = `<span class="${className}">{}</span>`;

                        values += value;
                    }

                } else {
                    // 上一个字符和当前字符样式不相等。
                    // 结束上一个字符，如果含有样式
                    if (!!outerHTML) {
                        rowContent += outerHTML.replace("{}", values);
                        values = "";
                        outerHTML = "";
                    }

                    if (block.attribute.len2) {
                        // 结束上一个字符，如果含有样式
                        rowContent += `<span class="${className}">${value}</span>`;
                    } else {
                        if (outerHTML === "")
                            outerHTML = `<span class="${className}">{}</span>`;
                        values += value;
                    }

                }

            } else {
                // 结束上一个字符，如果含有样式
                if (!!outerHTML) {
                    rowContent += outerHTML.replace("{}", values);
                    values = "";
                    outerHTML = "";
                }

                // 当前字符没有样式
                rowContent += value;
            }

            leftBlockClass = className;
        }

        if (!!values) {
            if (!!outerHTML) {
                rowContent += outerHTML.replace("{}", values);
            } else {
                rowContent += values;
            }
        }

        if(displayCursor
            && line === this.cursorLine
            && !printedCursor){

            this.terminal.cursor.value = "&nbsp;";
            rowContent += this.terminal.cursor.html;
        }

        line.element.innerHTML = rowContent;

    }


    appendDirtyLine(line: BufferLine){
        this.printLine(line, false);
        // this.printDirty();
    }

    // deleteDirtyLine(index: number){
    //     this.dirtyLines.splice(index, 1);
    // }
    //
    // getDirtyLineIndex(line: BufferLine){
    //     return this.dirtyLines.indexOf(line);
    // }

}