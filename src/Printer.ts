// import {BufferLine} from "./buffer/BufferLine";
import {Parser} from "./parser/Parser";
import {Terminal} from "./Terminal";
import {Buffer} from "./buffer/Buffer";
import {DataBlockAttribute} from "./buffer/DataBlockAttribute";

/**
 * 数据打印
 * 如果有大批量数据需要输出打印。
 *
 */
export class Printer {

    private parser: Parser;
    private terminal: Terminal;

    constructor(terminal: Terminal) {
        this.terminal = terminal;
        this.parser = this.terminal.parser;
    }

    get activeBuffer(): Buffer {
        return this.parser.bufferSet.activeBuffer;
    }

    get cursorLine(): HTMLElement {
        return this.activeBuffer.get(this.activeBuffer.y);
    }

    /**
     * 刷新数据到元素中
     * 刷新方式：通过判断当前缓冲区的所有脏链isDirty == true，
     */
    printBuffer(){

        const len = this.activeBuffer.size;

        for (let y = 1; y <= len; y++) {
            if(!this.activeBuffer.isDirty(y)){
                continue;
            }
            this.activeBuffer.updateDirty(y, false);

            this.printLine(this.activeBuffer.get(y), this.activeBuffer.getBlocks(y), true);
        }

    }

    /**
     * 打印脏行
     * @param container
     * @param blocks
     * @param displayCursor 是否显示光标
     */
    printLine(container: HTMLElement, blocks: string[], displayCursor: boolean = false){

        let element: HTMLSpanElement | undefined,
            leftClassName: string = "",
            strings: string[] = [];

        for (let x = 1,
                 len = blocks.length,
                 value,
                 className,
                 color,
                 bgColor,
                 len2,
                 block: string; x <= len; x++) {

            block = blocks[x - 1];

            // 空块
            if(!block || block.length == 0) continue;

            value = block.charAt(0);
            // 解析样式
            [className, color, bgColor]  = DataBlockAttribute.parseClassName(block.substring(2));
            len2 = block.charAt(1) == "1";

            if(len2){
                className = !!className ? className += " len2": "len2";
            }

            // 特殊字符处理。
            switch (value) {
                // case ' ':
                    // value = '&nbsp;';
                    // break;
                case '>':
                    value = '&gt;';
                    break;
                case '<':
                    value = '&lt;';
                    break;
                case '\t':
                    className = !!className ? className += " tab": "tab";
                    break;
            }

            if(displayCursor
                && this.parser.x === x
                && this.cursorLine === container) {       // cursor line

                if (!!leftClassName && element) {
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
                if (!!bgColor || !!attr.backgroundColorClass) {
                    this.terminal.cursor.backgroundColor = pref.getColor(bgColor || attr.backgroundColorClass);
                } else {
                    this.terminal.cursor.backgroundColor = pref.defaultCursorColor ? pref.backgroundColor : pref.cursorBackgroundColor;
                }

                // 后设置前景
                if (!!color || !!attr.colorClass) {
                    this.terminal.cursor.color = pref.getColor(color || attr.colorClass);
                } else {
                    this.terminal.cursor.color = pref.defaultCursorColor ? pref.color : pref.cursorColor;
                }

                this.terminal.cursor.extraClass = className;

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

                if(len2){
                    // len2
                    if(!!leftClassName){
                        strings.push(element.outerHTML);
                    }

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
                // fragment.appendChild(document.createTextNode(value));

            }

            leftClassName = className;
        }

        if(!!leftClassName && element){
            strings.push(element.outerHTML);
        }

        container.innerHTML = strings.join("").replace(/(\s*$)/g, "");

    }



    // /**
    //  * 打印脏行
    //  * @param line
    //  */
    // static getLineInnerHTML(line: BufferLine){
    //
    //     let element: HTMLSpanElement | undefined;
    //     let leftClassName: string = "";
    //     // let fragment = document.createDocumentFragment();
    //     let strings: string[] = [];
    //
    //     for (let x = 1; x <= line.blocks.length; x++) {
    //
    //         let block = line.get(x);
    //
    //         if (block.empty) {
    //             continue;
    //         }
    //
    //         if(block.version === 0) continue;
    //
    //         let value = block.data,
    //             className = block.getClassName();
    //
    //         // 特殊字符处理。
    //         // switch (value) {
    //         //     case ' ':
    //         //         value = '&nbsp;';
    //         //         break;
    //         //     case '>':
    //         //         value = '&gt;';
    //         //         break;
    //         //     case '<':
    //         //         value = '&lt;';
    //         //         break;
    //         //     // case '\t':
    //         //     //     block.attribute.tab = true;
    //         //     //     break;
    //         // }
    //
    //         // 样式不同
    //         // 含有len2(由于间隙问题，要求每一个字符一个span存储)
    //         // 不存在样式。
    //         if(!!className){
    //
    //             // 存在样式
    //             if(!element){
    //                 element = document.createElement("span");
    //                 element.className = className;
    //             }
    //
    //             if(block.attribute.len2){
    //                 if(!!leftClassName){
    //                     // fragment.appendChild(element);
    //                     strings.push(element.outerHTML);
    //                 }
    //
    //                 element.className = className;
    //                 element.innerHTML = value;
    //             } else {
    //                 // 普通的样式
    //                 if(!!leftClassName && leftClassName !== className){
    //                     strings.push(element.outerHTML);
    //                     // fragment.appendChild(element);
    //
    //                     element.className = className;
    //                 }
    //
    //                 if(leftClassName === className){
    //                     element.innerHTML = element.innerHTML + value;
    //                 } else {
    //                     element.innerHTML = value;
    //                 }
    //
    //             }
    //
    //
    //         } else {
    //
    //             if(!!leftClassName && element){
    //                 // 之前含有样式
    //                 strings.push(element.outerHTML);
    //                 // fragment.appendChild(element);
    //
    //                 element = undefined;
    //             }
    //
    //             // 没有存在样式
    //             strings.push(value);
    //             // fragment.appendChild(document.createTextNode(value));
    //
    //         }
    //
    //         leftClassName = className;
    //     }
    //
    //     if(!!leftClassName && element){
    //         strings.push(element.outerHTML);
    //         // fragment.appendChild(element);
    //     }
    //
    //     return strings.join("");
    //
    // }



    // replaceHTML(el: HTMLDivElement, html: string): HTMLDivElement {
    //
    //     let newEl = el.cloneNode(false);
    //
    //     (<HTMLDivElement>newEl).innerHTML = html;
    //
    //     if(el.parentElement)
    //         el.parentElement.replaceChild(newEl, el);
    //
    //     return (<HTMLDivElement>newEl);
    // }


}