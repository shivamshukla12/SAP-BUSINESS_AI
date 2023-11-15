"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserOutputFeature = void 0;
const Output_1 = require("../Output");
class UserOutputFeature {
    constructor(_client) {
        this._client = _client;
    }
    clear() { }
    fillClientCapabilities(capabilities) {
        var _a, _b;
        const window = (_a = capabilities.window) !== null && _a !== void 0 ? _a : (capabilities.window = {});
        ((_b = window['cds']) !== null && _b !== void 0 ? _b : (window['cds'] = {}))['userOutput'] = true;
    }
    initialize() {
        const method = 'cds/userOutput';
        this._client.onNotification(method, (params) => {
            const { message, reveaOutputWindowlIfHidden } = params;
            if (reveaOutputWindowlIfHidden) {
                Output_1.outputChannel.show(true);
            }
            Output_1.outputChannel.appendLine(message);
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
exports.UserOutputFeature = UserOutputFeature;
//# sourceMappingURL=UserOutputFeature.js.map