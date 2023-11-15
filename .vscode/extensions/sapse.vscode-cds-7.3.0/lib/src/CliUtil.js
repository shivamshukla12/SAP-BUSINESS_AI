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
exports.CliUtil = exports.RunError = exports.CancelError = void 0;
const cp = require("child_process");
const fs = require("fs");
const os = require("os");
const readline = require("readline");
const Tracing_1 = require("./Tracing");
const IS_WIN = (os.platform() === 'win32');
var CliPromiseIndex;
(function (CliPromiseIndex) {
    CliPromiseIndex[CliPromiseIndex["stdout"] = 0] = "stdout";
    CliPromiseIndex[CliPromiseIndex["stderr"] = 1] = "stderr";
    CliPromiseIndex[CliPromiseIndex["exec"] = 2] = "exec";
})(CliPromiseIndex || (CliPromiseIndex = {}));
class CancelError extends Error {
    constructor() {
        super('Cancelled');
    }
}
exports.CancelError = CancelError;
class RunError extends Error {
    constructor(message, cmd, code = 0, cliResult) {
        super(message);
        this.cmd = cmd;
        this.code = code;
        this.cliResult = cliResult;
    }
}
exports.RunError = RunError;
class CliUtil {
    static collectLines(inStream) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const lines = [];
                const reader = readline.createInterface({ input: inStream });
                reader.on('error', err => {
                    reader.close();
                    reject(err);
                });
                reader.on('line', line => {
                    lines.push(line);
                });
                reader.on('close', () => {
                    resolve(lines);
                });
            });
        });
    }
    static run(cmd, args, options = {}, trace, cancelCB) {
        return __awaiter(this, void 0, void 0, function* () {
            const log = (message) => {
                trace === null || trace === void 0 ? void 0 : trace.log(Tracing_1.TraceLevel.VERBOSE, ' ' + message);
            };
            const stdoutFile = options.stdoutFile;
            delete options.stdoutFile;
            options.env = options.env || process.env;
            const cmdLine = `${cmd} ${args.join(' ')}`;
            log(cmdLine);
            options.shell = IS_WIN;
            const childProcess = cp.spawn(cmd, args, options);
            if (cancelCB) {
                cancelCB(() => {
                    log(`cancelling ${cmdLine}`);
                    childProcess.kill('SIGKILL');
                });
            }
            const promises = [];
            if (stdoutFile) {
                promises.push(new Promise((resolve, reject) => {
                    const outFileWs = fs.createWriteStream(stdoutFile, { flags: 'w' });
                    outFileWs.on('close', resolve);
                    outFileWs.on('error', reject);
                    childProcess.stdout.pipe(outFileWs);
                }));
            }
            else {
                promises.push(this.collectLines(childProcess.stdout));
            }
            promises.push(this.collectLines(childProcess.stderr));
            promises.push(new Promise((resolve, reject) => {
                childProcess.on('error', err => {
                    reject(err);
                });
                childProcess.on('close', (code, signal) => {
                    if (signal === 'SIGKILL') {
                        reject(new CancelError());
                    }
                    else if (code) {
                        const err = new Error();
                        err.cmdCode = code;
                        reject(err);
                    }
                    else {
                        resolve();
                    }
                });
            }));
            const cliResults = yield Promise.allSettled(promises);
            const result = {
                stdout: cliResults[CliPromiseIndex.stdout].value ? cliResults[CliPromiseIndex.stdout].value.join(os.EOL) : '',
                stderr: cliResults[CliPromiseIndex.stderr].value ? cliResults[CliPromiseIndex.stderr].value.join(os.EOL) : '',
                combinedOut: ''
            };
            result.combinedOut = result.stdout + os.EOL + result.stderr;
            if (cliResults[CliPromiseIndex.exec].status === 'rejected') {
                if (cliResults[CliPromiseIndex.exec].reason.cmdCode) {
                    let error;
                    if (IS_WIN && result.stderr.match(/not recognized/i) && result.stderr.includes(cmd)) {
                        error = new RunError(`Failed: ${cmdLine}`, cmdLine, 'ENOENT', result);
                    }
                    else {
                        error = new RunError(`Failed: ${cmdLine}`, cmdLine, cliResults[2].reason.cmdCode, result);
                    }
                    throw error;
                }
                else {
                    throw cliResults[CliPromiseIndex.exec].reason;
                }
            }
            return result;
        });
    }
}
exports.CliUtil = CliUtil;
//# sourceMappingURL=CliUtil.js.map