"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cmd = exports.MagicCommands = void 0;
const ExtendJsonCommand_1 = require("./ExtendJsonCommand");
const QuickRefCommand_1 = require("./QuickRefCommand");
const ResetCommand_1 = require("./ResetCommand");
const SystemInfoCommand_1 = require("./SystemInfoCommand");
const WriteFileCommand_1 = require("./WriteFileCommand");
exports.MagicCommands = [
    ExtendJsonCommand_1.ExtendJsonCommand,
    QuickRefCommand_1.QuickRefCommand,
    ResetCommand_1.ResetCommand,
    SystemInfoCommand_1.SystemInfoCommand,
    WriteFileCommand_1.WriteFileCommand
];
const cmd = (s) => `%${s.meta.expectsPayload ? '%' : ''}${s.meta.name}`;
exports.cmd = cmd;
//# sourceMappingURL=MagicCommands.js.map