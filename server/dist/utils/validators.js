"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clampString = clampString;
exports.toPositiveInt = toPositiveInt;
exports.sanitizeSearch = sanitizeSearch;
function clampString(input, maxLen) {
    if (typeof input !== 'string')
        return undefined;
    return input.length > maxLen ? input.slice(0, maxLen) : input;
}
function toPositiveInt(input, defaultValue, max = 100) {
    const n = Number(input);
    if (!Number.isFinite(n) || n <= 0)
        return defaultValue;
    return Math.min(Math.floor(n), max);
}
function sanitizeSearch(input) {
    if (typeof input !== 'string')
        return undefined;
    return input.replace(/[\$]/g, '');
}
