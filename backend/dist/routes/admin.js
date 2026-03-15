"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const upload_1 = require("../middleware/upload");
const schemas_1 = require("../utils/schemas");
const helpers_1 = require("../utils/helpers");
const fs_1 = __importDefault(require("fs"));
const router = (0, express_1.Router)();
// ─── Auth ─────────────────────────────────────────────────────────────────────
router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = schemas_1.loginSchema.parse(req.body);
        const admin = await prisma_1.prisma.adminUser.findUnique({ where: { email } });
        if (!admin || !(await bcryptjs_1.default.compare(password, admin.passwordHash))) {
            // Same response for both "not found" and "wrong password" — prevents enumeration
            res.status(401).json({ error: 'Invalid credentials.' });
            return;
        }
        const secret = process.env.JWT_SECRET;
        const token = jsonwebtoken_1.default.sign({ adminId: admin.id, email: admin.email }, secret, { expiresIn: '8h' });
        res.json({ token, admin: { id: admin.id, email: admin.email, name: admin.name } });
    }
    catch (err) {
        next(err);
    }
});
// All routes below require authentication
router.use(auth_1.requireAuth);
// ─── Company Info ─────────────────────────────────────────────────────────────
router.get('/company', async (req, res, next) => {
    try {
        const info = await prisma_1.prisma.companyInfo.findFirst();
        res.json(info ? { ...info, logoUrl: (0, helpers_1.fileUrl)(req, info.logoPath) } : null);
    }
    catch (err) {
        next(err);
    }
});
router.put('/company', upload_1.uploadCompany.single('logo'), async (req, res, next) => {
    try {
        const data = schemas_1.companyInfoSchema.parse(typeof req.body === 'string' ? JSON.parse(req.body) : req.body);
        const existing = await prisma_1.prisma.companyInfo.findFirst();
        const logoPath = req.file ? req.file.path : undefined;
        // Delete old logo if a new one is uploaded
        if (logoPath && existing?.logoPath) {
            fs_1.default.unlink(existing.logoPath, () => { });
        }
        const info = await prisma_1.prisma.companyInfo.upsert({
            where: { id: 1 },
            update: { ...data, ...(logoPath ? { logoPath } : {}) },
            create: { id: 1, ...data, ...(logoPath ? { logoPath } : {}) },
        });
        res.json({ ...info, logoUrl: (0, helpers_1.fileUrl)(req, info.logoPath) });
    }
    catch (err) {
        next(err);
    }
});
// ─── Services ─────────────────────────────────────────────────────────────────
router.get('/services', async (req, res, next) => {
    try {
        const services = await prisma_1.prisma.service.findMany({ orderBy: [{ order: 'asc' }, { title: 'asc' }] });
        res.json(services.map((s) => ({ ...s, imageUrl: (0, helpers_1.fileUrl)(req, s.imagePath) })));
    }
    catch (err) {
        next(err);
    }
});
router.post('/services', upload_1.uploadService.single('image'), async (req, res, next) => {
    try {
        const data = schemas_1.serviceSchema.parse(typeof req.body === 'string' ? JSON.parse(req.body) : req.body);
        const slug = (0, helpers_1.slugify)(data.title);
        const service = await prisma_1.prisma.service.create({
            data: { ...data, slug, imagePath: req.file?.path ?? null },
        });
        res.status(201).json({ ...service, imageUrl: (0, helpers_1.fileUrl)(req, service.imagePath) });
    }
    catch (err) {
        next(err);
    }
});
router.put('/services/:id', upload_1.uploadService.single('image'), async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        const data = schemas_1.serviceSchema.partial().parse(typeof req.body === 'string' ? JSON.parse(req.body) : req.body);
        const existing = await prisma_1.prisma.service.findUnique({ where: { id } });
        if (!existing) {
            res.status(404).json({ error: 'Service not found.' });
            return;
        }
        const imagePath = req.file ? req.file.path : undefined;
        if (imagePath && existing.imagePath)
            fs_1.default.unlink(existing.imagePath, () => { });
        const updated = await prisma_1.prisma.service.update({
            where: { id },
            data: { ...data, ...(imagePath ? { imagePath } : {}), ...(data.title ? { slug: (0, helpers_1.slugify)(data.title) } : {}) },
        });
        res.json({ ...updated, imageUrl: (0, helpers_1.fileUrl)(req, updated.imagePath) });
    }
    catch (err) {
        next(err);
    }
});
router.delete('/services/:id', async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        const service = await prisma_1.prisma.service.findUnique({ where: { id } });
        if (!service) {
            res.status(404).json({ error: 'Service not found.' });
            return;
        }
        if (service.imagePath)
            fs_1.default.unlink(service.imagePath, () => { });
        await prisma_1.prisma.service.delete({ where: { id } });
        res.status(204).send();
    }
    catch (err) {
        next(err);
    }
});
// ─── Projects ─────────────────────────────────────────────────────────────────
router.get('/projects', async (req, res, next) => {
    try {
        const projects = await prisma_1.prisma.project.findMany({
            orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
            include: { images: true },
        });
        res.json(projects.map((p) => ({
            ...p,
            mainImageUrl: (0, helpers_1.fileUrl)(req, p.mainImagePath),
            images: p.images.map((img) => ({ ...img, imageUrl: (0, helpers_1.fileUrl)(req, img.imagePath) })),
        })));
    }
    catch (err) {
        next(err);
    }
});
router.post('/projects', upload_1.uploadProject.single('mainImage'), async (req, res, next) => {
    try {
        const data = schemas_1.projectSchema.parse(typeof req.body === 'string' ? JSON.parse(req.body) : req.body);
        const slug = (0, helpers_1.slugify)(data.title);
        const project = await prisma_1.prisma.project.create({
            data: {
                ...data,
                slug,
                mainImagePath: req.file?.path ?? null,
                startDate: data.startDate ? new Date(data.startDate) : null,
                completionDate: data.completionDate ? new Date(data.completionDate) : null,
            },
        });
        res.status(201).json({ ...project, mainImageUrl: (0, helpers_1.fileUrl)(req, project.mainImagePath) });
    }
    catch (err) {
        next(err);
    }
});
router.put('/projects/:id', upload_1.uploadProject.single('mainImage'), async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        const data = schemas_1.projectSchema.partial().parse(typeof req.body === 'string' ? JSON.parse(req.body) : req.body);
        const existing = await prisma_1.prisma.project.findUnique({ where: { id } });
        if (!existing) {
            res.status(404).json({ error: 'Project not found.' });
            return;
        }
        const mainImagePath = req.file ? req.file.path : undefined;
        if (mainImagePath && existing.mainImagePath)
            fs_1.default.unlink(existing.mainImagePath, () => { });
        const updated = await prisma_1.prisma.project.update({
            where: { id },
            data: {
                ...data,
                ...(mainImagePath ? { mainImagePath } : {}),
                ...(data.title ? { slug: (0, helpers_1.slugify)(data.title) } : {}),
                ...(data.startDate ? { startDate: new Date(data.startDate) } : {}),
                ...(data.completionDate ? { completionDate: new Date(data.completionDate) } : {}),
            },
        });
        res.json({ ...updated, mainImageUrl: (0, helpers_1.fileUrl)(req, updated.mainImagePath) });
    }
    catch (err) {
        next(err);
    }
});
router.delete('/projects/:id', async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        const project = await prisma_1.prisma.project.findUnique({ where: { id }, include: { images: true } });
        if (!project) {
            res.status(404).json({ error: 'Project not found.' });
            return;
        }
        if (project.mainImagePath)
            fs_1.default.unlink(project.mainImagePath, () => { });
        project.images.forEach((img) => fs_1.default.unlink(img.imagePath, () => { }));
        await prisma_1.prisma.project.delete({ where: { id } });
        res.status(204).send();
    }
    catch (err) {
        next(err);
    }
});
// ─── Gallery ──────────────────────────────────────────────────────────────────
router.get('/gallery', async (req, res, next) => {
    try {
        const images = await prisma_1.prisma.galleryImage.findMany({ orderBy: [{ order: 'asc' }, { createdAt: 'desc' }] });
        res.json(images.map((img) => ({ ...img, imageUrl: (0, helpers_1.fileUrl)(req, img.imagePath) })));
    }
    catch (err) {
        next(err);
    }
});
router.post('/gallery', upload_1.uploadGallery.single('image'), async (req, res, next) => {
    try {
        if (!req.file) {
            res.status(400).json({ error: 'Image file is required.' });
            return;
        }
        const { title = '', category = 'GENERAL', altText = '', order = '0' } = req.body;
        const image = await prisma_1.prisma.galleryImage.create({
            data: { title, imagePath: req.file.path, category: category, altText, order: parseInt(order) },
        });
        res.status(201).json({ ...image, imageUrl: (0, helpers_1.fileUrl)(req, image.imagePath) });
    }
    catch (err) {
        next(err);
    }
});
router.delete('/gallery/:id', async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        const image = await prisma_1.prisma.galleryImage.findUnique({ where: { id } });
        if (!image) {
            res.status(404).json({ error: 'Image not found.' });
            return;
        }
        fs_1.default.unlink(image.imagePath, () => { });
        await prisma_1.prisma.galleryImage.delete({ where: { id } });
        res.status(204).send();
    }
    catch (err) {
        next(err);
    }
});
// ─── Contact Messages ─────────────────────────────────────────────────────────
router.get('/messages', async (_req, res, next) => {
    try {
        const messages = await prisma_1.prisma.contactMessage.findMany({
            orderBy: { createdAt: 'desc' },
        });
        res.json(messages);
    }
    catch (err) {
        next(err);
    }
});
router.patch('/messages/:id', async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        const { status, adminNotes } = req.body;
        const updated = await prisma_1.prisma.contactMessage.update({
            where: { id },
            data: { ...(status ? { status: status } : {}), ...(adminNotes !== undefined ? { adminNotes } : {}) },
        });
        res.json(updated);
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
