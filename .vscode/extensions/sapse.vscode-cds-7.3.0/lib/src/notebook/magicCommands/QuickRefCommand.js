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
exports.QuickRefCommand = void 0;
const MagicCommand_1 = require("./MagicCommand");
const MagicCommands_1 = require("./MagicCommands");
let QuickRefCommand = class QuickRefCommand extends MagicCommand_1.MagicCommand {
    _execute(context, options = '', payload) {
        return __awaiter(this, void 0, void 0, function* () {
            let output = '';
            output += '<table><thead><tr><td>Command</td><td>Arguments</td><td>Description</td><td>Examples</td></tr></thead>';
            output += MagicCommands_1.MagicCommands.map(s => `
<tr>
  <td><code>${(0, MagicCommands_1.cmd)(s)}</code></td>
  <td><code>${(0, MagicCommand_1.htmlEscape)(s.meta.optionSyntax)}</code></td>
  <td><i>${(0, MagicCommand_1.htmlEscape)(s.meta.description)}</i></td>
  <td>CAP Sample Notebook <b>Magics</b>, section <i>${(0, MagicCommands_1.cmd)(s)}</i></td>
</tr>`).join('');
            return { content: output };
        });
    }
};
exports.QuickRefCommand = QuickRefCommand;
QuickRefCommand.meta = {
    name: 'quickref',
    description: 'Lists and describes all magic commands',
    optionSyntax: '',
    expectsPayload: false
};
exports.QuickRefCommand = QuickRefCommand = __decorate([
    (0, MagicCommand_1.staticImplements)()
], QuickRefCommand);
//# sourceMappingURL=QuickRefCommand.js.map