"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.to = void 0;
/**
 * A utility function to ensure compile-time type safety.
 *
 * @template T The expected type of the argument.
 * @param {T} value - The value that needs type verification.
 * @returns {T} - The same value, but its type will be checked during compile time.
 *
 * @example
 *
 * const myValue = to<MyType>("someValue");
 */
function to(value) {
    return value;
}
exports.to = to;
//# sourceMappingURL=typeSafety.js.map