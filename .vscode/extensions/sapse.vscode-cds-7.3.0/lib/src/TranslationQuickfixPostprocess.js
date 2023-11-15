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
exports.TranslationQuickfixPostprocess = void 0;
const fs = require("fs");
const path = require("path");
const url_1 = require("url");
const util = require("util");
const vscode = require("vscode");
const Output_1 = require("./Output");
const Tracing_1 = require("./Tracing");
class TranslationQuickfixPostprocess {
    constructor(context) {
        this.context = context;
        this.trace = new Tracing_1.Trace(Tracing_1.ClientTraceComponents.TRANSLATION, Output_1.technicalOutput);
    }
    installHook() {
        this.actualApplyEdit = vscode.workspace.applyEdit;
        vscode.workspace.applyEdit = this.onApplyEdit.bind(this);
        this.context.subscriptions.push({
            dispose: () => { vscode.workspace.applyEdit = this.actualApplyEdit; }
        });
    }
    onApplyEdit(edit) {
        return __awaiter(this, void 0, void 0, function* () {
            let found;
            try {
                found = yield this.findNewTranslationText(edit);
            }
            catch (e) {
                this.trace.log(Tracing_1.TraceLevel.ERROR, `Failed to find new translation text from edit: ${util.inspect(edit)}\n${e}`);
            }
            const applied = yield this.actualApplyEdit(edit);
            if (applied) {
                if (found) {
                    try {
                        yield this.showAndSelectNewTranslationText(found);
                    }
                    catch (e) {
                        this.trace.log(Tracing_1.TraceLevel.ERROR, `Failed to show and select new text: ${e}`);
                    }
                }
            }
            else {
                this.trace.log(Tracing_1.TraceLevel.ERROR, `Workspace edits could not be applied: ${util.inspect(edit)}`);
            }
            return applied;
        });
    }
    tryGetDocument(uri) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = uri.toString();
            let document;
            try {
                if (url.startsWith('file:') && fs.existsSync((0, url_1.fileURLToPath)(url))) {
                    document = vscode.workspace.textDocuments.find(doc => doc.uri.toString() === url);
                    if (!document) {
                        this.trace.log(Tracing_1.TraceLevel.INFO, `textDocument not found for ${url}, trying to open...`);
                        document = yield vscode.workspace.openTextDocument(uri);
                        if (!document) {
                            this.trace.log(Tracing_1.TraceLevel.ERROR, `Opening (existing) textDocument for ${url} failed`);
                        }
                    }
                }
            }
            catch (e) {
                this.trace.log(Tracing_1.TraceLevel.ERROR, `Failed to get document ${url} failed: ${e}`);
            }
            return document;
        });
    }
    findNewTranslationText(edit) {
        return __awaiter(this, void 0, void 0, function* () {
            const edits = edit.entries();
            let textEdit;
            let theUri;
            let unwrappedText;
            let document;
            let targetCursorLine;
            for (const [uri, textEdits] of edits) {
                if (!['.properties', '.csv', '.json'].includes(path.extname(uri.toString())))
                    continue;
                const unwrapRegex = /(<<<(.*)>>>)/;
                textEdit = textEdits.find(te => te.newText.match(unwrapRegex));
                if (textEdit) {
                    theUri = uri;
                    const match = textEdit.newText.match(unwrapRegex);
                    unwrappedText = match[2];
                    textEdit.newText = textEdit.newText.replace(match[1], unwrappedText);
                    document = yield this.tryGetDocument(uri);
                    const lastLine = document ? document.lineCount - 1 : 0;
                    try {
                        const editOffset = textEdit.newText.indexOf(unwrappedText);
                        const linesTilValue = textEdit.newText.slice(0, editOffset).split(/\r?\n/);
                        targetCursorLine = Math.min(textEdit.range.start.line, lastLine) + linesTilValue.length - 1;
                        this.trace.log(Tracing_1.TraceLevel.DEBUG, `target line is ${targetCursorLine}`);
                    }
                    catch (e) {
                        this.trace.log(Tracing_1.TraceLevel.ERROR, `failed to calculate target line: ${e}`);
                    }
                    break;
                }
            }
            return {
                targetCursorLine,
                unwrappedText,
                document,
                uri: theUri
            };
        });
    }
    showAndSelectNewTranslationText({ uri, document, targetCursorLine, unwrappedText }) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            if (targetCursorLine >= 0) {
                document = document || (yield this.tryGetDocument(uri));
                this.trace.log(Tracing_1.TraceLevel.DEBUG, `saving document ${(_a = document.uri) === null || _a === void 0 ? void 0 : _a.toString()}...`);
                yield document.save();
                const addTextHere = '<add text here>';
                if (unwrappedText === addTextHere) {
                    this.trace.log(Tracing_1.TraceLevel.DEBUG, `showing document ${(_b = document.uri) === null || _b === void 0 ? void 0 : _b.toString()}...`);
                    yield vscode.workspace.openTextDocument(document.uri);
                    try {
                        this.trace.log(Tracing_1.TraceLevel.DEBUG, `selecting and positioning range in line ${targetCursorLine}...`);
                        let range = document.lineAt(targetCursorLine).range;
                        const sLine = document.getText(range);
                        const selectionStart = new vscode.Position(targetCursorLine, sLine.indexOf(unwrappedText));
                        range = range.with(selectionStart, new vscode.Position(selectionStart.line, selectionStart.character + unwrappedText.length));
                        yield vscode.window.showTextDocument(document.uri, { selection: range });
                        this.trace.log(Tracing_1.TraceLevel.DEBUG, 'selecting and positioning range done');
                    }
                    catch (e) {
                        this.trace.log(Tracing_1.TraceLevel.ERROR, `applyEdit failed: ${e}`);
                    }
                }
            }
        });
    }
}
exports.TranslationQuickfixPostprocess = TranslationQuickfixPostprocess;
//# sourceMappingURL=TranslationQuickfixPostprocess.js.map