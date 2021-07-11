import {CommonUtils} from "../common/CommonUtils";

// shell>> cat emoji-zwj-sequences.txt | grep -v '^$' | grep -v '^#'
// | awk '{print "0x"$1}' | sort | uniq | xargs printf '%d\n' | sort -n | xargs printf '0x%X, '
// 需要连接符的前缀。
export const emojiZWJSequencesPrefix = [
     0x26F9, 0x1F3C3, 0x1F3C4, 0x1F3CA, 0x1F3CB,
    0x1F3CC, 0x1F3F3, 0x1F3F4, 0x1F408, 0x1F415,
    0x1F43B, 0x1F441, 0x1F468, 0x1F469, 0x1F46E,
    0x1F46F, 0x1F470, 0x1F471, 0x1F473, 0x1F477,
    0x1F481, 0x1F482, 0x1F486, 0x1F487, 0x1F575,
    0x1F645, 0x1F646, 0x1F647, 0x1F64B, 0x1F64D,
    0x1F64E, 0x1F6A3, 0x1F6B4, 0x1F6B5, 0x1F6B6,
    0x1F926, 0x1F935, 0x1F937, 0x1F938, 0x1F939,
    0x1F93C, 0x1F93D, 0x1F93E, 0x1F9B8, 0x1F9B9,
    0x1F9CD, 0x1F9CE, 0x1F9CF, 0x1F9D1, 0x1F9D6,
    0x1F9D7, 0x1F9D8, 0x1F9D9, 0x1F9DA, 0x1F9DB,
    0x1F9DC, 0x1F9DD, 0x1F9DE, 0x1F9DF
];

// https://en.wikipedia.org/wiki/Emoji
// 类型
const EmojiState = {
    NORMAL:            -1,  // 常规的
    START:              0,  // 开始emoji表情
    VS15:               1,  // VARIATION SELECTOR-15 (VS15) for text
    VS16:               2,  // VARIATION SELECTOR-16 (VS16) for emoji-style
    ZWJ:                4,  // 连接符 ZERO WIDTH JOINER
    // VS16_KEY_CAP:       5,  // 键帽
    SKIN:               6,  // 肤色
    REGIONAL_INDICATOR: 7,  // 地域标识（国旗）
    ZWJ_VS16:           10,
    ZWJ_VS16ZWJ:        11,
    ZWJ_VS16ZWJ_ZWJ:    12,
    ZWJ_ZWJ:            13,
    ZWJ_ZWJ_ZWJ:        14,
    SKIN_ZWJ:           15,
    SKIN_ZWJ_ZWJ_SKIN:  16,
    VS16_ZWJ:           17,
    VS16_ZWJ_VS16:      18
};

const EmojiCode = {
    VS15:               0xFE0E,
    VS16:               0xFE0F,
    ZWJ:                0x200D,
    KEY_CAP:            0x20E3,
}

/**
 * <code>Emoji表情解析</code><br/>
 * 1, 变量选择器: VS-15 VS-16, See: https://en.wikipedia.org/wiki/Variation_Selectors_(Unicode_block)<br/>
 * 格式：<br/>
 *  VS-15: 符号+FE0E<br/>
 *  VS-16: 符号+FE0F<br/>
 * 2, (#, * 和 0–9)键帽符号<br/>
 * 格式：<br/>
 *  # + VS-16 + U+20E3<br/>
 * 3, 改变肤色 See: https://en.wikipedia.org/wiki/Emoji   [Skin color]<br/>
 *  U+1F3FB EMOJI MODIFIER FITZPATRICK TYPE-1-2<br/>
 *  U+1F3FC EMOJI MODIFIER FITZPATRICK TYPE-3<br/>
 *  U+1F3FD EMOJI MODIFIER FITZPATRICK TYPE-4<br/>
 *  U+1F3FE EMOJI MODIFIER FITZPATRICK TYPE-5<br/>
 *  U+1F3FF EMOJI MODIFIER FITZPATRICK TYPE-6<br/>
 * 格式：<br/>
 *  符号+肤色<br/>
 * 4, ZWJ(零宽度连接符), See: https://unicode.org/Public/emoji/13.0/emoji-zwj-sequences.txt<br/>
 * 执行Python脚本，查看出现的所有情况：See: http://note.youdao.com/s/bWbbU4Is<br/>
 * 格式：<br/>
 *  4.8.  符号+200D+符号+FE0F<br/>
 *  4.1.  符号+200D+符号+FE0F+200D+符号<br/>
 *  4.2.  符号+200D+符号+FE0F+200D+符号+200D+符号<br/>
 *
 *  4.3.  符号+200D+符号<br/>
 *  4.4.  符号+200D+符号+200D+符号<br/>
 *  4.5.  符号+200D+符号+200D+符号+200D+符号<br/>
 *
 *  4.7.  符号+肤色+200D+符号<br/>
 *  4.9.  符号+肤色+200D+符号+FE0F<br/>
 *  4.6.  符号+肤色+200D+符号+200D+符号+肤色<br/>
 *
 *  4.11. 符号+FE0F+200D+符号<br/>
 *  4.10. 符号+FE0F+200D+符号+FE0F<br/>
 * 5, 辅助平面字符(codePointAt(1) >= 0xDC00 && codePointAt(1) <= 0xDFFF)<br/>
 */

/**
 * 字符说明：cp0：codepoint0=codePointAt(0); cp1: codepoint1=codePointAt(1);
 * 解析情况：
 * 长度：
 * 1: cp0=<code>,cp1=undefined;
 *    cp0=<code>,cp1=<code|FE0F>;
 * 2: i=0,cp0=<code>,cp1=undefined; i=1,cp0=<code|FE0F>,cp1=undefined;
 * 3: i=0,cp0=<code>,cp1=undefined; i=1,cp0=<code|FE0F>,cp1=undefined; i=2,cp0=<code|FE0F>,cp1=undefined;
 *
 */

// Unicode 基本平面字符(0, BMP, U+0000 ~ U+FFFF) 辅助平面字符(1-16, SMP, U+010000 ~ U+10FFFF)
// https://unicode.org/Public/UNIDATA/emoji/emoji-data.txt
// https://www.jianshu.com/p/88cf0f773396
export class EmojiParser {

    /**
     * 解析emoji字符，直到非emoji字符退出解析，并返回当前的index值
     * @param strings
     * @param startIndex
     */
    parse(strings: string[], startIndex: number): any[] {

        const arr: number[] = [];

        let state = EmojiState.NORMAL,
            cp0: number | undefined,
            cp1: number | undefined = undefined,
            i: number = startIndex,
            readAhead: string = "",
            charWidth: number = 1;

        for(; ; i++) {

            if(!strings[i]){
                break;
            }

            // 情况1：长度为1
            // s2 = String.fromCodePoint(9194)
            // s2.codePointAt(0) => 9194
            // s2.codePointAt(1) => undefined

            // s2 = String.fromCodePoint(9194, 65039)
            // s2.codePointAt(0) => 9194
            // s2.codePointAt(1) => 65039(FE0F)

            // 情况2：长度为2
            // i=0, 9760
            // i=0, undefined
            // i=1, 65039
            // i=1, undefined

            cp0 = strings[i].codePointAt(0);
            if(cp0 == undefined) {
                break;
            }

            cp1 = strings[i].codePointAt(1);
            // 辅助平面字符
            if(cp1){
                arr.push(cp0);
                // 非辅助平面字符
                if(!CommonUtils.isAuxPlaneChar(cp1)){
                    arr.push(cp1);
                    break;
                } else {
                    // i=0, 127535
                    // i=0, 56879
                    // i=1, 65039
                    // i=1, undefined

                    // 判断下一个字符
                    readAhead = strings[i + 1];
                    if(!readAhead){
                        break;
                    }
                    if(readAhead.codePointAt(0) == EmojiCode.VS16){
                        state = EmojiState.START;
                        continue;
                    }
                }
            }

            switch (state){

                case EmojiState.NORMAL:
                    // 判断是否为Emoji表情
                    // shell>> cat emoji-zwj-sequences.txt | grep -v '^$' | grep -v '^#'
                    // | awk '{print "0x"$1}' | sort | uniq | xargs printf '%d\n' | sort -n
                    if(this.isEmoji(cp0)) {
                        // 判断第一个字符是否以emoji开头
                        // 如果不是的话，直接退出循环
                        arr.push(cp0);
                        state = EmojiState.START;
                    }
                    break;

                case EmojiState.START:

                    switch (cp0){
                        case EmojiCode.VS15:
                            // VARIATION SELECTOR-15 (VS15) for text
                            arr.push(cp0);
                            state = EmojiState.NORMAL;
                            break;
                        case EmojiCode.VS16:
                            arr.push(cp0);

                            // 预读一个字符
                            readAhead = strings[i + 1];
                            if(!readAhead){
                                state = EmojiState.NORMAL;
                                break;
                            }
                            const readAheadOne = readAhead.codePointAt(0);
                            if(readAheadOne != EmojiCode.ZWJ && readAheadOne != EmojiCode.KEY_CAP && readAheadOne != EmojiCode.VS16){
                                // 如果下一个字符不是连接符标识、键帽标识、VS16标识的话，说明是结束符。
                                state = EmojiState.NORMAL;
                                break;
                            }

                            state = EmojiState.VS16;
                            break;
                        case EmojiCode.ZWJ:
                            // ZERO WIDTH JOINER
                            arr.push(cp0);
                            state = EmojiState.ZWJ;
                            break;
                        default:
                            if(cp0 >= 0x1F3FB && cp0 <= 0x1F3FF){
                                // 肤色
                                arr.push(cp0);
                                state = EmojiState.SKIN;
                            } else if (this.isRegionalIndicator(cp0)) {
                                // 区域指示符号(国旗)
                                // https://en.wikipedia.org/wiki/Regional_Indicator_Symbol
                                arr.push(cp0);
                                state = EmojiState.NORMAL;
                            } else {
                                console.info("其他");
                                console.info(arr);
                                i--;
                                state = EmojiState.NORMAL;
                                break;
                            }
                    }
                    break;
                case EmojiState.VS16:
                    arr.push(cp0);
                    if(cp0 == EmojiCode.ZWJ) {
                        state = EmojiState.VS16_ZWJ;
                    } else if(cp0 == EmojiCode.KEY_CAP){
                        // 键帽符号, 格式 #*(0-9)+FE0F+20E3
                        // 终止，退出
                        state = EmojiState.NORMAL;
                    } else if(cp0 == EmojiCode.VS16){
                        // ◾️
                        // i=0, 9726
                        // i=0, undefined
                        // i=1, 65039
                        // i=1, undefined
                        // i=2, 65039
                        // i=2, undefined
                        state = EmojiState.NORMAL;
                    }
                    break;
                case EmojiState.VS16_ZWJ:
                    // shell>> grep 'FE0F 200D' emoji-zwj-sequences.txt | grep -v '1F469'
                    // | grep -v '1F468' | awk '{print $4}' | sort | uniq
                    arr.push(cp0);
                    if(cp0 == 0x1F308){
                        // RGI_Emoji_ZWJ_Sequence  ; rainbow flag
                        // 终止，退出
                        state = EmojiState.NORMAL;
                    } else if(0x1F5E8 == cp0 || 0x2640 == cp0 || 0x2642 == cp0 || 0x26A7 == cp0) {
                        //
                        state = EmojiState.VS16_ZWJ_VS16;
                    }
                    break;
                case EmojiState.VS16_ZWJ_VS16:
                    arr.push(cp0);
                    // 终止，退出
                    state = EmojiState.NORMAL;
                    break;

                case EmojiState.ZWJ:
                    arr.push(cp0);
                    // 预读一个字符
                    readAhead = strings[i + 1];
                    if(!readAhead){
                        break;
                    }
                    switch (readAhead.codePointAt(0)){
                        case EmojiCode.ZWJ:
                            arr.push(EmojiCode.ZWJ);
                            // shell>> grep '200D.*200D' emoji-zwj-sequences.txt | awk -F ';' '{print $1}'
                            // | awk '{if($2=="200D" && $4=="200D")print $0}'
                            state = EmojiState.ZWJ_ZWJ;
                            i++;
                            break;
                        case EmojiCode.VS16:
                            arr.push(EmojiCode.VS16);
                            // shell>> grep '200D.*FE0F' emoji-zwj-sequences.txt | awk -F ';' '{print $1}'
                            // | awk '{if($2=="200D" && $4=="FE0F")print $0}'
                            state = EmojiState.ZWJ_VS16;
                            i++;
                            break;
                        default:
                            // 其他字符
                            // 终止，退出
                            state = EmojiState.NORMAL;
                            break;
                    }
                    break;
                case EmojiState.ZWJ_VS16:
                    arr.push(cp0);
                    if(cp0 == EmojiCode.ZWJ){
                        // shell>> grep '200D.*FE0F' emoji-zwj-sequences.txt | awk -F ';' '{print $1}'
                        // | awk '{if($2=="200D" && $4=="FE0F" && $5 == "200D")print $0}'
                        state = EmojiState.ZWJ_VS16ZWJ;
                    } else {
                        // 终止，退出
                        state = EmojiState.NORMAL;
                    }
                    break;
                case EmojiState.ZWJ_VS16ZWJ:
                    arr.push(cp0);
                    if(cp0 == 0x1F48B){
                        state = EmojiState.ZWJ_VS16ZWJ_ZWJ;
                    } else if(cp0 == 0x1F468 || cp0 == 0x1F469){
                        // 终止，退出
                        state = EmojiState.NORMAL;
                    }
                    break;
                case EmojiState.ZWJ_VS16ZWJ_ZWJ:
                    arr.push(cp0);
                    if(cp0 == 0x1F468 || cp0 == 0x1F469){
                        // 终止，退出
                        state = EmojiState.NORMAL;
                    }
                    break;
                case EmojiState.ZWJ_ZWJ:
                    // shell>> grep '200D.*200D' emoji-zwj-sequences.txt | awk -F ';' '{print $1}'
                    // | awk '{if($2=="200D" && $4=="200D")print $0}'
                    arr.push(cp0);
                    if(cp0 == 0x1F466 || cp0 == 0x1F467){
                        // 1F469 200D 1F467 200D 1F467
                        // 1F468 200D 1F469 200D 1F467 200D 1F467
                        // 预读一个字符
                        const readAhead = strings[i + 1];
                        if(!readAhead){
                            break;
                        }
                        if(readAhead.codePointAt(0) == EmojiCode.ZWJ){
                            i++;
                            arr.push(EmojiCode.ZWJ);
                            state = EmojiState.ZWJ_ZWJ_ZWJ;
                            break;
                        }
                    }
                    // shell>> grep '200D.*200D' emoji-zwj-sequences.txt | awk -F ';' '{print $1}'
                    // | awk '{if($2=="200D" && $4=="200D")print $0}' | awk '{if(NF==5) print $0}' | awk '{print $5}' | sort | uniq
                    // 终止，退出
                    state = EmojiState.NORMAL;
                    break;
                case EmojiState.ZWJ_ZWJ_ZWJ:
                    arr.push(cp0);
                    // 终止，退出
                    state = EmojiState.NORMAL;
                    break;

                case EmojiState.SKIN:
                    // 肤色
                    arr.push(cp0);
                    if(cp0 == EmojiCode.ZWJ){
                        state = EmojiState.SKIN_ZWJ;
                    }
                    break;
                case EmojiState.SKIN_ZWJ:
                    arr.push(cp0);
                    // 预读一个字符
                    readAhead = strings[i + 1];
                    if(!readAhead) {
                        break;
                    }
                    switch (readAhead.codePointAt(0)){
                        case EmojiCode.ZWJ:
                            arr.push(EmojiCode.ZWJ);
                            state = EmojiState.SKIN_ZWJ_ZWJ_SKIN;
                            i++;
                            break;
                        case EmojiCode.VS16:
                            arr.push(EmojiCode.VS16);
                            // 终止，退出
                            state = EmojiState.NORMAL;
                            i++;
                            break;
                        default:
                            // 其他字符
                            // 终止，退出
                            state = EmojiState.NORMAL;
                            break;
                    }
                    break;

                case EmojiState.SKIN_ZWJ_ZWJ_SKIN:
                    // grep '1F3FB' emoji-zwj-sequences.txt | awk -F ';' '{print $1}' | awk '{if(NF==7) print $0}'
                    arr.push(cp0);
                    if(cp0 >= 0x1F3FB && cp0 <= 0x1F3FF){
                        // 以肤色结束
                        // 终止，退出
                        state = EmojiState.NORMAL;
                    }
                    break;

                case EmojiState.REGIONAL_INDICATOR:
                    // 国旗分两个字符，每一个字符含有两个码点(codePoint)
                    arr.push(cp0);
                    CommonUtils.pushAux(arr, cp1);
                    // 终止，退出
                    state = EmojiState.NORMAL;
                    break;
            }

            if(state == EmojiState.NORMAL){
                // 解析完成
                charWidth = i - startIndex + 1;
                break;
            }
        }

        // console.info(String.fromCodePoint(...arr));

        return [i, charWidth, arr.length ? String.fromCodePoint(...arr): undefined];
    }

    /**
     * 是否为emoji表情
     * @param cp
     */
    isEmoji(cp: number): boolean {
        return 0x00A0 <= cp && cp <= 0x1FADF;
    }

    /**
     * 地域标识
     * @param cp0
     */
    isRegionalIndicator(cp0: number): boolean {
        return cp0 >= 0x1F1E6 && cp0 <= 0x1F1FF;
    }

}