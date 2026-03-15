"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.slugify = slugify;
exports.getClientIp = getClientIp;
exports.fileUrl = fileUrl;
function slugify(text) {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}
function getClientIp(req) {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string')
        return forwarded.split(',')[0].trim();
    return req.ip ?? 'unknown';
}
/**
 * Builds a full URL for an uploaded file path.
 * Returns null if path is null/undefined.
 */
function fileUrl(req, filePath) {
    if (!filePath)
        return null;
    const base = `${req.protocol}://${req.get('host')}`;
    return `${base}/${filePath.replace(/\\/g, '/')}`;
}
