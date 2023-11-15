"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyMiddleware = void 0;
/**
 * Applies the provided list of middlewares to a message from a webview in the order they are provided.
 *
 * @param {any} message - The message received from the webview.
 * @param {Webview} webview - The webview from which the message was received.
 * @param {...WebviewMiddleware[]} middlewares - The list of middlewares to apply.
 */
function applyMiddleware(message, webview, ...middlewares) {
    const execMiddleware = (index) => {
        if (index < middlewares.length) {
            middlewares[index](message, webview, () => execMiddleware(index + 1));
        }
    };
    execMiddleware(0);
}
exports.applyMiddleware = applyMiddleware;
//# sourceMappingURL=middleware.js.map