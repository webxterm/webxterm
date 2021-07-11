/**
 * 样式创建和重构
 */
export class Styles {

    private readonly head: Element | null;

    // scoped: {
    //      .selector: {
    //          color: ''
    //      }
    // }
    private cssObj: {
        [scoped: string]: {
            [selector: string]: {
                [key: string]: string
            }
        }
    } = {};

    // 光标样式
    private cursorCssObj: {
        [scoped: string]: {
            [selector: string]: {
                [key: string]: string
            }
        }
    } = {};

    // 元素
    private els: {
        [scoped: string]: HTMLElement
    } = {};

    // 动画
    private keyframes: {
        [scoped: string]: {
            [name: string]: string
        }
    } = {};

    private static _instance: Styles = new Styles();

    public static getStyles(): Styles {
        return this._instance;
    }

    constructor() {
        this.head = document.getElementsByTagName('HEAD').item(0);
    }

    public static add(selectors: string | string[], css: { [key: string]: string }, instance: string = ""): void {
        if (typeof selectors === 'string') {
            Styles.getStyles().put(selectors, css, instance);
        } else {
            for (let selector of selectors) {
                Styles.getStyles().put(selector, css, instance);
            }
        }
    }

    public static addCursorStyle(selectors: string | string[], css: { [key: string]: string }, instance: string = "", replace: boolean = false): void {
        if (typeof selectors === 'string') {
            Styles.getStyles().put2(selectors, css, instance, replace);
        } else {
            for (let selector of selectors) {
                Styles.getStyles().put2(selector, css, instance, replace);
            }
        }
    }

    /**
     * 设置样式
     * @param selector 选择器
     * @param css 样式
     * @param instance 属性选择器(应用范围)
     */
    public put(selector: string, css: { [key: string]: string }, instance: string = "__global__"): Styles {

        if (!!instance) {
            // 属性选择器
            if (!this.cssObj[instance]) this.cssObj[instance] = {};

            let scopedObj = this.cssObj[instance];

            if (!scopedObj[selector]) scopedObj[selector] = {};

            let _css = scopedObj[selector];
            for (const key in css) {
                const sk = key + "";
                _css[sk] = css[sk];
            }

        } else {

            return this.put(selector, css, instance);

        }

        this.update();

        return this;
    }


    /**
     * 设置样式
     * @param selector 选择器
     * @param css 样式
     * @param instance 属性选择器(应用范围)
     * @param replace 是否替换全部
     */
    public put2(selector: string, css: { [key: string]: string }, instance: string = "__global__", replace: boolean = false): Styles {

        if (!instance || instance === "") return this;

        // 属性选择器
        if (!this.cursorCssObj[instance] || replace) this.cursorCssObj[instance] = {};

        let scopedObj = this.cursorCssObj[instance];

        if (!scopedObj[selector]) scopedObj[selector] = {};

        let _css = scopedObj[selector];
        for (const key in css) {
            _css[key + ""] = css[key + ""];
        }

        this.update2();

        return this;
    }

    /**
     * 刷新内存到元素中
     */
    public update(): void {

        for (const scoped in this.cssObj) {
            const _scoped = scoped + "";
            const _scopedObj = this.cssObj[_scoped];

            if (!this.els[_scoped]) {
                this.els[_scoped] = document.createElement("style");
                this.els[_scoped].setAttribute("type", "text/css");
                this.els[_scoped].setAttribute("_ins", _scoped);
                if (this.head) this.head.appendChild(this.els[_scoped]);
            }

            let cssHTML = "";

            for (const selector in _scopedObj) {
                let _selector = selector + "";
                const _selectorObj = _scopedObj[_selector];

                if (_selector === ".webxterm") {
                    _selector = "";
                }

                if (_scoped !== "__global__") {
                    cssHTML += ".webxterm[instance=\"" + _scoped + "\"] ";
                } else {
                    cssHTML += ".webxterm ";
                }

                cssHTML += _selector + "{";

                for (const key in _selectorObj) {
                    const _key = key + "";
                    const value = _selectorObj[_key];
                    if (!!value)
                        cssHTML += _key + ": " + value + ";";
                }
                cssHTML += "} ";
            }

            // 动画
            let keyframes = this.keyframes[_scoped];  // {}
            for (const name in keyframes) {
                const value = " " + keyframes[name + ""];
                let scoped2 = "";

                if (_scoped !== "__global__") {
                    scoped2 = "-" + _scoped;
                }
                cssHTML += "@keyframes " + name + scoped2 + value;
                cssHTML += "@-moz-keyframes " + name + scoped2 + value; // Firefox
                cssHTML += "@-o-keyframes " + name + scoped2 + value; // Opera
                cssHTML += "@-webkit-keyframes " + name + scoped2 + value;  // Safari Chrome
            }

            this.els[_scoped].innerHTML = cssHTML;
        }

    }

    public update2(): void {

        for (const scoped in this.cursorCssObj) {
            const _scoped = scoped + "";
            const _scopeCursorObj = this.cursorCssObj[_scoped];

            if (!this.els[_scoped + "-cursor"]) {
                this.els[_scoped + "-cursor"] = document.createElement("style");
                this.els[_scoped + "-cursor"].setAttribute("type", "text/css");
                this.els[_scoped + "-cursor"].setAttribute("_ins", _scoped + "-cursor");
                if (this.head) this.head.appendChild(this.els[_scoped + "-cursor"]);
            }

            let cssHTML = "";

            for (const selector in _scopeCursorObj) {
                let _selector = selector + "";
                const _selectorObj = _scopeCursorObj[_selector];

                if (_selector === ".webxterm") {
                    _selector = "";
                }

                cssHTML += ".webxterm[instance=\"" + _scoped + "\"] " + _selector + "{";
                for (const key in _selectorObj) {
                    const _key = key + "";
                    const value = _selectorObj[_key];
                    if (!!value)
                        cssHTML += _key + ": " + value + ";";
                }
                cssHTML += "} ";
            }

            this.els[_scoped + "-cursor"].innerHTML = cssHTML;
        }

    }

    /**
     * 添加动画
     * @param instance
     * @param name
     * @param value
     */
    static addKeyFrames(name: string, value: string, instance: string = "__global__") {
        Styles.getStyles().putKeyFrame(instance, name, value);
    }


    /**
     * 添加动画
     * @param instance
     * @param name
     * @param value
     */
    public putKeyFrame(instance: string, name: string, value: string): void {

        if (!this.keyframes[instance]) {
            this.keyframes[instance] = {};
        }

        this.keyframes[instance][name] = value;

        this.update();
    }
}