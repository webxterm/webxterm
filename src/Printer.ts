import {BufferLine} from "./buffer/BufferLine";
import {Parser} from "./parser/Parser";
import {Terminal} from "./Terminal";
import {Buffer} from "./buffer/Buffer";

/**
 * 数据打印
 * 如果有大批量数据需要输出打印。
 *
 */
export class Printer {

    private parser: Parser;
    private terminal: Terminal;
    // innerHTML队列，实现后进先出
    private timer: number = 0;
    private strings: string[] = [];

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

        let element: HTMLSpanElement | undefined;
        let leftClassName: string = "";
        // let fragment = document.createDocumentFragment();
        // let strings: string[] = [];

        for (let x = 1; x <= line.blocks.length; x++) {

            let block = line.get(x);

            if (block.empty) {
                continue;
            }

            if(block.version === 0) continue;

            let value = block.data,
                className = block.getClassName();

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
                && line === this.cursorLine) {

                if (!!leftClassName && element) {
                    // 结束上一个。
                    // fragment.appendChild(element);
                    this.strings.push(element.outerHTML);
                    element = undefined;
                    leftClassName = "";
                }

                // 当前行需要制作光标
                this.terminal.cursor.value = value;

                const pref = this.terminal.preferences;
                const attr = this.terminal.esParser.attribute;

                // 光标的颜色。
                // 需要先设置背景
                if (!!block.attribute.backgroundColorClass || !!attr.backgroundColorClass) {
                    this.terminal.cursor.backgroundColor = pref.getColor(block.attribute.backgroundColorClass || attr.backgroundColorClass);
                } else {
                    this.terminal.cursor.backgroundColor = pref.defaultCursorColor ? pref.backgroundColor : pref.cursorBackgroundColor;
                }

                // 后设置前景
                if (!!block.attribute.colorClass || !!attr.colorClass) {
                    this.terminal.cursor.color = pref.getColor(block.attribute.colorClass || attr.colorClass);
                } else {
                    this.terminal.cursor.color = pref.defaultCursorColor ? pref.color : pref.cursorColor;
                }

                this.terminal.cursor.extraClass = className;

                // fragment.appendChild(this.terminal.cursor.getElement());

                this.strings.push(this.terminal.cursor.html);

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
                    if(!!leftClassName){
                        // fragment.appendChild(element);
                        this.strings.push(element.outerHTML);
                    }

                    element.className = className;
                    element.innerHTML = value;
                } else {
                    // 普通的样式
                    if(!!leftClassName && leftClassName !== className){
                        this.strings.push(element.outerHTML);
                        // fragment.appendChild(element);

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
                    this.strings.push(element.outerHTML);
                    // fragment.appendChild(element);

                    element = undefined;
                }

                // 没有存在样式
                this.strings.push(value);
                // fragment.appendChild(document.createTextNode(value));

            }

            leftClassName = className;
        }

        if(!!leftClassName && element){
            this.strings.push(element.outerHTML);
            // fragment.appendChild(element);
        }

        line.element.innerHTML = this.strings.splice(0, this.strings.length).join("");
        // line.element.appendChild(fragment);

    }

}