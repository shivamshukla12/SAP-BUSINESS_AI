"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.outputChannel = exports.technicalOutput = void 0;
const vscode = require("vscode");
const techOut = vscode.window.createOutputChannel('vscode-cds');
if (techOut) {
    techOut.log = (s) => {
        techOut.appendLine(`[${new Date().toISOString()}] ${s}`);
    };
}
exports.technicalOutput = techOut;
exports.outputChannel = vscode.window.createOutputChannel('CDS');
//# sourceMappingURL=Output.js.map