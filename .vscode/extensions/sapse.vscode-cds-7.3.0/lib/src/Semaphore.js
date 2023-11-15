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
exports.Semaphore = void 0;
const events_1 = require("events");
class Semaphore {
    constructor() {
        this.isAcquired = false;
        this.emitter = new events_1.EventEmitter();
    }
    run(cb) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.acquire();
            try {
                return yield cb();
            }
            finally {
                yield this.release();
            }
        });
    }
    acquire() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise(resolve => {
                if (!this.isAcquired) {
                    this.isAcquired = true;
                    return resolve();
                }
                const tryAcquire = () => {
                    if (!this.isAcquired) {
                        this.isAcquired = true;
                        this.emitter.removeListener('release', tryAcquire);
                        resolve();
                    }
                };
                this.emitter.on('release', tryAcquire);
            });
        });
    }
    release() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise(resolve => {
                this.isAcquired = false;
                this.emitter.emit('release');
                resolve();
            });
        });
    }
}
exports.Semaphore = Semaphore;
//# sourceMappingURL=Semaphore.js.map