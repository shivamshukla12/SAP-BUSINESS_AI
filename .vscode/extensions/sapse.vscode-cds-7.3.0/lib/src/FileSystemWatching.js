"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileSystemWatching = void 0;
const util = require("util");
const vscode = require("vscode");
const Output_1 = require("./Output");
const Tracing_1 = require("./Tracing");
class FileSystemWatching {
    constructor() {
        this.trace = new Tracing_1.Trace(Tracing_1.ClientTraceComponents.FILE_WATCH, Output_1.technicalOutput);
    }
    ensureNodeModulesWatching(enable) {
        try {
            const workspaceConfiguration = vscode.workspace.getConfiguration();
            const effectiveValue = workspaceConfiguration.get('files.watcherExclude');
            const allValues = workspaceConfiguration.inspect('files.watcherExclude');
            const persist = (value, scope, target) => {
                const config = vscode.workspace.getConfiguration(undefined, scope);
                config.update('files.watcherExclude', value, target).then(() => this.trace.log(Tracing_1.TraceLevel.INFO, `Updated files.watcherExclude with ${util.inspect(value)}`), (e) => this.trace.log(Tracing_1.TraceLevel.WARNING, `Could not update files.watcherExclude with ${util.inspect(value)}: ${e}`));
            };
            const change = (obj, prop, val) => {
                if (obj[prop] !== val) {
                    obj[prop] = val;
                    return true;
                }
                return false;
            };
            const removeOverrides = (value) => {
                let changed = false;
                for (const [globPath,] of Object.entries(value)) {
                    if (globPath.match(/\*\/node_modules\//)) {
                        changed = true;
                        delete value[globPath];
                    }
                }
                return changed;
            };
            const applyOverrides = (value) => {
                let changed = false;
                if (vscode.workspace.workspaceFolders.length === 1) {
                    for (const [globPath, isEnabled] of Object.entries(effectiveValue)) {
                        if (isEnabled && globPath.match(/\*\/node_modules\/\*/)) {
                            changed = change(value, globPath, false) || changed;
                            changed = change(value, '**/node_modules/[!@]*/**/*', true) || changed;
                        }
                    }
                }
                return changed;
            };
            if (!enable) {
                let value = allValues.workspaceFolderValue || {};
                if (removeOverrides(value)) {
                    persist(value, vscode.workspace.workspaceFolders[0], vscode.ConfigurationTarget.WorkspaceFolder);
                }
                value = allValues.workspaceValue || {};
                if (removeOverrides(value)) {
                    persist(value, undefined, vscode.ConfigurationTarget.Workspace);
                }
            }
            else {
                const value = allValues.workspaceFolderValue || {};
                if (applyOverrides(value)) {
                    persist(value, vscode.workspace.workspaceFolders[0], vscode.ConfigurationTarget.WorkspaceFolder);
                }
            }
        }
        catch (e) {
            this.trace.log(Tracing_1.TraceLevel.ERROR, `Reconfiguring files.watcherExclude failed: ${e}`);
        }
    }
}
exports.FileSystemWatching = FileSystemWatching;
//# sourceMappingURL=FileSystemWatching.js.map