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
exports.httpUtil = void 0;
const axios_1 = require("axios");
class HTTPUtil {
    cancel(token) {
        token();
    }
    get(url, options = {}, cancelCallback) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (cancelCallback) {
                    options.cancelToken = new axios_1.default.CancelToken((c) => {
                        cancelCallback(c);
                    });
                }
                return yield axios_1.default.get(url, options);
            }
            catch (err) {
                if (axios_1.default.isAxiosError(err)) {
                    this.handleTooManyRequestsError(err);
                    if (((_a = err.response) === null || _a === void 0 ? void 0 : _a.status) === axios_1.default.HttpStatusCode.NotModified) {
                        return err.response;
                    }
                }
                throw err;
            }
        });
    }
    handleTooManyRequestsError(e) {
        var _a, _b, _c;
        if (((_a = e.response) === null || _a === void 0 ? void 0 : _a.status) === axios_1.default.HttpStatusCode.TooManyRequests) {
            let when = 'later';
            const retryAfter = (_c = (_b = e.response) === null || _b === void 0 ? void 0 : _b.headers) === null || _c === void 0 ? void 0 : _c['retry-after'];
            if (typeof retryAfter === 'string') {
                const millis = Date.parse(retryAfter);
                if (Number.isNaN(millis)) {
                    when = `after ${new Date(millis).toLocaleString()}`;
                }
                else {
                    const seconds = parseInt(retryAfter, 10);
                    if (!Number.isNaN(seconds)) {
                        when = `after ${seconds} seconds`;
                    }
                }
            }
            throw new Error(`Too many requests. Please try again ${when}`);
        }
    }
}
exports.httpUtil = new HTTPUtil();
//# sourceMappingURL=HTTPUtil.js.map