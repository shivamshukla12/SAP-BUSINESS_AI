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
exports.WelcomePageHandler = exports.RELEASE_NOTES_SHOW_AUTO = void 0;
const axios_1 = require("axios");
const path = require("path");
const url_1 = require("url");
const vscode = require("vscode");
const HTTPUtil_1 = require("./HTTPUtil");
const I18NHandler_1 = require("./i18n/I18NHandler");
const Output_1 = require("./Output");
const Tracing_1 = require("./Tracing");
const REDIRECT_REGEX = /<meta\s+http-equiv\s*=\s*"refresh"\s+content\s*=\s*".*\s+url\s*=\s*(.*)\s*"/i;
const PANEL_LABEL = 'CAP Release Notes';
const STATE_ID = 'sap.cds.capWelcomePageVersion';
exports.RELEASE_NOTES_SHOW_AUTO = 'cds.releaseNotes.showAutomatically';
class WelcomePageHandler {
    constructor(context) {
        this.context = context;
        this.panels = new Map();
        this.trace = new Tracing_1.Trace(Tracing_1.ClientTraceComponents.WELCOME_PAGE, Output_1.technicalOutput);
        this.capLogoUri = vscode.Uri.file(path.join(this.context.extensionPath, 'media/cap-logo.png'));
        this.context.subscriptions.push(vscode.commands.registerCommand('cds.showWelcomePage', (doNotForce) => __awaiter(this, void 0, void 0, function* () {
            this.trace.log(Tracing_1.TraceLevel.INFO, 'Running command cds.showWelcomePage');
            yield this.openWelcomePage(!doNotForce);
        })));
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.openWelcomePage(false);
        });
    }
    loadContent(contentUrl, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.cancelToken) {
                this.trace.log(Tracing_1.TraceLevel.INFO, 'Cancelling running welcome page request');
                HTTPUtil_1.httpUtil.cancel(this.cancelToken);
                this.cancelToken = null;
            }
            const response = yield HTTPUtil_1.httpUtil.get(contentUrl.href, {
                timeout: 30000,
                headers
            }, (c) => {
                this.cancelToken = c;
            });
            this.cancelToken = null;
            this.trace.log(Tracing_1.TraceLevel.INFO, `Getting welcome page content from ${contentUrl.href}`);
            return response;
        });
    }
    getContentUrl(contentUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            const redirectResponse = yield this.loadContent(contentUrl);
            const match = REDIRECT_REGEX.exec(redirectResponse.data);
            if (match === null || match === void 0 ? void 0 : match[1]) {
                return new url_1.URL(match[1], contentUrl.origin);
            }
            return contentUrl;
        });
    }
    getShowAuto() {
        return !!vscode.workspace.getConfiguration().get(exports.RELEASE_NOTES_SHOW_AUTO);
    }
    openWelcomePage(force) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!force && !this.getShowAuto()) {
                this.trace.log(Tracing_1.TraceLevel.INFO, `CAP Release Notes not shown automatically: Setting ${exports.RELEASE_NOTES_SHOW_AUTO} is false`);
                return;
            }
            try {
                const contentUrl = yield this.getContentUrl(WelcomePageHandler.RELEASE_NOTES_URL);
                const headers = {};
                if (!force) {
                    const storedHash = this.context.globalState.get(STATE_ID);
                    headers['If-None-Match'] = storedHash === null || storedHash === void 0 ? void 0 : storedHash.toString();
                }
                const contentResponse = yield this.loadContent(contentUrl, headers);
                if (contentResponse.status === axios_1.default.HttpStatusCode.NotModified) {
                    return;
                }
                this.showContent(contentUrl, contentResponse.data);
                yield this.context.globalState.update(STATE_ID, contentResponse.headers.etag);
                this.trace.log(Tracing_1.TraceLevel.INFO, `Stored new welcome page id ${contentResponse.headers.etag}`);
            }
            catch (err) {
                if (!force || axios_1.default.isCancel(err)) {
                    return;
                }
                const errorBody = I18NHandler_1.i18nHandler.getText(I18NHandler_1.i18n.WelcomePageHandler_loadErrorBody_xmsg, {
                    docuUrl: WelcomePageHandler.RELEASE_NOTES_URL.href,
                    err: err.message
                });
                this.showContent(WelcomePageHandler.RELEASE_NOTES_URL, errorBody);
            }
        });
    }
    createPanel(panel) {
        this.panels.delete(PANEL_LABEL);
        if (!panel) {
            panel = vscode.window.createWebviewPanel('cds.welcomePage', PANEL_LABEL, vscode.ViewColumn.One, {
                enableScripts: true,
                enableCommandUris: false,
                retainContextWhenHidden: true,
                enableFindWidget: true
            });
        }
        panel.iconPath = this.capLogoUri;
        const themeChangeListener = vscode.window.onDidChangeActiveColorTheme((e) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const theme = vscode.ColorThemeKind[e.kind];
            try {
                yield ((_a = panel === null || panel === void 0 ? void 0 : panel.webview) === null || _a === void 0 ? void 0 : _a.postMessage({ theme }));
            }
            catch (err) {
                this.trace.log(Tracing_1.TraceLevel.DEBUG, err);
            }
        }));
        this.context.subscriptions.push(themeChangeListener);
        this.context.subscriptions.push(panel.onDidDispose(() => {
            this.panels.delete(PANEL_LABEL);
            themeChangeListener.dispose();
        }));
        this.panels.set(PANEL_LABEL, panel);
        return panel;
    }
    showContent(docuUrl, bodyContent) {
        let panel = this.panels.get(PANEL_LABEL);
        if (panel) {
            panel.reveal();
        }
        else {
            panel = this.createPanel();
        }
        const styleUri = panel.webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'media', 'welcomePageStyles.css'));
        const vitepressTheme = [vscode.ColorThemeKind.Dark, vscode.ColorThemeKind.HighContrast].includes(vscode.window.activeColorTheme.kind)
            ? 'dark'
            : '';
        bodyContent = bodyContent.replace(/(href\s*=\s*")(\.\/\.\.)/g, '$1/docs');
        panel.webview.html = `
        <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
        <!--suppress CssUnresolvedCustomProperty -->
        <html xmlns="http://www.w3.org/1999/xhtml" lang="en">
            <head>
                <title>${PANEL_LABEL}</title>
                <base href="${docuUrl.origin}" />
                <meta charset="UTF-8" />
                <link href="${styleUri}" rel="stylesheet" />
                <meta http-equiv="Content-Security-Policy" content="
                    default-src ${docuUrl.origin} ${panel.webview.cspSource};
                    script-src 'unsafe-inline' ${docuUrl.origin} ${panel.webview.cspSource};
                    style-src 'unsafe-inline' ${docuUrl.origin} ${panel.webview.cspSource};
                    img-src data: https://img.shields.io/ https://javadoc.io/ https://maven-badges.herokuapp.com/ ${docuUrl.origin} ${panel.webview.cspSource};
                "/>
                <script>
                    // vscode defaults (sometimes) to dark theme, so force theme setting
                    window.addEventListener('DOMContentLoaded', () => {
                        document.documentElement.classList.remove('dark');
                        document.documentElement.classList.add('${vitepressTheme}');
                    });
                    window.addEventListener('message', event => {
                        switch (event.data.theme) {
                            case '${vscode.ColorThemeKind[vscode.ColorThemeKind.Dark]}':
                            case '${vscode.ColorThemeKind[vscode.ColorThemeKind.HighContrast]}':
                                document.documentElement.classList.add('dark');
                                break;
                            case '${vscode.ColorThemeKind[vscode.ColorThemeKind.Light]}':
                            case '${vscode.ColorThemeKind[vscode.ColorThemeKind.HighContrastLight]}':
                                document.documentElement.classList.remove('dark');
                                break;
                        }
                    });
                </script>
            </head>

            <body>
                <div class="opacity-layer"></div>
                ${bodyContent}
            </body>
        </html>`;
        return panel;
    }
}
exports.WelcomePageHandler = WelcomePageHandler;
WelcomePageHandler.RELEASE_NOTES_URL = new url_1.URL('https://cap.cloud.sap/docs/releases/latest');
//# sourceMappingURL=WelcomePageHandler.js.map