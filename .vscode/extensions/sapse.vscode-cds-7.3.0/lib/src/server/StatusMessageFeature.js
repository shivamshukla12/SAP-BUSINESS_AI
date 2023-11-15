"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatusMessageFeature = void 0;
const ExtensionUtil_1 = require("../ExtensionUtil");
class StatusMessageFeature {
    constructor(_client) {
        this._client = _client;
    }
    clear() { }
    fillClientCapabilities(capabilities) {
        var _a, _b;
        const window = (_a = capabilities.window) !== null && _a !== void 0 ? _a : (capabilities.window = {});
        ((_b = window['cds']) !== null && _b !== void 0 ? _b : (window['cds'] = {}))['statusMessage'] = true;
    }
    initialize() {
        const method = 'cds/statusMessage';
        this._client.onNotification(method, (params) => {
            const { message, millisToShow } = params;
            (0, ExtensionUtil_1.showInStatusBar)(message, millisToShow);
        });
    }
    getState() {
        return {
            kind: 'static'
        };
    }
    dispose() {
    }
}
exports.StatusMessageFeature = StatusMessageFeature;
//# sourceMappingURL=StatusMessageFeature.js.map