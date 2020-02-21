/**
 * 偏好设置
 */
import {Logger} from "./common/Logger";
import {CommonUtils} from "./common/CommonUtils";
import {Styles} from "./Styles";
import {Terminal} from "./Terminal";

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
        "Custom": ["#839496", "#002B36"],
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

    public static defaultFontSize: string = "12pt";
    public static fontSizes: { [key: string]: number[] } = {
        "8pt": [6.4166717529296875, 13],
        "9pt": [7.2166595458984375, 14.5],
        "10pt": [8.033340454101562, 16],
        "11pt": [8.833328247070312, 17.5],
        "12pt": [9.633331298828125, 19],
        "13pt": [10.433334350585938, 21],
        "14pt": [11.23333740234375, 22],
        "15pt": [12.0333251953125, 24],
        "16pt": [12.850006103515625, 25.5],
        "17pt": [13.649993896484375, 27],
        "18pt": [14.45001220703125, 28.5],
        "19pt": [15.25, 30],
        "20pt": [16.04998779296875, 31.5],
        "21pt": [16.850006103515625, 33],
        "22pt": [17.666671752929688, 34.5],
        "23pt": [18.466659545898438, 36],
        "24pt": [19.26666259765625, 38],
        "25pt": [20.066665649414062, 39],
        "26pt": [20.866668701171875, 41],
        "27pt": [21.666671752929688, 42],
        "28pt": [22.48333740234375, 44],
        "29pt": [23.2833251953125, 45.5],
        "30pt": [24.083343505859375, 47],
        "31pt": [24.883331298828125, 48.5],
        "32pt": [25.683334350585938, 50.5],
        "33pt": [26.483322143554688, 51.5],
        "34pt": [27.300003051757812, 53.5],
        "35pt": [28.100006103515625, 55],
        "36pt": [28.899993896484375, 56.5],
        "37pt": [29.699996948242188, 58],
        "38pt": [30.5, 59.5],
        "39pt": [31.300003051757812, 61],
        "40pt": [32.116668701171875, 63],
        "41pt": [32.91667175292969, 64],
        "42pt": [33.71665954589844, 65.5],
        "43pt": [34.51666259765625, 67.5],
        "44pt": [35.31666564941406, 68.5],
        "45pt": [36.116668701171875, 70.5],
        "46pt": [36.93333435058594, 71.5],
        "47pt": [37.73333740234375, 73.5],
        "48pt": [38.53334045410156, 75],
        "49pt": [39.33332824707031, 76.5],
        "50pt": [40.133331298828125, 78],
        "51pt": [40.93333435058594, 80],
        "52pt": [41.75, 81],
        "53pt": [42.55000305175781, 83],
        "54pt": [43.34999084472656, 84],
        "55pt": [44.15000915527344, 86],
        "56pt": [44.94999694824219, 87.5],
        "57pt": [45.75, 89],
        "58pt": [46.56666564941406, 90.5],
        "59pt": [47.366668701171875, 92.5],
        "60pt": [48.16667175292969, 93.5],
        "61pt": [48.96665954589844, 95],
        "62pt": [49.76666259765625, 96.5],
        "63pt": [50.56666564941406, 98],
        "64pt": [51.383331298828125, 100],
        "65pt": [52.18333435058594, 101],
        "66pt": [52.98333740234375, 103],
        "67pt": [53.78334045410156, 104.5],
        "68pt": [54.58332824707031, 106],
        "69pt": [55.383331298828125, 107.5],
        "70pt": [56.18333435058594, 109.5],
        "71pt": [57, 110.5],
        "72pt": [57.80000305175781, 112.5],
        "73pt": [58.59999084472656, 113.5],
        "74pt": [59.40000915527344, 115.5],
        "75pt": [60.19999694824219, 117],
        "76pt": [61, 118.5],
        "77pt": [61.81666564941406, 120],
        "78pt": [62.616668701171875, 122],
        "79pt": [63.41667175292969, 123],
        "80pt": [64.21665954589844, 125],
        "81pt": [65.01666259765625, 126],
        "82pt": [65.81666564941406, 127.5],
        "83pt": [66.63334655761719, 129.5],
        "84pt": [67.43333435058594, 130.5],
        "85pt": [68.23332214355469, 132.5],
        "86pt": [69.03334045410156, 134],
        "87pt": [69.83332824707031, 135.5],
        "88pt": [70.63333129882812, 137],
        "89pt": [71.44999694824219, 138.5],
        "90pt": [72.25, 140],
        "91pt": [73.05000305175781, 142],
        "92pt": [73.85000610351562, 143],
        "93pt": [74.64999389648438, 145],
        "94pt": [75.44999694824219, 146.5],
        "95pt": [76.26667785644531, 148],
        "96pt": [77.06666564941406, 149.5],
        "97pt": [77.86666870117188, 151.5],
        "98pt": [78.66665649414062, 152.5],
        "99pt": [79.4666748046875, 154.5],
        "100pt": [80.26666259765625, 155.5],
        "101pt": [81.08332824707031, 157.5],
        "102pt": [81.88334655761719, 159],
        "103pt": [82.68331909179688, 160],
        "104pt": [83.48333740234375, 162],
        "105pt": [84.28334045410156, 163.5],
        "106pt": [85.08332824707031, 165],
        "107pt": [85.89999389648438, 166.5]
    };

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

    ////////////////// 背景 ////////////////
    private _backgroundImage: string = "";
    private _backgroundRepeat: boolean = false;
    private _backgroundSize: string = "";

    ////////////////// 字体 ////////////////
    // 字体
    private _fontFamily: string = "";
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

    // 日志打印
    private logger: Logger = Logger.getLogger("Preferences");

    private readonly instanceId: string;

    private terminal: Terminal;

    constructor(terminal: Terminal) {
        this.terminal = terminal;
        this.instanceId = terminal.instanceId;
    }

    /**
     * 初始化
     */
    init(): void {

        this.colorScheme = "Solarized dark";
        this.boldColor = "#FF6666";
        this.highlightColor = "#FFFFFF";
        this.highlightBackgroundColor = "#000000";

        this.transparentBackground = 0.5;
        this.cursorShape = "Block";
        this.cursorBlinking = false;
        this.cursorColor = "red";
        this.cursorBackgroundColor = "#00FF00";

        this.backgroundImage = "";
        this.backgroundRepeat = true;
        this.backgroundSize = "100% 100%";

        this.fontFamily = "DejaVuSansMono";
        this.fontSize = Preferences.defaultFontSize;

        this.showBoldTextInBrightColor = false;
        this.paletteScheme = "Tango";

        this.scrollToBottomOnInput = true;

        this.visualBell = true;
        this.visualBellColor = "rgba(0,0,0,0.5)";

        this.terminalType = "xterm";

        // https://invisible-island.net/xterm/manpage/xterm.html#VT100-Widget-Resources:saveLines
        // saveLines (class SaveLines)
        //                Specifies the number of lines to save beyond the top of the
        //                screen when a scrollbar is turned on.  The default is "1024".
        this.scrollBack = 1024;

    }


    get colorScheme(): string {
        return this._colorScheme;
    }

    set colorScheme(value: string) {
        this._colorScheme = value;

        let [color, background] = Preferences.colorSchemes[this._colorScheme];
        this.color = CommonUtils.parseColor(color, 0.99);
        this.backgroundColor = CommonUtils.parseColor(background, 0.99);

        // 如果设置了背景图片的话，不需要设置背景颜色。
        if (background && !CommonUtils.isEmpty(this.backgroundImage))
            this.backgroundColor = "transparent";

        Styles.add(".container", {
            "color": this.color || "",
            "background-color": this.backgroundColor
        }, this.instanceId);

        // 反向
        Styles.add(".inverse", {
            "color": this.backgroundColor + " !important",
            "background-color": this.color + " !important"
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
        Styles.addKeyFrames("border-blink",
            "{ 0%, 50% { border-color: " + this.color  + "} 50.1%, 100% { border-color: transparent; } }",
            this.instanceId);


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
        this._boldColor = CommonUtils.parseColor(value, 0.99);

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

                Styles.addCursorStyle([".cursor.cursor-shape-block",
                    ".cursor.cursor-shape-block.cursor-hide",
                    ".cursor.cursor-shape-block.cursor-focus.cursor-hide"], {
                    "background-color": "transparent",
                    color: "inherit"
                }, this.instanceId);

                // outline
                Styles.addCursorStyle([".cursor.cursor-shape-block .outline",
                    ".cursor.cursor-shape-block.cursor-focus .outline"], {
                    border: "1px solid " + this.cursorBackgroundColor
                }, this.instanceId);

                Styles.addCursorStyle([".cursor.cursor-shape-block.cursor-hide .outline",
                    ".cursor.cursor-shape-block.cursor-focus.cursor-hide .outline"], {
                    border: "1px solid transparent"
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

                Styles.addCursorStyle([".cursor.cursor-shape-underline.cursor-hide .outline",
                    ".cursor.cursor-shape-underline.cursor-focus.cursor-hide .outline"], {
                    "background-color": "transparent",
                    height: "0"
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
                Styles.addCursorStyle([".cursor.cursor-shape-vertical-bar.cursor-hide .outline",
                    ".cursor.cursor-shape-vertical-bar.cursor-focus.cursor-hide .outline"], {
                    "background-color": "transparent",
                    "width": "0"
                }, this.instanceId);

                break;
        }

        this.terminal.cursor.cursorShape = value;
    }

    get cursorBlinking(): boolean {
        return this._cursorBlinking;
    }

    set cursorBlinking(value: boolean) {
        this._cursorBlinking = value;
    }

    get cursorColor(): string {
        return this._cursorColor;
    }

    set cursorColor(value: string) {
        this._cursorColor = CommonUtils.parseColor(value, 0.99);

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
        this._cursorBackgroundColor = CommonUtils.parseColor(value, 0.99);

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

    get fontFamily(): string {
        return this._fontFamily;
    }

    set fontFamily(value: string) {
        this._fontFamily = value;

        Styles.add(".webxterm", {
            "font-family": this.fontFamily,
        }, this.instanceId);

        Styles.add(".measure", {
            "font-family": this.fontFamily
        }, this.instanceId);

        // 获取字符的尺寸
        if(this.terminal.init)
            this.terminal.measure();

    }

    get fontSize(): string {
        return this._fontSize;
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
        if(this.terminal.init)
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
            const color = CommonUtils.parseColor(colors[i], 0.99);

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
    }
}