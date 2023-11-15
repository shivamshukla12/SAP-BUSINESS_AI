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
exports.htmlEscape = exports.MagicCommand = exports.staticImplements = void 0;
function staticImplements() {
    return (constructor) => { constructor; };
}
exports.staticImplements = staticImplements;
class MagicCommand {
    constructor(controller) {
        this.controller = controller;
    }
    execute(execution, options, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { controller } = this;
            return this._execute({
                execution,
                getCurrentCwd: () => controller.getCurrentCwd(execution.cell),
                getDefaultCwd: () => controller.getDefaultCwd(execution.cell),
                resetNotebookCwd: () => controller.resetNotebookCwd(execution.cell.notebook),
                get env() { return controller.envFor(execution.cell); },
                get childProcessOptions() { return controller.childProcessOptions; }
            }, options, payload);
        });
    }
}
exports.MagicCommand = MagicCommand;
function htmlEscape(s) {
    return s
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}
exports.htmlEscape = htmlEscape;
//# sourceMappingURL=MagicCommand.js.map