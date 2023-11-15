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
exports.isMagicCommandLine = exports.MagicCommandDispatcher = void 0;
const util = require("util");
const vscode = require("vscode");
const Regex_1 = require("../../util/Regex");
const MagicCommands_1 = require("./MagicCommands");
const testLog_1 = require("./testLog");
const COMMAND_REGEX = /\B%(?<withPayload>%)?(?<command>[a-zA-Z]+)\b/;
class MagicCommandDispatcher {
    constructor(controller) {
        this.controller = controller;
    }
    process(execution) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const content = (_a = execution.cell.document.getText()) !== null && _a !== void 0 ? _a : '';
            (0, testLog_1.logX)(`process#${execution.cell.index}: ${content}`);
            let output = '';
            let mime = 'text/html';
            try {
                for (const command of this.extractCommands(content, execution.cell.document.languageId)) {
                    command.options = this.controller.resolveEnvVars(command.options, execution.cell);
                    const out = yield this.processSingleMagicCommand(execution, command);
                    (0, testLog_1.logX)(`out: ${out.content}`);
                    output += out.content + '\n';
                    mime = (_b = out.mime) !== null && _b !== void 0 ? _b : mime;
                }
            }
            catch (e) {
                (0, testLog_1.logX)(`++Error: ${e.stack}`);
                throw e;
            }
            void execution.replaceOutput([
                new vscode.NotebookCellOutput([
                    vscode.NotebookCellOutputItem.text(output, mime)
                ])
            ]);
            return output !== '';
        });
    }
    *extractCommands(content, languageId = 'shell') {
        var _a, _b;
        const matches = this.controller.getMagicComments(content, languageId);
        const lines = this.controller.splitLines(content);
        let state = { isInLineComment: false, isInBlockComment: false, isBlockCommentEnd: false };
        let i = 0;
        let hasPayload = false;
        const hasMagicCommands = matches.length > 0;
        for (const line of lines) {
            if (!hasPayload) {
                state = this.updateCommentStartState(line, state, languageId);
                const match = matches.filter(match => match.line === i)[0];
                if (match) {
                    if ((_a = match === null || match === void 0 ? void 0 : match.magic) === null || _a === void 0 ? void 0 : _a.payload) {
                        hasPayload = true;
                    }
                    (0, testLog_1.logX)(`Matched '${line}' to ${util.inspect(match)}`);
                }
                else if (!match && line.trim() && hasMagicCommands && !state.isInBlockComment && !state.isInLineComment) {
                    (0, testLog_1.logX)(`No match for '${line}'`);
                    throw new Error(`Magic command expected: ${line}`);
                }
                state = this.updateCommentEndState(state);
                i++;
                if (match) {
                    match.magic.command = (_b = match === null || match === void 0 ? void 0 : match.magic) === null || _b === void 0 ? void 0 : _b.command.replace(/%/g, '');
                    yield match === null || match === void 0 ? void 0 : match.magic;
                }
            }
        }
    }
    updateCommentStartState(line, state, languageId) {
        const { isLineComment, isBlockCommentStart } = this.controller.getMagicCommentSelectors(languageId);
        if (isBlockCommentStart(line)) {
            state.isInBlockComment = true;
        }
        else if (isLineComment(line)) {
            state.isInLineComment = true;
        }
        return state;
    }
    updateCommentEndState(state) {
        state.isInLineComment = false;
        if (state.isInBlockComment && state.isBlockCommentEnd) {
            state.isInBlockComment = false;
        }
        return state;
    }
    processSingleMagicCommand(execution, command) {
        return __awaiter(this, void 0, void 0, function* () {
            const Magic = MagicCommands_1.MagicCommands.find(s => s.meta.name === command.command);
            if (Magic) {
                (0, testLog_1.logX)(`processSingleMagicCommand(${command.command})${execution.cell.index}`);
                return new Magic(this.controller).execute(execution, command.options, command.payload);
            }
            (0, testLog_1.logX)(`unknown command: (${command.command})${execution.cell.index}`);
            return { content: `Unknown command: ${command.command}` };
        });
    }
}
exports.MagicCommandDispatcher = MagicCommandDispatcher;
function isMagicCommandLine(line) {
    return Regex_1.REGEX.and(/\s*/, COMMAND_REGEX).test(line);
}
exports.isMagicCommandLine = isMagicCommandLine;
//# sourceMappingURL=MagicCommandDispatcher.js.map