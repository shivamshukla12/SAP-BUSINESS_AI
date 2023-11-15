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
exports.CapNotebookController = void 0;
const cp = require("child_process");
const fs_1 = require("fs");
const os = require("os");
const path = require("path");
const kill = require("tree-kill");
const vscode = require("vscode");
const ExtensionUtil_1 = require("../ExtensionUtil");
const EnvVarHandler_1 = require("./EnvVarHandler");
const MagicCommandDispatcher_1 = require("./magicCommands/MagicCommandDispatcher");
const MagicCommands_1 = require("./magicCommands/MagicCommands");
const IS_WIN = os.platform() === 'win32';
const TERMINAL_ICON = new vscode.ThemeIcon('cloud-download');
const CWD_BEGIN_TOKEN = '--cwd_begin--';
const CWD_END_TOKEN = '--cwd_end--';
const CWD_REGEX = new RegExp(`${CWD_BEGIN_TOKEN}(.*)${CWD_END_TOKEN}`, 's');
const CWD_START_REGEX = new RegExp(`${CWD_BEGIN_TOKEN}(.*)`, 's');
const MAGIC_COMMAND_DECORATIONTYPE = vscode.window.createTextEditorDecorationType({
    cursor: 'help',
    backgroundColor: 'var(--vscode-editor-symbolHighlightBackground)'
});
const CELL_TYPES_VIEWABLE = [
    'csv (semicolon)',
    'html',
    'json'
];
const DEFAULT_CELL_TYPE = 'shell';
const CELL_TYPES_RUNNABLE = [
    DEFAULT_CELL_TYPE,
    'cds',
    'cds server',
    'java',
    'javascript',
    'markdown',
    'terminal'
];
const CELL_EXECUTION_TIMEOUT = 60000;
class FireNotebookCellStatusBarItemProvider {
    constructor(controller) {
        this.controller = controller;
        this.onDidChangeCellStatusBarItemsEventEmitter = new vscode.EventEmitter();
        this.onDidChangeCellStatusBarItems = this.onDidChangeCellStatusBarItemsEventEmitter.event;
    }
    fire() {
        this.onDidChangeCellStatusBarItemsEventEmitter.fire();
    }
    provideCellStatusBarItems(cell, _token) {
        const items = [];
        if (cell.kind === vscode.NotebookCellKind.Code) {
            const relativePath = path.relative(this.controller.getDefaultCwd(cell), this.controller.getCurrentCwd(cell));
            const printFileName = '.' + path.sep + (relativePath ? relativePath + path.sep : '');
            const item = new vscode.NotebookCellStatusBarItem(printFileName, vscode.NotebookCellStatusBarAlignment.Right);
            item.tooltip = this.controller.getCurrentCwd(cell);
            items.push(item);
            this.controller.setDecoration(cell);
        }
        return items;
    }
}
class CapNotebookController {
    constructor(context, _trace) {
        this.context = context;
        this._trace = _trace;
        this.controllerId = 'cap-notebook-controller';
        this.notebookType = 'cap-notebook';
        this.label = 'CAP Notebook';
        this.supportedLanguages = CELL_TYPES_RUNNABLE.concat(CELL_TYPES_VIEWABLE);
        this.executionOrder = 0;
        this.magicCommandDispatcher = new MagicCommandDispatcher_1.MagicCommandDispatcher(this);
        this.envVarHandler = new EnvVarHandler_1.EnvVarHandler(this);
        this.controller = vscode.notebooks.createNotebookController(this.controllerId, this.notebookType, this.label);
        this.controller.supportedLanguages = this.supportedLanguages;
        this.controller.supportsExecutionOrder = true;
        this.controller.executeHandler = this.executeHandler.bind(this);
        this.cellStatusProvider = new FireNotebookCellStatusBarItemProvider(this);
        context.subscriptions.push(vscode.notebooks.registerNotebookCellStatusBarItemProvider('cap-notebook', this.cellStatusProvider));
        context.subscriptions.push(vscode.workspace.onDidCloseNotebookDocument((notebook) => {
            const cells = notebook.getCells();
            for (const cell of cells) {
                if (cell.metadata.pid) {
                    kill(cell.metadata.pid, 'SIGKILL');
                }
            }
        }));
        context.subscriptions.push(vscode.commands.registerCommand('cds.resetCapNotebookCwd', (e) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            let notebook;
            if ((_a = e === null || e === void 0 ? void 0 : e.notebookEditor) === null || _a === void 0 ? void 0 : _a.notebookUri) {
                notebook = yield vscode.workspace.openNotebookDocument(e.notebookEditor.notebookUri);
            }
            else {
                notebook = (_b = vscode.window.activeNotebookEditor) === null || _b === void 0 ? void 0 : _b.notebook;
            }
            if (notebook) {
                yield this.resetNotebookCwd(notebook);
            }
        })));
        context.subscriptions.push(vscode.workspace.onDidChangeNotebookDocument((e) => __awaiter(this, void 0, void 0, function* () {
            var _c, _d;
            (_c = e === null || e === void 0 ? void 0 : e.cellChanges) === null || _c === void 0 ? void 0 : _c.forEach(cellChange => {
                this.setDecoration(cellChange.cell);
            });
            if (e === null || e === void 0 ? void 0 : e.contentChanges) {
                for (const change of e.contentChanges) {
                    for (const cell of change.removedCells) {
                        if (cell.metadata.pid) {
                            kill(cell.metadata.pid, 'SIGKILL');
                        }
                    }
                    let cwdChanged = false;
                    for (const cell of change.addedCells) {
                        const preMetadata = (_d = cell.notebook.cellAt(cell.index - 1)) === null || _d === void 0 ? void 0 : _d.metadata;
                        if (preMetadata) {
                            const cwd = preMetadata.newCwd || preMetadata.cwd;
                            if (cwd && cell.metadata.cwd !== cwd) {
                                cwdChanged = true;
                                yield this.setMetadata(cell, { cwd });
                            }
                        }
                        if (cwdChanged) {
                            this.cellStatusProvider.fire();
                        }
                    }
                }
            }
        })));
    }
    getMagicCommandsList() {
        const magicCommandsList = [];
        MagicCommands_1.MagicCommands.forEach(magic => {
            const magicCmdPrefix = magic.meta.expectsPayload ? '%%' : '%';
            magicCommandsList.push({
                command: `${magicCmdPrefix}${magic.meta.name}`,
                option: magic.meta.optionSyntax
            });
        });
        return magicCommandsList;
    }
    envFor(cell) {
        var _a;
        return ((_a = cell.notebook.metadata) === null || _a === void 0 ? void 0 : _a.env) || {};
    }
    get childProcessOptions() {
        return this.options;
    }
    dispose() {
        this.controller.dispose();
    }
    resetNotebookCwd(notebook) {
        return __awaiter(this, void 0, void 0, function* () {
            const cells = notebook.getCells();
            for (const cell of cells) {
                yield this.setMetadata(cell, { cwd: null, newCwd: null });
            }
            this.cellStatusProvider.fire();
        });
    }
    isRunAll(cells, notebook) {
        const codeCellCount = notebook.getCells().filter(cell => cell.kind === 2).length;
        return cells.length === codeCellCount;
    }
    executeHandler(cells, notebook, controller) {
        return __awaiter(this, void 0, void 0, function* () {
            const cdsConfig = vscode.workspace.getConfiguration(ExtensionUtil_1.extensionUtil.CONFIG_NAME);
            if (cdsConfig.resetNotebookCwdOnRunAll) {
                if (this.isRunAll(cells, notebook)) {
                    yield this.resetNotebookCwd(notebook);
                }
            }
            for (const cell of cells) {
                yield this.executeCell(controller, cell, cells);
            }
        });
    }
    getNotebookId(fileName) {
        return fileName ? `${path.basename(fileName)} - ${path.dirname(fileName)}` : undefined;
    }
    getDefaultCwd(cell) {
        return path.dirname(cell.document.fileName);
    }
    getCurrentCwd(cell) {
        return cell.metadata.cwd || this.getDefaultCwd(cell);
    }
    splitLines(content) {
        return content.split(/\r?\n/g);
    }
    getMagicComments(content, languageId = 'shell') {
        var _a;
        const lines = this.splitLines(content);
        const state = { isInBlockComment: false, isAwaitingPayload: false };
        const { isBlockCommentStart, isBlockCommentEnd, getMagic } = this.getMagicCommentSelectors(languageId);
        let matches = [];
        const payload = [];
        let index = 0;
        lines.forEach((line, l) => {
            if (state.isAwaitingPayload) {
                payload.push(line);
            }
            else {
                if (isBlockCommentStart(line)) {
                    state.isInBlockComment = true;
                }
                else if (state.isInBlockComment) {
                    if (isBlockCommentEnd(line)) {
                        state.isAwaitingPayload = true;
                    }
                    else {
                        const m = getMagic(line);
                        matches = this.updateMagicMatches(matches, m, l, index);
                    }
                }
                else {
                    const m = getMagic(line);
                    matches = this.updateMagicMatches(matches, m, l, index);
                    state.isAwaitingPayload = this.updateMagicPayloadState(m);
                }
            }
            index = this.updateContentIndex(index, line);
        });
        if (state.isAwaitingPayload && ((_a = matches[0]) === null || _a === void 0 ? void 0 : _a.magic)) {
            matches[0].magic.payload = payload.join(os.EOL);
        }
        return matches;
    }
    getMagicCommentSelectors(languageId) {
        const MAGIC_COMMENTS = {
            'shell': {
                lineComment: '#'
            },
            'cds': {
                lineComment: '//',
                blockComment: ['/*', '*/']
            },
            'cds server': {
                lineComment: '#'
            },
            'json': {
                lineComment: '//',
                blockComment: ['/*', '*/']
            },
            'javascript': {
                lineComment: '//',
                blockComment: ['/*', '*/']
            }
        };
        const allowsComment = Boolean(MAGIC_COMMENTS[languageId]);
        return {
            isBlockCommentStart: (s) => { var _a, _b; return allowsComment && ((_a = MAGIC_COMMENTS[languageId]) === null || _a === void 0 ? void 0 : _a.blockComment) && s.trim().startsWith((_b = MAGIC_COMMENTS[languageId]) === null || _b === void 0 ? void 0 : _b.blockComment[0]); },
            isBlockCommentEnd: (s) => { var _a, _b; return allowsComment && ((_a = MAGIC_COMMENTS[languageId]) === null || _a === void 0 ? void 0 : _a.blockComment) && s.trim().startsWith((_b = MAGIC_COMMENTS[languageId]) === null || _b === void 0 ? void 0 : _b.blockComment[1]); },
            isLineComment: (s) => { var _a; return allowsComment && s.trim().startsWith((_a = MAGIC_COMMENTS[languageId]) === null || _a === void 0 ? void 0 : _a.lineComment); },
            getMagic: (s) => this.getMagicCommandsList().map((magic) => {
                var _a, _b, _c, _d;
                const option = magic.option ? '\\s+(?<options>.*)?' : '';
                const regex = new RegExp(`^(?<offset>.*\\s)?(?<command>${magic.command})${option}`, 'g');
                const match = regex.exec(s);
                if (match) {
                    return {
                        line: 0,
                        offset: (_b = (_a = match === null || match === void 0 ? void 0 : match.groups) === null || _a === void 0 ? void 0 : _a.offset) === null || _b === void 0 ? void 0 : _b.length,
                        magic: {
                            command: ((_c = match === null || match === void 0 ? void 0 : match.groups) === null || _c === void 0 ? void 0 : _c.command) || '',
                            options: ((_d = match === null || match === void 0 ? void 0 : match.groups) === null || _d === void 0 ? void 0 : _d.options) || '',
                            payload: ''
                        }
                    };
                }
                else {
                    return undefined;
                }
            }).filter((item) => item)[0]
        };
    }
    updateMagicMatches(matches, m, l, index) {
        if (m) {
            m.index = index;
            m.line = l;
            matches.push(m);
        }
        return matches;
    }
    updateContentIndex(index, line) {
        if (line.length) {
            index += line.length;
        }
        index += os.EOL.length;
        return index;
    }
    updateMagicPayloadState(m) {
        var _a, _b;
        return ((_b = (_a = m === null || m === void 0 ? void 0 : m.magic) === null || _a === void 0 ? void 0 : _a.command) === null || _b === void 0 ? void 0 : _b.startsWith('%%')) ? true : false;
    }
    executeCell(controller, cell, cells, content) {
        return __awaiter(this, void 0, void 0, function* () {
            const lang = cell.document.languageId;
            content = content ? content : cell.document.getText();
            const execution = controller.createNotebookCellExecution(cell);
            execution.executionOrder = this.executionOrder + 1;
            execution.start(Date.now());
            try {
                void execution.replaceOutput([
                    new vscode.NotebookCellOutput([vscode.NotebookCellOutputItem.text('running... output will appear here')])
                ]);
                this.options = {
                    env: process.env,
                    shell: process.env.ComSpec || process.env.SHELL
                };
                const hasMagicCommands = !!content.split(os.EOL).find(line => (0, MagicCommandDispatcher_1.isMagicCommandLine)(line));
                if (!hasMagicCommands) {
                    const fillEnvVarsOutput = yield this.envVarHandler.fillEnvVars(content, execution.cell);
                    if (fillEnvVarsOutput) {
                        this.cellStatusProvider.fire();
                        yield execution.replaceOutput([
                            new vscode.NotebookCellOutput([
                                vscode.NotebookCellOutputItem.text(fillEnvVarsOutput, 'text/html')
                            ])
                        ]);
                        return execution.end(true, Date.now());
                    }
                }
                const hasRunCellMagic = hasMagicCommands
                    ? yield this.magicCommandDispatcher.process(execution)
                    : false;
                if (!hasRunCellMagic) {
                    switch (lang) {
                        case 'cds':
                            yield this.runCdsCell(content, execution);
                            break;
                        case 'cds server':
                            yield this.runCdsServerCell(content, execution);
                            break;
                        case 'java':
                            yield this.runJavaCell(content, execution);
                            break;
                        case 'javascript':
                            yield this.runNodeCell(content, execution);
                            break;
                        case 'shell':
                            yield this.runShellCell(content, execution);
                            break;
                        case 'terminal':
                            yield this.runTerminalCell(content, execution);
                            break;
                        default:
                            yield execution.replaceOutput([
                                new vscode.NotebookCellOutput([
                                    vscode.NotebookCellOutputItem.text(`Language "${lang}" is not supported.`)
                                ])
                            ]);
                    }
                }
                execution.end(true, Date.now());
            }
            catch (err) {
                if (err instanceof vscode.CancellationError) {
                    yield execution.replaceOutput([
                        new vscode.NotebookCellOutput([
                            vscode.NotebookCellOutputItem.text('Execution cancelled')
                        ])
                    ]);
                }
                else {
                    yield execution.replaceOutput([
                        new vscode.NotebookCellOutput([
                            vscode.NotebookCellOutputItem.stderr(err)
                        ])
                    ]);
                }
                execution.end(false, Date.now());
            }
        });
    }
    changeCwd(cell, cwd) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.setMetadata(cell, { newCwd: cwd });
            const cells = cell.notebook.getCells(new vscode.NotebookRange(cell.index + 1, cell.notebook.cellCount));
            let cwdChanged = false;
            for (const followingCell of cells) {
                if (followingCell.metadata.cwd !== cwd) {
                    cwdChanged = true;
                    yield this.setMetadata(followingCell, { cwd });
                }
            }
            if (cwdChanged) {
                this.cellStatusProvider.fire();
            }
        });
    }
    handleProcess(subProcess, execution, output = '', timeoutOptions, watchOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            let timerId = !timeoutOptions ? -1 : undefined;
            const startTimer = () => {
                if (timerId !== -1) {
                    clearTimeout(timerId);
                    timerId = setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                        timerId = -1;
                        const message = timeoutOptions.message
                            .replace(/{{\s*fileName\s*}}/g, path.basename(execution.cell.document.fileName))
                            .replace(/{{\s*cellNumber\s*}}/g, (execution.cell.index + 1) + '');
                        yield vscode.window.showWarningMessage(message);
                    }), timeoutOptions.timeout);
                    timerId.unref();
                }
            };
            const defaultCwd = this.getDefaultCwd(execution.cell);
            const processPromise = new Promise((resolve, reject) => {
                let cwd = '';
                let killed = false;
                let watched = false;
                if (!watchOptions) {
                    void execution.replaceOutput([
                        new vscode.NotebookCellOutput([
                            vscode.NotebookCellOutputItem.text(output)
                        ])
                    ]);
                    startTimer();
                }
                subProcess.stdout.on('data', (chunk) => __awaiter(this, void 0, void 0, function* () {
                    if (!watchOptions) {
                        startTimer();
                    }
                    if (watchOptions) {
                        chunk = chunk.toString();
                        const formatText = (text) => `\r${text.split(/(\r?\n)/g).join('\r')}\r`;
                        watchOptions.writeEmitter.fire(formatText(chunk));
                    }
                    output = output + chunk
                        .toString()
                        .replace(/\r/g, '')
                        .replace(/(^\s*'|'\s*$)/, '');
                    const pwd = CWD_REGEX.exec(output);
                    if (pwd === null || pwd === void 0 ? void 0 : pwd[1]) {
                        cwd = pwd[1].trim();
                        output = output.replace(CWD_REGEX, '');
                    }
                    if (watchOptions) {
                        if (!watched) {
                            if (watchOptions === null || watchOptions === void 0 ? void 0 : watchOptions.expressions.some(regex => regex.test(output))) {
                                watched = true;
                                void execution.replaceOutput([
                                    new vscode.NotebookCellOutput([
                                        vscode.NotebookCellOutputItem.text(`Started in terminal <b>${watchOptions.terminalName}</b>`, 'text/html')
                                    ])
                                ]);
                                resolve(cwd);
                            }
                        }
                    }
                    else {
                        const cleanedOutput = output.replace(CWD_START_REGEX, '');
                        void execution.replaceOutput([
                            new vscode.NotebookCellOutput([
                                vscode.NotebookCellOutputItem.text(cleanedOutput)
                            ])
                        ]);
                    }
                }));
                subProcess.stderr.on('data', chunk => {
                    if (!watchOptions) {
                        startTimer();
                    }
                    if (watchOptions) {
                        chunk = chunk.toString();
                        const formatText = (text) => `\r${text.split(/(\r?\n)/g).join('\r')}\r`;
                        watchOptions.writeEmitter.fire(formatText(chunk));
                    }
                    output = output + chunk.toString().replace(/\r/g, '');
                    if (!watchOptions) {
                        void execution.replaceOutput([
                            new vscode.NotebookCellOutput([
                                vscode.NotebookCellOutputItem.text(output)
                            ])
                        ]);
                    }
                });
                subProcess.on('error', (err) => __awaiter(this, void 0, void 0, function* () {
                    if (!watchOptions) {
                        clearTimeout(timerId);
                    }
                    yield this.setMetadata(execution.cell, { pid: null });
                    reject(err);
                }));
                subProcess.on('close', (code, signal) => __awaiter(this, void 0, void 0, function* () {
                    var _a, _b;
                    if (!watchOptions) {
                        clearTimeout(timerId);
                    }
                    yield this.setMetadata(execution.cell, { pid: null });
                    if (!killed) {
                        if (signal === 'SIGTERM') {
                            reject(new vscode.CancellationError());
                        }
                        else if (code) {
                            const err = new Error(output);
                            err.stack = '';
                            err.cmdCode = code;
                            err.signal = signal;
                            reject(err);
                        }
                        else if (output.match(/Uncaught \w*Error/)) {
                            reject(new Error(output));
                        }
                        else if (((_b = (_a = execution.cell) === null || _a === void 0 ? void 0 : _a.metadata) === null || _b === void 0 ? void 0 : _b.watched) !== true) {
                            resolve(cwd);
                        }
                    }
                }));
                execution.token.onCancellationRequested(() => {
                    killed = true;
                    subProcess.stdout.unpipe();
                    subProcess.stdout.destroy();
                    subProcess.stderr.unpipe();
                    subProcess.stderr.destroy();
                    subProcess.stdin.end();
                    subProcess.stdin.destroy();
                    kill(subProcess.pid, 'SIGKILL', (err) => {
                        if (err) {
                            reject(err);
                        }
                        else {
                            reject(new vscode.CancellationError());
                        }
                    });
                });
            });
            yield this.setMetadata(execution.cell, { pid: subProcess.pid });
            const newCwd = yield processPromise;
            if (newCwd && newCwd.toLowerCase() !== (execution.cell.metadata.cwd || (yield fs_1.promises.realpath(defaultCwd))).toLowerCase()) {
                yield this.changeCwd(execution.cell, newCwd);
            }
            else {
                yield this.setMetadata(execution.cell, { newCwd: null });
            }
            return output;
        });
    }
    runShellCell(content, execution) {
        return __awaiter(this, void 0, void 0, function* () {
            content = this.envVarHandler.resolveEnvVars(content, execution.cell);
            const lines = content
                .replace(/(\\\r?\n)/g, '')
                .split(/(\r?\n)+/)
                .map(line => line.trim())
                .filter(line => line && !line.match(/^\s*#/));
            lines.push(`echo ${CWD_BEGIN_TOKEN}`);
            lines.push(IS_WIN ? 'cmd /c cd' : 'pwd');
            lines.push(`echo ${CWD_END_TOKEN}`);
            const cwd = this.getCurrentCwd(execution.cell);
            const subProcess = cp.exec(lines.join(' && '), Object.assign(Object.assign({}, this.options), { cwd }));
            yield this.handleProcess(subProcess, execution, '', {
                timeout: CELL_EXECUTION_TIMEOUT,
                message: 'In CAP Notebook {{ fileName }} cell #{{ cellNumber }} did not write anything to the console for a while. Maybe the cell is waiting for user input? Consider stopping the cell execution and change the cell type to Native Terminal to handle user input.'
            });
        });
    }
    runTerminalCell(content, execution, expressions) {
        return __awaiter(this, void 0, void 0, function* () {
            const watch = expressions && expressions.length > 0 ? true : false;
            content = this.envVarHandler.resolveEnvVars(content, execution.cell);
            const cwd = this.getCurrentCwd(execution.cell);
            const cellNumber = execution.cell.index;
            const lines = content
                .replace(/(\\\r?\n)/g, '')
                .split(/(\r?\n)+/)
                .map(line => line.trim())
                .filter(line => line && !line.match(/^\s*#/));
            const terminalName = this.getNotebookId(execution.cell.document.fileName) + cellNumber;
            const message = watch ? 'Starting subprocess...' : `Running in terminal <b>${terminalName}</b>`;
            yield execution.replaceOutput([
                new vscode.NotebookCellOutput([
                    vscode.NotebookCellOutputItem.text(message, 'text/html')
                ])
            ]);
            let pty;
            let subProcess;
            let writeEmitter;
            let term = vscode.window.terminals.find(currentTerm => (currentTerm.name === terminalName));
            if (term && watch) {
                term.dispose();
            }
            if (term && !watch) {
                lines.unshift(`cd ${cwd}`);
            }
            else {
                let termOpts;
                if (watch) {
                    ({ pty, subProcess, writeEmitter } = yield this.createPty(execution, cwd, lines, terminalName));
                    termOpts = {
                        name: terminalName,
                        iconPath: TERMINAL_ICON,
                        pty
                    };
                }
                else {
                    termOpts = {
                        name: terminalName,
                        cwd,
                        iconPath: TERMINAL_ICON
                    };
                }
                term = vscode.window.createTerminal(termOpts);
            }
            term.show();
            if (watch) {
                const printFileName = path.relative(this.getDefaultCwd(execution.cell), execution.cell.document.fileName);
                yield this.handleProcess(subProcess, execution, '', {
                    timeout: CELL_EXECUTION_TIMEOUT,
                    message: `In CAP Notebook '${printFileName}' cell #${execution.cell.index + 1} did not write anything to the console for a while. Maybe the cell is waiting for user input? Consider stopping the cell execution and change the cell type to 'Native Terminal' to handle user input.`
                }, {
                    expressions,
                    terminalName,
                    writeEmitter
                });
            }
            else {
                term.sendText(lines.join(os.EOL));
            }
            yield term.processId;
        });
    }
    createPty(execution, cwd, lines, terminalName) {
        return __awaiter(this, void 0, void 0, function* () {
            const writeEmitter = new vscode.EventEmitter();
            let subProcess;
            const actions = {
                cancel: '\u0003'
            };
            lines = IS_WIN ? lines.map(line => line.split(/[\s,&&]+/)).flat() : lines.map(line => line.split(/[&&]+/)).flat();
            try {
                subProcess = IS_WIN
                    ? cp.spawn('cmd', ['/c'].concat(lines), {
                        cwd,
                        stdio: 'overlapped'
                    })
                    : cp.exec(lines.join(' && '), {
                        encoding: 'utf8',
                        cwd
                    });
            }
            catch (error) {
                if (error.name === 'Canceled') {
                    kill(subProcess.pid, 'SIGKILL');
                    const term = vscode.window.terminals.find(currentTerm => (currentTerm.name === terminalName));
                    term.dispose();
                    void execution.replaceOutput([
                        new vscode.NotebookCellOutput([
                            vscode.NotebookCellOutputItem.text('Execution cancelled')
                        ])
                    ]);
                }
            }
            const pty = {
                onDidWrite: writeEmitter.event,
                open: () => writeEmitter.fire(`\r> ${lines.join('\r\n> ')}\r\n`),
                close: () => {
                    if (subProcess === null || subProcess === void 0 ? void 0 : subProcess.stdout) {
                        subProcess.stdout.unpipe();
                        subProcess.stdout.destroy();
                    }
                    if (subProcess === null || subProcess === void 0 ? void 0 : subProcess.stderr) {
                        subProcess.stderr.unpipe();
                        subProcess.stderr.destroy();
                    }
                    if (subProcess === null || subProcess === void 0 ? void 0 : subProcess.stdin) {
                        subProcess.stdin.end();
                        subProcess.stdin.destroy();
                    }
                    if (subProcess === null || subProcess === void 0 ? void 0 : subProcess.pid) {
                        kill(subProcess.pid, 'SIGKILL');
                    }
                },
                handleInput: (data) => __awaiter(this, void 0, void 0, function* () {
                    if (data === actions.cancel) {
                        kill(subProcess.pid, 'SIGKILL');
                        const term = vscode.window.terminals.find(currentTerm => (currentTerm.name === terminalName));
                        term.dispose();
                    }
                    if (data === '\r') {
                        writeEmitter.fire(`${data}\r\n`);
                        subProcess.stdin.write(`${data}\r\n`);
                    }
                })
            };
            return { pty, subProcess, writeEmitter };
        });
    }
    setEnvVars(newEnv, cell) {
        return __awaiter(this, void 0, void 0, function* () {
            let env = this.envFor(cell);
            env = Object.assign(Object.assign({}, env), newEnv);
            yield this.setMetadata(cell.notebook, { env });
        });
    }
    runNodeCell(content, execution) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const cwd = this.getCurrentCwd(execution.cell);
                const code = content + '\n'
                    + `console.log('${CWD_BEGIN_TOKEN} ' + process.cwd() + ' ${CWD_END_TOKEN}')\n`;
                const subProcess = cp.spawn('node', ['-e', code], {
                    env: process.env,
                    cwd
                });
                yield this.handleProcess(subProcess, execution, '', {
                    timeout: CELL_EXECUTION_TIMEOUT,
                    message: 'In CAP Notebook {{ fileName }} cell #{{ cellNumber }} did not write anything to the console for a while. Maybe the cell is waiting for user input? Consider stopping the cell execution'
                });
            }
            catch (err) {
                if (err.code === 'ENOENT') {
                    return execution.replaceOutput([
                        new vscode.NotebookCellOutput([vscode.NotebookCellOutputItem.text('Command \'node\' not found. Make sure you have Node.js installed to run code in this cell.')])
                    ]);
                }
                throw err;
            }
        });
    }
    runJavaCell(content, execution) {
        return __awaiter(this, void 0, void 0, function* () {
            const cwd = this.getCurrentCwd(execution.cell);
            try {
                const subProcess = cp.spawn('jshell', ['-s', '-'], {
                    env: process.env,
                    cwd
                });
                subProcess.stdin.write(`${content}\n`);
                subProcess.stdin.write(`System.out.println("${CWD_BEGIN_TOKEN}" + System.getProperty("user.dir") + "${CWD_END_TOKEN}");\n`);
                subProcess.stdin.write('/exit\n');
                yield this.handleProcess(subProcess, execution, '', {
                    timeout: CELL_EXECUTION_TIMEOUT,
                    message: 'In CAP Notebook {{ fileName }} cell #{{ cellNumber }} did not write anything to the console for a while. Maybe the cell is waiting for user input? Consider stopping the cell execution.'
                });
            }
            catch (err) {
                if (err.code === 'ENOENT') {
                    return execution.replaceOutput([
                        new vscode.NotebookCellOutput([vscode.NotebookCellOutputItem.text('Command \'jshell\' not found. Make sure you have JDK version 9 or higher installed to run code in this cell.')])
                    ]);
                }
                throw err;
            }
        });
    }
    runCdsCell(content, execution) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const cwd = this.getCurrentCwd(execution.cell);
                const subProcess = cp.spawn('cds', ['repl'], Object.assign(Object.assign({}, this.options), { cwd }));
                subProcess.stdin.write(`${content}\n`);
                subProcess.stdin.write(`console.log('${CWD_BEGIN_TOKEN} ' + process.cwd() + ' ${CWD_END_TOKEN}')\n`);
                subProcess.stdin.write('.exit\n');
                yield this.handleProcess(subProcess, execution);
            }
            catch (err) {
                if (err.code === 'ENOENT') {
                    return execution.replaceOutput([
                        new vscode.NotebookCellOutput([vscode.NotebookCellOutputItem.text('Command \'cds\' not found. Make sure you have npm module @sap/cds-dk installed globally to run code in this cell.')])
                    ]);
                }
                throw err;
            }
        });
    }
    runCdsServerCell(content, execution) {
        return __awaiter(this, void 0, void 0, function* () {
            const expressions = [
                /listening on/i,
                /terminate with/i,
                /waiting for/i,
                /started application/i
            ];
            yield this.runTerminalCell(content, execution, expressions);
        });
    }
    resolveEnvVars(content, cell) {
        return this.envVarHandler.resolveEnvVars(content, cell);
    }
    setDecoration(cell) {
        const textEditor = vscode.window.visibleTextEditors.find(editor => { var _a; return editor.document.uri === ((_a = cell === null || cell === void 0 ? void 0 : cell.document) === null || _a === void 0 ? void 0 : _a.uri); });
        if (!textEditor) {
            return;
        }
        const rangeOptions = this.getMagicDecorations(cell.document);
        textEditor.setDecorations(MAGIC_COMMAND_DECORATIONTYPE, rangeOptions);
        this.envVarHandler.decorate(textEditor, cell);
    }
    getMagicDecorations(document) {
        const content = document.getText();
        const rangeOptions = [];
        const matches = this.getMagicComments(content, document.languageId);
        matches.forEach((m) => {
            var _a, _b, _c;
            if (m === null || m === void 0 ? void 0 : m.magic) {
                const meta = MagicCommands_1.MagicCommands.filter(magic => { var _a; return ((_a = m === null || m === void 0 ? void 0 : m.magic) === null || _a === void 0 ? void 0 : _a.command) === (0, MagicCommands_1.cmd)(magic); })[0].meta;
                const hoverMessage = `${(_a = m === null || m === void 0 ? void 0 : m.magic) === null || _a === void 0 ? void 0 : _a.command} ${meta.optionSyntax} (${meta.description})`;
                const offset = (m === null || m === void 0 ? void 0 : m.offset) ? m === null || m === void 0 ? void 0 : m.offset : 0;
                const index = m.index + offset;
                const range = new vscode.Range(document.positionAt(index), document.positionAt(index + ((_c = (_b = m === null || m === void 0 ? void 0 : m.magic) === null || _b === void 0 ? void 0 : _b.command) === null || _c === void 0 ? void 0 : _c.length)));
                rangeOptions.push({ range, hoverMessage });
            }
        });
        return rangeOptions;
    }
    setMetadata(target, newMetadata) {
        return __awaiter(this, void 0, void 0, function* () {
            let notebook;
            let notebookEdit;
            const mergedMetadata = Object.assign(Object.assign({}, target.metadata), newMetadata);
            if ('getCells' in target) {
                notebook = target;
                notebookEdit = vscode.NotebookEdit.updateNotebookMetadata(mergedMetadata);
            }
            else {
                if (target.index < 0) {
                    return;
                }
                notebook = target.notebook;
                notebookEdit = vscode.NotebookEdit.updateCellMetadata(target.index, mergedMetadata);
            }
            const workspaceEdit = new vscode.WorkspaceEdit();
            workspaceEdit.set(notebook.uri, [notebookEdit]);
            yield vscode.workspace.applyEdit(workspaceEdit);
        });
    }
}
exports.CapNotebookController = CapNotebookController;
//# sourceMappingURL=CapNotebookController.js.map