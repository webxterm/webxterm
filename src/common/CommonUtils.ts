

export class CommonUtils {

    /**
     * 判断传入的值是否为空
     *
     * @param value
     */
    static isEmpty(value: any): boolean{

        // 数值
        if(typeof value === 'string'){
            return value.length === 0;
        } else if(typeof value === "undefined"){
            return true;
        } else if(typeof value === 'object'){
            // 对象 & 数组
            if(value instanceof Array){
                // 数组
                return value.length === 0;
            } else if(value instanceof Object){
                // 对象
                let flag = true;
                for(let key in value){
                    flag = false;
                    if(!flag){
                        break;
                    }
                }
                return flag;
            }

        } else if(typeof value === 'function' || typeof value === 'number' || typeof value === 'boolean'){
            return false;
        }

        return (value + "").length === 0;
    }

    /**
     * 添加像素单位
     * @param d
     * @returns {string}
     */
    static px(d: number): string{
        return d + 'px';
    }

    /**
     * 获取字符串的长度
     * @param str
     */
    static strlen(str: string): number{

        let len = 0;
        for(let i = 0; i < str.length; i++){
            let chr = str[i];
            if(/[\u4E00-\u9FA5]|[\uFE30-\uFFA0]/gi.test(chr)){
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
    static addClass(element: HTMLElement | null, classNames: string | string[]){

        if(!element) return;

        let className = element.className;

        function update(name: string){
            if(className.indexOf(name) === -1){
                className += ' ' + name;
                return true;
            }
        }

        if(typeof classNames === 'object'){
            for(let item of classNames)
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
    static removeClass(element: HTMLElement | null, classNames: string | string[]){

        if(!element) return;

        let className = element.className;

        function update(name: string) {
            if(className.indexOf(name) !== -1){
                className = className.replace(new RegExp(name, 'g'), '');
                return true;
            }

        }

        if(typeof classNames === 'object'){
            for(let item of classNames) update(item);
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
    static hasClass(element: HTMLElement, classNames: string | string[]){

        if(!element) return;

        if(typeof classNames === 'string'){
            return element.className.indexOf(classNames) !== -1;
        } else if(typeof classNames === 'object'){
            return classNames.map((item) => element.className.indexOf(item) !== -1);
        }
    }

    /**
     * 获取字符串的实际长度
     * @param s
     * @returns {number}
     */
    static str_len(s: string = ''){
        return s.replace(/[^\x00-\xff]/g, "01").length;
    }


}