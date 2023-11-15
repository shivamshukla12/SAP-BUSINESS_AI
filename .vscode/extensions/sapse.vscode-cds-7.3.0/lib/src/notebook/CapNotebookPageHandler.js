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
exports.CapNotebookPageHandler = void 0;
const path = require("path");
const vscode = require("vscode");
const Output_1 = require("../Output");
const Tracing_1 = require("../Tracing");
const PANEL_LABEL = 'Welcome to CAP Notebooks!';
class CapNotebookPageHandler {
    constructor(context) {
        this.context = context;
        this.panels = new Map();
        this.trace = new Tracing_1.Trace(Tracing_1.ClientTraceComponents.WELCOME_PAGE, Output_1.technicalOutput);
        this.capLogoUri = vscode.Uri.file(path.join(this.context.extensionPath, 'media/cap-logo.png'));
        this.context.subscriptions.push(vscode.commands.registerCommand('cds.showCapNotebookPage', () => __awaiter(this, void 0, void 0, function* () {
            this.trace.log(Tracing_1.TraceLevel.INFO, 'Running command cds.showCapNotebookPage');
            yield this.showContent();
        })));
        this.context.subscriptions.push(vscode.window.registerWebviewPanelSerializer('cds.capNotebook', this));
    }
    deserializeWebviewPanel(webviewPanel, _state) {
        return __awaiter(this, void 0, void 0, function* () {
            this.createPanel(webviewPanel);
            yield this.showContent();
        });
    }
    createPanel(panel) {
        this.panels.delete(PANEL_LABEL);
        if (!panel) {
            panel = vscode.window.createWebviewPanel('cds.capNotebook', PANEL_LABEL, vscode.ViewColumn.One, {
                enableScripts: true,
                enableCommandUris: false,
                retainContextWhenHidden: true,
                enableFindWidget: true
            });
        }
        panel.iconPath = this.capLogoUri;
        this.context.subscriptions.push(panel.onDidDispose(() => {
            this.panels.delete(PANEL_LABEL);
        }));
        this.context.subscriptions.push(panel.webview.onDidReceiveMessage((message) => __awaiter(this, void 0, void 0, function* () {
            try {
                const ws = yield this.getWorkingFolder();
                if (!ws) {
                    yield vscode.window.showWarningMessage('Please add/open a folder where fthe notebook can be stored and try again.');
                    return;
                }
                const Ids = message.buttonId.split('-');
                const sampleNotebookId = Ids[1];
                const sampleNotebooksUri = vscode.Uri.joinPath(this.context.extensionUri, 'media/sample-notebooks/index.json');
                const sampleNotebooks = JSON.parse((yield vscode.workspace.fs.readFile(sampleNotebooksUri)).toString());
                const title = sampleNotebooks[sampleNotebookId].title;
                const fileName = `${title.split(' ').join('_')}.capnb`;
                const filePath = path.join(ws.uri.fsPath, fileName);
                try {
                    yield vscode.workspace.fs.stat(vscode.Uri.file(filePath));
                    const answer = yield vscode.window.showWarningMessage('The CAP Notebook file already exists. Do you want to overwrite the file?', { modal: true }, 'Overwrite');
                    if (answer !== 'Overwrite') {
                        return;
                    }
                }
                catch (err) {
                }
                const nbUri = vscode.Uri.joinPath(this.context.extensionUri, 'media/sample-notebooks', fileName);
                const nbContents = (yield vscode.workspace.fs.readFile(nbUri)).toString();
                const fileUri = vscode.Uri.file(filePath);
                yield vscode.workspace.fs.writeFile(fileUri, Buffer.from(nbContents, 'utf8'));
                yield vscode.commands.executeCommand('vscode.open', fileUri);
            }
            catch (err) {
                yield vscode.window.showWarningMessage(`Something went wrong when opening the cap-notebook: ${err.message}`);
            }
            finally {
                void panel.webview.postMessage({ buttonId: message.buttonId });
            }
        })));
        this.panels.set(PANEL_LABEL, panel);
        return panel;
    }
    getWorkingFolder() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length === 0) {
                return null;
            }
            if (vscode.workspace.workspaceFolders.length === 1) {
                return vscode.workspace.workspaceFolders[0];
            }
            return vscode.window.showWorkspaceFolderPick({
                placeHolder: 'Create the cap-notebook in this workspace folder'
            });
        });
    }
    showContent() {
        return __awaiter(this, void 0, void 0, function* () {
            let panel = this.panels.get(PANEL_LABEL);
            if (panel) {
                panel.reveal();
            }
            else {
                panel = this.createPanel();
            }
            let tilesContent = '';
            const sampleNotebooksUri = vscode.Uri.joinPath(this.context.extensionUri, 'media/sample-notebooks/index.json');
            const sampleNotebooks = JSON.parse((yield vscode.workspace.fs.readFile(sampleNotebooksUri)).toString());
            Object.entries(sampleNotebooks).sort((a, b) => a[1].order - b[1].order).forEach((entry) => {
                tilesContent += `<div id="button-${entry[0]}" class="tile">`;
                tilesContent += `<i class="iconstyle icon-${entry[1].icon}"></i>`;
                tilesContent += `<div class="tile-title">${entry[1].title}</div>`;
                tilesContent += '</div>';
                return tilesContent;
            });
            const styleUri = panel.webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'media', 'capNotebookStyles.css'));
            const scriptUri = panel.webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'media', 'capNotebookScript.js'));
            panel.webview.html = `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<!--suppress CssUnresolvedCustomProperty -->
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
    <head>
        <title>${PANEL_LABEL}</title>
        <meta charset="UTF-8" />
        <meta http-equiv="Content-Security-Policy" content="
            default-src 'none';
            style-src ${panel.webview.cspSource};
            script-src ${panel.webview.cspSource};
            img-src ${panel.webview.cspSource};
            font-src ${panel.webview.cspSource};
        "/>
        <link href="${styleUri}" rel="stylesheet" />
    </head>
    <body>
        <div class="opacity-layer"></div>
        <div class="intro">
            <h1 class="page-title">${PANEL_LABEL}<div><img alt="SAP" class="sap-img">&nbsp;<img alt="CAP" class="cap-img"><div></h1>
            <p>What is a CAP Notebook? A CAP notebook is a <a href="https://code.visualstudio.com/api/extension-guides/notebook">Custom VS Code Notebook</a>
            that serves as a guide on how to create, navigate and monitor CAP projects.<br><br>
            With this, we want to encourage the CAP community to work with CAP in the same <i>explorative</i> manner that data
            scientists work with their data by:
            </p>
            <ul>
                <li>Visually interacting with their code</li>
                <li>Playing with REPL-type inputs (notebook input cells)</li>
                <li>Storing persistent code (notebook output cells)</li>
            </ul>
            <p>
            The cell inputs/outputs are especially useful at later points in time when the project's details have long been forgotten.
            In addition, notebooks are a good way to share, compare and also reproduce projects.
            <br><br><br>
            <i>Click below to find out more and try out some of our notebook features</i>
            </p>
            <br><br>
        </div>
        <div class="tiles-container">${tilesContent}</div>
        <script src="${scriptUri}"></script>
    </body>
</html>`;
            return panel;
        });
    }
}
exports.CapNotebookPageHandler = CapNotebookPageHandler;
//# sourceMappingURL=CapNotebookPageHandler.js.map