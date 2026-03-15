"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadCompany = exports.uploadGallery = exports.uploadProject = exports.uploadService = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE_MB ?? '10') * 1024 * 1024;
const UPLOAD_DIR = process.env.UPLOAD_DIR ?? 'uploads';
// Ensure upload subdirectories exist on startup
const SUBDIRS = ['services', 'projects', 'gallery', 'company'];
SUBDIRS.forEach((dir) => {
    const fullPath = path_1.default.join(UPLOAD_DIR, dir);
    if (!fs_1.default.existsSync(fullPath))
        fs_1.default.mkdirSync(fullPath, { recursive: true });
});
function storage(subdir) {
    return multer_1.default.diskStorage({
        destination: (_req, _file, cb) => {
            cb(null, path_1.default.join(UPLOAD_DIR, subdir));
        },
        filename: (_req, file, cb) => {
            // Sanitize filename — strip path traversal attempts
            const ext = path_1.default.extname(file.originalname).toLowerCase();
            const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
            cb(null, safeName);
        },
    });
}
function fileFilter(_req, file, cb) {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('Only JPEG, PNG, and WebP images are allowed.'));
    }
}
exports.uploadService = (0, multer_1.default)({ storage: storage('services'), fileFilter, limits: { fileSize: MAX_FILE_SIZE } });
exports.uploadProject = (0, multer_1.default)({ storage: storage('projects'), fileFilter, limits: { fileSize: MAX_FILE_SIZE } });
exports.uploadGallery = (0, multer_1.default)({ storage: storage('gallery'), fileFilter, limits: { fileSize: MAX_FILE_SIZE } });
exports.uploadCompany = (0, multer_1.default)({ storage: storage('company'), fileFilter, limits: { fileSize: MAX_FILE_SIZE } });
