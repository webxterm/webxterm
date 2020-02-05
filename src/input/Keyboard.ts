/**
 * 键盘输入
 */
// https://en.wikipedia.org/wiki/ANSI_escape_code
// Terminal input sequences
// <char>                                -> char
// <esc> <nochar>                        -> esc
// <esc> <esc>                           -> esc
// <esc> <char>                          -> Alt-keypress or keycode sequence
// <esc> '[' <nochar>                    -> Alt-[
// <esc> '[' (<num>) (';'<num>) '~'      -> keycode sequence, <num> defaults to 1
//
// If the terminating character is '~', the first number must be present and is a
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
export class Keyboard {

    private asciiTable: string[] = [];


}