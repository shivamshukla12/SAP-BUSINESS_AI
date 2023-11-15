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
exports.GraphvizInstaller = void 0;
const fs = require("fs");
const os = require("os");
const path = require("path");
const vscode = require("vscode");
const HTTPUtil_1 = require("../HTTPUtil");
const I18NHandler_1 = require("../i18n/I18NHandler");
class GraphvizInstaller {
    constructor() {
        this.phase = '';
    }
    checkGraphvizInstalled() {
        return __awaiter(this, void 0, void 0, function* () {
            const extensionId = 'joaompinto.vscode-graphviz';
            if (!vscode.extensions.getExtension(extensionId)) {
                const install = I18NHandler_1.i18nHandler.getText(I18NHandler_1.i18n.AnalyzeDependencies_installGraphviz_xbut);
                const selection = yield vscode.window.showInformationMessage(I18NHandler_1.i18nHandler.getText(I18NHandler_1.i18n.AnalyzeDependencies_installGraphviz_xmsg), { modal: true }, install);
                return selection === install
                    ? this.installGraphviz()
                    : false;
            }
            return true;
        });
    }
    installGraphviz() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const vsixPath = yield this.downloadVsix();
                yield this.installVsix(vsixPath);
                return true;
            }
            catch (e) {
                yield vscode.window.showWarningMessage(`Installation of Graphviz extension failed while

${this.phase}

${e}
`, { modal: true });
                return false;
            }
        });
    }
    downloadVsix() {
        return __awaiter(this, void 0, void 0, function* () {
            const vsixPath = path.join(os.tmpdir(), 'graphviz.vsix');
            if (!fs.existsSync(vsixPath)) {
                const url = 'https://marketplace.visualstudio.com/_apis/public/gallery/publishers/joaompinto/vsextensions/vscode-graphviz/0.0.6/vspackage';
                this.phase = `downloading VSIX from ${url}`;
                const response = yield HTTPUtil_1.httpUtil.get(url, { responseType: 'arraybuffer' });
                this.saveVsix(vsixPath, response.data);
            }
            return vsixPath;
        });
    }
    saveVsix(vsixPath, data) {
        this.phase = `saving VSIX to ${vsixPath}`;
        fs.writeFileSync(vsixPath, data);
    }
    installVsix(vsixPath) {
        return __awaiter(this, void 0, void 0, function* () {
            this.phase = 'installing VSIX';
            yield vscode.commands.executeCommand('workbench.extensions.command.installFromVSIX', vscode.Uri.file(vsixPath));
        });
    }
}
exports.GraphvizInstaller = GraphvizInstaller;
//# sourceMappingURL=GraphvizInstaller.js.map