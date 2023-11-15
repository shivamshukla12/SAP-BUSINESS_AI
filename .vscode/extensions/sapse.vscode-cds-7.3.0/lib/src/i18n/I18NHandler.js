"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.i18nHandler = exports.i18n = void 0;
const en_1 = require("./en");
const TEMPLATE_REGEX = /\{\{([^{}]+)}}/gi;
exports.i18n = Object.assign({}, en_1.messages);
class I18nHandler {
    constructor() {
        this.DEFAULT_LOCALE = 'en';
        this.currentLocale = this.DEFAULT_LOCALE;
    }
    setLocale(newLocale) {
        this.loadResourceBundle(newLocale);
    }
    getText(text, context) {
        let newStr = text;
        if (context) {
            let match = TEMPLATE_REGEX.exec(text);
            while (match != null) {
                const value = context[match[1].trim()];
                if (value || value === '') {
                    newStr = newStr.replace(match[0], value);
                }
                match = TEMPLATE_REGEX.exec(text);
            }
        }
        return newStr;
    }
    loadResourceBundle(locale) {
        if (this.currentLocale !== locale) {
            try {
                const contents = this.requireLocale(locale);
                Object.assign(exports.i18n, contents.messages);
                this.currentLocale = locale;
            }
            catch (e) {
                this.loadResourceBundle(this.DEFAULT_LOCALE);
            }
        }
    }
    requireLocale(locale) {
        return require(`./${locale}`);
    }
}
exports.i18nHandler = new I18nHandler();
//# sourceMappingURL=I18NHandler.js.map