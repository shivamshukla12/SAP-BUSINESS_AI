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
exports.ResetCommand = void 0;
const MagicCommand_1 = require("./MagicCommand");
let ResetCommand = class ResetCommand extends MagicCommand_1.MagicCommand {
    _execute(context, options = '', payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const regex = /(["'])(?<component>[^\1]+)\1/;
            const match = regex.exec(options);
            const component = match === null || match === void 0 ? void 0 : match.groups.component;
            if (!component) {
                throw new Error('Reset component not found.');
            }
            else if (component !== 'dhist') {
                throw new Error(`The component '${component}' is unknown.`);
            }
            else {
                yield context.resetNotebookCwd();
                const cwd = context.getCurrentCwd();
                return { content: `Current working directory for all shell cells is now '${cwd}'.` };
            }
        });
    }
};
exports.ResetCommand = ResetCommand;
ResetCommand.meta = {
    name: 'reset',
    description: 'Resets the given component',
    optionSyntax: '"<component>"',
    expectsPayload: false
};
exports.ResetCommand = ResetCommand = __decorate([
    (0, MagicCommand_1.staticImplements)()
], ResetCommand);
//# sourceMappingURL=ResetCommand.js.map