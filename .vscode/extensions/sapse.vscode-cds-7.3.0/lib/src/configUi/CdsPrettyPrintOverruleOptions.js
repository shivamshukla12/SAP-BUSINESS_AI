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
exports.CdsPrettyPrintOverruleOptions = void 0;
const fs = require("node:fs");
const util = require("node:util");
const Tracing_1 = require("../Tracing");
class CdsPrettyPrintOverruleOptions {
    constructor(languageClient, trace) {
        this.languageClient = languageClient;
        this.trace = trace;
        this.originalOptionData = {};
        this.optionData = {};
    }
    set configFile(filepath) {
        this._currentConfigFilePath = filepath;
        this.readOriginalFileSettings();
    }
    onOptionChanged(optionAndValue) {
        const simpleName = optionAndValue[0];
        this.optionData[simpleName] = optionAndValue[1];
        this.persistSettings();
    }
    readOriginalFileSettings() {
        try {
            if (!fs.existsSync(this._currentConfigFilePath))
                return;
            this.originalOptionData = {};
            this.optionData = {};
            const optionsRaw = fs.readFileSync(this._currentConfigFilePath, 'utf8');
            const options = JSON.parse(optionsRaw);
            Object.keys(options).forEach((optionName) => {
                const value = options[optionName];
                this.originalOptionData[optionName] = value;
                this.optionData[optionName] = value;
            });
        }
        catch (e) {
            this.trace.log(Tracing_1.TraceLevel.ERROR, e.stack ? e.stack : util.inspect(e));
        }
    }
    persistSettings() {
        const merged = Object.assign({}, this.originalOptionData);
        const schema = this.getSchema();
        Object.entries(this.optionData).forEach(([name, value]) => {
            const optionName = name;
            if (merged[optionName] !== undefined || value !== schema[name].default) {
                merged[optionName] = value;
            }
        });
        this.persist(merged);
    }
    persist(options) {
        if (this._currentConfigFilePath) {
            fs.writeFileSync(this._currentConfigFilePath, JSON.stringify(options, null, 2));
        }
    }
    getEffectiveFormattingOptions() {
        const schema = this.getSchema();
        const options = {};
        for (const [option, value] of Object.entries(schema)) {
            options[option] = value.default;
        }
        Object.keys(this.optionData).forEach((key) => options[key] = this.optionData[key]);
        return options;
    }
    getSchema() {
        if (!this._schema) {
            const lspPath = require.resolve('@sap/cds-lsp/schemas/cds-prettier.json');
            const schemaContent = fs.readFileSync(lspPath, 'utf8');
            this._schema = JSON.parse(schemaContent).properties;
        }
        return this._schema;
    }
    beautify(content) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = {
                command: 'format',
                content,
                formattingOptions: this.getEffectiveFormattingOptions()
            };
            const x = yield this.languageClient.sendRequest('cds/formatContent', params);
            return x;
        });
    }
}
exports.CdsPrettyPrintOverruleOptions = CdsPrettyPrintOverruleOptions;
//# sourceMappingURL=CdsPrettyPrintOverruleOptions.js.map