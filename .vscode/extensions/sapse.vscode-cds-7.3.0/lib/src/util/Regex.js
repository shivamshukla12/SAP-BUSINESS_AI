"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REGEX = exports.rgx = void 0;
function rgx(r, flags) {
    return new REGEX(r, flags);
}
exports.rgx = rgx;
class REGEX extends RegExp {
    constructor(r = '', flags) {
        super(r, flags);
    }
    static and(...regexps) {
        return REGEX.combine('', ...regexps);
    }
    and(...regexps) {
        return REGEX.and(this, ...regexps);
    }
    static or(...regexps) {
        return this.combine('|', ...regexps);
    }
    or(...regexps) {
        return REGEX.or(this, ...regexps);
    }
    static wrap(wrapper, wrapped) {
        return new REGEX(wrapper.source.replace('XXX', wrapped.source));
    }
    wrap(wrapper) {
        return REGEX.wrap(wrapper, this);
    }
    static optional(r) {
        return this.wrap(/(?:XXX)?/, r);
    }
    optional() {
        return REGEX.optional(this);
    }
    static flags(r, flags) {
        return new REGEX(r, flags);
    }
    setFlags(flags) {
        return new REGEX(this, flags);
    }
    static combine(join, ...regexps) {
        const context = { capturingGroupsBefore: 0 };
        return new REGEX(regexps
            .map(r => typeof r === 'string'
            ? r
            : REGEX.adaptCapturingReferenceNumber(r, context))
            .map(source => `(?:${source})`)
            .join(join)).wrap(/(?:XXX)/);
    }
    static adaptCapturingReferenceNumber(r, context) {
        const newSource = r.source.replace(/\\[1-9]/g, x => '\\' + (context.capturingGroupsBefore + Number.parseInt(x.slice(1), 10)));
        const capturingGroups = [...r.source.matchAll(/(?<!\\)\((?!\?:)/g)].length;
        context.capturingGroupsBefore += capturingGroups;
        return newSource;
    }
}
exports.REGEX = REGEX;
//# sourceMappingURL=Regex.js.map