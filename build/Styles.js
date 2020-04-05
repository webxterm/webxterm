"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Styles {
    constructor() {
        this.cssObj = {};
        this.cursorCssObj = {};
        this.els = {};
        this.keyframes = {};
        this.head = document.getElementsByTagName('HEAD').item(0);
    }
    static getStyles() {
        return this._instance;
    }
    static add(selectors, css, instance = "") {
        if (typeof selectors === 'string') {
            Styles.getStyles().put(selectors, css, instance);
        }
        else {
            for (let selector of selectors) {
                Styles.getStyles().put(selector, css, instance);
            }
        }
    }
    static addCursorStyle(selectors, css, instance = "", replace = false) {
        if (typeof selectors === 'string') {
            Styles.getStyles().put2(selectors, css, instance, replace);
        }
        else {
            for (let selector of selectors) {
                Styles.getStyles().put2(selector, css, instance, replace);
            }
        }
    }
    put(selector, css, instance = "__global__") {
        if (!!instance) {
            if (!this.cssObj[instance])
                this.cssObj[instance] = {};
            let scopedObj = this.cssObj[instance];
            if (!scopedObj[selector])
                scopedObj[selector] = {};
            let _css = scopedObj[selector];
            for (const key in css) {
                const sk = key + "";
                _css[sk] = css[sk];
            }
        }
        else {
            return this.put(selector, css, instance);
        }
        this.update();
        return this;
    }
    put2(selector, css, instance = "__global__", replace = false) {
        if (!instance || instance === "")
            return this;
        if (!this.cursorCssObj[instance] || replace)
            this.cursorCssObj[instance] = {};
        let scopedObj = this.cursorCssObj[instance];
        if (!scopedObj[selector])
            scopedObj[selector] = {};
        let _css = scopedObj[selector];
        for (const key in css) {
            _css[key + ""] = css[key + ""];
        }
        this.update2();
        return this;
    }
    update() {
        for (const scoped in this.cssObj) {
            const _scoped = scoped + "";
            const _scopedObj = this.cssObj[_scoped];
            if (!this.els[_scoped]) {
                this.els[_scoped] = document.createElement("style");
                this.els[_scoped].setAttribute("type", "text/css");
                this.els[_scoped].setAttribute("_ins", _scoped);
                if (this.head)
                    this.head.appendChild(this.els[_scoped]);
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
                }
                else {
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
            let keyframes = this.keyframes[_scoped];
            for (const name in keyframes) {
                const value = " " + keyframes[name + ""];
                let scoped2 = "";
                if (_scoped !== "__global__") {
                    scoped2 = "-" + _scoped;
                }
                cssHTML += "@keyframes " + name + scoped2 + value;
                cssHTML += "@-moz-keyframes " + name + scoped2 + value;
                cssHTML += "@-o-keyframes " + name + scoped2 + value;
                cssHTML += "@-webkit-keyframes " + name + scoped2 + value;
            }
            this.els[_scoped].innerHTML = cssHTML;
        }
    }
    update2() {
        for (const scoped in this.cursorCssObj) {
            const _scoped = scoped + "";
            const _scopeCursorObj = this.cursorCssObj[_scoped];
            if (!this.els[_scoped + "-cursor"]) {
                this.els[_scoped + "-cursor"] = document.createElement("style");
                this.els[_scoped + "-cursor"].setAttribute("type", "text/css");
                this.els[_scoped + "-cursor"].setAttribute("_ins", _scoped + "-cursor");
                if (this.head)
                    this.head.appendChild(this.els[_scoped + "-cursor"]);
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
    static addKeyFrames(name, value, instance = "__global__") {
        Styles.getStyles().putKeyFrame(instance, name, value);
    }
    putKeyFrame(instance, name, value) {
        if (!this.keyframes[instance]) {
            this.keyframes[instance] = {};
        }
        this.keyframes[instance][name] = value;
        this.update();
    }
}
exports.Styles = Styles;
Styles._instance = new Styles();
