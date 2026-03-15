"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const path_1 = __importDefault(require("path"));
const public_1 = __importDefault(require("./routes/public"));
const contact_1 = __importDefault(require("./routes/contact"));
const admin_1 = __importDefault(require("./routes/admin"));
const errorHandler_1 = require("./middleware/errorHandler");
const app = (0, express_1.default)();
const PORT = parseInt(process.env.PORT ?? '3001');
const UPLOAD_DIR = process.env.UPLOAD_DIR ?? 'uploads';
// ─── Security Middleware ──────────────────────────────────────────────────────
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow media files from frontend
}));
app.use((0, cors_1.default)({
    origin: (process.env.CORS_ORIGINS ?? 'http://localhost:5173').split(',').map((o) => o.trim()),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false,
}));
// ─── General Rate Limit ───────────────────────────────────────────────────────
app.use((0, express_rate_limit_1.default)({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? '900000'),
    max: parseInt(process.env.RATE_LIMIT_MAX ?? '100'),
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests. Please slow down.' },
}));
// ─── Parsing & Compression ───────────────────────────────────────────────────
app.use((0, compression_1.default)());
app.use(express_1.default.json({ limit: '2mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '2mb' }));
// ─── Logging ─────────────────────────────────────────────────────────────────
app.use((0, morgan_1.default)(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
// ─── Static Media Serving ────────────────────────────────────────────────────
// Serve uploaded files — disable directory listing
app.use('/uploads', express_1.default.static(path_1.default.resolve(UPLOAD_DIR), {
    index: false,
    dotfiles: 'deny',
}));
// ─── Routes ───────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'healthy', service: 'iqiniso-api' }));
app.use('/api/v1', public_1.default);
app.use('/api/v1/contact', contact_1.default);
app.use('/api/v1/admin', admin_1.default);
// ─── Error Handling ───────────────────────────────────────────────────────────
app.use(errorHandler_1.notFoundHandler);
app.use(errorHandler_1.errorHandler);
// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`
  ┌─────────────────────────────────────────┐
  │   IQINISO Construction API              │
  │   http://localhost:${PORT}                  │
  │   ENV: ${process.env.NODE_ENV ?? 'development'}                    │
  └─────────────────────────────────────────┘
  `);
});
exports.default = app;
