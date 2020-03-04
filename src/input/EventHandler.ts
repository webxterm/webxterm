/**
 * 事件处理器
 */
import {Keyboard} from "./Keyboard";
import {Terminal} from "../Terminal";
import {CommonUtils} from "../common/CommonUtils";
import {Styles} from "../Styles";
import {Composition} from "./Composition";

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
    private composing: Composition = new Composition();

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

        // container.addEventListener("keydown", (e: KeyboardEvent) => {
        //     console.info('container。。。。。', e);
        // });

        document.addEventListener("keydown", (e: KeyboardEvent) => {
            console.info(e);
            // 修饰键不处理。
            if(e.key === "Alt"
                || e.key === "Control"
                || e.key === "Shift"
                || e.metaKey
                || e.altKey){
                return;
            }

            let keySym = this.keyboard.getKeySym(e,
                terminal.esParser.applicationCursorKeys,
                terminal.parser.applicationKeypad);

            this.paste(keySym, "key", terminal);

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

            // 手机输入法。。。。
            if (e.which === 229 || e.keyCode == 229) {
                // "Process": 229,
                // 手机端 e.which
                // d => 229
                // a => 229
                // t => 229
                // e => 229

                // date => \x08date
                // this.composition.push(key);
                //
                // return key;
                const key = e.key;


                if (/[\u4E00-\u9FA5]|[\uFE30-\uFFA0]/gi.test(key)) {
                    // 中文正常处理。。
                } else {

                    switch (this.composing.state) {
                        case 0:
                            this.composing.reset();
                            this.composing.update = key;
                            this.composing.state = 1;
                            this.composing.running = true;

                            // 显示联想输入
                            compositionElement = document.createElement("span");
                            compositionElement.className = "composition2";
                            compositionElement.innerHTML = this.composing.update;
                            let currentElement = terminal.cursor.currentElement;
                            if(currentElement && currentElement.parentElement){
                                currentElement.parentElement.insertBefore(compositionElement, currentElement);
                            }

                            break;
                        case 1:
                            // 正在输入
                            this.composing.state = 2;
                        case 2:
                            this.composing.update = this.composing.update + key;
                            compositionElement.innerHTML = this.composing.update;
                            break;
                        case 3:
                            this.composing.end = key;
                            compositionElement.innerHTML = this.composing.end;

                            // 发送内容给后台
                            this.paste(this.composing.end, "composition", terminal);

                            this.composing.reset();
                            compositionElement.remove();

                            break;
                    }

                    console.info(JSON.stringify(this.composing));

                    return;
                }

            } else if(!this.composing.events && this.composing.running){

                // 不是事件产生，并且正在输入
                if(e.key == "Backspace"){
                    // 回退键
                    this.composing.running = false;
                    this.composing.update = "";
                    this.composing.done = true;
                    this.composing.state = 3;

                } else if(e.key == "Enter"){
                    // 回车键
                    this.composing.end = this.composing.update;
                    compositionElement.innerHTML = this.composing.end;

                    this.composing.running = false;
                    this.composing.update = "";
                    this.composing.done = true;
                    this.composing.state = 3;

                    // 发送内容给后台
                    this.paste(this.composing.end, "composition", terminal);

                    this.composing.reset();
                    compositionElement.remove();
                }
                return;
            }


            let keySym = this.keyboard.getKeySym(e,
                terminal.esParser.applicationCursorKeys,
                terminal.parser.applicationKeypad);

            this.paste(keySym, "key", terminal);

            // 如果还没有满屏的话，不用滚动了
            if(terminal.bufferSet.activeBuffer.currentLineNum > terminal.rows
                && !terminal.enableScrollToBottom){
                terminal.enableScrollToBottom = true;
            }

        });


        clipboard.addEventListener("contextmenu", () => {
            clipboard.focus();
        });

        let compositionElement: HTMLSpanElement, compositionBlinkingTimer: number = 0;

        clipboard.addEventListener("compositionstart", (e) => {
            if(e instanceof CompositionEvent) {
                // 输入之前先重置
                this.composing.reset();
                this.composing.events = true;
                this.composing.update = e.data;
                this.composing.running = true;
                this.composing.state = 1;
                console.info(JSON.stringify(this.composing));

                // 显示联想输入
                compositionElement = document.createElement("span");
                compositionElement.className = "composition";
                compositionElement.innerHTML = this.composing.update;
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
                this.composing.update = e.data;
                this.composing.state = 2;
                console.info(JSON.stringify(this.composing));

                if(compositionElement){
                    compositionElement.innerHTML = this.composing.update;

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

                this.composing.update = "";
                this.composing.done = true;
                this.composing.running = false;
                this.composing.end = e.data;
                this.composing.state = 3;

                console.info(JSON.stringify(this.composing));

                if(compositionElement){

                    compositionElement.innerHTML = this.composing.end;

                    // 发送内容给后台
                    this.paste(e.data, "composition", terminal);

                    // 重置
                    this.composing.reset();

                    compositionElement.remove();

                    terminal.showCursor();
                }
            }
        });

        container.addEventListener('scroll', (e) => {
            // 判断是否滚动到底部。
            // 如果没有滚动到底部，输出内容的时候，也无需滚动到底部。
            let target = <HTMLElement> e.target;
            terminal.enableScrollToBottom = target.scrollTop + target.getBoundingClientRect().height + 15 >= target.scrollHeight;
        });

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

            terminal.focus();
            clipboard.value = '';
            focusTarget = FocusTarget.CLIPBOARD;
        });

        clipboard.focus(defaultOption);

        // clipboard.addEventListener('blur', (e) => {
        //     // 如果100ms，没有focus的话，就获取焦点。
        //     // 否则，不处理失去焦点
        //     blurTimer = setTimeout(() => {
        //
        //         console.info('失去焦点');
        //         // terminal.echo("失去焦点\r\n");
        //         console.info(window.innerHeight);
        //         e.stopPropagation();
        //
        //         if(!this.quickSelectAll
        //             && focusTarget !== FocusTarget.CONTAINER
        //             // && document.activeElement !== document.body  // 这个条件会取消点击容器外面失去焦点的功能。
        //             // 如果不加这个功能，当多次点击选中一行的时候，body会获取焦点，终端会失去焦点。
        //         ){
        //             terminal.blur();
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


        /* js 监听ios手机键盘弹起和收起的事件 */
        document.body.addEventListener('focusin', () => {  //软键盘弹起事件
            console.log("键盘弹起, container.offsetTop:", clipboard.offsetTop, clipboard.scrollTop, clipboard.getBoundingClientRect());
        });
        document.body.addEventListener('focusout', () => { //软键盘关闭事件
            console.log("键盘收起, container.offsetTop:", clipboard.offsetTop, clipboard.scrollTop, clipboard.getBoundingClientRect());
        });


    }

    paste(data: string, clipboard: string, terminal: Terminal) {
        if(!!data && terminal.transceiver){

            if(!(terminal.parser.applicationKeypad
                || terminal.esParser.applicationCursorKeys
                || terminal.bufferSet.isAlt)){
                // 这三种情况不记录日志
                if(data === "\x0d"){
                    // 回车新增一行
                    // terminal.eventLog.append("[Enter]");
                    terminal.eventLog.add();
                } else {
                    terminal.eventLog.append(data);
                }

            }

            terminal.transceiver.send(JSON.stringify({
                "cmd": data
            }));
        }
    }
}