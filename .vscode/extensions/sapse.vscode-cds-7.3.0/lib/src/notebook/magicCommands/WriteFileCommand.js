"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
exports.WriteFileCommand = void 0;
const path = require("path");
const vscode = require("vscode");
const MagicCommand_1 = require("./MagicCommand");
let WriteFileCommand = class WriteFileCommand extends MagicCommand_1.MagicCommand {
    _execute(context, options = '', payload = '') {
        return __awaiter(this, void 0, void 0, function* () {
            const cwd = context.getCurrentCwd();
            const regex = /(?<appendOption>-a |--append )?\s*(["'])(?<filename>[^\2]+)\2/;
            const match = regex.exec(options);
            const param = match === null || match === void 0 ? void 0 : match.groups.filename;
            if (param) {
                let fileName = param;
                const append = !!match.groups.appendOption;
                const fileContents = payload;
                if (!path.isAbsolute(fileName)) {
                    fileName = path.join(cwd, fileName);
                }
                yield vscode.workspace.fs.createDirectory(vscode.Uri.file(path.dirname(fileName)));
                const fileUri = vscode.Uri.file(fileName);
                if (append) {
                    const fileExists = () => __awaiter(this, void 0, void 0, function* () {
                        try {
                            const stat = yield vscode.workspace.fs.stat(fileUri);
                            return stat.type === vscode.FileType.File;
                        }
                        catch (e) {
                            return false;
                        }
                    });
                    const existingContent = (yield fileExists())
                        ? (yield vscode.workspace.fs.readFile(fileUri)).toString()
                        : '';
                    yield vscode.workspace.fs.writeFile(fileUri, Buffer.from(existingContent + fileContents, 'utf8'));
                }
                else {
                    yield vscode.workspace.fs.writeFile(fileUri, Buffer.from(fileContents, 'utf8'));
                }
                const printFileName = path.relative(context.getDefaultCwd(), fileName);
                return { content: `Wrote cell content to file <a href="${printFileName}">${printFileName}</a>.` };
            }
            else {
                throw new Error('Failed to get filename arg. Did you forget to add quotes?');
            }
        });
    }
};
exports.WriteFileCommand = WriteFileCommand;
WriteFileCommand.meta = {
    name: 'writefile',
    description: 'Writes cell contents to file',
    optionSyntax: '[-a|--append] <"filename">',
    expectsPayload: true
};
exports.WriteFileCommand = WriteFileCommand = __decorate([
    (0, MagicCommand_1.staticImplements)()
], WriteFileCommand);
//# sourceMappingURL=WriteFileCommand.js.map