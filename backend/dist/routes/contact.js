"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const prisma_1 = require("../lib/prisma");
const schemas_1 = require("../utils/schemas");
const helpers_1 = require("../utils/helpers");
const router = (0, express_1.Router)();
// Strict rate limit for contact: 5 requests per hour per IP
const contactLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000,
    max: parseInt(process.env.CONTACT_RATE_LIMIT_MAX ?? '5'),
    message: { error: 'Too many messages submitted. Please wait before trying again.' },
    standardHeaders: true,
    legacyHeaders: false,
});
router.post('/', contactLimiter, async (req, res, next) => {
    try {
        // Validate — throws ZodError which is caught by errorHandler middleware
        const data = schemas_1.contactSchema.parse(req.body);
        const message = await prisma_1.prisma.contactMessage.create({
            data: {
                ...data,
                phone: data.phone ?? '',
                ipAddress: (0, helpers_1.getClientIp)(req),
                userAgent: (req.headers['user-agent'] ?? '').slice(0, 500),
            },
        });
        // Send email notification (non-blocking — failure won't break the response)
        sendEmailNotification(message).catch((err) => {
            console.error('[CONTACT EMAIL] Failed to send notification:', err);
        });
        res.status(201).json({
            message: 'Your message has been received. We will be in touch shortly.',
        });
    }
    catch (err) {
        next(err);
    }
});
async function sendEmailNotification(msg) {
    const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, CONTACT_RECIPIENT } = process.env;
    if (!EMAIL_HOST || !EMAIL_USER || !EMAIL_PASS || !CONTACT_RECIPIENT)
        return;
    const transporter = nodemailer_1.default.createTransport({
        host: EMAIL_HOST,
        port: parseInt(EMAIL_PORT ?? '587'),
        secure: false,
        auth: { user: EMAIL_USER, pass: EMAIL_PASS },
    });
    await transporter.sendMail({
        from: `"IQINISO Website" <${EMAIL_USER}>`,
        to: CONTACT_RECIPIENT,
        subject: `[Website] New Contact: ${msg.subject}`,
        text: [
            `From: ${msg.name} <${msg.email}>`,
            `Phone: ${msg.phone || 'Not provided'}`,
            `Subject: ${msg.subject}`,
            '',
            msg.message,
            '',
            `Submitted: ${msg.createdAt.toISOString()}`,
        ].join('\n'),
    });
}
exports.default = router;
