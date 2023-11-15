"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Trace = exports.toConfigLevel = exports.toTraceLevel = exports.ClientTraceComponents = exports.TraceLevel = void 0;
const vscode = require("vscode");
const Output_1 = require("./Output");
const COMPONENT_WIDTH = 10;
var TraceLevel;
(function (TraceLevel) {
    TraceLevel[TraceLevel["invalid"] = 0] = "invalid";
    TraceLevel[TraceLevel["OFF"] = 1] = "OFF";
    TraceLevel[TraceLevel["INFRASTRUCTURE"] = 2] = "INFRASTRUCTURE";
    TraceLevel[TraceLevel["ERROR"] = 3] = "ERROR";
    TraceLevel[TraceLevel["WARNING"] = 4] = "WARNING";
    TraceLevel[TraceLevel["INFO"] = 5] = "INFO";
    TraceLevel[TraceLevel["VERBOSE"] = 6] = "VERBOSE";
    TraceLevel[TraceLevel["DEBUG"] = 7] = "DEBUG";
})(TraceLevel || (exports.TraceLevel = TraceLevel = {}));
var ClientTraceComponents;
(function (ClientTraceComponents) {
    ClientTraceComponents["CONFIG_UI"] = "ConfigUI";
    ClientTraceComponents["INSTALL_DK"] = "Install cds-dk";
    ClientTraceComponents["TELEMETRY"] = "Telemetry";
    ClientTraceComponents["TRANSLATION"] = "TranslationPostProcess";
    ClientTraceComponents["WELCOME_PAGE"] = "WelcomePage";
    ClientTraceComponents["FILE_WATCH"] = "FileSystemWatch";
    ClientTraceComponents["FILE_PREVIEW"] = "FilePreview";
    ClientTraceComponents["CAP_NOTEBOOK"] = "CapNotebook";
    ClientTraceComponents["NB_FILE_URI"] = "Notebook File Uri";
    ClientTraceComponents["DYNAMIC_SCHEMA"] = "DynamicJsonSchema";
    ClientTraceComponents["DYNAMIC_LSP"] = "DynamicLsp";
})(ClientTraceComponents || (exports.ClientTraceComponents = ClientTraceComponents = {}));
function toTraceLevel(configLevel) {
    switch (configLevel) {
        case 'off': return TraceLevel.OFF;
        case 'error': return TraceLevel.ERROR;
        case 'warning': return TraceLevel.WARNING;
        case 'info': return TraceLevel.INFO;
        case 'verbose': return TraceLevel.VERBOSE;
        case 'debug': return TraceLevel.DEBUG;
        default: return TraceLevel.OFF;
    }
}
exports.toTraceLevel = toTraceLevel;
function toConfigLevel(traceLevel) {
    switch (traceLevel) {
        case TraceLevel.OFF: return 'off';
        case TraceLevel.ERROR: return 'error';
        case TraceLevel.WARNING: return 'warning';
        case TraceLevel.INFO: return 'info';
        case TraceLevel.VERBOSE: return 'verbose';
        case TraceLevel.DEBUG: return 'debug';
        default: return 'off';
    }
}
exports.toConfigLevel = toConfigLevel;
class Trace {
    constructor(componentName, outputChannel = Output_1.outputChannel) {
        this.componentName = componentName;
        this.outputChannel = outputChannel;
        this.traceComponentName = componentName.toLowerCase();
        this.outputComponentText = `(${componentName})`.padEnd(COMPONENT_WIDTH);
    }
    getTraceLevel() {
        let traceLevel = TraceLevel.OFF;
        try {
            const cdsConfig = vscode.workspace.getConfiguration('cds');
            if (cdsConfig && cdsConfig.trace && cdsConfig.trace.components) {
                const components = cdsConfig.trace.components;
                components.find((component) => {
                    if (!component.name) {
                        this.forceLog(`Missing name attribute for configuration entry: ${JSON.stringify(component)}`);
                        return false;
                    }
                    if (component.name.toLowerCase() === this.traceComponentName) {
                        traceLevel = toTraceLevel(component.level);
                        return true;
                    }
                    if (component.name === '*') {
                        traceLevel = toTraceLevel(component.level);
                    }
                    return false;
                });
            }
        }
        catch (e) {
            this.forceLog(`Something went wrong while logging: ${e}.`);
        }
        return traceLevel;
    }
    forceLog(message) {
        if (message) {
            const timeStamp = new Date().toLocaleTimeString();
            this.outputChannel.appendLine(`[${timeStamp}] ${this.outputComponentText} ${message}`.trim());
        }
    }
    log(level, message) {
        if (message) {
            if (level <= this.getTraceLevel()) {
                const timeStamp = new Date().toLocaleTimeString();
                this.outputChannel.appendLine(`[${timeStamp}] ${this.outputComponentText} ${message}`.trim());
            }
        }
    }
}
exports.Trace = Trace;
//# sourceMappingURL=Tracing.js.map