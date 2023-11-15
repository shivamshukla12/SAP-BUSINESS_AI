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
exports.DynamicJSONSchemaProvider = void 0;
const cp = require("child_process");
const os = require("os");
const path = require("path");
const util_1 = require("util");
const vscode = require("vscode");
const ExtensionUtil_1 = require("./ExtensionUtil");
const Output_1 = require("./Output");
const Tracing_1 = require("./Tracing");
const IS_WIN = (os.platform() === 'win32');
const execAsync = (0, util_1.promisify)(cp.exec);
const CDS_JSON_SCHEMA = 'cdsJsonSchema';
class DynamicJSONSchemaProvider {
    constructor(context) {
        this.context = context;
        this.schemaMap = {};
        this.requestedSchemas = new Set();
        this.trace = new Tracing_1.Trace(Tracing_1.ClientTraceComponents.DYNAMIC_SCHEMA, Output_1.technicalOutput);
        this.onDidChangeEventEmitter = new vscode.EventEmitter();
        this.setSchemaMap();
        this.context.subscriptions.push(vscode.workspace.registerTextDocumentContentProvider(CDS_JSON_SCHEMA, this));
        this.context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(this.onChangeActiveEditor, this));
    }
    dispose() {
        this.onDidChangeEventEmitter.dispose();
    }
    get onDidChange() {
        return this.onDidChangeEventEmitter.event;
    }
    onChangeActiveEditor(editor) {
        if (!editor) {
            return;
        }
        const fileName = path.basename(editor.document.fileName);
        const schemaUrls = this.schemaMap[fileName];
        if (!schemaUrls) {
            return;
        }
        this.trace.log(Tracing_1.TraceLevel.DEBUG, `activating editor ${editor.document.fileName}`);
        this.requestedSchemas.clear();
        this.fireSchemaUrls(schemaUrls);
    }
    fireSchemaUrls(schemas) {
        for (const schema of schemas) {
            if (!this.requestedSchemas.has(schema)) {
                this.requestedSchemas.add(schema);
                this.onDidChangeEventEmitter.fire(vscode.Uri.parse(schema));
            }
        }
    }
    provideTextDocumentContent(uri, token) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const start = Date.now();
            const schemaFileName = uri.path.replace(/\//g, '');
            let schemaFileContent;
            try {
                const activeEditorFile = (_b = (_a = vscode.window.activeTextEditor) === null || _a === void 0 ? void 0 : _a.document) === null || _b === void 0 ? void 0 : _b.fileName;
                if (activeEditorFile) {
                    if (token.isCancellationRequested) {
                        return '';
                    }
                    const projectDir = path.dirname(activeEditorFile);
                    schemaFileContent = yield this.getCdsSchema(schemaFileName, projectDir);
                    if (schemaFileContent && this.requestedSchemas.has(uri.toString())) {
                        const newSchemas = Array.from(schemaFileContent.matchAll(/"\s*\$ref\s*"\s*:\s*"\s*(cdsJsonSchema:\/\/schemas\/[^"\s]+)\s*"/gi)).map(e => e[1]);
                        this.fireSchemaUrls(newSchemas);
                    }
                }
            }
            catch (err) {
                this.trace.log(Tracing_1.TraceLevel.ERROR, `error loading ${uri.toString()}: ${err.message}`);
            }
            finally {
                if (this.trace.getTraceLevel() === Tracing_1.TraceLevel.DEBUG) {
                    this.trace.log(Tracing_1.TraceLevel.DEBUG, `provided ${schemaFileName} in ${Date.now() - start}ms`);
                }
            }
            return schemaFileContent || '';
        });
    }
    safeReadFile(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const contentBuffer = yield vscode.workspace.fs.readFile(vscode.Uri.file(filePath));
                this.trace.log(Tracing_1.TraceLevel.DEBUG, `loaded file ${filePath} `);
                return contentBuffer.toString();
            }
            catch (err) {
                this.trace.log(Tracing_1.TraceLevel.ERROR, `could not open file ${filePath} `);
                return undefined;
            }
        });
    }
    getCdsSchema(schemaName, cwd) {
        var _a, _b, _c, _d, _e, _f, _g;
        return __awaiter(this, void 0, void 0, function* () {
            cwd = IS_WIN ? cwd.replace(/^\w:/, m => m.toLowerCase()) : cwd;
            if (!this.npmRootPath) {
                const result = yield execAsync('npm root -g', { timeout: 8000 });
                this.npmRootPath = (_a = result === null || result === void 0 ? void 0 : result.stdout) === null || _a === void 0 ? void 0 : _a.trim();
            }
            const libNames = ['@sap/cds-dk', '@sap/cds'];
            for (const libName of libNames) {
                try {
                    const cdsLibPath = require.resolve(libName, { paths: [cwd, this.npmRootPath] });
                    const cdsLib = require(cdsLibPath);
                    if (typeof ((_b = cdsLib.schema) === null || _b === void 0 ? void 0 : _b.overlay4) === 'function') {
                        this.trace.log(Tracing_1.TraceLevel.DEBUG, `loading schema '${schemaName}' using 'overlay4' in lib '${cdsLibPath}' ${cdsLib.version}`);
                        const content = yield cdsLib.schema.overlay4(schemaName, cwd);
                        return JSON.stringify(content);
                    }
                    if (typeof ((_c = cdsLib.schema) === null || _c === void 0 ? void 0 : _c.default4) === 'function') {
                        this.trace.log(Tracing_1.TraceLevel.DEBUG, `loading schema '${schemaName}' using 'default4' in lib '${cdsLibPath}' ${cdsLib.version}`);
                        const content = yield cdsLib.schema.default4(schemaName, cwd);
                        return JSON.stringify(content);
                    }
                    this.trace.log(Tracing_1.TraceLevel.DEBUG, `loading schema '${schemaName}' using 'cds.env' in lib '${cdsLibPath}' ${cdsLib.version}`);
                    if ((_e = (_d = cdsLib.env) === null || _d === void 0 ? void 0 : _d.schemas) === null || _e === void 0 ? void 0 : _e[schemaName]) {
                        const fileUrl = vscode.Uri.file((_g = (_f = cdsLib.env) === null || _f === void 0 ? void 0 : _f.schemas) === null || _g === void 0 ? void 0 : _g[schemaName]);
                        const contentBuffer = yield vscode.workspace.fs.readFile(fileUrl);
                        return contentBuffer.toString();
                    }
                    throw new Error('cds.env.schemas entry not found');
                }
                catch (err) {
                    if (err.code === 'MODULE_NOT_FOUND') {
                        this.trace.log(Tracing_1.TraceLevel.DEBUG, `Error: cannot find module ${libName}`);
                    }
                    else {
                        this.trace.log(Tracing_1.TraceLevel.DEBUG, `Error: loading schema ${schemaName} from ${libName} failed: ${err.message}`);
                    }
                }
            }
            return this.safeReadFile(path.join(ExtensionUtil_1.extensionUtil.getExtension().extensionPath, 'schemas', schemaName));
        });
    }
    setSchemaMap() {
        var _a, _b;
        const config = ExtensionUtil_1.extensionUtil.getExtension().packageJSON;
        (_b = (_a = config === null || config === void 0 ? void 0 : config.contributes) === null || _a === void 0 ? void 0 : _a.jsonValidation) === null || _b === void 0 ? void 0 : _b.forEach((element) => {
            var _a;
            if (element.fileMatch && ((_a = element.url) === null || _a === void 0 ? void 0 : _a.startsWith(CDS_JSON_SCHEMA))) {
                if (Array.isArray(element.fileMatch)) {
                    element.fileMatch.forEach((match) => {
                        this.schemaMap[match] = this.schemaMap[match] || new Set();
                        this.schemaMap[match].add(element.url);
                    });
                }
                else {
                    this.schemaMap[element.fileMatch] = this.schemaMap[element.fileMatch] || new Set();
                    this.schemaMap[element.fileMatch].add(element.url);
                }
            }
        });
    }
}
exports.DynamicJSONSchemaProvider = DynamicJSONSchemaProvider;
//# sourceMappingURL=DynamicJSONSchemaProvider.js.map