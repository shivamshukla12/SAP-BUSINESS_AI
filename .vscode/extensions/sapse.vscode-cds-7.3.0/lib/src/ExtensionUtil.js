"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.showInStatusBar = exports.extensionUtil = void 0;
const vscode = require("vscode");
class ExtensionUtil {
    constructor() {
        this.EXTENSION_ID = 'SAPSE.vscode-cds';
        this.CONFIG_NAME = 'cds';
        this.LANGUAGE_NAME = 'cds';
    }
    getExtension() {
        return vscode.extensions.getExtension(this.EXTENSION_ID);
    }
}
exports.extensionUtil = new ExtensionUtil();
function showInStatusBar(text, timeout = 5000, position = vscode.StatusBarAlignment.Left) {
    const item = vscode.window.createStatusBarItem(position);
    item.text = text;
    item.show();
    let disposed = false;
    const dispose = () => {
        if (!disposed) {
            disposed = true;
            item.dispose();
        }
    };
    setTimeout(dispose, timeout).unref();
    return dispose;
}
exports.showInStatusBar = showInStatusBar;
//# sourceMappingURL=ExtensionUtil.js.map