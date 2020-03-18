/**
 * 键盘输入
 */
// https://en.wikipedia.org/wiki/ANSI_escape_code
// Terminal input sequences
// <char>                                -> char
// <esc> <nochar>                        -> esc
// <esc> <esc>                           -> esc
// <esc> <char>                          -> Alt-keypress or keycode sequence
// <esc> "[" <nochar>                    -> Alt-[
// <esc> "[" (<num>) (";"<num>) "~"      -> keycode sequence, <num> defaults to 1
//
// If the terminating character is "~", the first number must be present and is a
// keycode number, the second number is an optional modifier value. If the terminating
// character is a letter, the letter is the keycode value, and the optional number is
// the modifier value.
//
// The modifier value defaults to 1, and after subtracting 1 is a bitmap of modifier
// keys being pressed: <Meta><Ctrl><Alt><Shift>. So, for example, <esc>[4;2~ is
// Shift-End, <esc>[20~ is function key 9, <esc>[5C is Ctrl-Right.
//
// vt sequences:
// <esc>[1~    - Home        <esc>[16~   -             <esc>[31~   - F17
// <esc>[2~    - Insert      <esc>[17~   - F6          <esc>[32~   - F18
// <esc>[3~    - Delete      <esc>[18~   - F7          <esc>[33~   - F19
// <esc>[4~    - End         <esc>[19~   - F8          <esc>[34~   - F20
// <esc>[5~    - PgUp        <esc>[20~   - F9          <esc>[35~   -
// <esc>[6~    - PgDn        <esc>[21~   - F10
// <esc>[7~    - Home        <esc>[22~   -
// <esc>[8~    - End         <esc>[23~   - F11
// <esc>[9~    -             <esc>[24~   - F12
// <esc>[10~   - F0          <esc>[25~   - F13
// <esc>[11~   - F1          <esc>[26~   - F14
// <esc>[12~   - F2          <esc>[27~   -
// <esc>[13~   - F3          <esc>[28~   - F15
// <esc>[14~   - F4          <esc>[29~   - F16
// <esc>[15~   - F5          <esc>[30~   -
//
// xterm sequences:
// <esc>[A     - Up          <esc>[K     -             <esc>[U     -
// <esc>[B     - Down        <esc>[L     -             <esc>[V     -
// <esc>[C     - Right       <esc>[M     -             <esc>[W     -
// <esc>[D     - Left        <esc>[N     -             <esc>[X     -
// <esc>[E     -             <esc>[O     -             <esc>[Y     -
// <esc>[F     - End         <esc>[1P    - F1          <esc>[Z     -
// <esc>[G     - Keypad 5    <esc>[1Q    - F2
// <esc>[H     - Home        <esc>[1R    - F3
// <esc>[I     -             <esc>[1S    - F4
// <esc>[J     -             <esc>[T     -
//
// <esc>[A to <esc>[D are the same as the ANSI output sequences. The <num> is normally
// omitted if no modifier keys are pressed, but most implementations always emit the
// <num> for F1-F4.


// https://invisible-island.net/xterm/ctlseqs/ctlseqs.html#h2-PC-Style-Function-Keys


const VK = {
    // cursor keys
    UP: "ArrowUp",
    DOWN: "ArrowDown",
    RIGHT: "ArrowRight",
    LEFT: "ArrowLeft",
    HOME: "Home",
    END: "End",

    // keypad numeric
    // keypad application
    TAB: "Tab",
    BACKSPACE: "Backspace",
    PAUSE: "Pause",
    ESCAPE: "Escape",
    INSERT: "Insert",
    DELETE: "Delete",
    PRIOR: "Prior",
    NEXT: "Next",
    F1: "F1",
    F2: "F2",
    F3: "F3",
    F4: "F4",
    F5: "F5",
    F6: "F6",
    F7: "F7",
    F8: "F8",
    F9: "F9",
    F10: "F10",
    F11: "F11",
    F12: "F12",

    ENTER: "Enter",
};

export class Keyboard {

    private readonly combinationKeys: { [key: string]: string } = {};
    private readonly disableEchoKeys: { [key: string]: number } = {};

    keyMap: { [key: string]: string } = {};

    // 229处理
    composition: string[] = [];

    // See http://invisible-island.net/xterm/ctlseqs/ctlseqs.html#h2-PC-Style-Function-Keys
    cursorKeysNormalMapping() {

        this.keyMap[VK.UP] = "\x1b[A";
        this.keyMap[VK.DOWN] = "\x1b[B";
        this.keyMap[VK.RIGHT] = "\x1b[C";
        this.keyMap[VK.LEFT] = "\x1b[D";
        this.keyMap[VK.HOME] = "\x1b[H";
        this.keyMap[VK.END] = "\x1b[F";

    }

    cursorKeysApplicationMapping() {


        this.keyMap[VK.UP] = "\x1bOA";
        this.keyMap[VK.DOWN] = "\x1bOB";
        this.keyMap[VK.RIGHT] = "\x1bOC";
        this.keyMap[VK.LEFT] = "\x1bOD";
        this.keyMap[VK.HOME] = "\x1bOH";
        this.keyMap[VK.END] = "\x1bOF";

    }

    // https://invisible-island.net/xterm/ctlseqs/ctlseqs.html#h2-PC-Style-Function-Keys
    // The application keypad transmits the following escape sequences depend-
    // ing on the mode specified via the DECKPNM and DECKPAM escape sequences.
    // Use the NumLock key to override the application mode.
    keypadNumericMapping() {

        this.keyMap[VK.ENTER] = "\x0d";

        this.keyMap[VK.TAB] = "\x09";
        this.keyMap[VK.BACKSPACE] = "\x7f";
        this.keyMap[VK.PAUSE] = "\x1a";
        this.keyMap[VK.ESCAPE] = "\x1b";
        this.keyMap[VK.INSERT] = "\x1b[2~";
        this.keyMap[VK.DELETE] = "\x1b[3~";
        this.keyMap[VK.PRIOR] = "\x1b[5~";
        this.keyMap[VK.NEXT] = "\x1b[6~";
        this.keyMap[VK.F1] = "\x1bOP"; // also \x1b[11~, PuTTY uses \x1b\x1b[A
        this.keyMap[VK.F2] = "\x1bOQ"; // also \x1b[12~, PuTTY uses \x1b\x1b[B
        this.keyMap[VK.F3] = "\x1bOR"; // also \x1b[13~, PuTTY uses \x1b\x1b[C
        this.keyMap[VK.F4] = "\x1bOS"; // also \x1b[14~, PuTTY uses \x1b\x1b[D
        this.keyMap[VK.F5] = "\x1b[15~";
        this.keyMap[VK.F6] = "\x1b[17~";
        this.keyMap[VK.F7] = "\x1b[18~";
        this.keyMap[VK.F8] = "\x1b[19~";
        this.keyMap[VK.F9] = "\x1b[20~";
        this.keyMap[VK.F10] = "\x1b[21~";
        this.keyMap[VK.F11] = "\x1b[23~";
        this.keyMap[VK.F12] = "\x1b[24~";

    }

    //Application mode - Some terminals support both a "Numeric" input mode, and an "Application" mode
    //  The standards vary on what each key translates to in the various modes, so I tried to make it as close
    //  to the VT220 standard as possible.
    //  The notable difference is in the arrow keys, which in application mode translate to "^[0A" (etc) as opposed to "^[[A" in numeric
    //Some very unclear documentation at http://invisible-island.net/xterm/ctlseqs/ctlseqs.html also suggests alternate encodings for F1-4
    //  which I have left in the comments on those entries as something to possibly add in the future, if need be.
    //It seems to me as though this was used for early numpad implementations, where presently numlock would enable
    //  "numeric" mode, outputting the numbers on the keys, while "application" mode does things like pgup/down, arrow keys, etc.
    //These keys aren't translated at all in numeric mode, so I figured I'd leave them out of the numeric table.
    keypadApplicationMapping() {

        this.keyMap[VK.ENTER] = "\x0d";

        this.keyMap[VK.TAB] = "\x09";
        this.keyMap[VK.BACKSPACE] = "\x7f";
        this.keyMap[VK.PAUSE] = "\x1a";
        this.keyMap[VK.ESCAPE] = "\x1b";
        this.keyMap[VK.INSERT] = "\x1b[2~";
        this.keyMap[VK.DELETE] = "\x1b[3~";
        this.keyMap[VK.PRIOR] = "\x1b[5~";
        this.keyMap[VK.NEXT] = "\x1b[6~";
        this.keyMap[VK.F1] = "\x1bOP"; // also \x1b[11~, PuTTY uses \x1b\x1b[A
        this.keyMap[VK.F2] = "\x1bOQ"; // also \x1b[12~, PuTTY uses \x1b\x1b[B
        this.keyMap[VK.F3] = "\x1bOR"; // also \x1b[13~, PuTTY uses \x1b\x1b[C
        this.keyMap[VK.F4] = "\x1bOS"; // also \x1b[14~, PuTTY uses \x1b\x1b[D
        this.keyMap[VK.F5] = "\x1b[15~";
        this.keyMap[VK.F6] = "\x1b[17~";
        this.keyMap[VK.F7] = "\x1b[18~";
        this.keyMap[VK.F8] = "\x1b[19~";
        this.keyMap[VK.F9] = "\x1b[20~";
        this.keyMap[VK.F10] = "\x1b[21~";
        this.keyMap[VK.F11] = "\x1b[23~";
        this.keyMap[VK.F12] = "\x1b[24~";

        // The numpad has a variety of mappings, none of which seem standard or really configurable by the OS.
        // See http://invisible-island.net/xterm/ctlseqs/ctlseqs.html#h2-PC-Style-Function-Keys
        //   to see just how convoluted this all is.
        // PuTTY uses a set of mappings that don't work in ViM without reamapping them back to the numpad
        // (see http://vim.wikia.com/wiki/PuTTY_numeric_keypad_mappings#Comments)
        // https://invisible-island.net/xterm/ctlseqs/ctlseqs.html#h2-VT220-Style-Function-Keys

    }


    modifierKeyMapping() {

    }


    constructor() {

        // for (let i = 32; i < 127; i++)
        //     this.asciiTable[i] = String.fromCharCode(i);

        // 组合键
        this.combinationKeys = {
            "CTRL+@": "\x00", // ctrl + shift
            "CTRL+A": "\x01",
            "CTRL+B": "\x02",
            "CTRL+C": "\x03",
            "CTRL+D": "\x04",
            "CTRL+E": "\x05",
            "CTRL+F": "\x06",
            "CTRL+G": "\x07",
            "CTRL+H": "\x08",
            "CTRL+I": "\x09",
            "CTRL+J": "\x0a",
            "CTRL+K": "\x0b",
            "CTRL+L": "\x0c",
            "CTRL+M": "\x0d",
            "CTRL+N": "\x0e",
            "CTRL+O": "\x0f",
            "CTRL+P": "\x10",
            "CTRL+Q": "\x11",
            "CTRL+R": "\x12",
            "CTRL+S": "\x13",
            "CTRL+T": "\x14",
            "CTRL+U": "\x15",
            "CTRL+V": "\x16",
            "CTRL+W": "\x17",
            "CTRL+X": "\x18",
            "CTRL+Y": "\x19",
            "CTRL+Z": "\x1a",
            "CTRL+[": "\x1b",
            "CTRL+\\": "\x1c",
            "CTRL+]": "\x1d",
            "CTRL+^": "\x1e",  // ctrl + shift
            "CTRL+_": "\x1f",  // ctrl + shift
            "CTRL+`": "\x20",
            "CTRL+BACKSPACE": "\x7f"
        };

        // 不回显的按键
        this.disableEchoKeys = {
            "Cancel": 3,
            "Help": 6,
            "Clear": 12,
            "Shift": 16,
            "Control": 17,
            "Alt": 18,
            "Pause": 19,
            "CapsLock": 20,
            "Convert": 28,
            "NonConvert": 29,
            "Accept": 30,
            "ModeChange": 31,
            "Select": 41,
            "Print": 42,
            "Execute": 43,
            "PrintScreen": 44,
            "Insert": 45,
            "OS": 91,
            "ContextMenu": 93,
            "NumLock": 144,
            "ScrollLock": 145,
            "VolumeMute": 181,
            "VolumeDown": 182,
            "VolumeUp": 183,
            "Meta": 224,
            "AltGraph": 225,
            "Process": 229,
            "Attn": 246,
            "CrSel": 247,
            "ExSel": 248,
            "EraseEof": 249,
            "Play": 250,
            "ZoomOut": 251
        };


    }

    /**
     * @param e
     * @param cursorApplicationMode 光标应用模式
     * @param keypadApplicationMode 键盘应用模式
     */
    public getKeySym(e: KeyboardEvent,
                     cursorApplicationMode: boolean,
                     keypadApplicationMode: boolean): string {

        //
        let modifiers = (e.shiftKey ? 1 : 0) | (e.altKey ? 2 : 0) | (e.ctrlKey ? 4 : 0) | (e.metaKey ? 8 : 0)  // 修饰键
            , keySym = ""
            , key = e.key;          // 按键

        if (this.disableEchoKeys[key]) {
            console.info("disable echo key: ", key);
            return "";
        }

        if(cursorApplicationMode){
            this.cursorKeysApplicationMapping();
        } else {
            this.cursorKeysNormalMapping();
        }

        if(keypadApplicationMode){
            this.keypadApplicationMapping();
        } else {
            this.keypadNumericMapping();
        }

        //
        keySym = this.keyMap[key];

        // console.info("keySym:" + keySym);

        if (modifiers > 0) {

            console.info("modifiers:" + modifiers);

            if(modifiers == 4){
                return this.combinationKeys["CTRL+" + key.toUpperCase()];
            }

            // if (keySym) {
            //
            //     if (typeof keySym === "object") {
            //
            //         // 直接返回
            //         return keySym[2].replace(/\${(.+?)}/, function (w) {
            //             return eval(w.substring(2, w.length - 1));
            //         });
            //
            //     } else {
            //         return keySym;
            //     }
            //
            // } else {
            //
            //     if (modifiers === 4) {
            //         // CTRL + A-Z
            //         return this.combinationKeys["CTRL+" + key.toUpperCase()];
            //     } else if (modifiers === 5) {
            //         // CTRL + @
            //         // CTRL + ^
            //         // CTRL + _
            //         return this.combinationKeys["CTRL+" + key.toUpperCase()];
            //     } else if (modifiers === 8) {
            //         // META
            //         return "";
            //     }
            //
            //     // keySym == undefined..
            //     return this.asciiTable.indexOf(key) !== -1 ? key : "";
            //
            // }


            // } else if (cursorApplicationMode) {

            // 程序模式

            // if (keySym) {
            //
            //     if (typeof keySym === "object") {
            //
            //         if (keySym[1]) return keySym[1];
            //         else if (keySym[0]) return keySym[0];
            //
            //     } else {
            //         return keySym;
            //     }
            //
            // } else {
            //
            //     // keySym == undefined..
            //     return this.asciiTable.indexOf(key) !== -1 ? key : "";
            // }

        } else {

            // 普通模式

            // if (keySym) {
            //
            //     if (typeof keySym === "object") {
            //         if (keySym[0]) return keySym[0];
            //     } else {
            //         return keySym;
            //     }
            //
            // } else {
            //     // keySym == undefined..
            //     return this.asciiTable.indexOf(key) !== -1 ? key : "";
            // }

        }

        return keySym || key;

    }


}
