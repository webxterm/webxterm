/**
 * 事件处理器
 */
import {Keyboard} from "./input/Keyboard";
import {Terminal} from "./Terminal";
import {CommonUtils} from "./common/CommonUtils";
import {Styles} from "./Styles";

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
    listen(terminal: Terminal) {

        const defaultOption: object = { preventScroll: true };
        let focusTarget = FocusTarget.UNDEFINED;
        let container = terminal.container;
        let clipboard = terminal.clipboard;

        // 注册容器点击事件
        container.addEventListener("click", (e: Event) => {
            console.info(e);
            this.quickSelectAll = false;
            if (this.getSelection().length === 0) {
                clipboard.focus(defaultOption);
            }
        });

        container.addEventListener("paste", (e: ClipboardEvent) => {
            console.info(e);
            clipboard.focus();
            if(e.clipboardData){
                this.paste(e.clipboardData.getData('text'), 'clipboard2', terminal);
            }

        });

        container.addEventListener("mousedown", (e: MouseEvent) => {
            // console.info(e);

            switch (e.button) {
                case 0:
                    // 左键按下
                    console.info('左键按下');
                    focusTarget = FocusTarget.CONTAINER;

                    // 终端获取焦点
                    clipboard.focus(defaultOption);

                    return;
                case 1:
                    // 滚轮（中键）按下
                    e.preventDefault();
                    this.paste(this.selectionContent, 'mouse(wheel|middle)', terminal);
                    clipboard.focus();

                    break;
                case 2:
                    // 右键
                    // 如果全选的话，默认事件
                    if(this.quickSelectAll){
                        break;
                    }

                    // 如果光标不在选中区域的话，可以粘贴
                    if (!this.isFocusSelectionRanges(e)) {
                        console.info('isFocusSelectionRanges => false');
                        console.info(e.target);

                        // 获取右键光标的位置
                        // ev.target instanceof this.terminal.container:
                        // => 光标落在外部容器中
                        // ev.target instanceof this.terminal.presentationEl:
                        // => 光标落在presentationEl中
                        // ev.target instanceof div.terminal-row:
                        // => 光标落在某一行中

                        let target: HTMLElement = <HTMLElement> e.target
                            , x = e.pageX
                            , y = 0
                            , h = terminal.charHeight;

                        if (target === terminal.container) {
                            console.info('光标落在容器中....');
                            y = e.pageY - (e.pageY % terminal.charHeight);
                        } else if (target === terminal.presentation) {
                            // 相当于光标落在最后一行数据行中。
                            y = target.offsetTop;
                            h = target.getBoundingClientRect().height;
                            console.info('光标落在撰写栏中....');
                        } else if (CommonUtils.hasClass(target, 'viewport-row')) {
                            console.info('光标落在某一行中....');
                            y = target.offsetTop;
                        } else {
                            // 光标落在其他地方的话，不处理。。。
                            break;
                        }

                        Styles.add(".clipboard", {
                            position: "absolute",
                            left: (x - terminal.charWidth / 2) + "px",
                            top: y + "px",
                            height: h + "px",
                            width: (target.getBoundingClientRect().width - x) + "px"
                        }, terminal.instanceId);

                        setTimeout(() => {

                            Styles.add(".clipboard", {
                                position: "",
                                left: "",
                                top: "",
                                height: "",
                                width: ""
                            }, terminal.instanceId);

                        }, 100);
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


        container.addEventListener('mouseup', () => {

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

        clipboard.addEventListener('keydown', (e:KeyboardEvent) => {

            console.info(e);
            this.quickSelectAll = false;

            // 不用取消默认行为。
            if (e.metaKey) {
                let key = e.key.toLowerCase();
                if ("cv".indexOf(key) !== -1) {
                    // MacOS: meta+c(复制), meta+v(粘贴)
                    return;
                } else if('a' === key){
                    // MacOS: meta+a(全选)
                    this.quickSelectAll = true;
                    // let sel = window.getSelection();
                    // sel.selectAllChildren(this.terminal.outputEl);
                    clipboard.blur();
                    return;
                }
            }

            // 阻止默认操作。
            // 如果不取消默认操作的话，tab等按键默认会跳出终端内。
            e.preventDefault();
            // 禁止冒泡
            e.stopPropagation();

            let keySym = this.keyboard.getKeySym(e,
                terminal.parser.esParser.applicationCursorKeys,
                terminal.parser.applicationKeypad);

            this.paste(keySym, "key", terminal);

        });


        clipboard.addEventListener("contextmenu", () => {
            clipboard.focus();
        });

        let compositionElement: HTMLSpanElement, compositionBlinkingTimer: number = 0;

        clipboard.addEventListener("compositionstart", (e) => {
            if(e instanceof CompositionEvent) {
                // this.composing.update = e.data;
                // this.composing.done = false;
                // this.composing.running = true;
                // console.info(this.composing);

                // 显示联想输入
                compositionElement = document.createElement("span");
                compositionElement.className = "composition";
                compositionElement.innerHTML = e.data;
                let currentElement = terminal.cursor.currentElement;
                if(currentElement && currentElement.parentElement){
                    currentElement.parentElement.insertBefore(compositionElement, currentElement);
                }
                // 隐藏当前的光标
                terminal.hideCursor();
            }
        });

        // 联想输入更新
        clipboard.addEventListener('compositionupdate', (e) => {
            if(e instanceof CompositionEvent) {
                // this.composing.update = e.data;
                // console.info(this.composing);
                // this.terminal.echoComposition(this.composing);
                if(compositionElement){
                    compositionElement.innerHTML = e.data;

                    CommonUtils.addClass(compositionElement, "running");
                    if(!!compositionBlinkingTimer){
                        return;
                    }
                    compositionBlinkingTimer = setTimeout(() => {
                        CommonUtils.removeClass(compositionElement, "running");
                        clearTimeout(compositionBlinkingTimer);
                        compositionBlinkingTimer = 0;
                    }, 1200);
                }
            }
        });

        // 联想输入结束
        clipboard.addEventListener('compositionend', (e) => {
            if(e instanceof CompositionEvent){
                // this.composing.update = "";
                // this.composing.done = true;
                // this.composing.running = false;
                // this.composing.end = e.data;
                // console.info(this.composing);
                // clipboard.value = '';
                // this.terminal.echoComposition(this.composing);
                if(compositionElement){

                    compositionElement.innerHTML = e.data;

                    // 发送内容给后台
                    this.paste(e.data, "composition", terminal);

                    compositionElement.remove();

                    terminal.showCursor();
                }
            }
        });

        container.addEventListener('scroll', (e) => {
            // 判断是否滚动到底部。
            // 如果没有滚动到底部，输出内容的时候，也无需滚动到底部。
            let target = <HTMLElement> e.target;
            terminal.scrollToBottom = target.scrollTop + target.getBoundingClientRect().height + 15 >= target.scrollHeight;
        });

        let resizingTimer: number = 0, blurTimer: number = 0;

        clipboard.addEventListener('focus', (e) => {

            // 如果当前是在失去焦点的时间，则不处理失去焦点的动作。
            if (blurTimer) {
                clearTimeout(blurTimer);
                blurTimer = 0;
            }

            console.info('获取焦点');
            e.stopPropagation();
            terminal.focus();
            clipboard.value = '';
            focusTarget = FocusTarget.CLIPBOARD;
        });

        clipboard.focus(defaultOption);

        clipboard.addEventListener('blur', (e) => {
            // 如果100ms，没有focus的话，就获取焦点。
            // 否则，不处理失去焦点
            blurTimer = setTimeout(() => {

                console.info('失去焦点');
                e.stopPropagation();
                if(!this.quickSelectAll && focusTarget !== FocusTarget.CONTAINER){
                    terminal.blur();
                }

                if (focusTarget === FocusTarget.CLIPBOARD) {
                    focusTarget = FocusTarget.UNDEFINED;
                }

                clearTimeout(blurTimer);
                blurTimer = 0;

            }, 100);



        });

        window.addEventListener('blur', () => {
            focusTarget = FocusTarget.UNDEFINED;
            terminal.blur();
        });

        // 窗口大小改变
        window.onresize = () => {
            if (!!resizingTimer) {
                clearTimeout(resizingTimer);
                resizingTimer = 0;
            }
            resizingTimer = setTimeout(() => {
                if(terminal.eventMap["resize"])
                    terminal.eventMap["resize"]();

                terminal.resizeWindow();

                clearTimeout(resizingTimer);
                resizingTimer = 0;
            }, 100);
        };

    }

    paste(data: string, clipboard: string, terminal: Terminal) {
        if(!!data && terminal.transceiver){
            terminal.transceiver.send(JSON.stringify({
                "cmd": data
            }));
        }
    }
}