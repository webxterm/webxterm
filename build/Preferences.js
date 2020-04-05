"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CommonUtils_1 = require("./common/CommonUtils");
const Styles_1 = require("./Styles");
const Color_1 = require("./common/Color");
const Font_1 = require("./font/Font");
const DejaVuSansMono_1 = require("./font/DejaVuSansMono");
const FreeMono_1 = require("./font/FreeMono");
const LiberationMono_1 = require("./font/LiberationMono");
const UbuntuMono_1 = require("./font/UbuntuMono");
class Preferences {
    constructor(terminal) {
        this._colorScheme = "";
        this._color = "";
        this._backgroundColor = "";
        this._boldColor = "";
        this._highlightColor = "";
        this._highlightBackgroundColor = "";
        this._transparentBackground = 0;
        this._cursorShape = "";
        this._cursorBlinking = false;
        this._cursorColor = "";
        this._cursorBackgroundColor = "";
        this._defaultCursorColor = false;
        this._backgroundImage = "";
        this._backgroundRepeat = false;
        this._backgroundSize = "";
        this._fontFamily = new Font_1.Font();
        this._fontSize = "";
        this._showBoldTextInBrightColor = false;
        this._paletteScheme = "";
        this._terminalType = "";
        this._scrollToBottomOnInput = false;
        this._visualBell = false;
        this._visualBellColor = "#000";
        this._scrollBack = 0;
        this._tabSize = 0;
        this._enableHeartbeat = false;
        this._nextHeartbeatSeconds = 0;
        this._scrollbar = false;
        this.terminal = terminal;
        this.instanceId = terminal.instanceId;
    }
    init() {
        this.colorScheme = "Tango dark";
        this.boldColor = "#FF6666";
        this.highlightColor = "#FFFFFF";
        this.highlightBackgroundColor = "#000000";
        this.transparentBackground = 0.5;
        this.cursorShape = "Block";
        this.cursorColor = "red";
        this.cursorBackgroundColor = "#FF6666";
        this.defaultCursorColor = true;
        this.cursorBlinking = false;
        this.backgroundRepeat = true;
        this.backgroundSize = "100% 100%";
        this.fontFamily = new FreeMono_1.FreeMono();
        this.fontSize = Preferences.defaultFontSize;
        this.showBoldTextInBrightColor = false;
        this.paletteScheme = "Tango";
        this.scrollToBottomOnInput = true;
        this.visualBell = true;
        this.visualBellColor = "rgba(0,0,0,0.5)";
        this.terminalType = "xterm";
        this.scrollBack = 51200;
        this.tabSize = 8;
        this.enableHeartbeat = true;
        this.nextHeartbeatSeconds = 10;
        this.scrollbar = true;
    }
    getFonts() {
        return [
            new DejaVuSansMono_1.DejaVuSansMono(),
            new DejaVuSansMono_1.DejaVuSansMonoOblique(),
            new DejaVuSansMono_1.DejaVuSansMonoBold(),
            new DejaVuSansMono_1.DejaVuSansMonoBoldOblique(),
            new FreeMono_1.FreeMono(),
            new FreeMono_1.FreeMonoOblique(),
            new FreeMono_1.FreeMonoBold(),
            new FreeMono_1.FreeMonoBoldOblique(),
            new LiberationMono_1.LiberationMono(),
            new LiberationMono_1.LiberationMonoItalic(),
            new LiberationMono_1.LiberationMonoBold(),
            new LiberationMono_1.LiberationMonoBoldItalic(),
            new UbuntuMono_1.UbuntuMono(),
            new UbuntuMono_1.UbuntuMonoItalic(),
            new UbuntuMono_1.UbuntuMonoBold(),
            new UbuntuMono_1.UbuntuMonoBoldItalic()
        ];
    }
    get colorScheme() {
        return this._colorScheme;
    }
    set colorScheme(value) {
        this._colorScheme = value;
        let [color, background] = Preferences.colorSchemes[this._colorScheme];
        this.color = Color_1.Color.parseColor(color);
        this.backgroundColor = Color_1.Color.parseColor(background);
        if (background && !CommonUtils_1.CommonUtils.isEmpty(this.backgroundImage))
            this.backgroundColor = "transparent";
        Styles_1.Styles.add(".container", {
            "color": this.color || "",
            "background-color": this.backgroundColor
        }, this.instanceId);
        Styles_1.Styles.add(".inverse", {
            "color": this.backgroundColor,
            "background-color": this.color
        }, this.instanceId);
        Styles_1.Styles.add([
            ".inverse::selection",
            ".inverse::-moz-selection",
            ".inverse::-webkit-selection"
        ], {
            "color": this.color,
            "background-color": this.backgroundColor
        }, this.instanceId);
        Styles_1.Styles.add([
            ".tab::selection",
            ".len2::selection",
            ".viewport-row::selection",
            ".tab::-moz-selection",
            ".len2::-moz-selection",
            ".viewport-row::-moz-selection",
            ".tab::-webkit-selection",
            ".len2::-webkit-selection",
            ".viewport-row::-webkit-selection"
        ], {
            "color": this.backgroundColor,
            "background-color": this.color
        }, this.instanceId);
        Styles_1.Styles.add(".composition:after", {
            "border-bottom": "2px solid " + this.color
        }, this.instanceId);
        Styles_1.Styles.add(".composition.running", {
            "border-right": "1px solid " + this.color
        }, this.instanceId);
        Styles_1.Styles.add(".composition:not(.running)", {
            "animation": `border-blink-${this.instanceId} 1.2s linear infinite`
        }, this.instanceId);
        Styles_1.Styles.addKeyFrames("border-blink", "{ 0%, 50% { border-color: " + this.color + "} 50.1%, 100% { border-color: transparent; } }", this.instanceId);
        this.terminal.cursor.color = this.color;
        this.terminal.cursor.backgroundColor = this.backgroundColor;
    }
    get color() {
        return this._color;
    }
    set color(value) {
        this._color = value;
    }
    get backgroundColor() {
        return this._backgroundColor;
    }
    set backgroundColor(value) {
        this._backgroundColor = value;
    }
    get boldColor() {
        return this._boldColor;
    }
    set boldColor(value) {
        this._boldColor = Color_1.Color.parseColor(value);
        Styles_1.Styles.add(".bold", {
            "color": this._boldColor
        }, this.instanceId);
        Styles_1.Styles.add([
            ".bold::selection",
            ".bold::-moz-selection",
            ".bold::-webkit-selection"
        ], {
            color: this.backgroundColor,
            "background-color": this._boldColor
        }, this.instanceId);
    }
    get highlightColor() {
        return this._highlightColor;
    }
    set highlightColor(value) {
        this._highlightColor = value;
    }
    get highlightBackgroundColor() {
        return this._highlightBackgroundColor;
    }
    set highlightBackgroundColor(value) {
        this._highlightBackgroundColor = value;
    }
    get transparentBackground() {
        return this._transparentBackground;
    }
    set transparentBackground(value) {
        this._transparentBackground = value;
    }
    get cursorShape() {
        return this._cursorShape;
    }
    set cursorShape(value) {
        this._cursorShape = value;
        switch (value) {
            case "Block":
                Styles_1.Styles.addCursorStyle(".cursor.cursor-shape-block.cursor-focus", {
                    "background-color": this.cursorBackgroundColor,
                    color: this.cursorColor
                }, this.instanceId, true);
                Styles_1.Styles.addCursorStyle(".cursor.cursor-shape-block", {
                    "background-color": "transparent",
                    color: "inherit"
                }, this.instanceId);
                Styles_1.Styles.addCursorStyle([".cursor.cursor-shape-block .outline",
                    ".cursor.cursor-shape-block.cursor-focus .outline"], {
                    border: "1px solid " + this.cursorBackgroundColor
                }, this.instanceId);
                break;
            case "Underline":
            case "Wide Underline":
                Styles_1.Styles.addCursorStyle(".cursor.cursor-shape-underline .outline", {
                    border: "1px solid " + this.cursorBackgroundColor
                }, this.instanceId, true);
                Styles_1.Styles.addCursorStyle(".cursor.cursor-shape-underline.cursor-focus .outline", {
                    border: "none",
                    "background-color": this.cursorBackgroundColor,
                    height: value === "Wide Underline" ? "2px" : "1px",
                    top: "auto"
                }, this.instanceId);
                break;
            case "I-Beam":
            case "Wide I-Beam":
                Styles_1.Styles.addCursorStyle(".cursor.cursor-shape-vertical-bar .outline", {
                    border: "1px solid " + this.cursorBackgroundColor
                }, this.instanceId, true);
                Styles_1.Styles.addCursorStyle(".cursor.cursor-shape-vertical-bar.cursor-focus .outline", {
                    border: "none",
                    "background-color": this.cursorBackgroundColor,
                    width: value === "Wide I-Beam" ? "2px" : "1px"
                }, this.instanceId);
                break;
        }
        Styles_1.Styles.addCursorStyle(".cursor.cursor-hide", {
            "visibility": "hidden !important"
        }, this.instanceId);
        this.terminal.cursor.cursorShape = value;
    }
    get cursorBlinking() {
        return this._cursorBlinking;
    }
    set cursorBlinking(value) {
        this._cursorBlinking = value;
        if (value) {
            Styles_1.Styles.add([".cursor.cursor-shape-block.cursor-focus.cursor-blink",
                ".cursor.cursor-focus .outline.cursor-blink"], {
                "animation": `cursor-blink-${this.instanceId} 1s steps(1, end) infinite;`
            }, this.instanceId);
            Styles_1.Styles.addKeyFrames("cursor-blink", "{ 0%, 50% { background-color: " + this.cursorBackgroundColor + "; color: " + this.cursorColor + "; } " +
                "51%, 100% { background-color: transparent; color: inherit; } }", this.instanceId);
        }
    }
    get cursorColor() {
        return this._cursorColor;
    }
    set cursorColor(value) {
        this._cursorColor = Color_1.Color.parseColor(value);
        if (this.cursorShape === "Block") {
            Styles_1.Styles.addCursorStyle(".cursor.cursor-shape-block.cursor-focus", {
                color: value
            }, this.instanceId);
        }
    }
    get cursorBackgroundColor() {
        return this._cursorBackgroundColor;
    }
    set cursorBackgroundColor(value) {
        this._cursorBackgroundColor = Color_1.Color.parseColor(value);
        switch (this.cursorShape) {
            case "Block":
                Styles_1.Styles.addCursorStyle(".cursor.cursor-shape-block.cursor-focus", {
                    "background-color": value
                }, this.instanceId);
                Styles_1.Styles.addCursorStyle([".cursor.cursor-shape-block .outline",
                    ".cursor.cursor-shape-block.cursor-focus .outline"], {
                    border: "1px solid " + value
                }, this.instanceId);
                break;
            case "Underline":
            case "Wide Underline":
                Styles_1.Styles.addCursorStyle(".cursor.cursor-shape-underline .outline", {
                    border: "1px solid " + value
                }, this.instanceId);
                Styles_1.Styles.addCursorStyle(".cursor.cursor-shape-underline.cursor-focus .outline", {
                    "background-color": value,
                }, this.instanceId);
                break;
            case "I-Beam":
            case "Wide I-Beam":
                Styles_1.Styles.addCursorStyle(".cursor.cursor-shape-vertical-bar .outline", {
                    border: "1px solid " + value
                }, this.instanceId);
                Styles_1.Styles.addCursorStyle(".cursor.cursor-shape-vertical-bar.cursor-focus .outline", {
                    border: "none",
                    "background-color": value
                }, this.instanceId);
                break;
        }
    }
    get defaultCursorColor() {
        return this._defaultCursorColor;
    }
    set defaultCursorColor(value) {
        this._defaultCursorColor = value;
        if (value) {
            this.cursorColor = this.backgroundColor;
            this.cursorBackgroundColor = this.color;
        }
    }
    get backgroundImage() {
        return this._backgroundImage;
    }
    set backgroundImage(value) {
        this._backgroundImage = value;
        Styles_1.Styles.add(".webxterm", {
            "background-image": !!this.backgroundImage ? `url(${this.backgroundImage})` : ""
        }, this.instanceId);
        Styles_1.Styles.add(".container", {
            "color": this.color || "",
            "background-color": !!this.backgroundImage ? "" : this.backgroundColor
        }, this.instanceId);
    }
    get backgroundRepeat() {
        return this._backgroundRepeat;
    }
    set backgroundRepeat(value) {
        this._backgroundRepeat = value;
        Styles_1.Styles.add(".webxterm", {
            "background-repeat": value ? "repeat" : "no-repeat",
            "background-size": value ? "" : this.backgroundSize,
        }, this.instanceId);
    }
    get backgroundSize() {
        return this._backgroundSize;
    }
    set backgroundSize(value) {
        this._backgroundSize = value;
        Styles_1.Styles.add(".webxterm", {
            "background-size": this.backgroundRepeat ? "" : value,
        }, this.instanceId);
    }
    get fontFamily() {
        return this._fontFamily;
    }
    set fontFamily(value) {
        this._fontFamily = value;
        Styles_1.Styles.add(".webxterm", {
            "font-family": this.fontFamily.getFontName(),
        }, this.instanceId);
        Styles_1.Styles.add(".measure", {
            "font-family": this.fontFamily.getFontName()
        }, this.instanceId);
        if (this.terminal.init)
            this.terminal.measure();
    }
    get fontSize() {
        return this._fontSize;
    }
    get defaultFontSizeVal() {
        return this.fontFamily.getFontSize(Preferences.defaultFontSize);
    }
    set fontSize(value) {
        this._fontSize = value;
        Styles_1.Styles.add(".webxterm", {
            "font-size": this.fontSize,
        }, this.instanceId);
        Styles_1.Styles.add(".measure", {
            "font-size": this.fontSize
        }, this.instanceId);
        if (this.terminal.init)
            this.terminal.measure();
    }
    get showBoldTextInBrightColor() {
        return this._showBoldTextInBrightColor;
    }
    set showBoldTextInBrightColor(value) {
        this._showBoldTextInBrightColor = value;
    }
    get paletteScheme() {
        return this._paletteScheme;
    }
    set paletteScheme(value) {
        this._paletteScheme = value;
        const colors = Preferences.paletteSchemes[value];
        for (let i = 0, len = Preferences.paletteColorNames.length; i < len; i++) {
            const colorName = Preferences.paletteColorNames[i];
            const color = Color_1.Color.parseColor(colors[i]);
            Styles_1.Styles.add("." + colorName, {
                color: color + " !important"
            }, this.instanceId);
            Styles_1.Styles.add([
                "." + colorName + "::selection",
                "." + colorName + "::-moz-selection",
                "." + colorName + "::-webkit-selection"
            ], {
                color: this.backgroundColor,
                "background-color": color + " !important"
            }, this.instanceId);
            Styles_1.Styles.add("._" + colorName, {
                "background-color": color + " !important"
            }, this.instanceId);
            Styles_1.Styles.add([
                "._" + colorName + "::selection",
                "._" + colorName + "::-moz-selection",
                "._" + colorName + "::-webkit-selection"
            ], {
                color: color + " !important",
                "background-color": this.color
            }, this.instanceId);
        }
    }
    getColor(className) {
        if (className.charAt(0) === '_') {
            className = className.substring(1);
        }
        let index = -1;
        for (let i = 0, len = Preferences.paletteColorNames.length; i < len; i++) {
            if (Preferences.paletteColorNames[i] === className) {
                index = i;
                break;
            }
        }
        if (index === -1) {
            return Color_1.Color.parseColor("#" + className);
        }
        else {
            const colors = Preferences.paletteSchemes[this.paletteScheme];
            return Color_1.Color.parseColor(colors[index]);
        }
    }
    get terminalType() {
        return this._terminalType;
    }
    set terminalType(value) {
        this._terminalType = value;
    }
    get scrollToBottomOnInput() {
        return this._scrollToBottomOnInput;
    }
    set scrollToBottomOnInput(value) {
        this._scrollToBottomOnInput = value;
    }
    get visualBell() {
        return this._visualBell;
    }
    set visualBell(value) {
        this._visualBell = value;
    }
    get visualBellColor() {
        return this._visualBellColor;
    }
    set visualBellColor(value) {
        this._visualBellColor = value;
    }
    get scrollBack() {
        return this._scrollBack;
    }
    set scrollBack(value) {
        this._scrollBack = value;
        if (value > 51200) {
            throw new Error("最大行数不能超过51200！");
        }
        if (this.terminal.bufferSet && this.terminal.bufferSet.normal) {
            this.terminal.bufferSet.normal.maxScrollBack = value;
        }
    }
    get tabSize() {
        return this._tabSize;
    }
    set tabSize(value) {
        this._tabSize = value;
    }
    get enableHeartbeat() {
        return this._enableHeartbeat;
    }
    set enableHeartbeat(value) {
        this._enableHeartbeat = value;
        if (this.terminal.transceiver) {
            this.terminal.transceiver.enableHeartbeat = value;
        }
    }
    get nextHeartbeatSeconds() {
        return this._nextHeartbeatSeconds;
    }
    set nextHeartbeatSeconds(value) {
        this._nextHeartbeatSeconds = value;
        if (this.terminal.transceiver) {
            this.terminal.transceiver.nextHeartbeatSeconds = value;
        }
    }
    set scrollbar(value) {
        this._scrollbar = value;
        if (!this._scrollbar) {
            Styles_1.Styles.add(".container", {
                "overflow-y": "hidden"
            }, this.terminal.instanceId);
        }
        else {
            Styles_1.Styles.add(".container", {
                "overflow-y": "scroll"
            }, this.terminal.instanceId);
        }
    }
}
exports.Preferences = Preferences;
Preferences.colorSchemes = {
    "Black on light yellow": ["#000000", "#FFFFDD"],
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
Preferences.cursorShapes = [
    "Block",
    "I-Beam",
    "Wide I-Beam",
    "Underline",
    "Wide Underline"
];
Preferences.paletteColorNames = [
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
Preferences.paletteSchemes = {
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
Preferences.terminalTypes = [
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
Preferences.defaultFontSize = "10pt";
