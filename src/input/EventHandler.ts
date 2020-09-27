/**
 * 事件处理器
 */
import {Keyboard} from "./Keyboard";
import {RenderType, Terminal} from "../Terminal";
import {CommonUtils} from "../common/CommonUtils";
import {Styles} from "../Styles";
import {CanvasSelection, SelectionPoint, SelectionPosition} from "../CanvasSelection";
import {InputEvent} from "./InputEvent";
import {LineBuffer} from "../buffer/LineBuffer";

enum FocusTarget {
    UNDEFINED,  // 未定义
    CONTAINER,  // 容器
    CLIPBOARD   // 粘贴板
}

export class EventHandler {

    // 键盘输入
    private keyboard: Keyboard = new Keyboard();

    // 选中的内容
    private selectionContent: string = "";

    // 光标选中范围
    private selectionRanges: Range[] = [];

    // 按快捷键全选。
    private quickSelectAll: boolean = false;

    // 正在输入，中文输入法 / 229
    // private composing: Composition = new Composition();

    /**
     * 获取选中的内容
     * 只适用标准浏览器
     */
    private getSelection() : string {
        let sel: Selection | null = window.getSelection();
        if(!sel) throw new Error("window.selection is " + sel);

        for (let i = 0; i < sel.rangeCount; i++) {
            this.selectionRanges[i] = sel.getRangeAt(i);
        }
        return sel.toString();
    }

    /**
     * 光标是否落在选中的范围中
     * @param {MouseEvent} event
     */
    private isFocusSelectionRanges(event: MouseEvent) : boolean {
        for (let range of this.selectionRanges) {
            for (let rect of range.getClientRects()) {
                if ((rect.x <= event.pageX && event.pageX <= rect.right)
                    && (rect.y <= event.pageY && event.pageY <= rect.bottom)) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * 监听
     */
    listen(t: Terminal) {

        const defaultOption: object = { preventScroll: true };
        let focusTarget = FocusTarget.UNDEFINED;
        let container = t.container;
        let clipboard = t.clipboard;
        let selection: CanvasSelection = t.selection;

        // 输入事件处理。
        new InputEvent(clipboard, t).initCompositionEvents().initKeydownEvent();

        // 注册容器点击事件
        container.addEventListener("click", (e: Event) => {
            // console.info(e);
            this.quickSelectAll = false;
            if (this.getSelection().length === 0) {
                clipboard.focus(defaultOption);
            }
        });

        container.addEventListener("paste", (e: ClipboardEvent) => {
            // console.info(e);
            clipboard.focus();
            t.scrollToBottom();
            if(e.clipboardData){
                let text = e.clipboardData.getData('text');
                // this.paste(text.replace(/\n|\r\n/gi, '\x0d'), 'clipboard2', terminal);
                this.sendMessage(t, text.replace(/\n|\r\n/gi, '\x0d'));
            }

        });

        // clipboard.addEventListener("copy", (e) => {
        //     console.info(e);
        //
        //     // let sel = window.getSelection();
        //     // let el = document.createElement("pre");
        //     // el.style.position = "absolute";
        //     // el.style.left = "-9999em";
        //     // document.body.append(el);
        //     // el.innerHTML = selection.selectedContent;
        //
        //
        //     if(sel != null){
        //         sel.selectAllChildren(el);
        //
        //         setTimeout(() => {
        //             el.remove();
        //         });
        //     }
        //
        //     // let a = document.createElement("a");
        //     // a.addEventListener("click", (e) => {
        //     //     let sel = window.getSelection();
        //     //     if(sel != null){
        //     //         sel.selectAllChildren(el);
        //     //         setTimeout(() => {
        //     //             document.execCommand("Copy");
        //     //         }, 1000);
        //     //     }
        //     // });
        //     // a.click();
        //
        //     // if(sel != null){
        //     //     sel.selectAllChildren(el);
        //
        //
        //         // setTimeout(() => {
        //         //     document.execCommand("copy");
        //         // });
        //     // }
        //
        // });

        container.addEventListener("mousedown", (e: MouseEvent) => {
            // console.info(e);
            console.info('container...mousedown....', e);

            // 正在输入，不处理鼠标按压事件、
            // 已被cursorView的事件阻止。
            // if(this.composing.running){
            //     e.preventDefault();
            //     return;
            // }

            switch (e.button) {
                case 0:
                    // 左键按下
                    // console.info('左键按下');
                    focusTarget = FocusTarget.CONTAINER;

                    // 终端获取焦点
                    clipboard.focus(defaultOption);

                    return;
                case 1:
                    // 滚轮（中键）按下
                    e.preventDefault();
                    this.sendMessage(t, this.selectionContent);
                    // this.paste(this.selectionContent, 'mouse(wheel|middle)', terminal);
                    clipboard.focus();

                    break;
                case 2:
                    // 右键
                    // 如果全选的话，默认事件
                    if(this.quickSelectAll){
                        break;
                    }

                    if(t.renderType == RenderType.CANVAS){
                        let target: HTMLElement = <HTMLElement> e.target
                            , x
                            , y = 0
                            , h = t.charHeight;

                        // 使用canvas渲染
                        let layerY = e.clientY - cursorViewRect.top,
                            height = t.charHeight;
                        x = e.clientX - cursorViewRect.left;
                        y = Math.floor(layerY / height ) * height + parseInt(t.viewport.style.marginTop);

                        Styles.add(".clipboard", {
                            position: "absolute",
                            left: (x - t.charWidth / 2) + "px",
                            top: y + "px",
                            height: h + "px",
                            width: (target.getBoundingClientRect().width - x) + "px"
                        }, t.instanceId);


                    } else if(t.renderType == RenderType.HTML){

                        // 如果光标不在选中区域的话，可以粘贴
                        if (!this.isFocusSelectionRanges(e)) {
                            console.info('isFocusSelectionRanges => false');
                            console.info(e.target);

                            // 获取右键光标的位置
                            // ev.target instanceof this.t.container:
                            // => 光标落在外部容器中
                            // ev.target instanceof this.t.presentationEl:
                            // => 光标落在presentationEl中
                            // ev.target instanceof div.terminal-row:
                            // => 光标落在某一行中

                            let target: HTMLElement = <HTMLElement> e.target
                                , x = e.pageX - t.container.getBoundingClientRect().left
                                , y = 0
                                , h = t.charHeight;

                            if (target === t.container) {
                                // console.info('光标落在容器中....');

                                y = e.pageY - (e.pageY % t.charHeight);
                            } else if (target === t.presentation) {
                                // 相当于光标落在最后一行数据行中。
                                y = target.offsetTop;
                                h = target.getBoundingClientRect().height;
                                // console.info('光标落在撰写栏中....');
                            } else if (CommonUtils.hasClass(target, 'viewport-row')) {
                                // console.info('光标落在某一行中....');
                                y = target.offsetTop;
                            } else {
                                // 如果落在.viewport-row的某一个span中。
                                if(target.nodeName && target.nodeName.toUpperCase() == "SPAN"){
                                    // span
                                    if(target.parentElement
                                        && CommonUtils.hasClass(target.parentElement, 'viewport-row')){
                                        // console.info('光标落在某一行中....');
                                        y = target.offsetTop;
                                    } else {
                                        break;
                                    }
                                } else {
                                    // 光标落在其他地方的话，不处理。。。
                                    break;
                                }
                            }

                            Styles.add(".clipboard", {
                                position: "absolute",
                                left: (x - t.charWidth / 2) + "px",
                                top: y + "px",
                                height: h + "px",
                                width: (target.getBoundingClientRect().width - x) + "px"
                            }, t.instanceId);

                            // setTimeout(() => {
                            //
                            //     Styles.add(".clipboard", {
                            //         position: "",
                            //         left: "",
                            //         top: "",
                            //         height: "",
                            //         width: ""
                            //     }, t.instanceId);
                            //
                            // }, 100);
                        }

                    }


                    break;
                case 3:
                    // 浏览器后退 按钮
                    // Browser Back
                    break;
                case 4:
                    // 浏览器前进 按钮
                    // Browser Forward
                    break;
            }
        });


        container.addEventListener('mouseup', (e) => {
            console.info('container...mouseup....', e);

            // console.info(e);

            // 选中的内容
            const selectionContent = this.getSelection();
            if (!!selectionContent) {
                this.selectionContent = selectionContent;
            } else {
                // console.info('粘贴板获取焦点...');
                // term.clipboard.focus();
            }

        });

        // container.addEventListener("keydown", (e: KeyboardEvent) => {
        //     console.info('container。。。。。', e);
        // });

        document.addEventListener("keydown", (e: KeyboardEvent) => {
            // console.info(e)
            console.info('document...keydown....', e);

            // 修饰键不处理。
            if(e.key === "Alt"
                || e.key === "Control"
                || e.key === "Shift"
                || e.metaKey
                || e.altKey){
                return;
            }

            let keySym = this.keyboard.getKeySym(e,
                t.esParser.applicationCursorKeys,
                t.parser.applicationKeypad);

            // this.paste(keySym, "key", terminal);

            this.sendMessage(t, keySym);

            clipboard.focus();
        });

        // document.body.addEventListener("click", (e) => {
        //     console.info(e);
        // }, true);

        // container.addEventListener("keypress", (e: KeyboardEvent) => {
        //     console.info(e);
        // });
        //
        // clipboard.addEventListener("keypress", (e: KeyboardEvent) => {
        //     console.info(e);
        // });


        // ============================================================================================================
        // 事件执行顺序：(中文输入)

        // MAC: safari 的执行顺序：compositionstart -> compositionupdate -> keydown(key:d, keyCode|which:229, code:KeyD, keyIdentifier: U+005A)
        // MAC/Windows: firefox 的执行顺序：keydown(key:Process, keyCode|which:229, code:KeyD) -> compositionstart -> compositionupdate
        // MAC: chrome, opera 的执行顺序：keydown(key:d, keyCode|which:229, code:KeyD) -> compositionstart -> compositionupdate
        // Windows: chrome, opera 的执行顺序：keydown(key:Process, keyCode|which:229, code:KeyD) -> compositionstart -> compositionupdate


        // IOS: safari 的执行顺序：
        // 1、百度输入法、搜狗输入法、讯飞输入法、系统英文输入法：keydown(code:Unidentified, key: 中文, keyCode|which:229, keyIdentifier: Unidentified)
        // 3、IOS系统中文输入法：keydown(code:Unidentified, key: ➒, keyCode|which:229, keyIdentifier: U+2792) -> compositionstart -> compositionupdate
        //

        // 四种情况：
        // 1,keyCode|which:229 key => Process   code:KeyD
        // 2,keyCode|which:229 key => d         code:KeyD
        // 3,keyCode|which:229 key => ➒         code:Unidentified
        // 4,keyCode|which:229 key => 中文       code:Unidentified

        // ============================================================================================================


        // clipboard.addEventListener('keydown', (e:KeyboardEvent) => {
        //     console.info('clipboard...keydown....', e);
        //
        //
        //     // console.info(e);
        //     // this.quickSelectAll = false;
        //     //
        //     // // 不用取消默认行为。
        //     // if (e.metaKey) {
        //     //     let key = e.key.toLowerCase();
        //     //     if(key === "meta"){
        //     //         return;
        //     //     }
        //     //     if ("cv".indexOf(key) !== -1) {
        //     //         // MacOS: meta+c(复制), meta+v(粘贴)
        //     //         return;
        //     //     } else if('a' === key){
        //     //         // MacOS: meta+a(全选)
        //     //         if(t.renderType == RenderType.HTML){
        //     //             this.quickSelectAll = true;
        //     //             // let sel = window.getSelection();
        //     //             // sel.selectAllChildren(this.t.outputEl);
        //     //             clipboard.blur();
        //     //         } else if(t.renderType == RenderType.CANVAS){
        //     //             // 全选。
        //     //             t.renderer.selectAll(selection);
        //     //         }
        //     //         return;
        //     //     }
        //     // }
        //
        //     // 阻止默认操作。
        //     // 如果不取消默认操作的话，tab等按键默认会跳出终端内。
        //     e.preventDefault();
        //     // 禁止冒泡
        //     e.stopPropagation();
        //
        //     // ============================================================================================================
        //     // 事件执行顺序：(中文输入)
        //
        //     // MAC: safari 的执行顺序：中文：compositionstart -> compositionupdate -> keydown(key:d, keyCode|which:229, code:KeyD, keyIdentifier: U+005A) |-> compositionend
        //     // MAC: safari 的执行顺序：英文：keydown(key:d, keyCode|which:229, code:KeyD, keyIdentifier: U+005A)
        //     // MAC: firefox 的执行顺序：keydown(key:Process, keyCode|which:229, code:KeyD) -> compositionstart -> compositionupdate |-> compositionend
        //     // MAC: chrome, opera 的执行顺序：keydown(key:d, keyCode|which:229, code:KeyD) -> compositionstart -> compositionupdate |-> compositionend
        //
        //     // IOS: safari 的执行顺序：
        //     // 1、IOS 百度输入法、搜狗输入法、讯飞输入法，系统简体拼音(英文)：keydown(code:Unidentified|KeyD, key: 中文|d, keyCode|which:229, keyIdentifier: Unidentified|U+2792)
        //     // 3、IOS 系统简体拼音(中文)：keydown(code:Unidentified|KeyD, key: ➒|d, keyCode|which:229, keyIdentifier: U+2792) -> compositionstart -> compositionupdate |-> compositionend
        //     //
        //
        //     // 四种情况：
        //     // 1,keyCode|which:229 key => Process   code:KeyD
        //     // 2,keyCode|which:229 key => d         code:KeyD
        //     // 3,keyCode|which:229 key => ➒         code:Unidentified
        //     // 4,keyCode|which:229 key => 中文       code:Unidentified
        //
        //     // ============================================================================================================
        //
        //     // 如果正在联想输入，不处理下面操作。
        //     // MAC: safari 的执行顺序：compositionstart -> compositionupdate -> keydown(key:d, keyCode|which:229, code:KeyD, keyIdentifier: U+005A)
        //     // if(this.composing.running){
        //     //     return;
        //     // }
        //
        //     // 非Safari的其他浏览器
        //     if ((e.which === 229 || e.keyCode == 229) && (e as any)['keyIdentifier'] == undefined) {
        //         return;
        //     }
        //
        //
        //     // if (e.which === 229 || e.keyCode == 229) {
        //     //     const key = e.key;
        //     //     // FireFox
        //     //     if(key == "Process"){
        //     //         // 已捕获compositionstart事件，无需处理
        //     //         console.info("FireFox浏览器。。。");
        //     //         return;
        //     //     }
        //     //     // Safari
        //     //     // https://developer.mozilla.org/zh-CN/docs/Web/API/KeyboardEvent/keyIdentifier
        //     //     const keyIdentifier = (e as any)['keyIdentifier'];
        //     //     if(keyIdentifier != undefined){
        //     //         console.info("Safari浏览器....");
        //     //
        //     //         if(keyIdentifier == 'Unidentified' && e.code == 'Unidentified'){
        //     //             // IOS 百度输入法、搜狗输入法、讯飞输入法，系统简体拼音(英文)：keydown(code:Unidentified, key: 中文, keyCode|which:229, keyIdentifier: Unidentified)
        //     //         } else if(keyIdentifier != 'Unidentified' && e.code == 'Unidentified'){
        //     //             // IOS 系统简体拼音(中文)
        //     //             return;
        //     //         } else {
        //     //             // MAC Safari
        //     //             // 搜狗浏览器英文输入
        //     //             // keydown(key:d, keyCode|which:229, code:KeyD, keyIdentifier: U+005A)
        //     //             // 搜狗浏览器中文输入
        //     //             // compositionstart -> compositionupdate -> keydown(key:d, keyCode|which:229, code:KeyD, keyIdentifier: U+005A)
        //     //             if(this.composing.running){
        //     //                 return;
        //     //             } else {
        //     //                 let keySym = this.keyboard.getKeySym(e,
        //     //                     t.esParser.applicationCursorKeys,
        //     //                     t.parser.applicationKeypad);
        //     //
        //     //                 // this.paste(keySym, "key", terminal);
        //     //                 this.sendMessage(t, keySym);
        //     //                 return;
        //     //             }
        //     //         }
        //     //     }
        //     //
        //     //     // 其他浏览器
        //     //     // Chrome, Opera, ....
        //     //
        //     //
        //     //
        //     //     // if (/[\u4E00-\u9FA5]|[\uFE30-\uFFA0]/gi.test(key)) {
        //     //     //     // 中文正常处理。。
        //     //     // } else if(key.length > 1){
        //     //     //     // 长度大于1不处理。
        //     //     //     return;
        //     //     // } else {
        //     //     //
        //     //     //     // 处理预输入。
        //     //     //     switch (this.composing.state) {
        //     //     //         case 0:
        //     //     //             this.composing.reset();
        //     //     //             this.composing.update = key;
        //     //     //             this.composing.state = 1;
        //     //     //             this.composing.running = true;
        //     //     //
        //     //     //             // 显示联想输入
        //     //     //             compositionElement = document.createElement("span");
        //     //     //             compositionElement.className = "composition2";
        //     //     //             compositionElement.innerHTML = this.composing.update;
        //     //     //             let currentElement = t.cursor.currentElement;
        //     //     //             if(currentElement && currentElement.parentElement){
        //     //     //                 currentElement.parentElement.insertBefore(compositionElement, currentElement);
        //     //     //             }
        //     //     //
        //     //     //             break;
        //     //     //         case 1:
        //     //     //             // 正在输入
        //     //     //             this.composing.state = 2;
        //     //     //         case 2:
        //     //     //             this.composing.update = this.composing.update + key;
        //     //     //             if(t.renderType == RenderType.HTML) {
        //     //     //                 compositionElement.innerHTML = this.composing.update;
        //     //     //             }
        //     //     //             break;
        //     //     //         case 3:
        //     //     //             this.composing.end = key;
        //     //     //             if(t.renderType == RenderType.HTML) {
        //     //     //                 compositionElement.innerHTML = this.composing.end;
        //     //     //             }
        //     //     //
        //     //     //             // 发送内容给后台
        //     //     //             // this.paste(this.composing.end, "composition", terminal);
        //     //     //
        //     //     //             this.sendMessage(t, this.composing.end);
        //     //     //
        //     //     //             this.composing.reset();
        //     //     //             if(t.renderType == RenderType.HTML) {
        //     //     //                 compositionElement.remove();
        //     //     //             }
        //     //     //             break;
        //     //     //     }
        //     //     //
        //     //     //     if(t.renderType == RenderType.CANVAS){
        //     //     //         t.renderer.drawLine(t.bufferSet.activeBuffer.y,
        //     //     //             t.bufferSet.activeBuffer.getBlocks(t.bufferSet.activeBuffer.y), false, this.composing);
        //     //     //     }
        //     //     //
        //     //     //     // console.info(JSON.stringify(this.composing));
        //     //     //
        //     //     //     return;
        //     //     // }
        //     //
        //     // }
        //
        //     // else if(!this.composing.events && this.composing.running){
        //     //
        //     //     // 不是事件产生，并且正在输入
        //     //     if(e.key == "Backspace"){
        //     //         // 回退键
        //     //         this.composing.running = false;
        //     //         this.composing.update = "";
        //     //         this.composing.done = true;
        //     //         this.composing.state = 3;
        //     //
        //     //     } else if(e.key == "Enter"){
        //     //         // 回车键
        //     //         this.composing.end = this.composing.update;
        //     //         compositionElement.innerHTML = this.composing.end;
        //     //
        //     //         this.composing.running = false;
        //     //         this.composing.update = "";
        //     //         this.composing.done = true;
        //     //         this.composing.state = 3;
        //     //
        //     //         // 发送内容给后台
        //     //         // this.paste(this.composing.end, "composition", terminal);
        //     //         this.sendMessage(t, this.composing.end);
        //     //
        //     //         this.composing.reset();
        //     //         compositionElement.remove();
        //     //     }
        //     //     return;
        //     // }
        //
        //
        //     let keySym = this.keyboard.getKeySym(e,
        //         t.esParser.applicationCursorKeys,
        //         t.parser.applicationKeypad);
        //
        //     // this.paste(keySym, "key", terminal);
        //     this.sendMessage(t, keySym);
        //
        //
        //
        //     // 如果还没有满屏的话，不用滚动了
        //     if(t.bufferSet.activeBuffer.currentLineNum >= t.rows
        //         && !t.enableScrollToBottom){
        //         t.enableScrollToBottom = true;
        //     }
        //
        // });


        clipboard.addEventListener("contextmenu", () => {
            clipboard.focus();
        });

        // let compositionElement: HTMLSpanElement, compositionBlinkingTimer: number = 0;

        // clipboard.addEventListener("compositionstart", (e) => {
        //     console.info('clipboard...compositionstart....', e);
        //     if(e instanceof CompositionEvent) {
        //         // 输入之前先重置
        //         this.composing.reset();
        //         this.composing.events = true;
        //         this.composing.update = e.data;
        //         this.composing.running = true;
        //         this.composing.state = 1;
        //         console.info(JSON.stringify(this.composing));
        //
        //         if(t.renderType == RenderType.CANVAS){
        //             t.renderer.drawLine(t.bufferSet.activeBuffer.y,
        //                 t.bufferSet.activeBuffer.getBlocks(t.bufferSet.activeBuffer.y), false, this.composing);
        //         } else if(t.renderType === RenderType.HTML){
        //             // 显示联想输入
        //             compositionElement = document.createElement("span");
        //             compositionElement.className = "composition";
        //             compositionElement.innerHTML = this.composing.update;
        //             let currentElement = t.cursor.currentElement;
        //             if(currentElement && currentElement.parentElement){
        //                 currentElement.parentElement.insertBefore(compositionElement, currentElement);
        //             }
        //             // 隐藏当前的光标
        //             t.hideCursor();
        //         }
        //
        //     }
        //
        // });

        // 联想输入更新
        // clipboard.addEventListener('compositionupdate', (e) => {
        //     console.info('clipboard...compositionupdate....', e);
        //     if(e instanceof CompositionEvent) {
        //         this.composing.update = e.data;
        //         this.composing.state = 2;
        //         console.info(JSON.stringify(this.composing));
        //
        //         if(t.renderType == RenderType.CANVAS){
        //             t.renderer.drawLine(t.bufferSet.activeBuffer.y,
        //                 t.bufferSet.activeBuffer.getBlocks(t.bufferSet.activeBuffer.y), false, this.composing);
        //         } else if(t.renderType === RenderType.HTML){
        //             if(compositionElement){
        //                 compositionElement.innerHTML = this.composing.update;
        //
        //                 CommonUtils.addClass(compositionElement, "running");
        //                 if(!!compositionBlinkingTimer){
        //                     return;
        //                 }
        //                 compositionBlinkingTimer = setTimeout(() => {
        //                     CommonUtils.removeClass(compositionElement, "running");
        //                     clearTimeout(compositionBlinkingTimer);
        //                     compositionBlinkingTimer = 0;
        //                 }, 1200);
        //             }
        //         }
        //
        //     }
        //
        // });

        // // 联想输入结束
        // clipboard.addEventListener('compositionend', (e) => {
        //     console.info('clipboard...compositionend....', e);
        //     if(e instanceof CompositionEvent){
        //
        //         this.composing.update = "";
        //         this.composing.done = true;
        //         this.composing.running = false;
        //         this.composing.end = e.data;
        //         this.composing.state = 3;
        //
        //         if(t.renderType == RenderType.CANVAS){
        //             t.renderer.drawLine(t.bufferSet.activeBuffer.y,
        //                 t.bufferSet.activeBuffer.getBlocks(t.bufferSet.activeBuffer.y), false, this.composing);
        //         } else if(t.renderType == RenderType.HTML){
        //             if(compositionElement){
        //
        //                 compositionElement.innerHTML = this.composing.end;
        //
        //                 t.showCursor();
        //                 compositionElement.remove();
        //             }
        //         }
        //
        //         console.info(JSON.stringify(this.composing));
        //         // 发送内容给后台
        //         // this.paste(e.data, "composition", terminal);
        //         this.sendMessage(t, e.data);
        //
        //         // 重置
        //         this.composing.reset();
        //     }
        //
        // });

        // container.addEventListener('scroll', (e) => {
        //     // 判断是否滚动到底部。
        //     // 如果没有滚动到底部，输出内容的时候，也无需滚动到底部。
        //     let target = <HTMLElement> e.target;
        //     t.enableScrollToBottom = target.scrollTop + target.getBoundingClientRect().height + 15 >= target.scrollHeight;
        // });

        let resizingTimer: number = 0, blurTimer: number = 0;

        clipboard.addEventListener('focus', (e) => {

            // 如果当前是在失去焦点的时间，则不处理失去焦点的动作。
            if (blurTimer) {
                clearTimeout(blurTimer);
                blurTimer = 0;
            }

            e.stopPropagation();
            e.preventDefault();

            console.info('获取焦点');
            // IOS键盘弹出键盘上移
            window.scrollTo(0,0);

            if(t.renderType === RenderType.CANVAS){
                setTimeout(() => {
                    if(t.cursorRenderer) t.cursorRenderer.drawCursor();
                });
            } else if(t.renderType === RenderType.HTML){
                t.focus();
                clipboard.value = '';
                focusTarget = FocusTarget.CLIPBOARD;
            }
        });

        clipboard.focus(defaultOption);

        // clipboard.addEventListener('blur', (e) => {
        //     // 如果100ms，没有focus的话，就获取焦点。
        //     // 否则，不处理失去焦点
        //     blurTimer = setTimeout(() => {
        //
        //         console.info('失去焦点');
        //         // t.echo("失去焦点\r\n");
        //         console.info(window.innerHeight);
        //         e.stopPropagation();
        //
        //         if(!this.quickSelectAll
        //             && focusTarget !== FocusTarget.CONTAINER
        //             // && document.activeElement !== document.body  // 这个条件会取消点击容器外面失去焦点的功能。
        //             // 如果不加这个功能，当多次点击选中一行的时候，body会获取焦点，终端会失去焦点。
        //         ){
        //             t.blur();
        //         }
        //
        //         if (focusTarget === FocusTarget.CLIPBOARD) {
        //             focusTarget = FocusTarget.UNDEFINED;
        //         }
        //
        //         clearTimeout(blurTimer);
        //         blurTimer = 0;
        //
        //     }, 200);
        //
        //
        //
        // });

        window.addEventListener('blur', () => {
            if(t.renderType === RenderType.CANVAS) {
                setTimeout(() => {
                    if(t.cursorRenderer) t.cursorRenderer.cursorBlur();
                });
            } else if(t.renderType === RenderType.HTML){
                focusTarget = FocusTarget.UNDEFINED;
                console.info('失去焦点');
                t.blur();
            }
        });

        // 窗口大小改变
        window.onresize = () => {

            if (!!resizingTimer) {
                clearTimeout(resizingTimer);
                resizingTimer = 0;
            }
            resizingTimer = setTimeout(() => {
                if(t.eventMap["resize"])
                    t.eventMap["resize"]();

                t.resizeWindow();

                clearTimeout(resizingTimer);
                resizingTimer = 0;
            }, 100);
        };

        // 第二种渲染方式：Canvas
        // 第一层：cursorView
        // 第一层：link
        // 第二层：selectionView
        // 第三层：textView
        // 因此，只需要捕获第一层的事件。
        let cursorViewRect = t.cursorView.getBoundingClientRect();

        // 通过长按并一直拖动可以选择
        // 上次点击时间
        let clickTime: number[] = [];
        // 每次点击的点
        let clickPoints: SelectionPoint[] = [];

        /**
         * 计算在Canvas的X左上角坐标
         * @param layerX
         */
        function calcPointX(layerX: number){
            const width = (t.textRenderer) ? t.textRenderer.measuredTextWidth : 0;
            // 取模，如果值大于width/2(字符一半)的话，则不选中当前字符，反之选中当前字符
            const xMod = layerX * 2 % width;
            let x = Math.floor(layerX * 2 / width) * width;
            if(xMod > width / 2){
                x += width;
            }
            return x;
        }

        /**
         * 计算在Canvas的Y左上角坐标 第一个行会返回 0
         * @param layerY
         */
        function calcPointY(layerY: number){
            const height = (t.textRenderer) ? t.textRenderer.height : 0;
            return Math.floor(layerY * 2 / height) * height;
        }

        t.scrollView.addEventListener("mousedown", (e) => {

            // 如果正在输入的话，不用处理
            // if(this.composing.running){
            //     e.stopPropagation();
            //     e.preventDefault();
            // }

            // const startIndex = Math.ceil(scrollTop / t.charHeight);
            // console.info("startIndex:" + startIndex);
            console.info("terminal。。。mousedown。。。", e);
            switch (e.buttons) {
                case 1:
                    // 鼠标左键
                    // 取消全选
                    if(!selection.enable) selection.enable = true;

                    // x = layerX, y = layerY
                    let x = e.clientX - cursorViewRect.left,
                        y = e.clientY - cursorViewRect.top;
                    // 计算offset。
                    let offsetTop = t.getOffsetTop();

                    // y += scrollTop;

                    if(e.shiftKey){
                        // 按了shift键
                        // 怎么判断是需要设置起点还是终点？
                        // 参考MacOS系统的终端
                        // 当比锚点小的设置为锚点，当比焦点大的设置为焦点。
                        // 当点击的区域小于等于起点和终点相减的1/2的时候，设置为锚点，大于则设置为焦点。
                        // 每一行的高度，CanvasRenderer.height
                        // let height = t.renderer.height;
                        // let realY = Math.floor(y * 2 / height) * height;
                        // let realAnchorY = Math.floor(selection.anchorPoint.y * 2 / height) * height;
                        // let realFocusY = Math.floor(selection.focusPoint.y * 2 / height) * height;
                        //
                        // if(x < selection.anchorPoint.x || realY < realAnchorY){
                        //     // 小于锚点
                        //     selection.start(x, y);
                        // } else if(x > selection.focusPoint.x || y > realFocusY){
                        //     // 大于焦点
                        //     selection.stop(x, y);
                        // } else {
                        //     //
                        //     let vectorX = Math.abs(selection.focusPoint.x - selection.anchorPoint.x) / 2;
                        //     let vectorY = Math.abs(selection.focusPoint.y - selection.anchorPoint.y) / 2;
                        //     if(x < vectorX && y < vectorY){
                        //         // 落在锚点区域
                        //         selection.start(x, y);
                        //     } else if(x > vectorX && y > vectorY){
                        //         selection.stop(x, y);
                        //     }
                        // }

                        selection.stop(calcPointX(x), calcPointY(y), offsetTop);
                        if(t.selectionRenderer) t.selectionRenderer.select(selection);

                    } else {

                        // 取消之前选中区域
                        if(t.selectionRenderer) t.selectionRenderer.clearSelected(selection);

                        if(selection.selectAll){
                            // 之前是全选。
                            selection.selectAll = false;
                            // 因为执行全选的时候，不会对底部的textView进行渲染，所有取消全选的时候，需要重新渲染textView视图。
                            if(t.textRenderer) t.textRenderer.flushLines(t.textRenderer.getDisplayBuffer(), false);
                        }

                        console.info("offsetTop:" + offsetTop);
                        // 设置锚点
                        selection.start(calcPointX(x), calcPointY(y), offsetTop);

                        // 三击处理，当用户三击的时候，说明需要选中一整行。
                        const now = new Date().getTime();
                        switch (clickTime.length) {
                            case 1:
                                // 第二次点击
                                // 如果现在时间和上次的时间超过500毫秒的话，重置为第一次点击
                                if((now - clickTime[0]) < 500) {
                                    clickPoints.push(new SelectionPoint(x, y));

                                    if (CommonUtils.isSamePoint(clickPoints[0], clickPoints[1])) {
                                        // 两个点相同。
                                        console.info("双击。。。。");
                                        console.info(clickPoints);
                                        // selection.stop(calcPointX(x), calcPointY(y));
                                        selection.stop(calcPointX(x), calcPointY(y), offsetTop);

                                        if(t.selectionRenderer) t.selectionRenderer.selectBlock(selection);
                                        clickTime.push(now);

                                        break;

                                        // } else {
                                        // 点击的两个点不同的话，视为单击
                                        // clickTime = [now];
                                        // clickPoints = [new SelectionPoint(x, y)];
                                    }
                                }
                                // } else {
                                    // 超过双击的时间
                                    clickTime = [now];
                                    clickPoints = [new SelectionPoint(x, y)];
                                // }
                                break;
                            case 2:
                                // 第三次点击
                                if((now - clickTime[1]) < 500
                                    && (clickTime[1] - clickTime[0]) < 500){
                                    clickPoints.push(new SelectionPoint(x, y));

                                    // 判断三个点是否相同，如果不同的话，视为单击
                                    if(CommonUtils.isSamePoint(clickPoints[0], clickPoints[1])
                                        && CommonUtils.isSamePoint(clickPoints[1], clickPoints[2])){
                                        //
                                        console.info("三击。。。。");
                                        console.info(clickPoints);
                                        selection.stop(calcPointX(x), calcPointY(y), offsetTop);
                                        if(t.selectionRenderer) t.selectionRenderer.selectLine(selection);

                                        break;
                                    // } else {
                                    //     // 点击的两个点不同的话，视为单击
                                    }

                                }
                                // 超过三击的时间
                                clickTime = [now];
                                clickPoints = [new SelectionPoint(x, y)];
                                break;
                            default:
                                // 重置为第一次点击
                                clickTime = [now];
                                clickPoints = [new SelectionPoint(x, y)];
                        }

                    }
                    console.info(e);
                    break;

                case 2:
                    // 鼠标右键
                    selection.enable = false;
                    break;
            }
        });

        container.addEventListener("mousemove", (e) => {

            // https://developer.mozilla.org/zh-CN/docs/Web/API/MouseEvent/buttons
            if(e.buttons == 0) return;

            switch (e.buttons) {
                case 1:
                    // 鼠标左键
                    if(t.renderType == RenderType.CANVAS
                        && selection.enable){

                        // const scrollTop = t.scrollView.scrollTop;

                        // x = layerX, y = layerY
                        let x = e.clientX - cursorViewRect.left,
                            y = e.clientY - cursorViewRect.top;
                        selection.stop(calcPointX(x), calcPointY(y));
                        if(t.selectionRenderer) t.selectionRenderer.select(selection);
                    }
                    break;
                case 2:
                    // 鼠标右键
                    break;
                case 4:
                    // 鼠标滚轮或者是中键
                    break;
                case 8:
                    // 第四按键 (通常是“浏览器后退”按键)
                    break;
                case 16:
                    // 第五按键 (通常是“浏览器前进”)
                    break;
            }
        });

        // 滚动事件
        let pending_flush_buf: LineBuffer, refresh: boolean, is_draw_cursor: boolean;
        t.scrollView.addEventListener("scroll", (e) => {

            // const t1 = new Date().getTime();

            if(t.textRenderer && t.textRenderer.hitFlushLines()){
                console.info("命中缓存。。。");
                return;
            }

            console.info(e);

            if(t.textRenderer)
                pending_flush_buf = t.textRenderer.getDisplayBuffer();
            refresh = false;
            is_draw_cursor = true;

            // 位置没有改变过的话，不用重新渲染。
            // 如果所有行都是缓冲区的行的话，就渲染光标、
            for(let i = 0, len = pending_flush_buf.lines.length; i < len; i++){
                if(!refresh && pending_flush_buf.lines[i] != t.bufferSet.activeBuffer.display_buffer.lines[i]){
                    refresh = true;
                }
                if(is_draw_cursor && t.bufferSet.activeBuffer.change_buffer.lines[i] != pending_flush_buf.lines[i]){
                    is_draw_cursor = false;
                }

                if(refresh && !is_draw_cursor){
                    break;
                }
            }

            t.cursor.show = is_draw_cursor;
            if(refresh) {
                if(t.textRenderer)
                    t.textRenderer.flushLines(pending_flush_buf, true);
            }
            else{
                if(t.cursor.show){
                    if(t.cursorRenderer) t.cursorRenderer.drawCursor();
                }
            }
            // console.info("滚动执行时间：" + (new Date().getTime() - t1))

        });

    }

    // paste(data: string, clipboard: string, terminal: Terminal) {
    //     if(!!data && t.transceiver){
    //
    //         if(!(t.parser.applicationKeypad
    //             || t.esParser.applicationCursorKeys
    //             || t.bufferSet.isAlt)){
    //             // 这三种情况不记录日志
    //             if(data === "\x0d"){
    //                 // 回车新增一行
    //                 // t.eventLog.append("[Enter]");
    //                 t.eventLog.add();
    //             } else {
    //                 t.eventLog.append(data);
    //             }
    //
    //         }
    //
    //         t.transceiver.send(JSON.stringify({
    //             "cmd": data
    //         }));
    //     } else if(!t.transceiver || !t.transceiver.connected){
    //         // 没有连接到终端。
    //         console.info("clipboard.keySym:" + data);
    //
    //         switch (data) {
    //             case "\x0d":
    //                 t.echo( "\r\n" + t.prompt);
    //                 break;
    //             case "\x7f":
    //                 if(t.bufferSet.activeBuffer.x >= t.prompt.length){
    //                     t.echo("\x08\x1b[P");
    //                 } else {
    //                     t.echo("\x07");
    //                 }
    //                 break;
    //             case "\x1b[A":
    //             case "\x1b[B":
    //                 t.echo("\x07");
    //                 break;
    //             default:
    //                 t.echo(data);
    //         }
    //
    //     }
    // }

    sendMessage(t: Terminal, data: string){
        if(data.length > 0){
            let presentation = JSON.stringify({
                cmd: data
            });

            console.info("发送的内容：" + presentation);
            t.transceiver.send(presentation);
        }

        // t.sshWorker.postMessage({
        //     "type": "put",
        //     "data": data
        // })
    }
}