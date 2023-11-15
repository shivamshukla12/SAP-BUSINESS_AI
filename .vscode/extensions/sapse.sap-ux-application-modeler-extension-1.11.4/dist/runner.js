var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
try {
    const eslintPath = require.resolve('eslint', { paths: [process.cwd()] });
    Promise.resolve(`${eslintPath}`).then(s => __importStar(require(s))).then((eslint) => {
        let eslintOptions = {
            useEslintrc: true,
            rulePaths: []
        };
        if (process.env.rulePaths) {
            eslintOptions = { ...eslintOptions, rulePaths: process.env.rulePaths.split(',') };
        }
        if (eslint.ESLint) {
            const eslintRunner = new eslint.ESLint(eslintOptions);
            eslintRunner.lintFiles(`./`).then((results) => {
                process.send({ results });
            });
        }
        else if (eslint.CLIEngine) {
            const cli = new eslint.CLIEngine(eslintOptions);
            const result = cli.executeOnFiles(`./`);
            process.send(result);
        }
    })
        .catch((e) => {
        if (e.stack) {
            const error = {
                name: e.name,
                message: e.message,
                stack: e.stack
            };
            process.send({
                error
            });
        }
        else {
            process.send(e);
        }
    });
}
catch (e) {
    process.send(e);
}
//# sourceMappingURL=runner.js.map