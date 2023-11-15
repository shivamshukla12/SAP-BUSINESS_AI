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
exports.EnvVarHandler = exports.ENV_VAR_USAGE_UNKNOWN_DECORATION = exports.ENV_VAR_USAGE_KNOWN_DECORATION = exports.ENV_VAR_DECLARATION_ERROR_DECORATION = exports.ENV_VAR_DECLARATION_DECORATION = void 0;
const vscode = require("vscode");
const MagicCommandDispatcher_1 = require("./magicCommands/MagicCommandDispatcher");
const VALID_ENV_KEY = /^[a-zA-Z_]\w*$/;
const KEY_VALUE_REGEX = /@(?<key>[^\s=]+)\s*=\s*("(?<val>.*)")?/gm;
const USAGE_REGEX = /(?<full>{{\s*(?<key>[a-zA-Z_]\w*)\s*}})/gm;
exports.ENV_VAR_DECLARATION_DECORATION = vscode.window.createTextEditorDecorationType({
    color: 'var(--vscode-symbolIcon-variableForeground)'
});
exports.ENV_VAR_DECLARATION_ERROR_DECORATION = vscode.window.createTextEditorDecorationType({
    color: 'var(--vscode-symbolIcon-variableForeground)',
    textDecoration: 'underline;  text-decoration-color: var(--vscode-editorError-foreground);  text-decoration-style: wavy;  text-underline-position: under;  text-decoration-thickness: from-font;'
});
exports.ENV_VAR_USAGE_KNOWN_DECORATION = vscode.window.createTextEditorDecorationType({
    fontStyle: 'italic',
    color: 'var(--vscode-symbolIcon-variableForeground)'
});
exports.ENV_VAR_USAGE_UNKNOWN_DECORATION = vscode.window.createTextEditorDecorationType({
    color: 'var(--vscode-symbolIcon-variableForeground)',
    textDecoration: 'underline;  text-decoration-color: var(--vscode-editorWarning-foreground);  text-decoration-style: wavy;  text-underline-position: under;  text-decoration-thickness: from-font;'
});
class EnvVarHandler {
    constructor(controller) {
        this.controller = controller;
    }
    resolveEnvVars(content, cell) {
        if (content) {
            const env = this.controller.envFor(cell);
            for (const key of Object.keys(env)) {
                const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
                content = content.replace(regex, env[key]);
            }
        }
        return content;
    }
    fillEnvVars(content, cell) {
        return __awaiter(this, void 0, void 0, function* () {
            KEY_VALUE_REGEX.lastIndex = 0;
            const env = {};
            let matches;
            let outputText = '';
            while ((matches = KEY_VALUE_REGEX.exec(content)) !== null) {
                if (VALID_ENV_KEY.exec(matches.groups.key)) {
                    env[matches.groups.key] = matches.groups.val;
                    if (matches.groups.val != null) {
                        outputText += `${matches.groups.key}=${matches.groups.val}<br>`;
                    }
                    else {
                        outputText += `deleting <b>${matches.groups.key}</b><br>`;
                    }
                }
                else {
                    outputText += `invalid key <b>${matches.groups.key}</b><br>`;
                }
            }
            if (Object.keys(env).length) {
                yield this.controller.setEnvVars(env, cell);
            }
            return outputText;
        });
    }
    decorate(textEditor, cell) {
        this.decorateDeclaration(textEditor, cell);
        this.decorateUsage(textEditor, cell);
    }
    decorateDeclaration(textEditor, cell) {
        const cellContent = cell.document.getText();
        const env = this.controller.envFor(cell);
        let match;
        const correctDeclaration = [];
        const incorrectDeclaration = [];
        KEY_VALUE_REGEX.lastIndex = 0;
        while ((match = KEY_VALUE_REGEX.exec(cellContent)) !== null) {
            const range = new vscode.Range(cell.document.positionAt(match.index), cell.document.positionAt(match.index + match.groups.key.length + 1));
            if (VALID_ENV_KEY.exec(match.groups.key)) {
                const hoverMessage = env[match.groups.key] != null ? `'${env[match.groups.key]}'` : 'undefined';
                correctDeclaration.push({ range, hoverMessage });
            }
            else {
                const hoverMessage = `invalid variable name ${match.groups.key}`;
                incorrectDeclaration.push({ range, hoverMessage });
            }
        }
        textEditor.setDecorations(exports.ENV_VAR_DECLARATION_DECORATION, correctDeclaration);
        textEditor.setDecorations(exports.ENV_VAR_DECLARATION_ERROR_DECORATION, incorrectDeclaration);
    }
    decorateUsage(textEditor, cell) {
        const env = this.controller.envFor(cell);
        let match;
        const knownUsage = [];
        const unknownUsage = [];
        const isShellOrTerminalCell = cell.kind === vscode.NotebookCellKind.Code && ['shell', 'terminal'].includes(cell.document.languageId);
        for (let lineNumber = 0; lineNumber < cell.document.lineCount; lineNumber++) {
            const line = cell.document.lineAt(lineNumber);
            if (isShellOrTerminalCell || (0, MagicCommandDispatcher_1.isMagicCommandLine)(line.text)) {
                const lineOffset = cell.document.offsetAt(line.range.start);
                USAGE_REGEX.lastIndex = 0;
                while ((match = USAGE_REGEX.exec(line.text)) !== null) {
                    const range = new vscode.Range(cell.document.positionAt(lineOffset + match.index), cell.document.positionAt(lineOffset + match.index + match.groups.full.length));
                    if (env[match.groups.key] != null) {
                        const hoverMessage = `'${env[match.groups.key]}'`;
                        knownUsage.push({ range, hoverMessage });
                    }
                    else {
                        const hoverMessage = 'undefined';
                        unknownUsage.push({ range, hoverMessage });
                    }
                }
            }
        }
        textEditor.setDecorations(exports.ENV_VAR_USAGE_KNOWN_DECORATION, knownUsage);
        textEditor.setDecorations(exports.ENV_VAR_USAGE_UNKNOWN_DECORATION, unknownUsage);
    }
}
exports.EnvVarHandler = EnvVarHandler;
//# sourceMappingURL=EnvVarHandler.js.map