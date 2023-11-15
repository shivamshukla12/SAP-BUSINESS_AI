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
exports.CapNotebookUriHandler = exports.ALLOWED_HOSTS = void 0;
const axios_1 = require("axios");
const crypto = require("crypto");
const os = require("os");
const path = require("path");
const vscode = require("vscode");
const Tracing_1 = require("../Tracing");
const CapNotebookSerializer_1 = require("./CapNotebookSerializer");
const NB_FILE_URI_KEY = 'NB_FILE_URI';
exports.ALLOWED_HOSTS = [
    'localhost',
    'cap.cloud.sap',
    'pages.github.tools.sap'
];
class CapNotebookUriHandler {
    constructor(context, outputChannel) {
        this.context = context;
        this.context.subscriptions.push(vscode.window.registerUriHandler(this));
        this.trace = new Tracing_1.Trace(Tracing_1.ClientTraceComponents.NB_FILE_URI, outputChannel);
        this.serializer = new CapNotebookSerializer_1.CapNotebookSerializer(this.trace);
    }
    handleUri(uri) {
        return __awaiter(this, void 0, void 0, function* () {
            const queryParams = new URLSearchParams(uri.query);
            if (uri.path === '/openNotebook' && queryParams.has('url')) {
                const urlString = queryParams.get('url');
                const url = new URL(urlString);
                const protocol = url.protocol;
                const hostname = url.hostname;
                const isProtocolHttps = protocol === 'https:' || hostname === 'localhost';
                const isAllowedHost = exports.ALLOWED_HOSTS.includes(hostname);
                if (isProtocolHttps && isAllowedHost) {
                    yield this.openNotebookFromUrl(urlString);
                }
                else {
                    if (!isProtocolHttps) {
                        yield vscode.window.showErrorMessage(`Not allowed to get notebook using protocol '${protocol}'.`);
                    }
                    if (!isAllowedHost) {
                        yield vscode.window.showErrorMessage(`Not allowed to get notebook from host '${hostname}'.`);
                    }
                }
            }
            else {
                yield vscode.window.showErrorMessage('Not allowed to get notebook due to wrong url format.');
            }
        });
    }
    openNotebookFromUrl(url) {
        return __awaiter(this, void 0, void 0, function* () {
            let notebookData;
            try {
                const res = yield axios_1.default.get(url, { responseType: 'arraybuffer' });
                if (res.status >= 200 && res.status < 400) {
                    const nbExtension = path.extname(url);
                    if (nbExtension !== '.capnb') {
                        void vscode.window.showErrorMessage(`Not allowed to get notebook with extension '${nbExtension}'.`);
                        return;
                    }
                }
                else {
                    void vscode.window.showErrorMessage(`Status ${res.status} encountered while getting the notebook.`);
                    return;
                }
                const arrayBuffer = yield res.data;
                const content = new Uint8Array(arrayBuffer);
                notebookData = yield this.serializer.deserializeNotebook(content);
            }
            catch (err) {
                void vscode.window.showErrorMessage(err.message);
                return;
            }
            try {
                const tmpDir = path.join(os.tmpdir(), `cap-playground-${crypto.randomBytes(6).toString('hex')}`);
                const tmpUri = vscode.Uri.file(tmpDir);
                const fileName = path.basename(url);
                const destPath = path.join(tmpDir, fileName);
                const nbContents = yield this.serializer.serializeNotebook(notebookData);
                const nbUri = vscode.Uri.file(destPath);
                yield vscode.workspace.fs.writeFile(nbUri, nbContents);
                const tasks = {
                    version: '2.0.0',
                    tasks: [
                        {
                            label: 'Open CAP Notebook',
                            type: 'shell',
                            command: `code ${fileName}`,
                            presentation: {
                                reveal: 'never'
                            },
                            runOptions: {
                                runOn: 'folderOpen',
                            }
                        },
                    ]
                };
                const tasksPath = path.join(tmpDir, '.vscode/tasks.json');
                yield vscode.workspace.fs.writeFile(vscode.Uri.file(tasksPath), Buffer.from(JSON.stringify(tasks, null, 4)));
                yield this.context.globalState.update(NB_FILE_URI_KEY, nbUri.path);
                yield vscode.commands.executeCommand('vscode.openFolder', tmpUri, true);
            }
            catch (err) {
                void vscode.window.showErrorMessage(`There was a problem opening the CAP Notebook: ${err}`);
            }
        });
    }
}
exports.CapNotebookUriHandler = CapNotebookUriHandler;
//# sourceMappingURL=CapNotebookUriHandler.js.map