"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActiveEditorChangedFeature = void 0;
const vscode = require("vscode");
class ActiveEditorChangedFeature {
    constructor(_client) {
        this._client = _client;
    }
    clear() { }
    fillClientCapabilities(capabilities) {
        var _a, _b;
        const ws = (_a = capabilities.workspace) !== null && _a !== void 0 ? _a : (capabilities.workspace = {});
        ((_b = ws['cds']) !== null && _b !== void 0 ? _b : (ws['cds'] = {}))['didChangeActiveEditor'] = true;
    }
    initialize() {
        const client = this._client;
        let previousActiveUri;
        vscode.window.onDidChangeActiveTextEditor((editor) => {
            var _a;
            const uri = (_a = editor === null || editor === void 0 ? void 0 : editor.document) === null || _a === void 0 ? void 0 : _a.uri;
            const newActiveUri = uri ? client.code2ProtocolConverter.asUri(uri) : undefined;
            const command = 'active-editor-changed';
            const params = {
                command,
                arguments: [{
                        previousActiveUri,
                        newActiveUri
                    }]
            };
            previousActiveUri = newActiveUri;
            void client.sendRequest('workspace/executeCommand', params);
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
exports.ActiveEditorChangedFeature = ActiveEditorChangedFeature;
//# sourceMappingURL=ActiveEditorChangedFeature.js.map