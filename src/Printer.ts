// import {Parser} from "./parser/Parser";
// import {RenderType, Terminal} from "./Terminal";
// import {BufferPool} from "./buffer/BufferPool";
// import {DataBlockAttribute} from "./buffer/DataBlockAttribute";
// import {CanvasRenderer} from "./CanvasRenderer";
// import {DataBlock} from "./buffer/DataBlock";
//
// /**
//  * 数据打印
//  * 如果有大批量数据需要输出打印。
//  *
//  */
// export class Printer {
//
//     private parser: Parser;
//     private terminal: Terminal;
//     readonly canvasRenderer: CanvasRenderer;
//
//     constructor(terminal: Terminal) {
//         this.terminal = terminal;
//         this.parser = this.terminal.parser;
//         this.canvasRenderer = new CanvasRenderer(terminal);
//     }
//
//     get activeBuffer(): BufferPool {
//         return this.parser.bufferSet.activeBuffer;
//     }
//
//     // get cursorLine(): HTMLElement {
//     //     return this.activeBuffer.get(this.activeBuffer.y);
//     // }
//
//     /**
//      * 刷新数据到元素中
//      * 刷新方式：通过判断当前缓冲区的所有脏链isDirty == true，
//      */
//     printBuffer(){
//
//         if(this.terminal.render == RenderType.HTML){
//
//             // const len = this.activeBuffer.size;
//             //
//             // for (let y = 1; y <= len; y++) {
//             //     if(!this.activeBuffer.isDirty(y)){
//             //         continue;
//             //     }
//             //     this.activeBuffer.updateDirty(y, false);
//             //
//             //     this.printLine(this.activeBuffer.get(y), this.activeBuffer.getBlocks(y), true);
//             // }
//
//         } else if(this.terminal.render == RenderType.CANVAS){
//             this.canvasRenderer.flushLines(this.canvasRenderer.getCurrentFlushLines(), false);
//         }
//
//     }
//
//
//     /**
//      * 打印脏行
//      * @param container
//      * @param blocks
//      * @param displayCursor 是否显示光标
//      */
//     // printLine(container: HTMLElement, blocks: string[], displayCursor: boolean = false){
//     //
//     //     let element: HTMLSpanElement | undefined,
//     //         leftClassName: string = "",
//     //         strings: string[] = [];
//     //
//     //     for (let x = 1,
//     //              len = blocks.length,
//     //              value,
//     //              className,
//     //              color,
//     //              bgColor,
//     //              len2,
//     //              block: DataBlock; x <= len; x++) {
//     //
//     //         block = DataBlock.decode(blocks[x - 1]);
//     //
//     //         // 空块
//     //         if(!block || block.length == 0) continue;
//     //
//     //         value = block.data;
//     //         // 解析样式
//     //         className = block.className;
//     //         color = block.colorClass;
//     //         bgColor = block.backgroundColorClass;
//     //         len2 = block.displaySize == 2;
//     //
//     //         if(len2){
//     //             className = !!className ? className += " len2": "len2";
//     //         }
//     //
//     //         // 特殊字符处理。
//     //         switch (value) {
//     //             // case ' ':
//     //                 // value = '&nbsp;';
//     //                 // break;
//     //             case '>':
//     //                 value = '&gt;';
//     //                 break;
//     //             case '<':
//     //                 value = '&lt;';
//     //                 break;
//     //             case '\t':
//     //                 className = !!className ? className += " tab": "tab";
//     //                 break;
//     //         }
//     //
//     //         if(displayCursor
//     //             && this.parser.x === x
//     //             && this.cursorLine === container) {       // cursor line
//     //
//     //             if (!!leftClassName && element) {
//     //                 // 结束上一个。
//     //                 strings.push(element.outerHTML);
//     //                 element = undefined;
//     //                 leftClassName = "";
//     //             }
//     //
//     //             // 当前行需要制作光标
//     //             this.terminal.cursor.value = value;
//     //
//     //             const pref = this.terminal.preferences;
//     //             const attr = this.terminal.esParser.attribute;
//     //
//     //             // 光标的颜色。
//     //             // 需要先设置背景
//     //             if (!!bgColor || !!attr.backgroundColorClass) {
//     //                 this.terminal.cursor.backgroundColor = pref.getColor(bgColor || attr.backgroundColorClass);
//     //             } else {
//     //                 this.terminal.cursor.backgroundColor = pref.defaultCursorColor ? pref.backgroundColor : pref.cursorBackgroundColor;
//     //             }
//     //
//     //             // 后设置前景
//     //             if (!!color || !!attr.colorClass) {
//     //                 this.terminal.cursor.color = pref.getColor(color || attr.colorClass);
//     //             } else {
//     //                 this.terminal.cursor.color = pref.defaultCursorColor ? pref.color : pref.cursorColor;
//     //             }
//     //
//     //             this.terminal.cursor.extraClass = className;
//     //
//     //             strings.push(this.terminal.cursor.html);
//     //
//     //             continue;
//     //         }
//     //
//     //         // 样式不同
//     //         // 含有len2(由于间隙问题，要求每一个字符一个span存储)
//     //         // 不存在样式。
//     //         if(!!className){
//     //
//     //             // 存在样式
//     //             if(!element){
//     //                 element = document.createElement("span");
//     //                 element.className = className;
//     //             }
//     //
//     //             if(len2){
//     //                 // len2
//     //                 if(!!leftClassName){
//     //                     strings.push(element.outerHTML);
//     //                 }
//     //
//     //                 element.className = className;
//     //                 element.innerHTML = value;
//     //             } else {
//     //                 // 普通的样式
//     //                 if(!!leftClassName && leftClassName !== className){
//     //                     strings.push(element.outerHTML);
//     //                     element.className = className;
//     //                 }
//     //
//     //                 if(leftClassName === className){
//     //                     element.innerHTML = element.innerHTML + value;
//     //                 } else {
//     //                     element.innerHTML = value;
//     //                 }
//     //
//     //             }
//     //
//     //
//     //         } else {
//     //
//     //             if(!!leftClassName && element){
//     //                 // 之前含有样式
//     //                 strings.push(element.outerHTML);
//     //                 element = undefined;
//     //             }
//     //
//     //             // 没有存在样式
//     //             strings.push(value);
//     //             // fragment.appendChild(document.createTextNode(value));
//     //
//     //         }
//     //
//     //         leftClassName = className;
//     //     }
//     //
//     //     if(!!leftClassName && element){
//     //         strings.push(element.outerHTML);
//     //     }
//     //
//     //     container.innerHTML = strings.join("").replace(/(\s*$)/g, "");
//     //
//     // }
//
// }