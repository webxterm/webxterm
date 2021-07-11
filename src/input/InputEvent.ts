import {Composition} from "./Composition";
import {Terminal} from "../Terminal";
import {Keyboard} from "./Keyboard";
import {Buffer} from "../buffer/Buffer";
import {ATTR_MODE_UNDERLINE, DataBlockAttribute} from "../buffer/DataBlockAttribute";
import {CanvasSelectionSelectType} from "../selection/CanvasSelectionSelectType";

/**
 * 输入事件
 *
 *
 */
// MAC: safari 的执行顺序：中文：compositionstart -> compositionupdate -> keydown(key:d, keyCode|which:229, code:KeyD, keyIdentifier: U+005A) |-> compositionend
// MAC: safari 的执行顺序：英文：keydown(key:d, keyCode|which:229, code:KeyD, keyIdentifier: U+005A)
// MAC/Windows: firefox 的执行顺序：keydown(key:Process, keyCode|which:229, code:KeyD) -> compositionstart -> compositionupdate |-> compositionend
// MAC: chrome, opera 的执行顺序：keydown(key:d, keyCode|which:229, code:KeyD) -> compositionstart -> compositionupdate |-> compositionend

// IOS: safari 的执行顺序：
// 1、IOS 百度输入法、搜狗输入法、讯飞输入法，系统简体拼音(英文)：keydown(code:Unidentified|KeyD, key: 中文|d, keyCode|which:229, keyIdentifier: Unidentified|U+2792)
// 3、IOS 系统简体拼音(中文)：keydown(code:Unidentified|KeyD, key: ➒|d, keyCode|which:229, keyIdentifier: U+2792) -> compositionstart -> compositionupdate |-> compositionend

// 问题3：
// 外部输入：如Safari不支持搜狗输入法面板中的符号表情，不会触发keydown、和 compositionstart事件


// 英文特殊符号
const symbols: string[] = [];
for (let i = 32, chr; i < 127; i++) {
    chr = String.fromCharCode(i);
    if (48 <= i && i <= 57) {
        // 0 - 9
        continue;
    } else if ((65 <= i && i <= 90) || (97 <= i && i <= 122)) {
        // A-Z a-z
        continue;
    }
    symbols.push(chr);
}

//
export class InputEvent {

    private readonly composing: Composition;
    private readonly processComposing: Composition;
    private readonly target: HTMLTextAreaElement;
    private readonly terminal: Terminal;
    // 键盘输入
    private keyboard: Keyboard = new Keyboard();

    constructor(target: HTMLTextAreaElement, terminal: Terminal) {

        this.target = target;
        this.terminal = terminal;
        this.composing = terminal.composing;
        this.processComposing = terminal.processComposing;  // 代码229的输入方式

        this.processComposing.isProcess = true;
        console.info(this.target);

        // 通过是否有"屏幕度数"来确定是否是PC端
        // https://developer.mozilla.org/en-US/docs/Web/API/Window/orientation
        this.composing.isPC = window.orientation == undefined;

        this.init();
    }

    /**
     * 初始化联想输入的事件
     */
    initCompositionEvents(): InputEvent {

        // 联想输入开始
        this.target.addEventListener("compositionstart", (e) => {

            console.info("compositionstart。。。", e);

            if (e instanceof CompositionEvent) {
                // 输入之前先重置
                this.processComposing.reset();
                this.composing.reset();
                this.composing.events = true;
                this.composing.update = e.data;
                this.composing.running = true;
                this.composing.state = 1;
                console.info(JSON.stringify(this.composing));
                // this.composing.start(this.terminal.bufferSet.activeBuffer.x, this.terminal.bufferSet.absY);
                this.write_change_buffer(this.composing);
            }

        });

        // 联想输入更新
        this.target.addEventListener("compositionupdate", (e) => {

            console.info("compositionupdate。。。", e);

            if (e instanceof CompositionEvent) {
                this.composing.update = e.data;
                this.composing.state = 2;
                console.info(JSON.stringify(this.composing));
                // this.composing.anchorY = this.terminal.bufferSet.activeBuffer.y;
                // this.terminal.renderer.drawComposingLine();
                console.info("this.terminal.bufferSet.activeBuffer.x:" + this.terminal.bufferSet.activeBuffer.x);
                // this.composing.stop(this.terminal.bufferSet.activeBuffer.x, this.terminal.bufferSet.absY);
                this.write_change_buffer(this.composing);
            }

        });

        // 联想输入结束
        this.target.addEventListener("compositionend", (e) => {

            if (e instanceof CompositionEvent) {

                this.composing.update = "";
                this.composing.done = true;
                this.composing.running = false;
                this.composing.end = e.data;
                this.composing.state = 3;

                console.info(e);

                // this.composing.stop(this.terminal.bufferSet.activeBuffer.x, this.terminal.bufferSet.absY);

                // this.composing.anchorY = this.terminal.bufferSet.activeBuffer.y;
                // this.terminal.renderer.drawComposingLine();
                this.write_change_buffer(this.composing);

                console.info(JSON.stringify(this.composing));
                // 发送内容给后台
                // this.paste(e.data, "composition", terminal);
                this.sendMessage(e.data);

                // 重置
                this.composing.reset();
            }

        });

        return this;
    }


    /**
     * 初始化键盘按下的事件
     */
    initKeydownEvent(): InputEvent {

        this.target.addEventListener("keydown", (e) => {

            // @ts-ignore
            console.info("this.target:" + this.target.value);

            if (!this.isPreventDefault(e)) {
                // 不阻止默认
                return;
            }

            console.info(e);

            // 阻止默认操作。
            // 如果不取消默认操作的话，tab等按键默认会跳出终端内。
            e.preventDefault();
            // 禁止冒泡
            e.stopPropagation();

            const key = e.key, isProcess = (e.which === 229 || e.keyCode == 229);

            /// ------------------------------------------------------------------------------------
            /// 桌面浏览器：MAC，Windows，Linux
            /// ------------------------------------------------------------------------------------
            // Safari
            if (this.composing.isPC) {
                if (this.composing.running) {
                    return;
                }
                //
                if ((e as any)['keyIdentifier'] == undefined) {
                    // 非Safari的其他浏览器，如Firefox, Chrome, Opera, ...
                    if (isProcess) return;
                } else {
                    this.composing.isSafari = true;
                    // Safari 浏览器
                    // if ((e.which == 229 || e.keyCode == 229) && e.code == 'Space'){
                    //     // Safari 浏览器 中文输入法使用空格选择第一个首选字符时，选择字符后会再产生一个space的keydown
                    //     return;
                    // }
                }
            }


            // 获取键码
            let keySym = this.keyboard.getKeySym(e, this.terminal.esParser.applicationCursorKeys, this.terminal.parser.applicationKeypad);

            // 考虑手机输入法：百度输入法这些有预选的操作的，比如输入 d a t e 后选择输入法上面的date的时候，会再次出发keydown(key=Backspace)事件，然后再触发keydown(key=date)事件
            /// ------------------------------------------------------------------------------------
            /// 手机浏览器：IOS，Android
            /// 通过判断是否实现了屏幕旋转事件：onorientationchange
            /// ------------------------------------------------------------------------------------
            /// https://developer.mozilla.org/zh-CN/docs/Web/API/KeyboardEvent/code
            if (!this.composing.isPC) {
                if (!this.composing.running) {

                    if ((key.codePointAt(0) || 0x0) > 0xFFFF || /[\u3000-\u303F]/gi.test(key)) {
                        // 四字节字符，如Emoji表情
                        if (this.processComposing.running) {
                            this.processComposing.reset();
                        }
                        this.target.value = "";
                    } else if (e.code == 'Space') {
                        // 遇到特殊字符(中英文适用)取消联想输入
                        if (this.processComposing.running) {
                            this.sendMessage(this.processComposing.update);
                            this.processComposing.reset();
                        }
                        this.target.value = "";
                    } else if (isProcess) {
                        switch (this.processComposing.state) {
                            case 0:
                                this.processComposing.running = true;
                                this.processComposing.events = false;
                                this.processComposing.update = keySym;
                                this.processComposing.state = 1;
                                // this.composing.start(this.terminal.bufferSet.activeBuffer.x, this.terminal.bufferSet.absY);
                                break;
                            case 1:
                                this.processComposing.update = this.processComposing.update + keySym;
                                this.processComposing.state = 2;
                                // this.composing.stop(this.terminal.bufferSet.activeBuffer.x, this.terminal.bufferSet.absY);
                                break;
                            case 2:
                                this.processComposing.update = this.processComposing.update + keySym;
                                console.info(JSON.stringify(this.processComposing));
                                break;
                            case 3:
                                // 结束联想输入，并写将数据发送到服务器。
                                this.processComposing.done = true;
                                this.processComposing.running = false;
                                this.processComposing.update = "";
                                this.processComposing.end = e.key;
                                // this.composing.stop(this.terminal.bufferSet.activeBuffer.x, this.terminal.bufferSet.absY);

                                this.sendMessage(e.key);
                                this.processComposing.reset();
                                return;
                            default:
                                break;
                        }

                        // this.processComposing.anchorY = this.terminal.bufferSet.activeBuffer.y;
                        // this.terminal.renderer.drawComposingLine();
                        this.write_change_buffer(this.composing);

                        console.info(JSON.stringify(this.processComposing))
                        return;
                        // } else if(e.code == 'Backslash'){
                        // https://developer.mozilla.org/zh-CN/docs/Web/API/KeyboardEvent/code

                    } else if (e.code == 'Backspace') {
                        if (this.processComposing.running) {
                            // 这个步骤是手机输入法，清掉之前联想输入的字符，重新通过keydown事件e.key输入已选定的字符。
                            // 因此设定状态为结束联想输入。
                            this.processComposing.reset();

                            this.processComposing.state = 3;
                            this.processComposing.isProcess = true;

                            // this.composing.stop(this.terminal.bufferSet.activeBuffer.x, this.terminal.bufferSet.absY);

                            // 清掉之前的联想输入字符
                            // this.processComposing.anchorY = this.terminal.bufferSet.activeBuffer.y;
                            // this.terminal.renderer.restoreDrawLine();
                            this.write_change_buffer(this.composing);

                            return;
                        }

                        console.info(JSON.stringify(this.processComposing))

                    } else if (e.code == 'Enter') {
                        if (this.processComposing.running) {
                            // 情况2：输入了一定数量的字符，然后按了"换行"/回车键，keySym为\r，this.processComposing.update为前面输入的内容
                            this.sendMessage(this.processComposing.update + keySym);
                            this.processComposing.reset();
                            return;
                        }

                        this.target.value = "";
                        console.info(JSON.stringify(this.processComposing))
                    }
                } else {
                    // 手机浏览器，使用了compositionstart,compositionupdate,compositionend。
                    this.processComposing.reset();
                    return;
                }

            }

            this.sendMessage(keySym);

            // 如果还没有满屏的话，不用滚动了
            // if(this.terminal.bufferSet.activeBuffer.currentLineNum >= this.terminal.rows
            //     && !this.terminal.enableScrollToBottom){
            //     this.terminal.enableScrollToBottom = true;
            // }


        });

        return this;
    }

    /**
     * 是否阻止默认行为
     */
    private isPreventDefault(e: KeyboardEvent): boolean {

        if (this.composing.running) {
            return false;
        }

        if (e.metaKey) {
            let key = e.key.toLowerCase();
            if (key === "meta") {
                return false;
            }
            if ("cv".indexOf(key) !== -1) {
                // MacOS: meta+c(复制), meta+v(粘贴)
                return false;
            } else if ('a' === key) {
                // MacOS: meta+a(全选)
                // if(this.terminal.renderType == RenderType.HTML){
                // this.quickSelectAll = true;
                // let sel = window.getSelection();
                // sel.selectAllChildren(this.terminal.outputEl);
                // this.target.blur();
                // } else if(this.terminal.renderType == RenderType.CANVAS){
                // 全选。
                // 全部定位在第一行。
                this.terminal.selection.start(0, 0, 0).stop(-1, 0, 0);
                this.terminal.emitSelect(CanvasSelectionSelectType.ALL);
                return false;
            }
        }

        return true;
    }


    /**
     * 初始化Input事件
     */
    init() {

        // https://developer.mozilla.org/zh-CN/docs/Web/API/InputEvent
        // https://developer.mozilla.org/zh-CN/docs/Web/API/InputEvent/inputType

        // !!! 经测试发现，input事件比compositionstart, compositionupdate, compositionend事件兼容性更好

        this.target.addEventListener("input", (e) => {
            const inputType = (e as any)['inputType'];
            // 联想输入：insertCompositionText(Firefox, Chrome, Opera)，insertFromComposition(Safari)
            // 非联想输入：insertText
            if (inputType == "insertCompositionText" || inputType == "insertFromComposition") {
                // 如果类型是这个的话，就说明已经调用了前面的Composition事件。
                // 联想输入
                console.info((e as any)['data']);
                return;
            } else if (inputType == "insertText") {
                // 需要插入
                const data = (e as any)['data'];
                this.sendMessage(data);
            }

            console.info(e);
            console.info(this.target.value);
        });
    }


    bindMobileSafariEvents(): void {

    }

    bindSafariEvents(): void {

    }

    bindFirefox(): void {

    }


    sendMessage(data: string) {
        if (data && data.length > 0) {
            let presentation = JSON.stringify({
                cmd: data
            });

            // 先取消选择
            this.terminal.emitSelect(CanvasSelectionSelectType.CANCEL);

            console.info("发送的内容：" + presentation);
            this.terminal.transceiver.send(presentation);
        }

        // terminal.sshWorker.postMessage({
        //     "type": "put",
        //     "data": data
        // })
    }

    /**
     * 更新缓冲区
     * @param composing
     */
    private write_change_buffer(composing: Composition) {

        let data;
        if (composing.done) {
            // 清除从 composing.x, composing.y 开始 - 结束的字符。
            // 有可能出现输入多行的情况
            // 如果结束联想输入，显示光标
            this.terminal.cursor.show = true;
            data = composing.end;
        } else {

            // 如果是联想输入，隐藏光标
            if (this.terminal.cursor.show) this.terminal.cursor.show = false;
            data = composing.update;

            // if(composing.state == 1){
            //     // 联想输入开始
            //     composing.y = this.terminal.bufferSet.activeBuffer.change_buffer.line_ids[this.terminal.parser.y - 1];
            //     composing.x = this.terminal.parser.x;
            // }

        }

        // if(this.composing.state == 1){
        //     // 将当前光标行保存到undo_buffer中
        //     this.terminal.bufferSet.activeBuffer.copy_change_buffer_to_undo_buffer(this.terminal.parser.y - 1);
        // } else {
        //     this.rollback_change_buffer();
        // }
        // 创建一个lineBuffer;
        this.flush_composing_display_buffer(data);

        // console.info(display_buffer);
        //
        // if(this.terminal.textRenderer)
        //     this.terminal.textRenderer.flushLines(display_buffer , false);
        //
        // console.info("显示的data:" + data);

        // this.terminal.echo(data);

    }

    /**
     * 获取联想输入缓冲区
     */
    private flush_composing_display_buffer(data: string) {

        let display_buffer = new Buffer(0);
        let change_buffer = this.terminal.bufferSet.activeBuffer.change_buffer;
        // 复制行
        for (let y = 0; y < this.terminal.rows; y++) {
            display_buffer.copyLineFrom(change_buffer, y);
        }

        if (data.length == 0) {
            return display_buffer;
        }

        // 将联想输入的内容更新到缓冲区中
        const text = Array.from(data), len = text.length;
        let y = this.terminal.parser.y
            , x = this.terminal.parser.x
            , self = this;
        const attr = new DataBlockAttribute();
        attr.underline = ATTR_MODE_UNDERLINE;

        /**
         * 更新缓冲区
         * @param s
         * @param charWidth 字符宽度
         */
        function update(s: string, charWidth: number = 1) {

            // 当行内容超过指定的数量的时候，需要再次换行。
            if (x > self.terminal.columns) {
                if (y == self.terminal.bufferSet.activeBuffer.scrollBottom) {
                    // 最后一行
                    display_buffer.removeLine(0, 1);
                    display_buffer.appendLine(self.terminal.columns, 1);
                } else {
                    y++;
                }
                // 光标重置
                x = 1;
            }

            display_buffer.replace(y - 1, x - 1, charWidth, attr, s);
            if (charWidth > 1) {
                display_buffer.replace(y - 1, x, 0, attr, "");
            }

            x += charWidth;
        }

        for (let i = 0, s; i < len; i++) {
            s = text[i];

            // ascii字符
            const asciiStandardCode: number | undefined = s.codePointAt(0);
            if (asciiStandardCode && 32 <= asciiStandardCode && asciiStandardCode < 127) {
                if (s.codePointAt(1) == undefined) {
                    // 考虑emoji
                    update(s, 1);
                }
            } else if (/[\u4E00-\u9FA5]|[\uFE30-\uFFA0]|[\u3000-\u303F]|[\u2E80-\u2EFF]/gi.test(s)) {
                // 中文字符
                // @Parser.handleDoubleChars
                update(s, 2);
            }
        }


        if (this.terminal.textRenderer) {
            this.terminal.textRenderer.flushLines(display_buffer, false);
        }

        if (this.terminal.cursorRenderer) {
            this.terminal.cursorRenderer.clearCursor();
            this.terminal.cursorRenderer.drawComposingCursor(x - 1, y);
        }
    }


}