"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class CommonUtils {
    static isEmpty(value) {
        if (typeof value === 'string') {
            return value.length === 0;
        }
        else if (typeof value === "undefined") {
            return true;
        }
        else if (typeof value === 'object') {
            if (value instanceof Array) {
                return value.length === 0;
            }
            else if (value instanceof Object) {
                let flag = true;
                for (let key in value) {
                    flag = false;
                    if (!flag) {
                        break;
                    }
                }
                return flag;
            }
        }
        else if (typeof value === 'function' || typeof value === 'number' || typeof value === 'boolean') {
            return false;
        }
        return (value + "").length === 0;
    }
    static px(d) {
        return d + 'px';
    }
    static strlen(str) {
        let len = 0;
        for (let i = 0; i < str.length; i++) {
            let chr = str[i];
            if (/[\u4E00-\u9FA5]|[\uFE30-\uFFA0]/gi.test(chr)) {
                len += 2;
            }
            else {
                len += 1;
            }
        }
        return len;
    }
    static addClass(element, classNames) {
        if (!element)
            return;
        let className = element.className;
        function update(name) {
            if (className.indexOf(name) === -1) {
                className += ' ' + name;
                return true;
            }
        }
        if (typeof classNames === 'object') {
            for (let item of classNames)
                update(item);
        }
        else {
            if (!update(classNames)) {
                return;
            }
        }
        element.className = className.trim();
    }
    static removeClass(element, classNames) {
        if (!element)
            return;
        let className = element.className;
        function update(name) {
            if (className.indexOf(name) !== -1) {
                className = className.replace(new RegExp(name, 'g'), '');
                return true;
            }
        }
        if (typeof classNames === 'object') {
            for (let item of classNames)
                update(item);
        }
        else {
            if (!update(classNames)) {
                return;
            }
        }
        element.className = className.trim();
    }
    static hasClass(element, classNames) {
        if (!element)
            return;
        if (typeof classNames === 'string') {
            return element.className.indexOf(classNames) !== -1;
        }
        else if (typeof classNames === 'object') {
            return classNames.map((item) => element.className.indexOf(item) !== -1);
        }
    }
    static str_len(s = '') {
        return s.replace(/[^\x00-\xff]/g, "01").length;
    }
}
exports.CommonUtils = CommonUtils;
