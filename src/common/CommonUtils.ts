import {CanvasSelectionPoint} from "../selection/CanvasSelectionPoint";


export class CommonUtils {

    /**
     * 判断传入的值是否为空
     *
     * @param value
     */
    static isEmpty(value: any): boolean {

        // 数值
        if (typeof value === 'string') {
            return value.length === 0;
        } else if (typeof value === "undefined") {
            return true;
        } else if (typeof value === 'object') {
            // 对象 & 数组
            if (value instanceof Array) {
                // 数组
                return value.length === 0;
            } else if (value instanceof Object) {
                // 对象
                let flag = true;
                for (let key in value) {
                    flag = false;
                    if (!flag) {
                        break;
                    }
                }
                return flag;
            }

        } else if (typeof value === 'function' || typeof value === 'number' || typeof value === 'boolean') {
            return false;
        }

        return (value + "").length === 0;
    }

    /**
     * 添加像素单位
     * @param d
     * @returns {string}
     */
    static px(d: number): string {
        return d + 'px';
    }

    /**
     * 获取字符串的长度
     * @param str
     */
    static strlen(str: string): number {

        let len = 0;
        for (let i = 0; i < str.length; i++) {
            let chr = str[i];
            if (/[\u4E00-\u9FA5]|[\uFE30-\uFFA0]/gi.test(chr)) {
                len += 2;
            } else {
                len += 1;
            }
        }

        return len;

    }

    /**
     * 更新元素的class
     * @param element
     * @param classNames
     */
    static addClass(element: HTMLElement | null, classNames: string | string[]) {

        if (!element) return;

        let className = element.className;

        function update(name: string) {
            if (className.indexOf(name) === -1) {
                className += ' ' + name;
                return true;
            }
        }

        if (typeof classNames === 'object') {
            for (let item of classNames)
                update(item);
        } else {
            if (!update(classNames)) {
                return;
            }
        }

        element.className = className.trim();

    }

    /**
     * 删除元素的class
     * @param element
     * @param classNames
     */
    static removeClass(element: HTMLElement | null, classNames: string | string[]) {

        if (!element) return;

        let className = element.className;

        function update(name: string) {
            if (className.indexOf(name) !== -1) {
                className = className.replace(new RegExp(name, 'g'), '');
                return true;
            }

        }

        if (typeof classNames === 'object') {
            for (let item of classNames) update(item);
        } else {
            if (!update(classNames)) {
                return;
            }
        }

        element.className = className.trim();

    }

    /**
     * 判断是否含有某个class
     * @param element
     * @param classNames
     */
    static hasClass(element: HTMLElement, classNames: string | string[]) {

        if (!element) return;

        if (typeof classNames === 'string') {
            return element.className.indexOf(classNames) !== -1;
        } else if (typeof classNames === 'object') {
            return classNames.map((item) => element.className.indexOf(item) !== -1);
        }
    }

    /**
     * 获取字符串的实际长度
     * @param s
     * @returns {number}
     */
    static str_len(s: string = '') {
        return s.replace(/[^\x00-\xff]/g, "01").length;
    }

    /**
     * 实际长度，emoji当一个长度
     * @param str
     */
    // static real_str_len(str: string = ''){
    //     return Array.from(str).length;
    // }

    // static charAt(str: string, index: number){
    //     let i = 0;
    //     for(let s of str){
    //         if(i == index){
    //             return s;
    //         }
    //         i++;
    //     }
    //     return '';
    // }
    //
    // static substring(str: string, startIndex: number, stopIndex: number = -1){
    //
    //     let i = 0, result = [];
    //     for(let s of str){
    //         if(i >= startIndex){
    //             result.push(s);
    //         } else if((stopIndex != -1 && i >= stopIndex)){
    //             break
    //         }
    //         i++;
    //     }
    //     return result.join('');
    //
    // }

    static copyArray(array: any[]): any[] {
        let result = [];
        for (let i = 0, len = array.length; i < len; i++) {
            result[i] = array[i];
        }
        return result;
    }

    /**
     * 是否为中文
     * @param str
     */
    static isChinese(str: string): boolean {
        return /[\u4E00-\u9FA5]|[\uFE30-\uFFA0]/gi.test(str);
    }

    /**
     * 是否中文符号
     * @param str
     */
    static isChineseSymbol(str: string): boolean {
        return /[\u3000-\u303F]|[\u2E80-\u2EFF]/gi.test(str);
    }

    /**
     * 是否为中文字符串、包含中文符号
     * @param str
     */
    static isChinese2(str: string){
        return /[\u4E00-\u9FA5]|[\uFE30-\uFFA0]|[\u3000-\u303F]|[\u2E80-\u2EFF]/gi.test(str);
    }

    /**
     * 是否数字+字母
     * @param str
     */
    static isNumberLetter(str: string): boolean {
        return /[a-zA-Z0-9_-]/gi.test(str);
    }

    /**
     * 是否为英文特殊符号，非半角空格
     * @param str
     */
    static isSymbol(str: string) {
        return /[`~!@#$^&*()=|{}':;,\[\].<>/?]/gi.test(str);
    }

    /**
     * 是否左符号，如 (
     * @param str
     */
    static isLeftSymbol(str: string){
        return /[({\[<（【「《]/gi.test(str);
    }

    /**
     * 是否右符号，如 )
     * @param str
     */
    static isRightSymbol(str: string){
        return /[)}\]>）】」》]/gi.test(str);
    }


    /**
     * 是否空格
     * @param str
     */
    static isBlank(str: string) {
        return str == " ";
    }

    /**
     * 判断两个点是否相同
     * @param p1
     * @param p2
     */
    static isSamePoint(p1: CanvasSelectionPoint, p2: CanvasSelectionPoint) {
        return p1 && p2 && (p1.x == p2.x && p1.y == p2.y);
    }

    /**
     * 是否全部都在同一个点
     * @param points
     */
    static isSamePointArray(points: CanvasSelectionPoint[]){

        for(let i = 1, len = points.length, sp1, sp2; i < len; i++){
            sp1 = points[i - 1];
            sp2 = points[i];
            if(!(sp1 && sp2 && sp1.x == sp2.x && sp1.y == sp2.y)){
                return false;
            }
        }

        return true;
    }

    /**
     * 是否为双击
     * @param timeArray
     * @param interval
     */
    static isDoubleClick(timeArray: number[], interval: number = 500){
        return (timeArray[1] - timeArray[0]) < interval;
    }

    /**
     * 是否为有效的事件间隔
     * @param timeArray
     * @param interval
     * @param interval2
     */
    static isValidIntervalArray(timeArray: number[], interval: number = 500, interval2: number = 1500){

        for(let i = 1, len = timeArray.length; i < len; i++){
            if(i == 1 && timeArray[i - 1] < timeArray[i] - interval){
                return false;
            }
            if(i == 2 && timeArray[i - 1] < timeArray[i] - interval2){
                return false;
            }
        }
        return true;
    }

    /**
     * 两个点为负纵坐标（y值越大，代表越往下）
     * @param p1
     * @param p2
     */
    static indexPoint(p1: CanvasSelectionPoint, p2: CanvasSelectionPoint) {
        if (!p1 || !p2) {
            return false;
        }
        if (p1.y < p2.y) {
            return true;
        } else if (p1.y == p2.y) {
            return p1.x < p2.x;
        }
        return false;
    }

    /**
     * 反向对比，正纵坐标（y值越大，代表越往上）
     * @param p1
     * @param p2
     */
    static reverseIndexPoint(p1: CanvasSelectionPoint, p2: CanvasSelectionPoint) {
        if (!p1 || !p2) {
            return false;
        }
        if (p1.y < p2.y) {
            return false;
        } else if (p1.y == p2.y) {
            return p1.x > p2.x;
        }
        return true;
    }

    /**
     * 二分法查找
     * @param arr
     * @param value
     */
    static indexOf(arr: number[], value: number): number{

        let low = 0, high = arr.length - 1, mid;

        while (low <= high){
            mid = Math.floor((low + high) / 2);
            if(arr[mid] == value) {
                return mid;
            } else if(arr[mid] > value){
                high = mid - 1;
            } else if(arr[mid] < value){
                low = mid + 1;
            }
        }
        return -1;
    }

    /**
     * 是否包含某一个元素
     * @param arr
     * @param value
     */
    static contains(arr: number[], value: number | undefined): boolean {
        if(value == undefined) {
            return false;
        }
        return CommonUtils.indexOf(arr, value) > 0;
    }

    /**
     * 只有value为非undefined才push
     * @param arr
     * @param value
     */
    static push(arr: number[], value: number | undefined) {
        if(value == undefined) {
            return;
        }
        arr.push(value);
    }

    /**
     * 插入辅助平面字符
     * @param arr
     * @param cp
     */
    static pushAux(arr: number[], cp: number | undefined){
        // 辅助平面字符
        // let H = Math.floor((codePoint0 - 0x10000) / 0x400) + 0xD800,
        //     L = (codePoint0 - 0x10000) % 0x400 + 0xDC00;
        // 实际上 String.fromCodePoint(codePoint0) = String.fromCodePoint(H, L)
        if(cp == undefined) {
            return;
        }
        if (cp && !CommonUtils.isAuxPlaneChar(cp)) {
            CommonUtils.push(arr, cp);
        }
    }

    /**
     * 是否为辅助平面字符
     * @param codePoint
     */
    static isAuxPlaneChar(codePoint: number){
        return codePoint >= 0xDC00 && codePoint <= 0xDFFF;
    }


    /**
     * 二分法查找
     * @param arr
     * @param num
     * @param startIndex
     * @param stopIndex
     */
    static indexOf2(arr: number[], num: number, startIndex: number, stopIndex: number): number{
        const middleIndex = Math.floor((startIndex + stopIndex)/2),
            middleVal = arr[middleIndex];

        if(middleVal > num){
            // 查询左边
            if(middleIndex == 0){
                return -1;
            }
            return CommonUtils.indexOf2(arr, num, startIndex, middleIndex);
        } else if(middleVal < num) {
            // 查询右边
            if(middleIndex == arr.length - 1){
                return -1;
            }
            return CommonUtils.indexOf2(arr, num, middleIndex, stopIndex);
        }

        return middleIndex;
    }


}