/**
 * 事件处理器
 */
import {Composition} from "./Composition";
import {Keyboard} from "./input/Keyboard";
import {FocusTarget, Terminal} from "./Terminal";
import {CommonUtils} from "./common/CommonUtils";
import {Styles} from "./Styles";

export class EventHandler {

    // 联想输入
    private composing: Composition = new Composition();
    // 键盘输入
    private keyboard: Keyboard = new Keyboard();

    // 选中的内容
    private selectionContent: string = "";

    // 光标选中范围
    private selectionRanges: Range[] = [];

    // 按快捷键全选。
    private quickSelectAll: boolean = false;

    private terminal: Terminal;

    private styles: Styles = Styles.getStyles();

    constructor(terminal: Terminal) {
        this.terminal = terminal;
    }

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
    public listen(): void {

        const defaultOption: object = { preventScroll: true };

        // 注册容器点击事件
        this.container.addEventListener("click", (e: Event) => {
            this.quickSelectAll = false;
            console.info(e);
            console.info(this.getSelection());
            if (this.getSelection().length === 0) {
                this.clipboard.focus(defaultOption);
            }
        });

        this.container.addEventListener("paste", (e: ClipboardEvent) => {
            console.info(e);
            this.clipboard.focus();
            if(e.clipboardData){
                this.paste(e.clipboardData.getData('text'), 'clipboard2');
            }

        });

        this.container.addEventListener("mousedown", (e: MouseEvent) => {
            console.info(e);

            switch (e.button) {
                case 0:
                    // 左键按下
                    console.info('左键按下');
                    this.terminal.focusTarget = FocusTarget.CONTAINER;

                    // 终端获取焦点
                    this.terminal.focus();

                    return;
                case 1:
                    // 滚轮（中键）按下
                    e.preventDefault();
                    this.paste(this.selectionContent, 'mouse(wheel|middle)');
                    this.terminal.clipboard.focus();

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
                            , h = this.terminal.charHeight;

                        if (target === this.terminal.container) {
                            console.info('光标落在容器中....');
                            y = e.pageY - (e.pageY % this.terminal.charHeight);
                        } else if (target === this.terminal.presentation) {
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

                        this.styles.put(".clipboard", {
                            position: "absolute",
                            left: (x - this.terminal.charWidth / 2) + "px",
                            top: y + "px",
                            height: h + "px",
                            width: (target.getBoundingClientRect().width - x) + "px"
                        }, this.terminal.instanceId);

                        setTimeout(() => {

                            this.styles.put(".clipboard", {
                                position: "",
                                left: "",
                                top: "",
                                height: "",
                                width: ""
                            }, this.terminal.instanceId);

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


        this.container.addEventListener('mouseup', () => {

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

        this.clipboard.addEventListener('keydown', (e:KeyboardEvent) => {

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
                    this.terminal.clipboard.blur();
                    return;
                }
            }

            // 阻止默认操作。
            // 如果不取消默认操作的话，tab等按键默认会跳出终端内。
            e.preventDefault();
            // 禁止冒泡
            e.stopPropagation();

            // let keySym = keyboard.getKeySym(e, this.terminal.applicationMode);
            //
            // if (!!keySym) {

                // if(this.terminal.connected){
                //     this.send(keySym);
                // } else {
                //     // 未连接终端
                //     //
                //     if(keySym === C0.CR){
                //         this.terminal.echo('\r\n');
                //         if(this.terminal.password !== undefined){
                //             // 验证密码
                //             // 解析ssh命令
                //             this.terminal.transceiver.server.password = this.terminal.password;
                //             delete this.terminal.password;
                //
                //             this.terminal.handleSSHConnect();
                //
                //         }
                //         this.terminal.printPrompt();
                //     } else {
                //         this.terminal.print(keySym);
                //     }
                //
                // }
                //
                // if(keySym === C0.LF){
                //     this.terminal.clipboard.value = '';
                // }

                // this.send(keySym);
            //
            // }

        });


        this.clipboard.addEventListener("contextmenu", () => {
            this.clipboard.focus();
        });

        this.clipboard.addEventListener("compositionstart", (e) => {
            if(e instanceof CompositionEvent) {
                this.composing.update = e.data;
                this.composing.done = false;
                this.composing.running = true;
                console.info(this.composing);
                // this.terminal.echoComposition(this.composing);
            }
        });

        // 联想输入更新
        this.clipboard.addEventListener('compositionupdate', (e) => {
            if(e instanceof CompositionEvent) {
                this.composing.update = e.data;
                console.info(this.composing);
                // this.terminal.echoComposition(this.composing);
            }
        });

        // 联想输入结束
        this.clipboard.addEventListener('compositionend', (e) => {
            if(e instanceof CompositionEvent){
                this.composing.update = "";
                this.composing.done = true;
                this.composing.running = false;
                this.composing.end = e.data;
                console.info(this.composing);
                this.clipboard.value = '';
                // this.terminal.echoComposition(this.composing);
            }
        });

    }


    get container(): HTMLDivElement {
        return this.terminal.container;
    }

    get clipboard(): HTMLTextAreaElement {
        return this.terminal.clipboard;
    }

    private paste(data: string, clipboard: string) {
        console.info("paste:" + data);
    }
}