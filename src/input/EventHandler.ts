/**
 * 事件处理器
 */
import {Keyboard} from "./Keyboard";
import {RenderType, Terminal} from "../Terminal";
import {CommonUtils} from "../common/CommonUtils";
import {Styles} from "../Styles";
import {CanvasSelection} from "../selection/CanvasSelection";
import {InputEvent} from "./InputEvent";
import {Buffer} from "../buffer/Buffer";
import {CanvasSelectionPoint} from "../selection/CanvasSelectionPoint";
import {CanvasSelectionSelectType} from "../selection/CanvasSelectionSelectType";

enum FocusTarget {
    UNDEFINED,  // 未定义
    CONTAINER,  // 容器
    CLIPBOARD   // 粘贴板
}

/**
 * 鼠标事件(buttons)的可选值
 */
const MouseEventButtons = {
    NONE: 0,
    PRIMARY: 1,
    SECONDARY: 2,
    AUXILIARY: 4,
    BROWSER_BACK: 8,
    BROWSER_FORWARD: 16
};

export class EventHandler {

    // 键盘输入
    private keyboard: Keyboard = new Keyboard();

    // 选中的内容
    private selectionContent: string = "";

    // 光标选中范围
    private selectionRanges: Range[] = [];

    // 按快捷键全选。
    private quickSelectAll: boolean = false;

    // 是否已经添加了额外的滚动视图
    private _appendExtraScrollView: boolean = false;
    private _extraScrollLayer: HTMLDivElement = document.createElement("div");
    private _extraScrollWrapper: HTMLDivElement = document.createElement("div");

    // 上次点击时间
    private _timeClicks: number[] = [];
    // 每次点击的点
    private _pointClicks: CanvasSelectionPoint[] = [];

    // 正在输入，中文输入法 / 229
    // private composing: Composition = new Composition();

    /**
     * 获取选中的内容
     * 只适用标准浏览器
     */
    private getSelection(): string {
        let sel: Selection | null = window.getSelection();
        if (!sel) throw new Error("window.selection is " + sel);

        for (let i = 0; i < sel.rangeCount; i++) {
            this.selectionRanges[i] = sel.getRangeAt(i);
        }
        return sel.toString();
    }

    /**
     * 光标是否落在选中的范围中
     * @param {MouseEvent} event
     */
    private isFocusSelectionRanges(event: MouseEvent): boolean {
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

        const defaultOption: object = {preventScroll: true};
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
            if (e.clipboardData) {
                let text = e.clipboardData.getData('text');
                // this.paste(text.replace(/\n|\r\n/gi, '\x0d'), 'clipboard2', terminal);
                this.sendMessage(t, text.replace(/\n|\r\n/gi, '\x0d'));
            }

        });

        container.addEventListener("mousedown", (e: MouseEvent) => {
            // console.info(e);
            console.info('container...mousedown....', e);

            const buttons = this.getButtons(e);

            if(buttons == MouseEventButtons.NONE) return;

            // 正在输入，不处理鼠标按压事件、
            // 已被cursorView的事件阻止。
            // if(this.composing.running){
            //     e.preventDefault();
            //     return;
            // }

            switch (buttons) {
                case MouseEventButtons.PRIMARY:
                    // 左键按下
                    // console.info('左键按下');
                    focusTarget = FocusTarget.CONTAINER;

                    // 终端获取焦点
                    clipboard.focus(defaultOption);

                    return;
                case MouseEventButtons.AUXILIARY:
                    // 滚轮（中键）按下
                    e.preventDefault();
                    this.sendMessage(t, this.selectionContent);
                    // this.paste(this.selectionContent, 'mouse(wheel|middle)', terminal);
                    clipboard.focus();

                    break;
                case MouseEventButtons.SECONDARY:
                    // 右键
                    // 如果全选的话，默认事件
                    if (this.quickSelectAll) {
                        break;
                    }

                    if (t.isCanvasMode()) {
                        let target: HTMLElement = <HTMLElement>e.target
                            , x
                            , y = 0
                            , h = t.charHeight;

                        // 使用canvas渲染
                        let layerY = e.clientY - cursorViewRect.top,
                            height = t.charHeight;
                        x = e.clientX - cursorViewRect.left;
                        y = Math.floor(layerY / height) * height + parseInt(t.viewport.style.marginTop);

                        Styles.add(".clipboard", {
                            position: "absolute",
                            "background-color": "red",
                            left: (x - t.charWidth / 2) + "px",
                            top: y + "px",
                            height: h + "px",
                            width: (target.getBoundingClientRect().width - x) + "px"
                        }, t.instanceId);

                        // 还原样式
                        setTimeout(() => {

                            Styles.add(".clipboard", {
                                position: "",
                                "background-color": "",
                                left: "",
                                top: "",
                                height: "",
                                width: ""
                            }, t.instanceId);

                        }, 100);


                    } else if (t.renderType == RenderType.HTML) {

                        // 如果光标不在选中区域的话，可以粘贴
                        // if (!this.isFocusSelectionRanges(e)) {
                        //     console.info('isFocusSelectionRanges => false');
                        //     console.info(e.target);
                        //
                        //     // 获取右键光标的位置
                        //     // ev.target instanceof this.t.container:
                        //     // => 光标落在外部容器中
                        //     // ev.target instanceof this.t.presentationEl:
                        //     // => 光标落在presentationEl中
                        //     // ev.target instanceof div.terminal-row:
                        //     // => 光标落在某一行中
                        //
                        //     let target: HTMLElement = <HTMLElement>e.target
                        //         , x = e.pageX - t.container.getBoundingClientRect().left
                        //         , y = 0
                        //         , h = t.charHeight;
                        //
                        //     if (target === t.container) {
                        //         // console.info('光标落在容器中....');
                        //
                        //         y = e.pageY - (e.pageY % t.charHeight);
                        //     } else if (target === t.presentation) {
                        //         // 相当于光标落在最后一行数据行中。
                        //         y = target.offsetTop;
                        //         h = target.getBoundingClientRect().height;
                        //         // console.info('光标落在撰写栏中....');
                        //     } else if (CommonUtils.hasClass(target, 'viewport-row')) {
                        //         // console.info('光标落在某一行中....');
                        //         y = target.offsetTop;
                        //     } else {
                        //         // 如果落在.viewport-row的某一个span中。
                        //         if (target.nodeName && target.nodeName.toUpperCase() == "SPAN") {
                        //             // span
                        //             if (target.parentElement
                        //                 && CommonUtils.hasClass(target.parentElement, 'viewport-row')) {
                        //                 // console.info('光标落在某一行中....');
                        //                 y = target.offsetTop;
                        //             } else {
                        //                 break;
                        //             }
                        //         } else {
                        //             // 光标落在其他地方的话，不处理。。。
                        //             break;
                        //         }
                        //     }
                        //
                        //     Styles.add(".clipboard", {
                        //         position: "absolute",
                        //         left: (x - t.charWidth / 2) + "px",
                        //         top: y + "px",
                        //         height: h + "px",
                        //         width: (target.getBoundingClientRect().width - x) + "px"
                        //     }, t.instanceId);
                        // }

                    }


                    break;
                case MouseEventButtons.BROWSER_BACK:
                    // 浏览器后退 按钮
                    // Browser Back
                    break;
                case MouseEventButtons.BROWSER_FORWARD:
                    // 浏览器前进 按钮
                    // Browser Forward
                    break;
            }
        });


        container.addEventListener('mouseup', (e) => {
            // console.info('container...mouseup....', e);
            //
            // // console.info(e);
            //
            // // 选中的内容
            // const selectionContent = this.getSelection();
            // if (!!selectionContent) {
            //     this.selectionContent = selectionContent;
            // } else {
            //     // console.info('粘贴板获取焦点...');
            //     // term.clipboard.focus();
            // }
            // selection.enable = false;

        });

        // container.addEventListener("keydown", (e: KeyboardEvent) => {
        //     console.info('container。。。。。', e);
        // });

        document.addEventListener("keydown", (e: KeyboardEvent) => {
            // console.info(e)
            console.info('document...keydown....', e);

            // 修饰键不处理。
            if (e.key === "Alt"
                || e.key === "Control"
                || e.key === "Shift"
                || e.metaKey
                || e.altKey) {
                return;
            }

            let keySym = this.keyboard.getKeySym(e,
                t.esParser.applicationCursorKeys,
                t.parser.applicationKeypad);

            // this.paste(keySym, "key", terminal);

            this.sendMessage(t, keySym);

            clipboard.focus();
        });


        clipboard.addEventListener("contextmenu", () => {
            clipboard.focus();
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
            window.scrollTo(0, 0);

            if (t.isCanvasMode()) {
                setTimeout(() => {
                    if(t.cursorRenderer) t.cursorRenderer.drawCursor();
                });
            } else if (t.renderType === RenderType.HTML) {
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
            if (t.isCanvasMode()) {
                setTimeout(() => {
                    if(t.cursorRenderer) t.cursorRenderer.cursorBlur();
                });
            } else if (t.renderType === RenderType.HTML) {
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
                if (t.eventMap["resize"]) {
                    t.eventMap["resize"]();
                }

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

        // 鼠标按下的事件
        let mouseDownLevel = 0;

        t.scrollArea.addEventListener("mouseup", (e) => {
            // 鼠标事件
            mouseDownLevel = 0;
        });

        t.scrollArea.addEventListener("mousedown", (e) => {
            // 经测试，发现单击后，会出现e.buttons=0(无按键被按下)的情况...
            // https://developer.mozilla.org/zh-CN/docs/Web/API/MouseEvent/MouseEvent
            // 因此当e.buttons=0的时候，需要使用e.which来替换、
            // https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/which
            // 首先使用e.buttons
            const buttons = this.getButtons(e);
            if(MouseEventButtons.NONE == buttons) {
                return;
            }

            // 鼠标事件
            mouseDownLevel = buttons;

            // 如果正在输入的话，不用处理
            // if(this.composing.running){
            //     e.stopPropagation();
            //     e.preventDefault();
            // }

            // const startIndex = Math.ceil(scrollTop / t.charHeight);
            // console.info("startIndex:" + startIndex);
            switch (buttons) {
                case MouseEventButtons.PRIMARY:
                    // 鼠标左键
                    // 取消全选
                    this.responseUserEvent(t, e.clientX, e.clientY, e.shiftKey);
                    break;

                case MouseEventButtons.SECONDARY:
                    // 鼠标右键
                    selection.enable = false;
                    break;

                case MouseEventButtons.AUXILIARY:
                    // 按下滚轮或中间键
                    // console.info("粘贴内容：" + selection.selectedContent);
                    this.sendMessage(t, selection.selectedContent);
                    break;
                case MouseEventButtons.BROWSER_BACK:
                    // 第四按键 (通常是“浏览器后退”按键)
                    break;
                case MouseEventButtons.BROWSER_FORWARD:
                    // 第五按键 (通常是“浏览器前进”)
                    break;
            }
        });

        container.addEventListener("mousemove", (e) => {

            // 判断是否为鼠标按下状态
            if ((mouseDownLevel & e.buttons) == MouseEventButtons.NONE) return;

            // 再次检查鼠标是否按下。如果选择的时候，移出了windows，则无法捕捉。
            console.info(e);

            switch (mouseDownLevel) {
                case MouseEventButtons.PRIMARY:
                    // 鼠标左键
                    if (!(t.isCanvasMode() && selection.enable)) {
                        break;
                    }

                    // x = layerX, y = layerY
                    let x = e.clientX - cursorViewRect.left, y = e.clientY - cursorViewRect.top;
                    const cx = this.calcPointX(x, t), cy = this.calcPointY(y, t), offsetTop = t.measureOffsetTop();
                    selection.stop(cx, cy, offsetTop);

                    // if (t.selectionRenderer) {
                    //     // 设置结束选中的行的ID
                    //     selection.focusId = t.selectionRenderer.getDisplayBufferIdByPoint(selection.focusPoint);
                    //     t.selectionRenderer.select(selection);
                    // }
                    if(e.metaKey){
                        // 列模式选择
                        console.info("列模式选择...");
                        t.selection.columnMode = true;
                    } else {
                        t.selection.columnMode = false;
                    }

                    t.emitSelect(CanvasSelectionSelectType.NORMAL);

                    break;
                case MouseEventButtons.SECONDARY:
                    // 鼠标右键
                    break;
                case MouseEventButtons.AUXILIARY:
                    // 鼠标滚轮或者是中键
                    break;
                case MouseEventButtons.BROWSER_BACK:
                    // 第四按键 (通常是“浏览器后退”按键)
                    break;
                case MouseEventButtons.BROWSER_FORWARD:
                    // 第五按键 (通常是“浏览器前进”)
                    break;
            }
        });



        // 滚动事件
        let displayBuffer: Buffer,              // 显示缓冲区
            topIndex: number,                   // 离顶部的距离 offset index
            end: number,                        // 结束行
            lastTopIndex: number = -1;          // 上次topIndex

        t.scrollView.addEventListener("scroll", (e) => {

            // 正常情况下，如果使用了备用缓冲区的话，scroll的功能需要切换到 备用缓冲区的 方向键向上/方向键向下、
            // if(t.bufferSet.isAlt){
            //     e.preventDefault();
            //     e.stopPropagation();
            //
            //     this.switchExtraScrollView();
            //     return;
            // }

            if(!t.textRenderer){
                return;
            }

            topIndex = t.getOffsetTop();
            if(topIndex == lastTopIndex){
                // offset 相同，无需渲染
                return;
            }
            lastTopIndex = topIndex;

            end = t.bufferSet.activeBuffer.size + topIndex;
            displayBuffer = t.bufferSet.getDisplayBuffer(topIndex, end);
            // 渲染行
            t.textRenderer.flushLines(displayBuffer, true);

            // 渲染光标
            if(!t.cursorRenderer){
                return;
            }
            t.cursorRenderer.drawCursor(displayBuffer);

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

    sendMessage(t: Terminal, data: string) {
        if (data.length > 0) {
            let presentation = JSON.stringify({
                cmd: data
            });

            // 先取消选择
            t.emitSelect(CanvasSelectionSelectType.CANCEL);

            console.info("发送的内容：" + presentation);
            t.transceiver.send(presentation);
        }

        // t.sshWorker.postMessage({
        //     "type": "put",
        //     "data": data
        // })
    }

    /**
     *
     * @param e
     */
    getButtons(e: MouseEvent){
        return e.buttons || [0, 1, 4, 2][e.which];
    }

    // 备用缓冲区滚动事件
    switchExtraScrollView(){
        if(!this._appendExtraScrollView){
            this._appendExtraScrollView = true;

            // 如果滚动区域没有添加的话，则添加
            let fragment = document.createDocumentFragment();
            // 创建一个滚动层
            this._extraScrollWrapper.style.height = this._extraScrollWrapper.style.width = "100px";
            this._extraScrollWrapper.style.overflowY = "scroll";
            this._extraScrollWrapper.style.overflowX = "hidden";
            this._extraScrollWrapper.style.position = "absolute";
            this._extraScrollWrapper.style.left = this._extraScrollWrapper.style.top = "0";
            this._extraScrollWrapper.style.background = "red";
            this._extraScrollWrapper.style.zIndex = '99999999';

            this._extraScrollLayer.style.height = "999999999px";
            this._extraScrollWrapper.appendChild(this._extraScrollLayer);

            for(let i = 0; i < 1000; i++){
                let d1 = document.createElement("div");
                d1.innerHTML = "text:::::" + i;
                this._extraScrollLayer.appendChild(d1);
            }
            fragment.appendChild(this._extraScrollWrapper);
            document.body.appendChild(fragment);
        }

        this._extraScrollWrapper.focus();
        console.info("switchExtraScrollView....");


        this._extraScrollWrapper.addEventListener("scroll", (e) => {
            console.info(e);
        });

    }


    /**
     * 计算在Canvas的X左上角坐标
     * @param layerX
     * @param t
     * @param useRule
     */
    calcPointX(layerX: number, t: Terminal, useRule: boolean = true) {
        if(!t.textRenderer){
            console.error("calcPointX: t.textRenderer is " + t.textRenderer);
            return -1;
        }
        const width = t.textRenderer.measuredTextWidth;
        let x = Math.floor((layerX * t.preferences.canvasSizeMultiple) / width) * width;
        if (useRule) {
            // 取模，如果值大于width/2(字符一半)的话，则不选中当前字符，反之选中当前字符
            const xMod = (layerX * t.preferences.canvasSizeMultiple) % width;
            if((xMod > width / t.preferences.canvasSizeMultiple)){
                x += width;
            }
        }
        return x;
    }

    /**
     * 计算在Canvas的Y左上角坐标 第一个行会返回 0
     * @param layerY
     * @param t
     */
    calcPointY(layerY: number, t: Terminal) {
        if(!t.textRenderer) {
            console.error("calcPointX: t.textRenderer is " + t.textRenderer);
            return -1;
        }
        const height = t.textRenderer.height;
        return Math.floor(layerY * t.preferences.canvasSizeMultiple / height) * height;
    }


    /**
     * 单击、双击时间处理。
     * @param t
     * @param clientX
     * @param clientY
     * @param shiftKey
     */
    responseUserEvent(t: Terminal, clientX: number, clientY: number, shiftKey: boolean) {
        const sel = t.selection;

        if (!sel.enable) {
            sel.enable = true;
        }

        // 第二种渲染方式：Canvas
        // 第一层：cursorView
        // 第一层：link
        // 第二层：selectionView
        // 第三层：textView
        // 因此，只需要捕获第一层的事件。
        let cursorViewRect = t.cursorView.getBoundingClientRect();

        // x = layerX, y = layerY
        let x = clientX - cursorViewRect.left,
            y = clientY - cursorViewRect.top;

        let cx = this.calcPointX(x, t), cy = this.calcPointY(y, t), offsetTop = t.measureOffsetTop();

        if (shiftKey) {
            // 按了shift键
            sel.sticky(cx, cy, offsetTop);
            t.emitSelect(CanvasSelectionSelectType.NORMAL);
        } else {

            // 取消之前已选中的区域
            t.emitSelect(CanvasSelectionSelectType.CANCEL);

            // 设置锚点
            sel.start(cx, cy, offsetTop);

            // 三击处理，当用户三击的时候，说明需要选中一整行。
            const now = new Date().getTime(),
                sp = new CanvasSelectionPoint(x, y, offsetTop);

            switch (this._timeClicks.length) {
                case 1:
                    // 第二次点击
                    // 如果现在时间和上次的时间超过500毫秒的话，重置为第一次点击
                    if ((now - this._timeClicks[0]) < 500) {
                        this._pointClicks.push(sp);
                        if (CommonUtils.isSamePointArray(this._pointClicks)) {
                            // 两个点相同。
                            sel.stop(cx, cy, offsetTop);

                            // 重新计算后的开始和结束点
                            const newX = this.calcPointX(x, t, false);
                            sel.start2(newX, cy, offsetTop).stop2(newX, cy, offsetTop);

                            // 块选择
                            t.emitSelect(CanvasSelectionSelectType.BLOCK);
                            this._timeClicks.push(now);
                            return;
                        }
                    }
                    // 超过双击的时间
                    break;
                case 2:
                    // 第三次点击
                    this._timeClicks.push(now);
                    if (CommonUtils.isValidIntervalArray(this._timeClicks)) {
                        this._pointClicks.push(sp);
                        // 判断三个点是否相同，如果不同的话，视为单击
                        if (CommonUtils.isSamePointArray(this._pointClicks)) {
                            sel.stop(cx, cy, offsetTop);

                            // 重新计算后的结束点
                            sel.stop2(this.calcPointX(x, t, false), cy, offsetTop);

                            t.emitSelect(CanvasSelectionSelectType.LINE);
                            return;
                        }

                    }
                    break;
                default:
                    // 重置为第一次点击
                    break;
            }

            // 重置时间
            this._timeClicks = [ now ];
            this._pointClicks = [ sp ];

        }
    }
}