"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRecordTraceCommand = void 0;
const vscode = require("vscode");
const Output_1 = require("../Output");
const Tracing_1 = require("../Tracing");
const ZipTraces_1 = require("./ZipTraces");
const RECORD_TRACES_COMMAND_ID = 'cds.lsp.traces.startRecording';
const RECORD_VERBOSE_TRACES_COMMAND_ID = 'cds.lsp.traces.startRecording.detailed';
const STOP_RECORD_TRACES_COMMAND_ID = 'cds.lsp.traces.stopRecording';
function registerRecordTraceCommand(context) {
    let session;
    context.subscriptions.push(vscode.commands.registerCommand(RECORD_TRACES_COMMAND_ID, () => __awaiter(this, void 0, void 0, function* () {
        session = new RecordingSession(Tracing_1.TraceLevel.INFO);
        yield session.startRecording();
    })));
    context.subscriptions.push(vscode.commands.registerCommand(RECORD_VERBOSE_TRACES_COMMAND_ID, () => __awaiter(this, void 0, void 0, function* () {
        session = new RecordingSession(Tracing_1.TraceLevel.VERBOSE);
        yield session.startRecording();
    })));
    context.subscriptions.push(vscode.commands.registerCommand(STOP_RECORD_TRACES_COMMAND_ID, () => __awaiter(this, void 0, void 0, function* () {
        yield (session === null || session === void 0 ? void 0 : session.stopRecording());
        session = undefined;
    })));
}
exports.registerRecordTraceCommand = registerRecordTraceCommand;
class RecordingSession {
    constructor(level) {
        this.level = level;
    }
    startRecording() {
        return __awaiter(this, void 0, void 0, function* () {
            Output_1.outputChannel.clear();
            this.traceComponents = new TraceComponents();
            yield this.traceComponents.enableComponents(this.level);
            this.statusItem = this.showStatusItem();
            this.showOutput();
        });
    }
    stopRecording() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (this.statusItem) {
                this.statusItem.dispose();
                this.statusItem = undefined;
                try {
                    const action = yield this.showSavePopup();
                    if (action) {
                        yield vscode.commands.executeCommand(ZipTraces_1.ZIP_TRACES_COMMAND_ID, action === 'WithSources');
                    }
                }
                finally {
                    yield ((_a = this.traceComponents) === null || _a === void 0 ? void 0 : _a.restore());
                }
            }
        });
    }
    showOutput() {
        Output_1.outputChannel.show(true);
        Output_1.outputChannel.appendLine(`CDS Language Support is RECORDING ${this.level > Tracing_1.TraceLevel.INFO ? 'detailed ' : ''}traces
  
In case you want to record the trace for a support ticket, reproduce the problem NOW

Once you have reproduced the problem, click on 'RECORDING TRACES' in the status bar.
The traces will be zipped and stored in your project root.
From there you can take the Zip file and attach it to a support ticket.

Thank you

`);
    }
    showStatusItem() {
        const item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);
        item.text = 'RECORDING TRACES $(record)';
        item.command = { command: STOP_RECORD_TRACES_COMMAND_ID, arguments: [], title: '(title not used)', tooltip: '(tooltip not used)' };
        item.tooltip = new vscode.MarkdownString(`_CDS Language Support is currently recording ${this.level > Tracing_1.TraceLevel.INFO ? 'detailed ' : ''}traces_

Reproduce potential problems now

Once finished click this item to complete the recording`);
        item.show();
        return item;
    }
    showSavePopup() {
        return __awaiter(this, void 0, void 0, function* () {
            const SAVE = 'Save Traces';
            const SAVE_SOURCES = 'Save Traces including Project Sources';
            const { title: action } = yield vscode.window.showInformationMessage('Save CDS Language Support trace files', {
                modal: true,
                detail: `Please note that the trace files likely contain personal data,
namely the user name which is typically part of file paths.
Some requests like source formatting may trace the formatted CDS source file.

If you don't mind, including the project sources will greatly enhance the possibility to reproduce problems.

All data is EXCLUSIVELY used for fixing the reported issue, and not used in any other way. 
`
            }, { title: SAVE }, { title: SAVE_SOURCES }, { title: 'Cancel', isCloseAffordance: true });
            switch (action) {
                case SAVE: return 'JustTraces';
                case SAVE_SOURCES: return 'WithSources';
                default: return undefined;
            }
        });
    }
}
class TraceComponents {
    constructor() {
        this.components = this.getComponents();
        this.changed = false;
    }
    enableComponents(level) {
        return __awaiter(this, void 0, void 0, function* () {
            Output_1.outputChannel.appendLine(`
(switching 'cds.trace.components' to '${Tracing_1.TraceLevel[level]}')
`);
            yield vscode.workspace.getConfiguration('cds').update('trace.components', [{ name: '*', level: (0, Tracing_1.toConfigLevel)(level) }]);
            this.changed = true;
            return this.getComponents();
        });
    }
    getComponents() {
        return vscode.workspace.getConfiguration('cds').get('trace.components');
    }
    restore() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.changed) {
                Output_1.outputChannel.appendLine(`
(restoring 'cds.trace.components')
`);
                yield vscode.workspace.getConfiguration('cds').update('trace.components', this.components);
                this.changed = false;
            }
        });
    }
}
//# sourceMappingURL=RecordTraceCommand.js.map