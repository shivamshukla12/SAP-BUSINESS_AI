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
exports.getRawLanguageClient = exports.activate = exports.deactivate = void 0;
const vscode_1 = require("vscode");
const DynamicJSONSchemaProvider_1 = require("./DynamicJSONSchemaProvider");
const ExtensionUtil_1 = require("./ExtensionUtil");
const FileCommandHandler_1 = require("./FileCommandHandler");
const I18NHandler_1 = require("./i18n/I18NHandler");
const InstallCdsDk_1 = require("./InstallCdsDk");
const LanguageClientProvider_1 = require("./LanguageClientProvider");
const CapNotebookPageHandler_1 = require("./notebook/CapNotebookPageHandler");
const CapNotebookProvider_1 = require("./notebook/CapNotebookProvider");
const CapNotebookUriHandler_1 = require("./notebook/CapNotebookUriHandler");
const Output_1 = require("./Output");
const TranslationQuickfixPostprocess_1 = require("./TranslationQuickfixPostprocess");
const WelcomePageHandler_1 = require("./WelcomePageHandler");
let lspProvider;
const NB_FILE_URI_KEY = 'NB_FILE_URI';
const NOTIFICATION_TIMEOUT = 5000;
function deactivate() {
    return __awaiter(this, void 0, void 0, function* () {
        yield (lspProvider === null || lspProvider === void 0 ? void 0 : lspProvider.stopClient());
    });
}
exports.deactivate = deactivate;
function activate(context) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        Output_1.technicalOutput.log(`Activating ${ExtensionUtil_1.extensionUtil.EXTENSION_ID}...`);
        try {
            initLocale();
            showStartupNotebookInCase(context);
            const packageJson = ExtensionUtil_1.extensionUtil.getExtension().packageJSON;
            safe(() => new DynamicJSONSchemaProvider_1.DynamicJSONSchemaProvider(context));
            safe(() => new CapNotebookProvider_1.CapNotebookProvider(context));
            safe(() => new CapNotebookUriHandler_1.CapNotebookUriHandler(context));
            safe(() => void new WelcomePageHandler_1.WelcomePageHandler(context).init());
            safe(() => new CapNotebookPageHandler_1.CapNotebookPageHandler(context));
            safe(() => void new FileCommandHandler_1.FileCommandHandler(context).init(packageJson));
            safe(() => void new InstallCdsDk_1.InstallCdsDk(context).checkCdsDevKit());
            yield safe(() => __awaiter(this, void 0, void 0, function* () {
                lspProvider = new LanguageClientProvider_1.LanguageClientProvider(context);
                yield lspProvider.init();
            }));
            safe(() => new TranslationQuickfixPostprocess_1.TranslationQuickfixPostprocess(context).installHook());
            safe(() => require('./configUi/ConfigUiCommand').registerConfigUiCommand(context));
            safe(() => require('./analyzeModel/AnalyzeDependenciesCommand').registerAnalyzeDependenciesCommand(context));
            safe(() => require('./support/RecordTraceCommand').registerRecordTraceCommand(context));
            safe(() => restartLspIfCertainUserSettingsAreChanged());
            return {
                getLanguageClient
            };
        }
        catch (e) {
            Output_1.technicalOutput.log((_a = e.stack) !== null && _a !== void 0 ? _a : e);
            throw e;
        }
    });
}
exports.activate = activate;
function restartLspIfCertainUserSettingsAreChanged() {
    const userSettingsWhichNeedLspRestart = getSettingsThatRequireLspRestart();
    vscode_1.workspace.onDidChangeConfiguration((e) => __awaiter(this, void 0, void 0, function* () {
        if (e.affectsConfiguration('cds')) {
            const changedSetting = userSettingsWhichNeedLspRestart.find(setting => e.affectsConfiguration(setting));
            if (changedSetting) {
                const newVal = vscode_1.workspace.getConfiguration('cds').get(changedSetting.slice('cds.'.length));
                Output_1.technicalOutput.log(`User setting '${changedSetting}' changed to: ${newVal} => Restarting CDS Language Server`);
                yield vscode_1.commands.executeCommand(LanguageClientProvider_1.RESTART_LSP_COMMAND_ID);
            }
        }
    }));
}
function getSettingsThatRequireLspRestart() {
    var _a;
    try {
        return Object.entries(require('../../package.json').contributes.configuration.properties)
            .filter(([, value]) => value.restartLsp)
            .map(([setting]) => setting);
    }
    catch (e) {
        Output_1.technicalOutput.log((_a = e.stack) !== null && _a !== void 0 ? _a : e);
        return [];
    }
}
function safe(lambda) {
    var _a;
    try {
        const res = lambda();
        if (res === null || res === void 0 ? void 0 : res.then) {
            res.catch((e) => {
                var _a;
                Output_1.technicalOutput.log((_a = e.stack) !== null && _a !== void 0 ? _a : e);
            });
            return res;
        }
    }
    catch (e) {
        Output_1.technicalOutput.log((_a = e.stack) !== null && _a !== void 0 ? _a : e);
    }
}
function getRawLanguageClient() {
    return lspProvider === null || lspProvider === void 0 ? void 0 : lspProvider['client'];
}
exports.getRawLanguageClient = getRawLanguageClient;
function getLanguageClient() {
    if (lspProvider) {
        return lspProvider.getClient();
    }
    else {
        Output_1.technicalOutput.log('[ERROR] VSCode Extension for CDS Language Server must be activated first');
        return null;
    }
}
function showOpenPlaygroundFolderNotification(context) {
    const progressOptions = {
        cancellable: false,
        location: vscode_1.ProgressLocation.Notification,
        title: 'Please wait while your cap-playground is loading...',
    };
    vscode_1.window.withProgress(progressOptions, progress => {
        progress.report({ increment: 0 });
        const p = new Promise(resolve => {
            let timeoutHandle;
            const disposable = vscode_1.tasks.onDidEndTask(e => {
                if (e.execution.task.name === 'Open CAP Notebook') {
                    disposable.dispose();
                    if (timeoutHandle) {
                        clearTimeout(timeoutHandle);
                    }
                    resolve();
                }
            });
            context.subscriptions.push(disposable);
            timeoutHandle = setTimeout(() => {
                disposable.dispose();
                timeoutHandle = undefined;
                resolve();
            }, NOTIFICATION_TIMEOUT).unref();
        });
        return p;
    });
}
function initLocale() {
    if (process.env.VSCODE_NLS_CONFIG) {
        const vscodeConf = JSON.parse(process.env.VSCODE_NLS_CONFIG);
        I18NHandler_1.i18nHandler.setLocale(vscodeConf.locale);
    }
}
function showStartupNotebookInCase(context) {
    if (context.globalState.get(NB_FILE_URI_KEY)) {
        void context.globalState.update(NB_FILE_URI_KEY, undefined);
        showOpenPlaygroundFolderNotification(context);
    }
}
//# sourceMappingURL=extension.js.map