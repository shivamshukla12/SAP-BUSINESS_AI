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
exports.FileCommandHandler = void 0;
const os = require("os");
const path = require("path");
const vscode = require("vscode");
const CliUtil_1 = require("./CliUtil");
const ExtensionUtil_1 = require("./ExtensionUtil");
const I18NHandler_1 = require("./i18n/I18NHandler");
const Tracing_1 = require("./Tracing");
const IS_WIN = (os.platform() === 'win32');
const PREVIEW_FOLDER = 'cds-previews';
const CDS_COMMAND = 'cds';
const CDS_PREVIEW_PROTOCOL = 'cds-preview';
var USER_SETTINGS;
(function (USER_SETTINGS) {
    USER_SETTINGS["sideBySide"] = "sideBySide";
    USER_SETTINGS["refreshOnSave"] = "refreshOnSave";
})(USER_SETTINGS || (USER_SETTINGS = {}));
class FireTextDocumentContentProvider {
    constructor() {
        this.onDidChangeEventEmitter = new vscode.EventEmitter();
        this.onDidChange = this.onDidChangeEventEmitter.event;
    }
    provideTextDocumentContent(uri) {
        return __awaiter(this, void 0, void 0, function* () {
            const fsUri = vscode.Uri.file(uri.fsPath);
            const fileData = yield vscode.workspace.fs.readFile(fsUri);
            return Buffer.from(fileData).toString('utf8');
        });
    }
}
class CancelToken {
    constructor() {
        this.externalCancel = () => { };
    }
    cancel() {
        this.isCancelled = true;
        this.externalCancel();
    }
}
const COMMANDS = {
    'cds.2edmx-v2': {
        cmd: 'cds.2edmx-v2',
        args: ['--to', 'edmx-v2'],
        languageId: 'edmx',
        getCommentLine: cargo => `<!-- ${cargo} -->`
    },
    'cds.2edmx-v4': {
        cmd: 'cds.2edmx-v4',
        args: ['--to', 'edmx-v4'],
        languageId: 'edmx',
        getCommentLine: cargo => `<!-- ${cargo} -->`
    },
    'cds.2hdbtable': {
        cmd: 'cds.2hdbtable',
        args: ['--to', 'hdbtable'],
        languageId: 'hdbtable',
        getCommentLine: cargo => `---- ${cargo} ----`
    },
    'cds.2json': {
        cmd: 'cds.2json',
        args: ['--to', 'json'],
        languageId: 'json',
        getCommentLine: cargo => `// ${cargo}`
    },
    'cds.4odata': {
        cmd: 'cds.4odata',
        args: ['--for', 'odata'],
        languageId: 'cson',
        getCommentLine: cargo => `# ${cargo}`
    },
    'cds.2sql': {
        cmd: 'cds.2sql',
        args: ['--to', 'sql'],
        languageId: 'sql',
        getCommentLine: cargo => `-- ${cargo}`
    },
    'cds.2yaml': {
        cmd: 'cds.2yaml',
        args: ['--to', 'yaml'],
        languageId: 'yaml',
        getCommentLine: cargo => `# ${cargo}`
    }
};
const FILESYSTEM_WATCHER_GLOB = '**/{csn.json,*.cds,*.yaml}';
class FileCommandHandler {
    constructor(context, outputChannel) {
        this.runningTasksCancelMethods = new Map();
        this.SUPPORTED_LANGUAGE_IDS = ['cds', 'json', 'yaml'];
        this.context = context;
        this.trace = new Tracing_1.Trace(Tracing_1.ClientTraceComponents.FILE_PREVIEW, outputChannel);
        const watcher = vscode.workspace.createFileSystemWatcher(FILESYSTEM_WATCHER_GLOB);
        watcher.onDidChange((srcFile) => __awaiter(this, void 0, void 0, function* () {
            if (!this.getUserSetting(USER_SETTINGS.refreshOnSave)) {
                this.trace.log(Tracing_1.TraceLevel.DEBUG, 'ignoring file change');
                return null;
            }
            const projectFolder = this.getWorkspaceFolder(srcFile);
            const projectRelPath = path.relative(projectFolder, path.dirname(srcFile.fsPath));
            const fileName = path.basename(srcFile.fsPath, path.extname(srcFile.fsPath));
            const outFolder = yield this.getOutFolder(projectFolder);
            let destFilePattern = path.join(outFolder, projectRelPath, fileName);
            if (IS_WIN) {
                destFilePattern = destFilePattern.replace(/^[a-z]:/i, match => match.toLowerCase());
            }
            if (this.trace.getTraceLevel() === Tracing_1.TraceLevel.DEBUG) {
                this.trace.log(Tracing_1.TraceLevel.DEBUG, `changed file ${srcFile.fsPath}`);
            }
            const promises = vscode.workspace.textDocuments
                .filter((doc) => {
                let docFileName = doc.fileName;
                if (IS_WIN) {
                    docFileName = docFileName === null || docFileName === void 0 ? void 0 : docFileName.replace(/^[a-z]:/i, match => match.toLowerCase());
                }
                return docFileName === null || docFileName === void 0 ? void 0 : docFileName.startsWith(destFilePattern);
            })
                .map((doc) => __awaiter(this, void 0, void 0, function* () {
                const type = doc.fileName.match(/\.(.+)\..+$/)[1];
                if (type) {
                    if (this.trace.getTraceLevel() === Tracing_1.TraceLevel.DEBUG) {
                        this.trace.log(Tracing_1.TraceLevel.DEBUG, `refreshing preview for ${doc.fileName}`);
                    }
                    return this.showPreview(COMMANDS[type], srcFile, false);
                }
            }));
            return Promise.all(promises);
        }), this, context.subscriptions);
    }
    init(packageJson) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmds = packageJson.contributes.commands;
            for (const cmd of cmds) {
                if (cmd.subcategory === 'preview') {
                    this.context.subscriptions.push(vscode.commands.registerCommand(cmd.command, (currentFileUri) => __awaiter(this, void 0, void 0, function* () { return this.runCommand(currentFileUri, COMMANDS[cmd.command]); })));
                }
            }
            this.context.subscriptions.push(vscode.commands.registerCommand('cds.2source', (currentFileUri) => this.showSource(currentFileUri)));
            this.cdsPreviewContentProvider = new FireTextDocumentContentProvider();
            this.context.subscriptions.push(vscode.workspace.registerTextDocumentContentProvider(CDS_PREVIEW_PROTOCOL, this.cdsPreviewContentProvider));
        });
    }
    runCommand(currentFileUri, cmd) {
        return __awaiter(this, void 0, void 0, function* () {
            this.trace.log(Tracing_1.TraceLevel.INFO, `Running command ${cmd.cmd}`);
            const fileUri = this.getFileUri(currentFileUri);
            if (fileUri) {
                this.trace.log(Tracing_1.TraceLevel.INFO, `Opening preview for ${fileUri.fsPath} using ${cmd.cmd}`);
                return this.showPreview(cmd, fileUri, true);
            }
            this.trace.log(Tracing_1.TraceLevel.ERROR, 'No cds file specified');
            yield vscode.window.showErrorMessage(I18NHandler_1.i18n.FileCommandHandler_sourceFileNotFound_xmsg);
            return null;
        });
    }
    getOutFolder(projectFolder = '') {
        return __awaiter(this, void 0, void 0, function* () {
            if (IS_WIN) {
                projectFolder = projectFolder.replace(/^\w+:/, '');
            }
            const outFolder = path.join(os.tmpdir(), PREVIEW_FOLDER, projectFolder);
            yield vscode.workspace.fs.createDirectory(vscode.Uri.file(outFolder));
            return outFolder;
        });
    }
    getFileUri(fileUri) {
        var _a;
        if (fileUri) {
            return fileUri;
        }
        const doc = (_a = vscode.window.activeTextEditor) === null || _a === void 0 ? void 0 : _a.document;
        if (doc && (this.SUPPORTED_LANGUAGE_IDS.includes(doc.languageId) || doc.fileName.includes(`${path.sep}${PREVIEW_FOLDER}${path.sep}`))) {
            return doc.uri;
        }
        return null;
    }
    getWorkspaceFolder(srcFile) {
        var _a;
        const wsFolder = vscode.workspace.getWorkspaceFolder(srcFile);
        return ((_a = wsFolder === null || wsFolder === void 0 ? void 0 : wsFolder.uri) === null || _a === void 0 ? void 0 : _a.fsPath) || path.dirname(srcFile.fsPath);
    }
    getDestFile(projectFolder, srcFile, cmd) {
        return __awaiter(this, void 0, void 0, function* () {
            const projectRelPath = path.relative(projectFolder, path.dirname(srcFile.fsPath));
            const fileName = path.basename(srcFile.fsPath, path.extname(srcFile.fsPath));
            const outFolder = yield this.getOutFolder(projectFolder);
            return path.join(outFolder, projectRelPath, `${fileName}.${cmd.cmd}.${cmd.languageId}`);
        });
    }
    showPreview(cmd, srcFile, openEditor = false) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const projectFolder = this.getWorkspaceFolder(srcFile);
            const activeDocument = (_a = vscode.window.activeTextEditor) === null || _a === void 0 ? void 0 : _a.document;
            return vscode.window.withProgress({
                location: vscode.ProgressLocation.Window,
                title: I18NHandler_1.i18n.FileCommandHandler_progressTitle_xtit
            }, (progress) => __awaiter(this, void 0, void 0, function* () {
                const STEP_INCREMENT = 20;
                try {
                    progress.report({ increment: 0 });
                    if (activeDocument === null || activeDocument === void 0 ? void 0 : activeDocument.isDirty) {
                        progress.report({ increment: STEP_INCREMENT, message: I18NHandler_1.i18n.FileCommandHandler_progressSavingSrc_xmsg });
                        yield activeDocument.save();
                        const message = I18NHandler_1.i18nHandler.getText(I18NHandler_1.i18n.FileCommandHandler_savedFile_xmsg, {
                            file: path.relative(projectFolder, activeDocument.uri.fsPath)
                        });
                        void vscode.window.showInformationMessage(message);
                    }
                    else {
                        progress.report({ increment: STEP_INCREMENT });
                    }
                    progress.report({
                        increment: STEP_INCREMENT,
                        message: I18NHandler_1.i18nHandler.getText(I18NHandler_1.i18n.FileCommandHandler_progressCompiling_xmsg, { type: cmd.languageId })
                    });
                    const destFile = yield this.getDestFile(projectFolder, srcFile, cmd);
                    let token = this.runningTasksCancelMethods.get(destFile);
                    if (token) {
                        token.cancel();
                    }
                    token = new CancelToken();
                    this.runningTasksCancelMethods.set(destFile, token);
                    try {
                        yield this.compileSource(cmd, projectFolder, srcFile.fsPath, destFile, token);
                    }
                    finally {
                        this.runningTasksCancelMethods.delete(destFile);
                    }
                    progress.report({ increment: STEP_INCREMENT, message: I18NHandler_1.i18n.FileCommandHandler_progressOpening_xmsg });
                    const uri = vscode.Uri.parse(`${CDS_PREVIEW_PROTOCOL}:${destFile}`);
                    this.cdsPreviewContentProvider.onDidChangeEventEmitter.fire(uri);
                    if (openEditor) {
                        yield this.showTextDocument(uri);
                    }
                    this.trace.log(Tracing_1.TraceLevel.INFO, 'Created preview file');
                }
                catch (err) {
                    if (!(err instanceof CliUtil_1.CancelError)) {
                        void vscode.window.showErrorMessage(I18NHandler_1.i18nHandler.getText(I18NHandler_1.i18n.FileCommandHandler_showPreviewError_xmsg, { err: err.message }));
                    }
                }
            }));
        });
    }
    showSource(previewFile) {
        return __awaiter(this, void 0, void 0, function* () {
            const fileUri = this.getFileUri(previewFile);
            if (fileUri) {
                this.trace.log(Tracing_1.TraceLevel.INFO, `Opening source for ${fileUri.fsPath}`);
                const outFolder = yield this.getOutFolder();
                let srcFilePath = fileUri.fsPath.substring(outFolder.length);
                srcFilePath = srcFilePath.replace(/\.[^.]+\.[^.]+$/i, '');
                srcFilePath = path.resolve(srcFilePath);
                try {
                    const uri = vscode.Uri.file(srcFilePath);
                    return this.showTextDocument(uri);
                }
                catch (err) {
                    return vscode.window.showErrorMessage(I18NHandler_1.i18nHandler.getText(I18NHandler_1.i18n.FileCommandHandler_showPreviewError_xmsg, { err: err.message }));
                }
            }
            this.trace.log(Tracing_1.TraceLevel.ERROR, 'No cds file specified');
            return vscode.window.showErrorMessage(I18NHandler_1.i18n.FileCommandHandler_noCdsFileError_xmsg);
        });
    }
    compileSource(cmd, projectFolder, srcFile, destFile, token) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (token.isCancelled) {
                    throw new CliUtil_1.CancelError();
                }
                yield vscode.workspace.fs.createDirectory(vscode.Uri.file(path.dirname(destFile)));
                const relSrcFile = path.relative(projectFolder, srcFile.replace(/[&%;]/g, ''));
                yield CliUtil_1.CliUtil.run(CDS_COMMAND, ['compile', ...cmd.args, relSrcFile], {
                    cwd: projectFolder,
                    stdoutFile: destFile
                }, this.trace, cancelMethod => {
                    token.externalCancel = cancelMethod;
                });
            }
            catch (err) {
                if (err instanceof CliUtil_1.CancelError) {
                    throw err;
                }
                if (err.code === 'ENOENT') {
                    throw new Error(I18NHandler_1.i18nHandler.getText(I18NHandler_1.i18n.FileCommandHandler_cdsCommandMissingError_xmsg, {
                        cmd: CDS_COMMAND
                    }));
                }
                let message = err.message;
                if ((_a = err.cliResult) === null || _a === void 0 ? void 0 : _a.stderr) {
                    message = `${message}\n${err.cliResult.stderr.split('\n')[0]}`;
                }
                this.trace.log(Tracing_1.TraceLevel.ERROR, message);
                if (err.code !== 0) {
                    throw new Error(I18NHandler_1.i18nHandler.getText(I18NHandler_1.i18n.FileCommandHandler_compileError_xmsg, {
                        err: message
                    }));
                }
            }
        });
    }
    getUserSetting(setting) {
        var _a;
        const cdsConfig = vscode.workspace.getConfiguration(ExtensionUtil_1.extensionUtil.CONFIG_NAME);
        return !!((_a = cdsConfig === null || cdsConfig === void 0 ? void 0 : cdsConfig.preview) === null || _a === void 0 ? void 0 : _a[setting]);
    }
    showTextDocument(uri) {
        return __awaiter(this, void 0, void 0, function* () {
            const options = {
                preview: true,
                selection: new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 0))
            };
            if (this.getUserSetting(USER_SETTINGS.sideBySide)) {
                options.viewColumn = vscode.ViewColumn.Beside;
                options.preserveFocus = true;
            }
            return vscode.commands.executeCommand('vscode.open', uri, options);
        });
    }
}
exports.FileCommandHandler = FileCommandHandler;
//# sourceMappingURL=FileCommandHandler.js.map