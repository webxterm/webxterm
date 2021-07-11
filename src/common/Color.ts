export class Color {

    // 系统内置颜色
    private static systemPresetColors: { [key: string]: string } = {
        'black': '#000000',
        'navy': '#000080',
        'darkblue': '#00008b',
        'mediumblue': '#0000cd',
        'blue': '#0000ff',
        'darkgreen': '#006400',
        'green': '#008000',
        'teal': '#008080',
        'darkcyan': '#008b8b',
        'deepskyblue': '#00bfff',
        'darkturquoise': '#00ced1',
        'mediumspringgreen': '#00fa9a',
        'lime': '#00ff00',
        'springgreen': '#00ff7f',
        'aqua': '#00ffff',
        'cyan': '#00ffff',
        'midnightblue': '#191970',
        'dodgerblue': '#1e90ff',
        'lightseagreen': '#20b2aa',
        'forestgreen': '#228b22',
        'seagreen': '#2e8b57',
        'darkslategray': '#2f4f4f',
        'limegreen': '#32cd32',
        'mediumseagreen': '#3cb371',
        'turquoise': '#40e0d0',
        'royalblue': '#4169e1',
        'steelblue': '#4682b4',
        'darkslateblue': '#483d8b',
        'mediumturquoise': '#48d1cc',
        'indigo': '#4b0082',
        'darkolivegreen': '#556b2f',
        'cadetblue': '#5f9ea0',
        'cornflowerblue': '#6495ed',
        'mediumaquamarine': '#66cdaa',
        'dimgray': '#696969',
        'dimgrey': '#696969',
        'slateblue': '#6a5acd',
        'olivedrab': '#6b8e23',
        'slategray': '#708090',
        'lightslategray': '#778899',
        'mediumslateblue': '#7b68ee',
        'lawngreen': '#7cfc00',
        'chartreuse': '#7fff00',
        'aquamarine': '#7fffd4',
        'maroon': '#800000',
        'purple': '#800080',
        'olive': '#808000',
        'gray': '#808080',
        'skyblue': '#87ceeb',
        'lightskyblue': '#87cefa',
        'blueviolet': '#8a2be2',
        'darkred': '#8b0000',
        'darkmagenta': '#8b008b',
        'saddlebrown': '#8b4513',
        'darkseagreen': '#8fbc8f',
        'lightgreen': '#90ee90',
        'mediumpurple': '#9370db',
        'darkviolet': '#9400d3',
        'palegreen': '#98fb98',
        'darkorchid': '#9932cc',
        'yellowgreen': '#9acd32',
        'sienna': '#a0522d',
        'brown': '#a52a2a',
        'darkgray': '#a9a9a9',
        'lightblue': '#add8e6',
        'greenyellow': '#adff2f',
        'paleturquoise': '#afeeee',
        'lightsteelblue': '#b0c4de',
        'powderblue': '#b0e0e6',
        'firebrick': '#b22222',
        'darkgoldenrod': '#b8860b',
        'mediumorchid': '#ba55d3',
        'rosybrown': '#bc8f8f',
        'darkkhaki': '#bdb76b',
        'silver': '#c0c0c0',
        'mediumvioletred': '#c71585',
        'indianred': '#cd5c5c',
        'peru': '#cd853f',
        'chocolate': '#d2691e',
        'tan': '#d2b48c',
        'lightgray': '#d3d3d3',
        'thistle': '#d8bfd8',
        'orchid': '#da70d6',
        'goldenrod': '#daa520',
        'palevioletred': '#db7093',
        'crimson': '#dc143c',
        'gainsboro': '#dcdcdc',
        'plum': '#dda0dd',
        'burlywood': '#deb887',
        'lightcyan': '#e0ffff',
        'lavender': '#e6e6fa',
        'darksalmon': '#e9967a',
        'violet': '#ee82ee',
        'palegoldenrod': '#eee8aa',
        'lightcoral': '#f08080',
        'khaki': '#f0e68c',
        'aliceblue': '#f0f8ff',
        'honeydew': '#f0fff0',
        'azure': '#f0ffff',
        'sandybrown': '#f4a460',
        'wheat': '#f5deb3',
        'beige': '#f5f5dc',
        'whitesmoke': '#f5f5f5',
        'mintcream': '#f5fffa',
        'ghostwhite': '#f8f8ff',
        'salmon': '#fa8072',
        'antiquewhite': '#faebd7',
        'linen': '#faf0e6',
        'lightgoldenrodyellow': '#fafad2',
        'oldlace': '#fdf5e6',
        'red': '#ff0000',
        'fuchsia': '#ff00ff',
        'magenta': '#ff00ff',
        'deeppink': '#ff1493',
        'orangered': '#ff4500',
        'tomato': '#ff6347',
        'hotpink': '#ff69b4',
        'coral': '#ff7f50',
        'darkorange': '#ff8c00',
        'lightsalmon': '#ffa07a',
        'orange': '#ffa500',
        'lightpink': '#ffb6c1',
        'pink': '#ffc0cb',
        'gold': '#ffd700',
        'peachpuff': '#ffdab9',
        'navajowhite': '#ffdead',
        'moccasin': '#ffe4b5',
        'bisque': '#ffe4c4',
        'mistyrose': '#ffe4e1',
        'blanchedalmond': '#ffebcd',
        'papayawhip': '#ffefd5',
        'lavenderblush': '#fff0f5',
        'seashell': '#fff5ee',
        'cornsilk': '#fff8dc',
        'lemonchiffon': '#fffacd',
        'floralwhite': '#fffaf0',
        'snow': '#fffafa',
        'yellow': '#ffff00',
        'lightyellow': '#ffffe0',
        'ivory': '#fffff0',
        'white': '#ffffff'
    };

    /**
     * 16进制颜色转10进制颜色
     * 如：#FFFFFF #FFF #FFFFFFFF  => 255,255,255[,alpha]
     * @param color
     * @param alpha 透明度 （00|0表示完全透明，ff|1表示完全不透明）
     */
    static parseColor(color: string, alpha: number | string = 0.99) {

        if (1 === 1) return color;

        if (color.indexOf("rgba") !== -1) return color;

        alpha = alpha || 'ff';

        if (color.charAt(0) === '#') {

            color = color.substring(1);

        } else {

            let c = Color.systemPresetColors[color.toLowerCase()];
            if (!c) {
                // 无效的颜色
                console.info('无效的颜色值: ' + color + ', 已自动设置为#000000(Black)。');
                c = '#000000';
            }

            color = c;
            color = color.substring(1);

        }

        let r: string = 'ff', g: string = 'ff', b: string = 'ff', a: string, len: number = color.length,
            a1: number = 255;

        if (len === 3) {
            r = color.substring(0, 1);
            g = color.substring(1, 2);
            b = color.substring(2);
            r += r;
            g += g;
            b += b;
        } else if (len === 6 || len === 8) {
            r = color.substring(0, 2);
            g = color.substring(2, 4);
            b = color.substring(4, 6);
        }

        if (len === 3 || len === 6) {
            if (typeof alpha === 'string') {
                a1 = Math.round((
                    parseInt(alpha, 16) * 100 / 255)) / 100;
            } else {
                a1 = alpha;
            }
        } else if (len === 8) {
            a1 = Math.round((
                parseInt(
                    color.substring(6), 16) * 100 / 255)) / 100;
        }

        if (a1 > 255 || a1 < 0) {
            throw new Error("Invalid alpha value: " + alpha);
        }

        return 'rgba(' + parseInt(r, 16) + ', ' +
            parseInt(g, 16) + ', ' + parseInt(b, 16) +
            ', ' + a1 + ')';
    }


}