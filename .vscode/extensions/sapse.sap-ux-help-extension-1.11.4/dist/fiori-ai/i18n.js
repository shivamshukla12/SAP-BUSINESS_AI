"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initI18n = exports.i18n = void 0;
const i18next_1 = __importDefault(require("i18next"));
const i18n_json_1 = __importDefault(require("./i18n/i18n.json"));
exports.i18n = i18next_1.default.createInstance();
async function initI18n() {
    // Initialize i18next of ide-extension
    await exports.i18n.init({
        resources: {
            en: {
                translation: i18n_json_1.default
            }
        },
        lng: 'en',
        fallbackLng: 'en',
        joinArrays: '\n\n'
    });
}
exports.initI18n = initI18n;
//# sourceMappingURL=i18n.js.map