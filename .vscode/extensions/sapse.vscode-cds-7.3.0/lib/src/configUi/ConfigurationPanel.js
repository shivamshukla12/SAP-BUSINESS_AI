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
exports.ConfigurationPanel = void 0;
const events_1 = require("events");
const os = require("os");
const path = require("path");
const url_1 = require("url");
const vscode = require("vscode");
const Tracing_1 = require("../Tracing");
const CdsPrettyPrintOverruleOptions_1 = require("./CdsPrettyPrintOverruleOptions");
const ConfigHtml_1 = require("./ConfigHtml");
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms).unref());
}
const CDS_PRETTIER_JSON = '.cdsprettier.json';
const MAGENTA = '\x1b[1;35m';
const RESET = '\x1b[0m';
const tmpPath = path.join(os.tmpdir(), 'vscode-cds/sample.cds');
const tmpUri = (0, url_1.pathToFileURL)(tmpPath).toString();
const DemoUri = vscode.Uri.parse(tmpUri);
const OptionsColumn = vscode.ViewColumn.One;
const SampleColumn = vscode.ViewColumn.Two;
class ConfigurationPanel {
    constructor(context, trace) {
        this.context = context;
        this.trace = trace;
        this._disposables = [];
        this.optionChanged = new events_1.EventEmitter();
        this._closingTriggered = false;
        this.noTabsBeforeOpening = false;
        this._listenerReg = 0;
        const languageClient = context.extension.exports.getLanguageClient();
        this.prettyPrint = new CdsPrettyPrintOverruleOptions_1.CdsPrettyPrintOverruleOptions(languageClient, trace);
        this.configHtml = new ConfigHtml_1.ConfigHtml(this.prettyPrint);
        this._selectedCategory = Object.values(this.prettyPrint.getSchema())
            .map(metaOption => metaOption.category)
            .sort()[0];
        this.optionChanged.on('optionChanged', (optionAndValue) => __awaiter(this, void 0, void 0, function* () {
            this.prettyPrint.onOptionChanged(optionAndValue);
            const prefixedOptionName = optionAndValue[0];
            const codeExample = this.isDemoEditor()
                ? prefixedOptionName ? this.prettyPrint.getSchema()[prefixedOptionName].sample : ''
                : this._editorDocument.getText();
            const formattedContent = yield this.prettyPrint.beautify(codeExample);
            const invalidRange = new vscode.Range(0, 0, this._editorDocument.lineCount, 0);
            const fullRange = this._editorDocument.validateRange(invalidRange);
            const editor = this.getEditor();
            if (editor) {
                yield editor.edit(edit => edit.replace(fullRange, formattedContent));
                editor.selection = new vscode.Selection(0, 0, 0, 0);
                if (this.isDemoEditor()) {
                    yield this._editorDocument.save();
                }
            }
            else {
                this.logInfo(`No editor to apply formatted content (doc is ${this._editorDocument && this._editorDocument.uri})`);
            }
        }));
    }
    fetchConfigFile(uri) {
        return __awaiter(this, void 0, void 0, function* () {
            if (path.basename(uri.fsPath) === CDS_PRETTIER_JSON)
                return this.configForExistingSchema(uri.fsPath);
            if (uri === DemoUri)
                return this.configIfMultipleWorkspaces();
            return this.configForExistingSource(uri);
        });
    }
    configForExistingSchema(configFilePath) {
        return {
            contentUri: DemoUri,
            configFilePath
        };
    }
    configForExistingSource(cdsSourceFile) {
        return __awaiter(this, void 0, void 0, function* () {
            const projectRoot = vscode.workspace.getWorkspaceFolder(cdsSourceFile).uri.fsPath;
            const languageClient = this.context.extension.exports.getLanguageClient();
            const params = {
                command: 'config',
                sourcePath: cdsSourceFile.fsPath,
                projectPath: projectRoot
            };
            const configFile = yield languageClient.sendRequest('cds/formatContent', params);
            return {
                contentUri: cdsSourceFile,
                configFilePath: configFile || path.join(projectRoot, CDS_PRETTIER_JSON),
            };
        });
    }
    configIfMultipleWorkspaces() {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const workspaces = (_b = (_a = vscode.workspace) === null || _a === void 0 ? void 0 : _a.workspaceFolders) !== null && _b !== void 0 ? _b : [];
            const result = (configFolder) => ({
                contentUri: DemoUri,
                configFilePath: path.join(configFolder, CDS_PRETTIER_JSON)
            });
            switch (workspaces.length) {
                case 0: return result(os.homedir());
                case 1: return result(workspaces[0].uri.fsPath);
                default: {
                    const option = yield vscode.window.showQuickPick(workspaces.map((wsf, i) => ({
                        label: `${wsf.name}: ${CDS_PRETTIER_JSON}`,
                        uri: wsf.uri,
                        picked: i === 0
                    })));
                    return option
                        ? result(option.uri.fsPath)
                        : result(os.homedir());
                }
            }
        });
    }
    show(uri = DemoUri) {
        return __awaiter(this, void 0, void 0, function* () {
            const schemaProps = this.prettyPrint.getSchema();
            const config = yield this.fetchConfigFile(uri);
            this.prettyPrint.configFile = config.configFilePath;
            const { contentUri } = config;
            yield this.prepareSampleFile(contentUri);
            this.logInfo(`show(${contentUri})`);
            const doAfterEditorOpened = this.showOptionsPanel();
            yield this.showEditor(contentUri);
            doAfterEditorOpened();
            const firstProp = Object.entries(schemaProps)
                .filter(([, metaOpt]) => metaOpt.category === this._selectedCategory)
                .map(([name,]) => name)
                .sort()[0];
            const currentOptions = this.prettyPrint.getEffectiveFormattingOptions();
            return this.handleMessages({ command: 'onUserChangedOption', optionAndValue: [firstProp, currentOptions[firstProp]] });
        });
    }
    prepareSampleFile(contentUri) {
        return __awaiter(this, void 0, void 0, function* () {
            if (contentUri === DemoUri) {
                const schema = this.prettyPrint.getSchema();
                const firstOption = Object.entries(schema)[0];
                yield vscode.workspace.fs.writeFile(contentUri, Buffer.from(firstOption[1].sample, 'utf8'));
            }
        });
    }
    showOptionsPanel() {
        this.logInfo('showOptionsPanel()');
        if (this._optionsPanel) {
            this.logInfo('_optionsPanel.reveal');
            this._optionsPanel.reveal(OptionsColumn);
            return () => { };
        }
        else {
            this.logInfo('createWebPanel');
            return this.createWebPanel(OptionsColumn);
        }
    }
    closeOptionsPanel() {
        this.logInfo('closeOptionsPanel()');
        if (this._optionsPanel) {
            this.logInfo('Closing optionsPanel...');
            this._optionsPanel.dispose();
            this.logInfo('Closed optionsPanel.');
        }
    }
    getEditor() {
        let editor;
        if (this._editorDocument) {
            editor = vscode.window.visibleTextEditors.find(te => {
                this.logInfo(`getEditor-visibleEditor: ${te.document ? te.document.uri : 'no doc'}`);
                return (te.document === this._editorDocument);
            });
        }
        this.logInfo(`getEditor() -> ${editor ? editor.document.uri : editor}`);
        return editor;
    }
    isUriOfEditor(uri) {
        const editorUri = this._editorDocument ? this._editorDocument.uri.toString() : undefined;
        const b = editorUri === uri.toString();
        this.logInfo(`isUriOfEditor(${uri}) -> ${b}`);
        return b;
    }
    isDemoEditor() {
        return this._editorDocument && this._editorDocument.uri.toString() === DemoUri.toString();
    }
    showEditor(uri) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logInfo(`showEditor(${uri})`);
            const columnOneAlreadyUsed = !!vscode.window.visibleTextEditors.find(te => te.viewColumn === vscode.ViewColumn.One);
            this.noTabsBeforeOpening = !columnOneAlreadyUsed;
            this._closingTriggered = false;
            if (!this.isUriOfEditor(uri)) {
                this.logInfo('not uri of possibly open editor');
                this.logInfo(`Close demo editor before showing ${uri}`);
                yield this.closeEditor('showEditor');
                this._closingTriggered = false;
                const docs = vscode.workspace.textDocuments.filter(d => d.uri.toString() === uri.toString());
                if (docs.length > 1) {
                    this.trace.log(Tracing_1.TraceLevel.WARNING, `Multiple documents for uri ${uri}`);
                }
                const openDocs = docs.filter(d => !d.isClosed);
                if (openDocs.length > 1) {
                    this.trace.log(Tracing_1.TraceLevel.WARNING, `Multiple OPEN documents for uri ${uri}`);
                }
                if (openDocs.length > 0) {
                    const doc = openDocs[0];
                    if (doc) {
                        this.logInfo('Reusing existing document');
                    }
                    this._editorDocument = doc;
                }
                else {
                    this.logInfo(`openTextDocument(${uri})`);
                    this._editorDocument = yield vscode.workspace.openTextDocument(uri);
                }
            }
            this.logInfo(`showTextDocument(${this._editorDocument.uri})`);
            yield vscode.window.showTextDocument(this._editorDocument, { preview: false, viewColumn: SampleColumn });
        });
    }
    closeEditor(callerId, retrials = 3) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = `(${callerId})`;
            this.logInfo(`${id} closeEditor`);
            if (this._editorDocument) {
                this.logInfo(`${id} Closing editor...`);
                const sampleDocument = this._editorDocument;
                const uri = this._editorDocument.uri;
                if (this._closingTriggered) {
                    this.logInfo(`${id} Closing already triggered`);
                    return;
                }
                this.logInfo(`${id} Activating editor ${sampleDocument.uri}...`);
                yield vscode.window.showTextDocument(sampleDocument, { preview: false, preserveFocus: false, viewColumn: SampleColumn })
                    .then(() => __awaiter(this, void 0, void 0, function* () {
                    this.logInfo(`${id} Activation done.`);
                    if (vscode.window.activeTextEditor.document === sampleDocument) {
                        this.logInfo(`${id} Closing active editor ${vscode.window.activeTextEditor.document.uri}...`);
                        this._closingTriggered = true;
                        if (this.noTabsBeforeOpening) {
                            this.logInfo(`${id} Closing ALL editors...`);
                            return vscode.commands.executeCommand('workbench.action.closeAllEditors');
                        }
                        return vscode.commands.executeCommand('workbench.action.closeActiveEditor');
                    }
                    this.logInfo(`${id} Activation failed. Active uri is now ${vscode.window.activeTextEditor.document.uri}`);
                    return Promise.reject(new Error('Demo editor could not be closed - activation failed'));
                }));
                yield sleep(1000);
                const stillVisible = !!vscode.window.visibleTextEditors.find(te => {
                    var _a, _b, _c;
                    this.logInfo(`stillVisible?: ${(_b = (_a = te === null || te === void 0 ? void 0 : te.document) === null || _a === void 0 ? void 0 : _a.uri) !== null && _b !== void 0 ? _b : 'no doc'}`);
                    return (((_c = te === null || te === void 0 ? void 0 : te.document) === null || _c === void 0 ? void 0 : _c.uri) === uri);
                });
                if (retrials && stillVisible) {
                    this.logInfo('demo editor still visible, trying again');
                    this._closingTriggered = false;
                    yield this.closeEditor(callerId, retrials - 1);
                }
                this._editorDocument = null;
                this.logInfo(`${id} Closed demo editor.`);
            }
        });
    }
    registerEditorClosed() {
        const listReg = `<${++this._listenerReg}>`;
        this.logInfo(`registerEditorClosed for ${listReg}`);
        vscode.window.onDidChangeVisibleTextEditors((editors) => __awaiter(this, void 0, void 0, function* () {
            this.logInfo(`-> ${listReg} onDidChangeVisibleTextEditors`);
            editors.forEach(e => this.logInfo(`- visibleEditor: ${e.document.uri}`));
            const ourEditor = editors.find(e => e.document === this._editorDocument);
            if (!this._optionsPanel) {
                this.logInfo(`!!! ${listReg} Options panel already gone, close editor`);
                yield this.closeEditor('registerEditorClosed.onDidChangeVisibleTextEditors.noOptionsPanel');
            }
            if (this._editorDocument && !ourEditor) {
                this.logInfo(`${listReg} Editor no longer visible. Closing optionsPanel...`);
                if (this._editorDocument.isClosed) {
                    this.logInfo(`!!! ${listReg} Doc closed`);
                    this._editorDocument = null;
                }
                yield this.closeEditor('registerEditorClosed.onDidChangeVisibleTextEditors.notOurEditor');
                this.closeOptionsPanel();
            }
        }), null, this._disposables);
    }
    registerOptionPanelClosed() {
        this.logInfo('registerOptionPanelClosed');
        this._optionsPanel.onDidDispose(() => __awaiter(this, void 0, void 0, function* () {
            this.logInfo('-> _optionsPanel.onDidDispose');
            this.dispose();
            this.logInfo('OptionsPanel was closed. Closing demo editor...');
            yield sleep(300);
            yield this.closeEditor('registerOptionPanelClosed.optionsDisposed');
        }), null, this._disposables);
        this._optionsPanel.onDidChangeViewState((e) => __awaiter(this, void 0, void 0, function* () {
            this.logInfo('-> _optionsPanel.onDidChangeViewState');
            if (!e.webviewPanel.visible) {
                if (e.webviewPanel !== this._optionsPanel) {
                    this.logInfo("This ain't our panel!");
                }
                else {
                    this.logInfo('webView no longer visible, closing demo, disposing configPanel...');
                    yield this.closeEditor('registerOptionPanelClosed.optionsNotVisible');
                    this.dispose();
                }
            }
        }), null, this._disposables);
    }
    registerOptionPanelChanged() {
        this.logInfo('registerOptionPanelChanged');
        this._optionsPanel.webview.onDidReceiveMessage(message => this.handleMessages(message), null, this._disposables);
    }
    createWebPanel(column) {
        this.logInfo('createWebPanel');
        this._optionsPanel = vscode.window.createWebviewPanel('configurationPanel', 'CDS Formatting Options Configuration', column, { enableScripts: true });
        this.renderHtml();
        return () => {
            this.registerEditorClosed();
            this.registerOptionPanelClosed();
            this.registerOptionPanelChanged();
        };
    }
    renderHtml() {
        this._optionsPanel.webview.html = this.configHtml.getHtml(this._selectedCategory);
    }
    handleMessages(message) {
        return __awaiter(this, void 0, void 0, function* () {
            switch (message.command) {
                case 'onUserChangedOption':
                    this.optionChanged.emit('optionChanged', message.optionAndValue);
                    this.renderHtml();
                    break;
                case 'onCategoryChanged':
                    this._selectedCategory = message.category;
                    this.renderHtml();
                    break;
            }
        });
    }
    logInfo(s) {
        this.trace.log(Tracing_1.TraceLevel.INFO, `${MAGENTA}${s}${RESET}`);
    }
    dispose() {
        this.logInfo('configPanel.dispose');
        this.logInfo('Disposing optionsPanel...');
        this._optionsPanel.dispose();
        this._optionsPanel = undefined;
        const toDispose = this._disposables;
        this._disposables = [];
        toDispose.reverse();
        toDispose.forEach(disposable => disposable.dispose());
        this.logInfo('Disposed configPanel.');
    }
}
exports.ConfigurationPanel = ConfigurationPanel;
//# sourceMappingURL=ConfigurationPanel.js.map