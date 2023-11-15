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
exports.mergeJSONs = exports.ExtendJsonCommand = void 0;
const path = require("path");
const vscode = require("vscode");
const MagicCommand_1 = require("./MagicCommand");
const testLog_1 = require("./testLog");
let ExtendJsonCommand = class ExtendJsonCommand extends MagicCommand_1.MagicCommand {
    _execute(context, options = '', payload = '') {
        return __awaiter(this, void 0, void 0, function* () {
            const cwd = context.getCurrentCwd();
            const regex = /(["'])(?<filename>[^\1]+?)\1(\s+(["'])(?<xpath>[^\4]+)\4)?/;
            const match = regex.exec(options);
            if (!match) {
                throw new Error('Failed to get filename arg. Did you forget to add quotes?');
            }
            let filename = match.groups.filename;
            const xpath = match.groups.xpath;
            (0, testLog_1.logX)(`extendjson: ${xpath}`);
            try {
                let jsonToInsert = JSON.parse(payload);
                if (xpath === null || xpath === void 0 ? void 0 : xpath.trim()) {
                    const propertyPath = xpath.split('>');
                    jsonToInsert = insert({}, propertyPath, jsonToInsert);
                }
                if (!path.isAbsolute(filename)) {
                    filename = path.join(cwd, filename);
                }
                const jsonBuffer = yield vscode.workspace.fs.readFile(vscode.Uri.file(filename));
                const jsonContents = JSON.parse(jsonBuffer.toString());
                const joinedContents = mergeJSONs(jsonContents, jsonToInsert);
                (0, testLog_1.logX)(`${filename}: ${JSON.stringify(joinedContents, null, 2)}`);
                yield vscode.workspace.fs.writeFile(vscode.Uri.file(filename), Buffer.from(JSON.stringify(joinedContents, null, 2), 'utf8'));
            }
            catch (err) {
                (0, testLog_1.logX)(`Error: ${err.stack}`);
                throw new Error('Failed to add cell content to file. ' + err.message);
            }
            const printFileName = path.relative(context.getDefaultCwd(), filename);
            return { content: `Added cell content to file <a href="${printFileName}">${printFileName}</a>.` };
        });
    }
};
exports.ExtendJsonCommand = ExtendJsonCommand;
ExtendJsonCommand.meta = {
    name: 'extendjson',
    description: 'Writes cell contents to file',
    optionSyntax: '<"filename"> ["a1>...>an"]',
    expectsPayload: true
};
exports.ExtendJsonCommand = ExtendJsonCommand = __decorate([
    (0, MagicCommand_1.staticImplements)()
], ExtendJsonCommand);
function insert(target, segments, toInsert) {
    var _a;
    if (!segments.length)
        return toInsert;
    const segment = (_a = segments[0]) === null || _a === void 0 ? void 0 : _a.trim();
    target[segment] = insert(target[segment] || {}, segments.slice(1), toInsert);
    return target;
}
function mergeJSONs(target, add) {
    const isObject = (obj) => typeof obj === 'object';
    Object.entries(add).forEach(([key, addVal]) => {
        const targetVal = target[key];
        if (targetVal && isObject(targetVal) && isObject(addVal)) {
            if ((Array.isArray(targetVal) && Array.isArray(addVal))) {
                targetVal.push(...addVal);
                return;
            }
            mergeJSONs(targetVal, addVal);
        }
        else {
            target[key] = addVal;
        }
    });
    return target;
}
exports.mergeJSONs = mergeJSONs;
//# sourceMappingURL=ExtendJsonCommand.js.map