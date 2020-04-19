/**
 * 偏好设置
 */
import {Logger} from "./common/Logger";
import {CommonUtils} from "./common/CommonUtils";
import {Styles} from "./Styles";
import {Terminal} from "./Terminal";
import {Color} from "./common/Color";
import {Font} from "./font/Font";
import {
    DejaVuSansMono,
    DejaVuSansMonoBold,
    DejaVuSansMonoBoldOblique,
    DejaVuSansMonoOblique
} from "./font/DejaVuSansMono";
import {FreeMono, FreeMonoBold, FreeMonoBoldOblique, FreeMonoOblique} from "./font/FreeMono";
import {
    LiberationMono,
    LiberationMonoBold,
    LiberationMonoBoldItalic,
    LiberationMonoItalic
} from "./font/LiberationMono";
import {UbuntuMono, UbuntuMonoBold, UbuntuMonoBoldItalic, UbuntuMonoItalic} from "./font/UbuntuMono";

export class Preferences {

    // 内置颜色
    public static colorSchemes: { [key: string]: string[] } = {
        "Black on light yellow": ["#000000", "#FFFFDD"],  // color, background
        "Black on white": ["#000000", "#FFFFFF"],
        "Gray on black": ["#AAAAAA", "#000000"],
        "Green on black": ["#00FF00", "#000000"],
        "White on black": ["#FFFFFF", "#000000"],
        "Tango light": ["#2E3436", "#EEEEEC"],
        "Tango dark": ["#D3D7CF", "#2E3436"],
        "Solarized light": ["#657B83", "#FDF6E3"],
        "Solarized dark": ["#839496", "#002B36"],
        "Custom": ["#B1B1B1", "#000000"],
    };

    // 光标轮廓可用值
    public static cursorShapes: string[] = [
        "Block",
        "I-Beam",
        "Wide I-Beam",
        "Underline",
        "Wide Underline"];

    ////////////////// 调色板 ////////////////
    public static paletteColorNames: string[] = [
        "black",
        "red",
        "green",
        "yellow",
        "blue",
        "magenta",
        "cyan",
        "white",
        "bright-black",
        "bright-red",
        "bright-green",
        "bright-yellow",
        "bright-blue",
        "bright-magenta",
        "bright-cyan",
        "bright-white"
    ];

    // 调色板方案列表
    public static paletteSchemes: { [key: string]: string[] } = {
        "Tango": [
            "#2E3436", "#CC0000", "#4E9A06", "#C4A000",
            "#3465A4", "#75507B", "#06989A", "#D3D7CF",
            "#555753", "#EF2929", "#8AE234", "#FCE94F",
            "#729FCF", "#AD7FA8", "#34E2E2", "#EEEEEC"
        ],
        "Linux console": [
            "#000000", "#AA0000", "#00AA00", "#AA5500",
            "#0000AA", "#AA00AA", "#00AAAA", "#AAAAAA",
            "#555555", "#FF5555", "#55FF55", "#FFFF55",
            "#5555FF", "#FF55FF", "#55FFFF", "#FFFFFF"
        ],
        "XTerm": [
            "#000000", "#CD0000", "#00CD00", "#CDCD00",
            "#0000EE", "#CD00CD", "#00CDCD", "#E5E5E5",
            "#7F7F7F", "#FF0000", "#00FF00", "#FFFF00",
            "#5C5CFF", "#FF00FF", "#00FFFF", "#FFFFFF"
        ],
        "Rxvt": [
            "#000000", "#CD0000", "#00CD00", "#CDCD00",
            "#0000CD", "#CD00CD", "#00CDCD", "#FAEBD7",
            "#404040", "#FF0000", "#00FF00", "#FFFF00",
            "#0000FF", "#FF00FF", "#00FFFF", "#FFFFFF"
        ],
        "Solarized": [
            "#073642", "#DC322F", "#859900", "#B58900",
            "#268BD2", "#D33682", "#2AA198", "#EEE8D5",
            "#002B36", "#CB4B16", "#586E75", "#657B83",
            "#839496", "#6C71C4", "#93A1A1", "#FDF6E3"
        ],
        "Custom": [
            "#073642", "#DC322F", "#859900", "#B58900",
            "#268BD2", "#D33682", "#2AA198", "#EEE8D5",
            "#002B36", "#CB4B16", "#586E75", "#657B83",
            "#839496", "#6C71C4", "#93A1A1", "#FDF6E3"
        ]
    };

    // 终端定义类型
    public static terminalTypes: string[] = [
        "ansi",
        "dtterm",
        "nsterm",
        "rxvt",
        "vt52",
        "vt100",
        "vt102",
        "xterm",
        "xterm-16color",
        "xterm-256color"
    ];

    public static defaultFontSize: string = "10pt";

    // 颜色方案
    private _colorScheme: string = "";
    // 前景颜色
    private _color: string = "";
    // 背景颜色
    private _backgroundColor: string = "";
    // 加粗字体颜色
    private _boldColor: string = "";
    // 高亮字体颜色
    private _highlightColor: string = "";
    // 高亮字体背景颜色
    private _highlightBackgroundColor: string = "";
    // 透明度 0 - 1
    private _transparentBackground: number = 0;

    ////////////////// 光标 ////////////////

    // 光标轮廓
    private _cursorShape: string = "";
    // 光标闪烁
    private _cursorBlinking: boolean = false;
    // 光标前景颜色
    private _cursorColor: string = "";
    // 光标背景颜色
    private _cursorBackgroundColor: string = "";
    // 光标颜色跟随colorScheme颜色。
    private _defaultCursorColor: boolean = false;

    ////////////////// 背景 ////////////////
    private _backgroundImage: string = "";
    private _backgroundRepeat: boolean = false;
    private _backgroundSize: string = "";

    ////////////////// 字体 ////////////////
    // 字体
    private _fontFamily: Font = new Font();
    // 字体大小
    private _fontSize: string = "";

    // 以亮色显示粗体文本
    private _showBoldTextInBrightColor: boolean = false;

    // 调色板方案
    private _paletteScheme: string = "";

    ////////////////// 终端 ////////////////
    // 终端类型
    private _terminalType: string = "";

    // 滚动到底部
    private _scrollToBottomOnInput: boolean = false;

    // 可见报警声，改变背景颜色
    private _visualBell: boolean = false;

    // 可见报警声，
    private _visualBellColor: string = "#000";

    // 回滚行数
    private _scrollBack: number = 0;

    // 一个制表符填充多少个字符
    private _tabSize: number = 0;

    // 是否启用心跳机制
    private _enableHeartbeat: boolean = false;

    // 离下一次心跳的秒数
    private _nextHeartbeatSeconds: number = 0;

    // 是否含有滚动条
    private _scrollbar: boolean = false;

    readonly instanceId: string;

    private terminal: Terminal;

    constructor(terminal: Terminal) {
        this.terminal = terminal;
        this.instanceId = terminal.instanceId;
    }

    /**
     * 初始化
     */
    init(): void {

        this.colorScheme = "Custom";
        this.boldColor = "#FF6666";
        this.highlightColor = "#FFFFFF";
        this.highlightBackgroundColor = "#000000";

        this.transparentBackground = 0.5;
        // this.cursorShape = "Block";
        // this.cursorShape = "I-Beam";
        this.cursorShape = "Wide Underline";

        this.cursorColor = "red";
        this.cursorBackgroundColor = "#FF6666";
        this.defaultCursorColor = true;
        this.cursorBlinking = true;

        // this.backgroundImage = "../images/default-background.png";
        this.backgroundRepeat = true;
        this.backgroundSize = "100% 100%";

        this.fontFamily = new FreeMono();
        // this.fontFamily = new DejaVuSansMono();
        this.fontSize = Preferences.defaultFontSize;

        this.showBoldTextInBrightColor = true;
        this.paletteScheme = "Linux console";

        this.scrollToBottomOnInput = true;

        this.visualBell = true;
        this.visualBellColor = "rgba(0,0,0,0.5)";

        // this.terminalType = "vt100";
        this.terminalType = "linux";

        // https://invisible-island.net/xterm/manpage/xterm.html#VT100-Widget-Resources:saveLines
        // saveLines (class SaveLines)
        //                Specifies the number of lines to save beyond the top of the
        //                screen when a scrollbar is turned on.  The default is "1024".
        // max = 9999 lines
        this.scrollBack = 9999;

        // https://en.wikipedia.org/wiki/Tab_key#Tab_characters
        this.tabSize = 8;  // 默认是8

        // 默认启用心跳机制
        this.enableHeartbeat = true;
        // 离下一次心跳的秒数(s)
        this.nextHeartbeatSeconds = 10;
        // 默认含有滚动条
        this.scrollbar = true;
    }

    getFonts(): Font[] {
        return [
            new DejaVuSansMono(),
            new DejaVuSansMonoOblique(),
            new DejaVuSansMonoBold(),
            new DejaVuSansMonoBoldOblique(),

            new FreeMono(),
            new FreeMonoOblique(),
            new FreeMonoBold(),
            new FreeMonoBoldOblique(),

            new LiberationMono(),
            new LiberationMonoItalic(),
            new LiberationMonoBold(),
            new LiberationMonoBoldItalic(),

            new UbuntuMono(),
            new UbuntuMonoItalic(),
            new UbuntuMonoBold(),
            new UbuntuMonoBoldItalic()
        ];
    }

    get colorScheme(): string {
        return this._colorScheme;
    }

    set colorScheme(value: string) {
        this._colorScheme = value;

        let [color, background] = Preferences.colorSchemes[this._colorScheme];
        this.color = Color.parseColor(color);
        this.backgroundColor = Color.parseColor(background);

        // 如果设置了背景图片的话，不需要设置背景颜色。
        if (background && !CommonUtils.isEmpty(this.backgroundImage))
            this.backgroundColor = "transparent";

        Styles.add(".container", {
            "color": this.color || "",
            "background-color": this.backgroundColor
        }, this.instanceId);

        // 反向
        Styles.add(".inverse", {
            "color": this.backgroundColor,
            "background-color": this.color
        }, this.instanceId);

        // 反转颜色选中
        Styles.add([
            ".inverse::selection",
            ".inverse::-moz-selection",
            ".inverse::-webkit-selection"], {
            "color": this.color,
            "background-color": this.backgroundColor
        }, this.instanceId);

        // 选中字体颜色
        Styles.add([
            ".tab::selection",
            ".len2::selection",
            ".viewport-row::selection",
            ".tab::-moz-selection",
            ".len2::-moz-selection",
            ".viewport-row::-moz-selection",
            ".tab::-webkit-selection",
            ".len2::-webkit-selection",
            ".viewport-row::-webkit-selection"], {
            "color": this.backgroundColor,
            "background-color": this.color
        }, this.instanceId);


        // 光标边框选中颜色
        // Styles.add([
        //     ".cursor > .outline::selection",
        //     ".cursor > .outline::-moz-selection",
        //     ".cursor > .outline::-webkit-selection"], {
        //     "border-color": this.backgroundColor + " !important"
        // }, this.instanceId);

        // 联想输入下划线
        Styles.add(".composition:after", {
            "border-bottom": "2px solid " + this.color
        }, this.instanceId);
        Styles.add(".composition.running", {
            "border-right": "1px solid " + this.color
        }, this.instanceId);
        Styles.add(".composition:not(.running)", {
            "animation": `border-blink-${this.instanceId} 1.2s linear infinite`
        }, this.instanceId);

        // 考虑不同实例不同的颜色。
        Styles.addKeyFrames("border-blink",
            "{ 0%, 50% { border-color: " + this.color + "} 50.1%, 100% { border-color: transparent; } }",
            this.instanceId);

        // 设置颜色。
        this.terminal.cursor.color = this.color;
        this.terminal.cursor.backgroundColor = this.backgroundColor;

    }

    get color(): string {
        return this._color;
    }

    set color(value: string) {
        this._color = value;
    }

    get backgroundColor(): string {
        return this._backgroundColor;
    }

    set backgroundColor(value: string) {
        this._backgroundColor = value;
    }

    get boldColor(): string {
        return this._boldColor;
    }

    set boldColor(value: string) {
        this._boldColor = Color.parseColor(value);

        // 加粗颜色
        Styles.add(".bold", {
            "color": this._boldColor
        }, this.instanceId);

        Styles.add([
            ".bold::selection",
            ".bold::-moz-selection",
            ".bold::-webkit-selection"], {
            color: this.backgroundColor,
            "background-color": this._boldColor
        }, this.instanceId);
    }

    get highlightColor(): string {
        return this._highlightColor;
    }

    set highlightColor(value: string) {
        this._highlightColor = value;
    }

    get highlightBackgroundColor(): string {
        return this._highlightBackgroundColor;
    }

    set highlightBackgroundColor(value: string) {
        this._highlightBackgroundColor = value;
    }

    get transparentBackground(): number {
        return this._transparentBackground;
    }

    set transparentBackground(value: number) {
        this._transparentBackground = value;
    }

    get cursorShape(): string {
        return this._cursorShape;
    }

    set cursorShape(value: string) {
        this._cursorShape = value;

        switch (value) {
            case "Block":

                Styles.addCursorStyle(".cursor.cursor-shape-block.cursor-focus", {
                    "background-color": this.cursorBackgroundColor,
                    color: this.cursorColor
                }, this.instanceId, true);

                Styles.addCursorStyle(".cursor.cursor-shape-block", {
                    "background-color": "transparent",
                    color: "inherit"
                }, this.instanceId);

                // outline
                Styles.addCursorStyle([".cursor.cursor-shape-block .outline",
                    ".cursor.cursor-shape-block.cursor-focus .outline"], {
                    border: "1px solid " + this.cursorBackgroundColor
                }, this.instanceId);

                break;

            case "Underline":
            case "Wide Underline":
                // outline
                Styles.addCursorStyle(".cursor.cursor-shape-underline .outline", {
                    border: "1px solid " + this.cursorBackgroundColor
                }, this.instanceId, true);

                Styles.addCursorStyle(".cursor.cursor-shape-underline.cursor-focus .outline", {
                    border: "none",
                    "background-color": this.cursorBackgroundColor,
                    height: value === "Wide Underline" ? "2px" : "1px",
                    top: "auto"
                }, this.instanceId);

                break;

            case "I-Beam":
            case "Wide I-Beam":
                // outline
                Styles.addCursorStyle(".cursor.cursor-shape-vertical-bar .outline", {
                    border: "1px solid " + this.cursorBackgroundColor
                }, this.instanceId, true);
                Styles.addCursorStyle(".cursor.cursor-shape-vertical-bar.cursor-focus .outline", {
                    border: "none",
                    "background-color": this.cursorBackgroundColor,
                    width: value === "Wide I-Beam" ? "2px" : "1px"
                }, this.instanceId);

                break;
        }

        Styles.addCursorStyle(".cursor.cursor-hide", {
            "visibility": "hidden !important"
        }, this.instanceId);

        this.terminal.cursor.cursorShape = value;
    }

    get cursorBlinking(): boolean {
        return this._cursorBlinking;
    }

    set cursorBlinking(value: boolean) {
        this._cursorBlinking = value;

        if (value) {

            Styles.add([".cursor.cursor-shape-block.cursor-focus.cursor-blink",
                ".cursor.cursor-focus .outline.cursor-blink"], {
                "animation": `cursor-blink-${this.instanceId} 0.4s steps(1, end) infinite;`
            }, this.instanceId);

            // 光标闪烁
            Styles.addKeyFrames("cursor-blink",
                "{ 0%, 50% { background-color: " + this.cursorBackgroundColor + "; color: " + this.cursorColor + "; } " +
                "51%, 100% { background-color: transparent; color: inherit; } }",
                this.instanceId);

        }

    }

    get cursorColor(): string {
        return this._cursorColor;
    }

    set cursorColor(value: string) {
        this._cursorColor = Color.parseColor(value);

        if (this.cursorShape === "Block") {
            Styles.addCursorStyle(".cursor.cursor-shape-block.cursor-focus", {
                color: value
            }, this.instanceId);
        }
    }

    get cursorBackgroundColor(): string {
        return this._cursorBackgroundColor;
    }

    set cursorBackgroundColor(value: string) {
        this._cursorBackgroundColor = Color.parseColor(value);

        switch (this.cursorShape) {
            case "Block":

                Styles.addCursorStyle(".cursor.cursor-shape-block.cursor-focus", {
                    "background-color": value
                }, this.instanceId);

                // outline
                Styles.addCursorStyle([".cursor.cursor-shape-block .outline",
                    ".cursor.cursor-shape-block.cursor-focus .outline"], {
                    border: "1px solid " + value
                }, this.instanceId);

                break;

            case "Underline":
            case "Wide Underline":
                // outline
                Styles.addCursorStyle(".cursor.cursor-shape-underline .outline", {
                    border: "1px solid " + value
                }, this.instanceId);

                Styles.addCursorStyle(".cursor.cursor-shape-underline.cursor-focus .outline", {
                    "background-color": value,
                }, this.instanceId);

                break;

            case "I-Beam":
            case "Wide I-Beam":
                // outline
                Styles.addCursorStyle(".cursor.cursor-shape-vertical-bar .outline", {
                    border: "1px solid " + value
                }, this.instanceId);
                Styles.addCursorStyle(".cursor.cursor-shape-vertical-bar.cursor-focus .outline", {
                    border: "none",
                    "background-color": value
                }, this.instanceId);

                break;
        }
    }

    get defaultCursorColor(): boolean {
        return this._defaultCursorColor;
    }

    set defaultCursorColor(value: boolean) {
        this._defaultCursorColor = value;
        if (value) {
            this.cursorColor = this.backgroundColor;
            this.cursorBackgroundColor = this.color;
        }
    }

    get backgroundImage(): string {
        return this._backgroundImage;
    }

    set backgroundImage(value: string) {
        this._backgroundImage = value;

        Styles.add(".webxterm", {
            "background-image": !!this.backgroundImage ? `url(${this.backgroundImage})` : ""
        }, this.instanceId);

        Styles.add(".container", {
            "color": this.color || "",
            "background-color": !!this.backgroundImage ? "" : this.backgroundColor
        }, this.instanceId);

    }


    get backgroundRepeat(): boolean {
        return this._backgroundRepeat;
    }

    set backgroundRepeat(value: boolean) {
        this._backgroundRepeat = value;

        Styles.add(".webxterm", {
            "background-repeat": value ? "repeat" : "no-repeat",
            "background-size": value ? "" : this.backgroundSize,
        }, this.instanceId);
    }

    get backgroundSize(): string {
        return this._backgroundSize;
    }

    set backgroundSize(value: string) {
        this._backgroundSize = value;

        Styles.add(".webxterm", {
            "background-size": this.backgroundRepeat ? "" : value,
        }, this.instanceId);

    }

    get fontFamily(): Font {
        return this._fontFamily;
    }

    set fontFamily(value: Font) {
        this._fontFamily = value;

        Styles.add(".webxterm", {
            "font-family": this.fontFamily.getFontName(),
        }, this.instanceId);

        Styles.add(".measure", {
            "font-family": this.fontFamily.getFontName()
        }, this.instanceId);

        // 获取字符的尺寸
        if (this.terminal.init)
            this.terminal.measure();

    }

    get fontSize(): string {
        return this._fontSize;
    }

    get defaultFontSizeVal(): number[] {
        return this.fontFamily.getFontSize(Preferences.defaultFontSize);
    }

    set fontSize(value: string) {
        this._fontSize = value;

        Styles.add(".webxterm", {
            "font-size": this.fontSize,
        }, this.instanceId);

        Styles.add(".measure", {
            "font-size": this.fontSize
        }, this.instanceId);

        // 获取字符的尺寸
        if (this.terminal.init)
            this.terminal.measure();
    }

    get showBoldTextInBrightColor(): boolean {
        return this._showBoldTextInBrightColor;
    }

    set showBoldTextInBrightColor(value: boolean) {
        this._showBoldTextInBrightColor = value;
    }

    get paletteScheme(): string {
        return this._paletteScheme;
    }

    set paletteScheme(value: string) {
        this._paletteScheme = value;
        // 初始化调色板。
        const colors = Preferences.paletteSchemes[value];

        for (let i = 0, len = Preferences.paletteColorNames.length; i < len; i++) {

            const colorName = Preferences.paletteColorNames[i];
            // color
            const color = Color.parseColor(colors[i]);

            Styles.add("." + colorName, {
                color: color + " !important"
            }, this.instanceId);
            Styles.add([
                "." + colorName + "::selection",
                "." + colorName + "::-moz-selection",
                "." + colorName + "::-webkit-selection"], {
                color: this.backgroundColor,
                "background-color": color + " !important"
            }, this.instanceId);

            // 光标的颜色。
            // Styles.add(".cursor." + colorName + " .outline", {
            //     "border-color": color + " !important"
            // }, this.instanceId);
            //
            // Styles.add(".cursor.cursor-shape-block:not(.cursor-blink)." + colorName, {
            //     "color": this.backgroundColor + " !important",
            //     "background-color": color + " !important",
            // }, this.instanceId);
            //
            // Styles.add([
            //     ".cursor.cursor-shape-underline." + colorName + " .outline",
            //     ".cursor.cursor-shape-vertical-bar." + colorName + " .outline",
            // ], {
            //     "background-color": color + " !important",
            // }, this.instanceId);

            // background color

            Styles.add("._" + colorName, {
                "background-color": color + " !important"
            }, this.instanceId);
            Styles.add([
                "._" + colorName + "::selection",
                "._" + colorName + "::-moz-selection",
                "._" + colorName + "::-webkit-selection"], {
                color: color + " !important",
                "background-color": this.color
            }, this.instanceId);

        }

    }

    /**
     * 通过类名获取颜色值
     * @param className
     */
    getColor(className: string){

        if(className.charAt(0) === '_'){
            className = className.substring(1);
        }

        let index = -1;
        for(let i = 0, len = Preferences.paletteColorNames.length; i < len; i++){
            if(Preferences.paletteColorNames[i] === className){
                index = i;
                break;
            }
        }

        if(index === -1){
            return Color.parseColor("#" + className);
        } else {
            const colors = Preferences.paletteSchemes[this.paletteScheme];
            return Color.parseColor(colors[index]);
        }

    }

    get terminalType(): string {
        return this._terminalType;
    }

    set terminalType(value: string) {
        this._terminalType = value;
    }

    get scrollToBottomOnInput(): boolean {
        return this._scrollToBottomOnInput;
    }

    set scrollToBottomOnInput(value: boolean) {
        this._scrollToBottomOnInput = value;
    }

    get visualBell(): boolean {
        return this._visualBell;
    }

    set visualBell(value: boolean) {
        this._visualBell = value;
    }

    get visualBellColor(): string {
        return this._visualBellColor;
    }

    set visualBellColor(value: string) {
        this._visualBellColor = value;
    }


    get scrollBack(): number {
        return this._scrollBack;
    }

    set scrollBack(value: number) {
        this._scrollBack = value;

        if(value > 51200){
            throw new Error("最大行数不能超过51200！");
        }

        // 设置最大滚动行数
        if(this.terminal.bufferSet && this.terminal.bufferSet.normal){
            this.terminal.bufferSet.normal.maxScrollBack = value;
        }
    }


    get tabSize(): number {
        return this._tabSize;
    }

    set tabSize(value: number) {
        this._tabSize = value;
    }


    get enableHeartbeat(): boolean {
        return this._enableHeartbeat;
    }

    set enableHeartbeat(value: boolean) {
        this._enableHeartbeat = value;

        // if(this.terminal.transceiver){
        //     this.terminal.transceiver.enableHeartbeat = value;
        // }
    }

    get nextHeartbeatSeconds(): number {
        return this._nextHeartbeatSeconds;
    }

    set nextHeartbeatSeconds(value: number) {
        this._nextHeartbeatSeconds = value;

        // if(this.terminal.transceiver){
        //     this.terminal.transceiver.nextHeartbeatSeconds = value;
        // }
    }

    set scrollbar(value: boolean) {
        this._scrollbar = value;

        if(!this._scrollbar){
            // 不要滚动条
            Styles.add(".container", {
                "overflow-y": "hidden"
            }, this.terminal.instanceId)
        } else {
            Styles.add(".container", {
                "overflow-y": "scroll"
            }, this.terminal.instanceId)
        }
    }
}