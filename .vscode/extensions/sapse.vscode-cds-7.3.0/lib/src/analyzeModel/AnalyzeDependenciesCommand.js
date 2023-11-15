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
exports.registerAnalyzeDependenciesCommand = void 0;
const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const path = require("path");
const url_1 = require("url");
const vscode = require("vscode");
const extension_1 = require("../extension");
const ExtensionUtil_1 = require("../ExtensionUtil");
const GraphvizInstaller_1 = require("./GraphvizInstaller");
function registerAnalyzeDependenciesCommand(context) {
    context.subscriptions.push(vscode.commands.registerCommand('cds.analyzeDependencies', (uri) => __awaiter(this, void 0, void 0, function* () {
        var _a;
        if (!uri)
            return;
        if (!(yield new GraphvizInstaller_1.GraphvizInstaller().checkGraphvizInstalled()))
            return;
        const map = {
            file2file: 'File to file (detailed)',
            file2folder: 'File to file (reduced to folders)',
            folder2folder: 'Complete folder to complete folder'
        };
        const mode = yield vscode.window.showQuickPick(Object.values(map), { canPickMany: false });
        const detailMode = (_a = Object.entries(map).find(([, description]) => mode === description)) === null || _a === void 0 ? void 0 : _a[0];
        if (detailMode) {
            void new AnalyzeDependenciesCommand().execute(uri, detailMode);
        }
    })));
}
exports.registerAnalyzeDependenciesCommand = registerAnalyzeDependenciesCommand;
class AnalyzeDependenciesCommand {
    execute(startModelUri, detailMode) {
        return __awaiter(this, void 0, void 0, function* () {
            const folder = this.createOutputFolder(startModelUri);
            const clientOutputUri = this.getOutputUri(folder, startModelUri);
            yield this.triggerAnalysis(startModelUri, clientOutputUri, detailMode);
            return this.triggerPreview(clientOutputUri);
        });
    }
    triggerPreview(outputUri) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.openModelFile(outputUri);
            return vscode.commands.executeCommand('graphviz.preview', outputUri);
        });
    }
    triggerAnalysis(uri, clientOutputUri, detailMode = 'file2file') {
        return __awaiter(this, void 0, void 0, function* () {
            const hide = (0, ExtensionUtil_1.showInStatusBar)('Calculating dependency tree');
            const startModelUri = this.getServerModelUri(uri);
            const outputUri = this.getClient().code2ProtocolConverter.asUri(clientOutputUri);
            const command = 'analyze-dependencies';
            const params = {
                command,
                arguments: [{
                        startModelUri,
                        outputUri,
                        detailMode
                    }]
            };
            yield this.getClient().sendRequest('workspace/executeCommand', params);
            hide();
            (0, ExtensionUtil_1.showInStatusBar)('Calculated', 1000);
        });
    }
    getClient() {
        if (!this._client) {
            this._client = (0, extension_1.getRawLanguageClient)();
        }
        return this._client;
    }
    openModelFile(outputUri) {
        return __awaiter(this, void 0, void 0, function* () {
            const doc = yield vscode.workspace.openTextDocument(outputUri);
            return vscode.window.showTextDocument(doc, { preview: true });
        });
    }
    createOutputFolder(uri) {
        const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
        const projectHash = crypto.createHash('md5').update(workspaceFolder.uri.toString()).digest('hex');
        const outFolder = path.join(os.tmpdir(), '.graphvizModels', projectHash);
        fs.mkdirSync(outFolder, { recursive: true });
        return outFolder;
    }
    getOutputUri(outputFolder, uri) {
        const modelUri = this.getServerModelUri(uri);
        const outputFile = path.join(outputFolder, `${path.basename(modelUri)}.dot`);
        return vscode.Uri.parse((0, url_1.pathToFileURL)(outputFile).toString());
    }
    getServerModelUri(uri) {
        return this.getClient().code2ProtocolConverter.asUri(uri);
    }
}
//# sourceMappingURL=AnalyzeDependenciesCommand.js.map