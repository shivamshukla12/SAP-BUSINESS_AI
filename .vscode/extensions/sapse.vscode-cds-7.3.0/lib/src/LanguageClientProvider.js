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
exports.LanguageClientProvider = exports.RESTART_LSP_COMMAND_ID = void 0;
const node_perf_hooks_1 = require("node:perf_hooks");
const url = require("node:url");
const util = require("node:util");
const vscode = require("vscode");
const vscode_languageclient_1 = require("vscode-languageclient");
const node_1 = require("vscode-languageclient/node");
const CliUtil_1 = require("./CliUtil");
const ExtensionUtil_1 = require("./ExtensionUtil");
const FileSystemWatching_1 = require("./FileSystemWatching");
const I18NHandler_1 = require("./i18n/I18NHandler");
const Output_1 = require("./Output");
const Semaphore_1 = require("./Semaphore");
const ActiveEditorChangedFeature_1 = require("./server/ActiveEditorChangedFeature");
const StatusMessageFeature_1 = require("./server/StatusMessageFeature");
const UserOutputFeature_1 = require("./server/UserOutputFeature");
const ZipTraces_1 = require("./support/ZipTraces");
const TelemetryHandler_1 = require("./TelemetryHandler");
const Tracing_1 = require("./Tracing");
const DEBUG_PORT = 6009;
exports.RESTART_LSP_COMMAND_ID = 'cds.restartLsp';
const USE_LATEST_LSP = 0;
class LanguageClientProvider {
    getLspPath(compilerVersion = this.clientCompilerVersion) {
        var _a, _b;
        return (_b = (_a = this.compilerVersionToLspPath[compilerVersion]) !== null && _a !== void 0 ? _a : this.compilerVersionToLspPath[USE_LATEST_LSP]) !== null && _b !== void 0 ? _b : 'XX';
    }
    constructor(context) {
        this.context = context;
        this.trace = new Tracing_1.Trace(Tracing_1.ClientTraceComponents.DYNAMIC_LSP, Output_1.technicalOutput);
        this.sem = new Semaphore_1.Semaphore();
        this.compilerVersionToLspPath = {
            [USE_LATEST_LSP]: this.context.asAbsolutePath('node_modules/@sap/cds-lsp'),
            1: this.context.asAbsolutePath('lsp-lib/6.0.3/node_modules/@sap/cds-lsp'),
            2: this.context.asAbsolutePath('lsp-lib/6.0.3/node_modules/@sap/cds-lsp')
        };
        this.context.subscriptions.push(this.registerOnWorkspaceChanged());
        this.context.subscriptions.push(this.registerRestartLspCommand());
        this.context.subscriptions.push((0, ZipTraces_1.registerZipTracesCommand)(this));
    }
    registerOnWorkspaceChanged() {
        return vscode.workspace.onDidChangeWorkspaceFolders((e) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            this.debug('workspace changed');
            if (((_a = e === null || e === void 0 ? void 0 : e.added) === null || _a === void 0 ? void 0 : _a.length) || ((_b = e === null || e === void 0 ? void 0 : e.removed) === null || _b === void 0 ? void 0 : _b.length)) {
                const compilerVersions = yield this.collectFolders();
                if (compilerVersions.length > 1) {
                    void vscode.window.showWarningMessage(I18NHandler_1.i18n.LanguageClientProvider_warn_mixed_versions_xmsg, I18NHandler_1.i18n.Ok_xbut);
                }
                else if (this.clientCompilerVersion && compilerVersions[0] !== this.clientCompilerVersion) {
                    void vscode.window.showWarningMessage(I18NHandler_1.i18n.LanguageClientProvider_warn_lsp_needs_restart_xmsg, I18NHandler_1.i18n.Ok_xbut);
                }
            }
        }));
    }
    registerRestartLspCommand() {
        return vscode.commands.registerCommand(exports.RESTART_LSP_COMMAND_ID, () => __awaiter(this, void 0, void 0, function* () {
            const startedNew = yield this.init();
            if (!startedNew) {
                yield this.restartClient();
            }
        }));
    }
    debug(message) {
        this.trace.log(Tracing_1.TraceLevel.DEBUG, message);
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.sem.run(() => __awaiter(this, void 0, void 0, function* () {
                const compilerVersions = yield this.collectFolders();
                if (compilerVersions.length > 1) {
                    void vscode.window.showWarningMessage(I18NHandler_1.i18n.LanguageClientProvider_warn_mixed_versions_xmsg, I18NHandler_1.i18n.Ok_xbut);
                    return this.startClient(USE_LATEST_LSP);
                }
                return this.startClient(compilerVersions[0]);
            }));
        });
    }
    collectFolders() {
        return __awaiter(this, void 0, void 0, function* () {
            const cdsConfig = vscode.workspace.getConfiguration(ExtensionUtil_1.extensionUtil.CONFIG_NAME);
            if (!cdsConfig.enableDynamicLsp) {
                return [USE_LATEST_LSP];
            }
            return vscode.window.withProgress({
                location: vscode.ProgressLocation.Window,
                title: I18NHandler_1.i18n.LanguageClientProvider_checkingFolders_xmsg
            }, () => __awaiter(this, void 0, void 0, function* () {
                const compilerVersions = [];
                if (vscode.workspace.workspaceFolders) {
                    yield Promise.all(vscode.workspace.workspaceFolders.map((wsf) => __awaiter(this, void 0, void 0, function* () {
                        var _a;
                        const start = node_perf_hooks_1.performance.now();
                        const majorVersion = Number.parseInt((_a = (yield this.getCompilerVersion(wsf.uri.fsPath))) === null || _a === void 0 ? void 0 : _a.split('.')[0].trim(), 10) || USE_LATEST_LSP;
                        if (majorVersion && !compilerVersions.includes(majorVersion)) {
                            compilerVersions.push(majorVersion);
                        }
                        const duration = node_perf_hooks_1.performance.now() - start;
                        this.debug(`folder '${wsf.uri.fsPath}': v${majorVersion} (${Math.round(duration)}ms)`);
                    })));
                }
                if (compilerVersions.length === 0) {
                    compilerVersions.push(USE_LATEST_LSP);
                }
                return [...compilerVersions]
                    .sort((a, b) => a - b)
                    .reverse();
            }));
        });
    }
    startClient(compilerVersion) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.clientCompilerVersion !== compilerVersion) {
                yield this.stopClient();
                yield this.createAndStartNewClient(compilerVersion);
                return true;
            }
            return false;
        });
    }
    getCompilerVersion(folder) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield CliUtil_1.CliUtil.run('cds', ['-e', '.compiler.version()'], {
                    cwd: folder,
                    env: process.env,
                    timeout: 20000
                });
                return result.stdout.trim();
            }
            catch (err) {
                this.trace.log(Tracing_1.TraceLevel.WARNING, `[WARN] could not determine cds compiler version for folder ${folder}\n${err}`);
                return null;
            }
        });
    }
    createClient(compilerVersion) {
        const serverModule = this.getLspPath(compilerVersion);
        const args = [];
        const OPTION_WATCH_SAPCDS_NODE_MODULE = 'cds.compiler.detectLocalSapCdsInstallation';
        new FileSystemWatching_1.FileSystemWatching().ensureNodeModulesWatching(!!vscode.workspace.getConfiguration().get(OPTION_WATCH_SAPCDS_NODE_MODULE));
        const env = Object.assign({}, process.env);
        const runtime = undefined;
        env.CDS_LSP_FEATURE_FLAG_ASSERT_NODE_VERSION = 'off';
        const runOptions = { env };
        const debugOptions = { env, execArgv: ['--nolazy', `--inspect=${DEBUG_PORT}`, '--enable-source-maps'] };
        const serverOptions = {
            run: { module: serverModule, transport: node_1.TransportKind.ipc, options: runOptions, args, runtime },
            debug: { module: serverModule, transport: node_1.TransportKind.ipc, options: debugOptions, args, runtime }
        };
        const clientOptions = {
            documentSelector: [
                { scheme: 'file', language: ExtensionUtil_1.extensionUtil.LANGUAGE_NAME },
                { scheme: 'untitled', language: ExtensionUtil_1.extensionUtil.LANGUAGE_NAME }
            ],
            uriConverters: {
                code2Protocol: uri => url.format(url.parse(uri.toString(true))),
                protocol2Code: str => vscode.Uri.parse(str)
            },
            synchronize: {
                configurationSection: ExtensionUtil_1.extensionUtil.CONFIG_NAME,
                fileEvents: vscode.workspace.createFileSystemWatcher('**/*.{cds,json,csn,properties,csv,cdsignore,gitignore}')
            },
            outputChannel: Output_1.technicalOutput,
            initializationFailedHandler: e => {
                void vscode.window.showErrorMessage('CDS\n' + util.inspect(e));
                return false;
            },
            initializationOptions: vscode.workspace.getConfiguration('cds'),
            progressOnInitialization: true,
            revealOutputChannelOn: vscode_languageclient_1.RevealOutputChannelOn.Never
        };
        const client = new CdsLanguageClient(serverOptions, clientOptions);
        new TelemetryHandler_1.TelemetryHandler(this.context).installHook(client);
        return client;
    }
    getClient() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.client) {
                yield this.sem.run(() => __awaiter(this, void 0, void 0, function* () {
                    if (!this.client) {
                        yield this.init();
                    }
                }));
            }
            return this.client;
        });
    }
    createAndStartNewClient(compilerVersion) {
        return __awaiter(this, void 0, void 0, function* () {
            const start = node_perf_hooks_1.performance.now();
            Output_1.technicalOutput.log(`starting lsp '${this.getLspPath(compilerVersion)}'...`);
            this.client = this.createClient(compilerVersion);
            this.clientCompilerVersion = compilerVersion;
            yield this.client.start();
            const duration = node_perf_hooks_1.performance.now() - start;
            Output_1.technicalOutput.log(`finished starting lsp '${this.getLspPath(compilerVersion)}' in ${Math.round(duration)}ms`);
        });
    }
    stopClient() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.client) {
                const start = node_perf_hooks_1.performance.now();
                Output_1.technicalOutput.log(`stopping lsp '${this.getLspPath()}'... `);
                yield this.client.stop();
                this.client = null;
                const duration = node_perf_hooks_1.performance.now() - start;
                Output_1.technicalOutput.log(`finished stopping lsp '${this.getLspPath()}' in ${Math.round(duration)}ms`);
                this.clientCompilerVersion = undefined;
            }
        });
    }
    restartClient() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.client) {
                const start = node_perf_hooks_1.performance.now();
                Output_1.technicalOutput.log(`restarting lsp '${this.getLspPath()}'... `);
                yield this.client.stop();
                yield this.client.start();
                const duration = node_perf_hooks_1.performance.now() - start;
                Output_1.technicalOutput.log(`finished restarting lsp '${this.getLspPath()}' in ${Math.round(duration)}ms`);
            }
        });
    }
}
exports.LanguageClientProvider = LanguageClientProvider;
class CdsLanguageClient extends node_1.LanguageClient {
    constructor(serverOptions, clientOptions, forceDebug = false) {
        super(ExtensionUtil_1.extensionUtil.LANGUAGE_NAME, 'CDS Language Server', serverOptions, clientOptions, forceDebug);
    }
    registerBuiltinFeatures() {
        super.registerBuiltinFeatures();
        this.registerFeature(new ActiveEditorChangedFeature_1.ActiveEditorChangedFeature(this));
        this.registerFeature(new StatusMessageFeature_1.StatusMessageFeature(this));
        this.registerFeature(new UserOutputFeature_1.UserOutputFeature(this));
    }
}
//# sourceMappingURL=LanguageClientProvider.js.map