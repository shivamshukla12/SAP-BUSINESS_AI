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
exports.CapNotebookSerializer = void 0;
const os = require("os");
const util_1 = require("util");
const vscode = require("vscode");
const Tracing_1 = require("../Tracing");
class CapNotebookSerializer {
    constructor(trace) {
        this.trace = trace;
    }
    serializeNotebook(data) {
        return __awaiter(this, void 0, void 0, function* () {
            this.trace.log(Tracing_1.TraceLevel.INFO, 'serializing cap notebook');
            function _asRawOutput(cell) {
                var _a;
                const result = [];
                for (const output of (_a = cell.outputs) !== null && _a !== void 0 ? _a : []) {
                    for (const item of output.items) {
                        let outputContents = '';
                        try {
                            outputContents = new util_1.TextDecoder().decode(item.data);
                        }
                        catch (_b) {
                        }
                        try {
                            const outputData = JSON.parse(outputContents);
                            result.push({ mime: item.mime, value: outputData });
                        }
                        catch (_c) {
                            result.push({ mime: item.mime, value: outputContents });
                        }
                    }
                }
                return result;
            }
            const contents = [];
            for (const cell of data.cells) {
                let value = cell.value.replace(new RegExp(os.EOL, 'g'), '\n');
                if (Object.keys(cell === null || cell === void 0 ? void 0 : cell.metadata).length > 0) {
                    value = (cell === null || cell === void 0 ? void 0 : cell.metadata[cell === null || cell === void 0 ? void 0 : cell.languageId]) ? cell === null || cell === void 0 ? void 0 : cell.metadata[cell === null || cell === void 0 ? void 0 : cell.languageId] : '';
                }
                contents.push({
                    kind: cell.kind,
                    language: cell.languageId,
                    value,
                    outputs: _asRawOutput(cell)
                });
            }
            return new util_1.TextEncoder().encode(JSON.stringify(contents, null, 4));
        });
    }
    deserializeNotebook(content) {
        return __awaiter(this, void 0, void 0, function* () {
            this.trace.log(Tracing_1.TraceLevel.INFO, 'deserializing cap notebook');
            const decodedContent = new util_1.TextDecoder().decode(content);
            let raw;
            try {
                raw = JSON.parse(decodedContent);
            }
            catch (_a) {
                raw = [];
            }
            function _convertRawOutputToBytes(raw) {
                const result = [];
                for (const output of raw.outputs) {
                    const data = new util_1.TextEncoder().encode(output.value);
                    result.push(new vscode.NotebookCellOutputItem(data, output.mime));
                }
                return result;
            }
            const cells = raw.map(item => {
                const cellItem = new vscode.NotebookCellData(item.kind, item.value, (['bat', 'cmd', 'powershell', 'shellscript'].includes(item.language) ? 'shell' : item.language));
                cellItem.metadata = {};
                return cellItem;
            });
            for (let i = 0; i < cells.length; i++) {
                const cell = cells[i];
                cell.outputs = raw[i].outputs ? [new vscode.NotebookCellOutput(_convertRawOutputToBytes(raw[i]))] : [];
            }
            return new vscode.NotebookData(cells);
        });
    }
}
exports.CapNotebookSerializer = CapNotebookSerializer;
//# sourceMappingURL=CapNotebookSerializer.js.map