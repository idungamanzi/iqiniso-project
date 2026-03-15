"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
exports.notFoundHandler = notFoundHandler;
const zod_1 = require("zod");
const multer_1 = require("multer");
function errorHandler(err, _req, res, _next) {
    // Zod validation errors
    if (err instanceof zod_1.ZodError) {
        const errors = {};
        err.errors.forEach((e) => {
            const field = e.path.join('.');
            errors[field] = e.message;
        });
        res.status(400).json({ error: 'Validation failed.', errors });
        return;
    }
    // Multer file upload errors
    if (err instanceof multer_1.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            res.status(400).json({ error: `File too large. Maximum size is ${process.env.MAX_FILE_SIZE_MB ?? 10}MB.` });
            return;
        }
        res.status(400).json({ error: err.message });
        return;
    }
    // Known operational errors
    if (err instanceof Error) {
        if (err.message.includes('Only JPEG')) {
            res.status(400).json({ error: err.message });
            return;
        }
        console.error('[ERROR]', err.message, err.stack);
    }
    res.status(500).json({ error: 'Internal server error. Please try again later.' });
}
function notFoundHandler(_req, res) {
    res.status(404).json({ error: 'Route not found.' });
}
