"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelemetryHandler = void 0;
const Tracing_1 = require("./Tracing");
let lastInternalErrorStack;
const lastInternalErrorThreshold = 60000;
let lastInternalErrorTime = Date.now() - lastInternalErrorThreshold;
class TelemetryHandler {
    constructor(_context) {
        this._context = _context;
        this.trace = new Tracing_1.Trace(Tracing_1.ClientTraceComponents.TELEMETRY);
    }
    installHook(client) {
        client.onTelemetry((e) => {
            try {
                if (e.type === 'internal compiler error') {
                    if (lastInternalErrorStack !== e.stack || lastInternalErrorTime + lastInternalErrorThreshold < Date.now()) {
                        this.trace.log(Tracing_1.TraceLevel.ERROR, `[INTERNAL ERROR] ${e.stack}\nPlease report this error.\n\n`);
                    }
                    lastInternalErrorStack = e.stack;
                    lastInternalErrorTime = Date.now();
                }
            }
            catch (err) {
                this.trace.log(Tracing_1.TraceLevel.INFO, `Exception on telemetry: ${err}`);
            }
        });
    }
}
exports.TelemetryHandler = TelemetryHandler;
//# sourceMappingURL=TelemetryHandler.js.map