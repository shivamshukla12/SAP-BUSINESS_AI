"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const views_1 = require("./views");
const i18n_1 = require("./i18n");
const workspaceConfiguration_1 = require("./utils/workspaceConfiguration");
/**
 * Activates the extension.
 *
 * @param {ExtensionContext} context - The context provided by VS Code for extensions.
 * @returns {Promise<void>} A promise that resolves when the activation is complete.
 */
async function activate(context) {
    // Initialize translations of texts
    (0, i18n_1.initI18n)();
    // Add chat project explorer tree view to activity bar view container
    (0, views_1.addChatProjectExplorerTreeView)(context, 'sap-ux-help-fiori-ai.chatProjectExplorerView');
    // Add chat webview view to activity bar view container
    (0, views_1.addChatWebviewView)(context, 'sap-ux-help-fiori-ai.chatView');
    // Initialize config and register commands to manage it
    await (0, workspaceConfiguration_1.initConfigCommands)(context);
}
exports.activate = activate;
/**
 * Deactivates the extension.
 *
 * @returns {Promise<void>} A promise that resolves when the deactivation is complete.
 */
async function deactivate() {
    // Do nothing
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map