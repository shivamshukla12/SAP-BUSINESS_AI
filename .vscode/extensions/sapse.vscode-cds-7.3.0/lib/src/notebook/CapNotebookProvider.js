"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CapNotebookProvider = void 0;
const vscode = require("vscode");
const Output_1 = require("../Output");
const Tracing_1 = require("../Tracing");
const CapNotebookController_1 = require("./CapNotebookController");
const CapNotebookSerializer_1 = require("./CapNotebookSerializer");
class CapNotebookProvider {
    constructor(context) {
        const trace = new Tracing_1.Trace(Tracing_1.ClientTraceComponents.CAP_NOTEBOOK, Output_1.technicalOutput);
        context.subscriptions.push(vscode.workspace.registerNotebookSerializer('cap-notebook', new CapNotebookSerializer_1.CapNotebookSerializer(trace), {
            transientCellMetadata: {
                newCwd: true,
                cwd: true,
                pid: true
            },
            transientDocumentMetadata: {
                env: true
            }
        }));
        context.subscriptions.push(new CapNotebookController_1.CapNotebookController(context, trace));
    }
}
exports.CapNotebookProvider = CapNotebookProvider;
//# sourceMappingURL=CapNotebookProvider.js.map