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
exports.SystemInfoCommand = void 0;
const child_process = require("child_process");
const os = require("os");
const util = require("util");
const MagicCommand_1 = require("./MagicCommand");
const execAsync = util.promisify(child_process.exec);
let SystemInfoCommand = class SystemInfoCommand extends MagicCommand_1.MagicCommand {
    _execute(context, options = '', payload) {
        return __awaiter(this, void 0, void 0, function* () {
            let output = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') + ' UTC<br>';
            output += `<br><b>os.platform</b><br>${os.platform().replace(/\r\n|\n|\r/g, '<br>')}<br>`;
            output += `<br><b>default shell</b><br>${context.childProcessOptions.shell}<br>`;
            const cmds = [
                'node -v',
                'npm -v',
                'java -version',
                'mvn -v',
                'cf -v',
                'cds v',
                'code -v',
                'kubectl version --short --client=true'
            ];
            const promises = cmds.map((cmd) => __awaiter(this, void 0, void 0, function* () { return this.infoFor(cmd, context); }));
            for (const promise of promises) {
                output += '<br>' + (yield promise);
            }
            return { content: output };
        });
    }
    infoFor(cmd, context) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = `<b>${cmd}</b><br>`;
            try {
                const subProcessOut = yield execAsync(cmd, Object.assign(Object.assign({}, context.childProcessOptions), { cwd: os.tmpdir() }));
                result += (subProcessOut.stdout || subProcessOut.stderr || '');
            }
            catch (err) {
                result += (err.stdout ? err.stdout + '\n' : '') + err.stderr;
            }
            result = result.replace(/\r?\n/g, '<br>').replace(/\x1b\[\d*m/g, '');
            return result;
        });
    }
};
exports.SystemInfoCommand = SystemInfoCommand;
SystemInfoCommand.meta = {
    name: 'systeminfo',
    description: 'Shows the system info',
    optionSyntax: '',
    expectsPayload: false
};
exports.SystemInfoCommand = SystemInfoCommand = __decorate([
    (0, MagicCommand_1.staticImplements)()
], SystemInfoCommand);
//# sourceMappingURL=SystemInfoCommand.js.map