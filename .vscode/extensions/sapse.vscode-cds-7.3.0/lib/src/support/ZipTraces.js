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
exports.registerZipTracesCommand = exports.ZIP_TRACES_COMMAND_ID = void 0;
const Zip = require("adm-zip");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const vscode = require("vscode");
const Output_1 = require("../Output");
exports.ZIP_TRACES_COMMAND_ID = 'cds.traces.zip';
function registerZipTracesCommand(provider) {
    return vscode.commands.registerCommand(exports.ZIP_TRACES_COMMAND_ID, (includingSources) => new ZipTraces(provider).zipTraces(includingSources));
}
exports.registerZipTracesCommand = registerZipTracesCommand;
class ZipTraces {
    constructor(provider) {
        this.provider = provider;
    }
    zipTraces(includingSources) {
        return __awaiter(this, void 0, void 0, function* () {
            const zip = new Zip();
            Output_1.outputChannel.appendLine('\nZipping trace files...');
            yield this.zipTraceFiles(zip);
            if (includingSources) {
                Output_1.outputChannel.appendLine('Zipping CDS source files...');
                for (const wsf of vscode.workspace.workspaceFolders) {
                    this.zipFolder(zip, wsf.uri.fsPath, `sources/${path.basename(wsf.uri.fsPath)}`);
                }
            }
            return this.persistZipFile(zip);
        });
    }
    persistZipFile(zip) {
        var _a;
        const targetFolder = ((_a = vscode.workspace.workspaceFolders[0]) === null || _a === void 0 ? void 0 : _a.uri.fsPath) || os.tmpdir();
        const zipFilePath = path.join(targetFolder, `CDS-LS-traces-${new Date().toISOString().replace(/[:-]/g, '')}.zip`);
        Output_1.outputChannel.appendLine(`Zip file is written to ${vscode.Uri.parse(zipFilePath)}`);
        zip.writeZip(zipFilePath);
        return zipFilePath;
    }
    zipTraceFiles(zip) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = { name: 'logfilePath' };
            const filePattern = yield (yield this.provider.getClient()).sendRequest('cds/lspProperties', params);
            const folder = path.dirname(filePattern);
            const fileNames = fs.readdirSync(folder);
            for (const fileName of fileNames) {
                const filePath = path.join(folder, fileName);
                if (filePath.match(filePattern)) {
                    Output_1.outputChannel.appendLine(`  adding ${filePath}`);
                    zip.addLocalFile(filePath, 'traces/');
                }
            }
        });
    }
    zipFolder(zip, folder, relativePath) {
        const excludes = ['.git', 'node_modules'];
        const fileNames = fs.readdirSync(folder);
        for (const fileName of fileNames) {
            if (excludes.includes(fileName))
                continue;
            const filePath = path.join(folder, fileName);
            const stats = fs.statSync(filePath);
            if (stats.isDirectory()) {
                this.zipFolder(zip, filePath, `${relativePath}/${fileName}`);
            }
            else if (stats.isFile()) {
                if (fileName.endsWith('.cds') || fileName.endsWith('.json')) {
                    Output_1.outputChannel.appendLine(`  adding ${filePath}`);
                    zip.addLocalFile(filePath, relativePath);
                }
            }
        }
    }
}
//# sourceMappingURL=ZipTraces.js.map