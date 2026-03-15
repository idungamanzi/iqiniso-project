"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.companyInfoSchema = exports.projectSchema = exports.serviceSchema = exports.loginSchema = exports.contactSchema = void 0;
const zod_1 = require("zod");
// ─── Contact ──────────────────────────────────────────────────────────────────
const SPAM_KEYWORDS = ['casino', 'viagra', 'lottery', 'click here', 'earn money fast'];
function noSpam(val) {
    const lower = val.toLowerCase();
    return !SPAM_KEYWORDS.some((kw) => lower.includes(kw));
}
exports.contactSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .min(2, 'Name must be at least 2 characters')
        .max(150)
        .regex(/^[a-zA-Z\s'\-.]+$/, 'Name contains invalid characters'),
    email: zod_1.z.string().email('Invalid email address').max(254),
    phone: zod_1.z
        .string()
        .max(20)
        .regex(/^[\d\s\-+().]*$/, 'Invalid phone number')
        .optional()
        .or(zod_1.z.literal('')),
    subject: zod_1.z
        .string()
        .min(3, 'Subject is required')
        .max(300)
        .refine(noSpam, 'Subject contains disallowed content'),
    message: zod_1.z
        .string()
        .min(20, 'Message must be at least 20 characters')
        .max(5000)
        .refine(noSpam, 'Message contains disallowed content')
        .refine((val) => (val.match(/https?:\/\//g) ?? []).length <= 3, 'Message contains too many links'),
});
// ─── Admin Login ──────────────────────────────────────────────────────────────
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(1),
});
// ─── Service ──────────────────────────────────────────────────────────────────
exports.serviceSchema = zod_1.z.object({
    title: zod_1.z.string().min(2).max(200),
    description: zod_1.z.string().min(10),
    shortDescription: zod_1.z.string().max(300).optional(),
    icon: zod_1.z.string().max(50).optional(),
    isActive: zod_1.z.boolean().optional(),
    order: zod_1.z.number().int().min(0).optional(),
});
// ─── Project ──────────────────────────────────────────────────────────────────
exports.projectSchema = zod_1.z.object({
    title: zod_1.z.string().min(2).max(200),
    description: zod_1.z.string().min(10),
    shortDescription: zod_1.z.string().max(300).optional(),
    client: zod_1.z.string().max(200).optional(),
    value: zod_1.z.number().positive().optional().nullable(),
    location: zod_1.z.string().max(300).optional(),
    startDate: zod_1.z.string().datetime().optional().nullable(),
    completionDate: zod_1.z.string().datetime().optional().nullable(),
    status: zod_1.z.enum(['COMPLETED', 'ONGOING', 'PLANNED']).optional(),
    isFeatured: zod_1.z.boolean().optional(),
    order: zod_1.z.number().int().min(0).optional(),
});
// ─── Company Info ─────────────────────────────────────────────────────────────
exports.companyInfoSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(200).optional(),
    tagline: zod_1.z.string().max(300).optional(),
    aboutShort: zod_1.z.string().max(500).optional(),
    aboutFull: zod_1.z.string().optional(),
    vision: zod_1.z.string().optional(),
    mission: zod_1.z.string().optional(),
    policy: zod_1.z.string().optional(),
    yearEstablished: zod_1.z.number().int().min(1900).max(new Date().getFullYear()).optional().nullable(),
    registrationNumber: zod_1.z.string().max(100).optional(),
    registrationCertificateUrl: zod_1.z.string().url().optional().or(zod_1.z.literal('')),
    physicalAddress: zod_1.z.string().optional(),
    email: zod_1.z.string().email().optional().or(zod_1.z.literal('')),
    phone: zod_1.z.string().max(20).optional(),
    whatsapp: zod_1.z.string().max(20).optional(),
    facebookUrl: zod_1.z.string().url().optional().or(zod_1.z.literal('')),
    instagramUrl: zod_1.z.string().url().optional().or(zod_1.z.literal('')),
    linkedinUrl: zod_1.z.string().url().optional().or(zod_1.z.literal('')),
    twitterUrl: zod_1.z.string().url().optional().or(zod_1.z.literal('')),
    googleMapsEmbedUrl: zod_1.z.string().optional(),
});
