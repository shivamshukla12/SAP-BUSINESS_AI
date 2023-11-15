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
exports.InstallCdsDk = void 0;
const path = require("path");
const vscode = require("vscode");
const CliUtil_1 = require("./CliUtil");
const ExtensionUtil_1 = require("./ExtensionUtil");
const I18NHandler_1 = require("./i18n/I18NHandler");
const Tracing_1 = require("./Tracing");
const CHECK_OPTION = 'cds.checkDevKitInstalled';
const DevKitModule = '@sap/cds-dk';
const UmbrellaModule = '@sap/cds';
class InstallCdsDk {
    constructor(context) {
        this.trace = new Tracing_1.Trace(Tracing_1.ClientTraceComponents.INSTALL_DK);
        context.subscriptions.push(vscode.commands.registerCommand('cds.installCdsDk', () => __awaiter(this, void 0, void 0, function* () {
            const checkCdsDk = yield this.checkCdsDevKit(true);
            if (checkCdsDk) {
                yield this.showInfoMessage(I18NHandler_1.i18n.CheckCdsDk_upToDate_msg);
            }
        })));
    }
    checkCdsDevKit(force = false) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!force && !this.isCheckEnabled()) {
                return;
            }
            const location = force ? vscode.ProgressLocation.Notification : vscode.ProgressLocation.Window;
            return vscode.window.withProgress({
                location,
                title: I18NHandler_1.i18nHandler.getText(I18NHandler_1.i18n.CheckCdsDk_progress_xmsg)
            }, () => __awaiter(this, void 0, void 0, function* () {
                yield this.setSapRegistry();
                let choice = null;
                const installationStatus = yield this.isDevKitInstalled();
                switch (installationStatus) {
                    case 'manuallyInstalled':
                        this.trace.log(Tracing_1.TraceLevel.INFO, I18NHandler_1.i18n.CheckCdsDk_installedManuallyNoFurtherCheck_xmsg);
                        choice = 'switchOff';
                        break;
                    case 'notInstalled':
                        choice = yield this.askUserToInstall();
                        break;
                    case 'npmInstalled': {
                        const check = yield this.isDevKitOutdated();
                        if (check.isOutdated) {
                            choice = yield this.askUserToUpdate(check);
                        }
                        break;
                    }
                }
                switch (choice) {
                    case 'update': return this.updateDevKit();
                    case 'install': return this.installDevKit();
                    case 'switchOff': return this.switchOffInstallationCheck();
                    case 'cancel': return false;
                    default: return true;
                }
            }));
        });
    }
    isGloballyInstalled(npmModuleId, i18nMsg) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            let isInstalled = false;
            try {
                this.trace.log(Tracing_1.TraceLevel.INFO, i18nMsg);
                const x = yield this.runNpm('ls', '-g', '--json', '--depth=0', npmModuleId);
                const globalPackageJson = JSON.parse(x.stdout);
                const version = (_b = (_a = globalPackageJson === null || globalPackageJson === void 0 ? void 0 : globalPackageJson.dependencies) === null || _a === void 0 ? void 0 : _a[npmModuleId]) === null || _b === void 0 ? void 0 : _b.version;
                isInstalled = !!version;
            }
            catch (e) {
                this.traceError(e);
            }
            this.traceResult(i18nMsg, isInstalled ? I18NHandler_1.i18n.CheckCdsDk_yes_xmsg : I18NHandler_1.i18n.CheckCdsDk_no_xmsg);
            return isInstalled;
        });
    }
    isDevKitInstalled() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(yield this.isDevKitGloballyAvailable()))
                return 'notInstalled';
            if (yield this.isGloballyInstalled(DevKitModule, I18NHandler_1.i18n.CheckCdsDk_isInstalledViaNpm_xmsg))
                return 'npmInstalled';
            return 'manuallyInstalled';
        });
    }
    isDevKitGloballyAvailable() {
        return __awaiter(this, void 0, void 0, function* () {
            let res = I18NHandler_1.i18n.CheckCdsDk_no_xmsg;
            try {
                this.trace.log(Tracing_1.TraceLevel.INFO, I18NHandler_1.i18n.CheckCdsDk_isAvailable_xmsg);
                const x = yield CliUtil_1.CliUtil.run('cds', ['-e', '.home'], { cwd: path.resolve('/') }, this.trace);
                res = `${I18NHandler_1.i18n.CheckCdsDk_yes_xmsg} (${x.stdout})`;
                return true;
            }
            catch (e) {
            }
            finally {
                this.traceResult(I18NHandler_1.i18n.CheckCdsDk_isAvailable_xmsg, res);
            }
            return false;
        });
    }
    isDevKitOutdated() {
        return __awaiter(this, void 0, void 0, function* () {
            let res = { isOutdated: false };
            try {
                this.trace.log(Tracing_1.TraceLevel.INFO, I18NHandler_1.i18n.CheckCdsDk_isOutdated_xmsg);
                yield this.runNpm('outdated', '-g', '-json', '--depth=0', DevKitModule);
            }
            catch (e) {
                try {
                    const runError = e;
                    const result = JSON.parse(runError.cliResult.stdout);
                    const dkEntry = result[DevKitModule];
                    const { current, latest } = dkEntry;
                    res = { isOutdated: true, current, latest };
                }
                catch (e2) {
                    this.traceError(e);
                }
            }
            finally {
                this.traceResult(I18NHandler_1.i18n.CheckCdsDk_isOutdated_xmsg, res.isOutdated ? I18NHandler_1.i18n.CheckCdsDk_yes_xmsg : I18NHandler_1.i18n.CheckCdsDk_no_xmsg);
            }
            return res;
        });
    }
    traceError(e) {
        this.trace.log(Tracing_1.TraceLevel.ERROR, `${I18NHandler_1.i18n.CheckCdsDk_commandDetails_xmsg}:
${e.cmd}
${e.cliResult.combinedOut}
${I18NHandler_1.i18nHandler.getText(I18NHandler_1.i18n.CheckCdsDk_processExited_xmsg, e)}`);
    }
    isCheckEnabled() {
        return !!vscode.workspace.getConfiguration().get(CHECK_OPTION);
    }
    switchOffInstallationCheck() {
        this.trace.log(Tracing_1.TraceLevel.INFO, I18NHandler_1.i18n.CheckCdsDk_disableCheck_xmsg);
        return vscode.workspace.getConfiguration().update(CHECK_OPTION, false)
            .then(() => vscode.workspace.getConfiguration().update(CHECK_OPTION, false, vscode.ConfigurationTarget.Global));
    }
    askUserToInstall() {
        return __awaiter(this, void 0, void 0, function* () {
            const installButton = I18NHandler_1.i18n.CheckCdsDk_install_xbut;
            const switchOffButton = I18NHandler_1.i18n.CheckCdsDk_disableCheck_xbut;
            const choice = yield this.showInfoMessage(I18NHandler_1.i18n.CheckCdsDk_notInstalled_xmsg, installButton, switchOffButton, I18NHandler_1.i18n.CheckCdsDk_cancel_xbut);
            switch (choice) {
                case installButton: return 'install';
                case switchOffButton: return 'switchOff';
                default: return 'cancel';
            }
        });
    }
    askUserToUpdate(outdatedInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            const updateButton = I18NHandler_1.i18n.CheckCdsDk_update_xbut;
            const switchOffButton = I18NHandler_1.i18n.CheckCdsDk_disableCheck_xbut;
            const msg = I18NHandler_1.i18nHandler.getText(I18NHandler_1.i18n.CheckCdsDk_notCurrent_xmsg, { currentVersion: outdatedInfo.current, latestVersion: outdatedInfo.latest });
            const choice = yield this.showInfoMessage(msg, updateButton, switchOffButton, I18NHandler_1.i18n.CheckCdsDk_cancel_xbut);
            switch (choice) {
                case updateButton: return 'update';
                case switchOffButton: return 'switchOff';
                default: return 'cancel';
            }
        });
    }
    showInfoMessage(message, ...buttons) {
        return __awaiter(this, void 0, void 0, function* () {
            const choice = yield vscode.window.showInformationMessage(message, ...buttons);
            this.trace.log(Tracing_1.TraceLevel.INFO, `Asking user: ${message} => ${choice}`);
            return choice;
        });
    }
    showInStatusBar(message) {
        this.trace.log(Tracing_1.TraceLevel.INFO, message);
        (0, ExtensionUtil_1.showInStatusBar)(message);
    }
    traceResult(question, answer) {
        this.trace.log(Tracing_1.TraceLevel.INFO, I18NHandler_1.i18nHandler.getText(I18NHandler_1.i18n.CheckCdsDk_questionAndAnswer_xmsg, { question, answer }));
    }
    isUmbrellaGloballyInstalled() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.isGloballyInstalled(UmbrellaModule, I18NHandler_1.i18n.CheckCdsDk_isCdsInstalled_xmsg);
        });
    }
    uninstallGlobalCds() {
        return __awaiter(this, void 0, void 0, function* () {
            const isInstalled = yield this.isUmbrellaGloballyInstalled();
            if (isInstalled) {
                try {
                    this.trace.log(Tracing_1.TraceLevel.INFO, I18NHandler_1.i18n.CheckCdsDk_uninstallCds_xmsg);
                    yield this.runNpm('uninstall', '-g', UmbrellaModule);
                }
                catch (e) {
                    this.traceError(e);
                    this.showInStatusBar(I18NHandler_1.i18n.CheckCdsDk_removeUmbrellaFailed_xmsg);
                }
            }
        });
    }
    installDevKit() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.uninstallGlobalCds();
            try {
                this.trace.log(Tracing_1.TraceLevel.INFO, I18NHandler_1.i18n.CheckCdsDk_installCdsDk_xmsg);
                yield this.runNpm('install', '-g', DevKitModule);
                this.showInStatusBar(I18NHandler_1.i18n.CheckCdsDk_installSuccess_xmsg);
            }
            catch (e) {
                this.traceError(e);
                this.showInStatusBar(I18NHandler_1.i18n.CheckCdsDk_installFailed_xmsg);
            }
        });
    }
    updateDevKit() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.trace.log(Tracing_1.TraceLevel.INFO, I18NHandler_1.i18n.CheckCdsDk_updateCdsDk_xmsg);
                yield this.runNpm('install', '-g', DevKitModule);
                this.showInStatusBar(I18NHandler_1.i18n.CheckCdsDk_updateSuccess_xmsg);
            }
            catch (e) {
                this.traceError(e);
                this.showInStatusBar(I18NHandler_1.i18n.CheckCdsDk_updateFailed_xmsg);
            }
        });
    }
    setSapRegistry() {
        return __awaiter(this, void 0, void 0, function* () {
            this.trace.log(Tracing_1.TraceLevel.INFO, I18NHandler_1.i18n.CheckCdsDk_isSapRegistrySet_xmsg);
            try {
                const SAP_REGISTRY_KEY = '@sap:registry';
                const SAP_REGISTRY_VALUE = 'https://registry.npmjs.org';
                const x = yield this.runNpm('config', 'get', '-g', SAP_REGISTRY_KEY);
                const registry = x.stdout.split(/\r?\n/)[0];
                const isNotSet = registry.startsWith('undefined') || registry.trim() === '';
                this.traceResult(I18NHandler_1.i18n.CheckCdsDk_isSapRegistrySet_xmsg, isNotSet ? I18NHandler_1.i18n.CheckCdsDk_no_xmsg : `${I18NHandler_1.i18nHandler.getText(I18NHandler_1.i18n.CheckCdsDk_yesWithValue_xmsg, { value: registry })}`);
                if (!isNotSet && !registry.toLowerCase().startsWith(SAP_REGISTRY_VALUE)) {
                    this.trace.log(Tracing_1.TraceLevel.WARNING, I18NHandler_1.i18nHandler.getText(I18NHandler_1.i18n.CheckCdsDk_unofficialSapRegistry_xmsg, { registry }));
                }
            }
            catch (e) {
                this.traceError(e);
            }
        });
    }
    runNpm(...args) {
        return CliUtil_1.CliUtil.run('npm', args, {}, this.trace);
    }
}
exports.InstallCdsDk = InstallCdsDk;
//# sourceMappingURL=InstallCdsDk.js.map