"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerConfigUiCommand = void 0;
const vscode = require("vscode");
const Output_1 = require("../Output");
const Tracing_1 = require("../Tracing");
const ConfigurationPanel_1 = require("./ConfigurationPanel");
function registerConfigUiCommand(context) {
    let configPanel;
    context.subscriptions.push(vscode.commands.registerCommand('cds.showConfiguration', (uri) => {
        var _a;
        if (!((_a = vscode.workspace.workspaceFolders) === null || _a === void 0 ? void 0 : _a.length)) {
            void vscode.window.showInformationMessage('First open a folder that can be used to persist the code formatting settings to');
            return;
        }
        if (!configPanel) {
            configPanel = new ConfigurationPanel_1.ConfigurationPanel(context, new Tracing_1.Trace(Tracing_1.ClientTraceComponents.CONFIG_UI, Output_1.technicalOutput));
        }
        void configPanel.show(uri);
    }));
}
exports.registerConfigUiCommand = registerConfigUiCommand;
//# sourceMappingURL=ConfigUiCommand.js.map