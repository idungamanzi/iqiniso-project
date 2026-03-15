"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const helpers_1 = require("../utils/helpers");
const router = (0, express_1.Router)();
// ─── Company Info ─────────────────────────────────────────────────────────────
router.get('/core/info', async (req, res, next) => {
    try {
        const info = await prisma_1.prisma.companyInfo.findFirst();
        if (!info) {
            res.status(503).json({ error: 'Company information not configured yet.' });
            return;
        }
        res.json({ ...info, logoUrl: (0, helpers_1.fileUrl)(req, info.logoPath) });
    }
    catch (err) {
        next(err);
    }
});
// ─── Services ─────────────────────────────────────────────────────────────────
router.get('/services', async (req, res, next) => {
    try {
        const services = await prisma_1.prisma.service.findMany({
            where: { isActive: true },
            orderBy: [{ order: 'asc' }, { title: 'asc' }],
        });
        res.json(services.map((s) => ({ ...s, imageUrl: (0, helpers_1.fileUrl)(req, s.imagePath) })));
    }
    catch (err) {
        next(err);
    }
});
router.get('/services/:slug', async (req, res, next) => {
    try {
        const service = await prisma_1.prisma.service.findUnique({
            where: { slug: req.params.slug, isActive: true },
        });
        if (!service) {
            res.status(404).json({ error: 'Service not found.' });
            return;
        }
        res.json({ ...service, imageUrl: (0, helpers_1.fileUrl)(req, service.imagePath) });
    }
    catch (err) {
        next(err);
    }
});
// ─── Projects ─────────────────────────────────────────────────────────────────
router.get('/projects', async (req, res, next) => {
    try {
        const { status, featured, page = '1', limit = '12' } = req.query;
        const where = {};
        if (status && ['COMPLETED', 'ONGOING', 'PLANNED'].includes(status.toUpperCase())) {
            where.status = status.toUpperCase();
        }
        if (featured === 'true')
            where.isFeatured = true;
        const pageNum = Math.max(1, parseInt(page));
        const pageSize = Math.min(50, Math.max(1, parseInt(limit)));
        const skip = (pageNum - 1) * pageSize;
        const [total, projects] = await Promise.all([
            prisma_1.prisma.project.count({ where }),
            prisma_1.prisma.project.findMany({
                where,
                orderBy: [{ isFeatured: 'desc' }, { order: 'asc' }, { startDate: 'desc' }],
                skip,
                take: pageSize,
                select: {
                    id: true, title: true, slug: true, shortDescription: true,
                    mainImagePath: true, status: true, isFeatured: true,
                    location: true, startDate: true, completionDate: true, client: true,
                },
            }),
        ]);
        res.json({
            data: projects.map((p) => ({ ...p, mainImageUrl: (0, helpers_1.fileUrl)(req, p.mainImagePath) })),
            pagination: { total, page: pageNum, limit: pageSize, pages: Math.ceil(total / pageSize) },
        });
    }
    catch (err) {
        next(err);
    }
});
router.get('/projects/:slug', async (req, res, next) => {
    try {
        const project = await prisma_1.prisma.project.findUnique({
            where: { slug: req.params.slug },
            include: { images: { orderBy: { order: 'asc' } } },
        });
        if (!project) {
            res.status(404).json({ error: 'Project not found.' });
            return;
        }
        res.json({
            ...project,
            mainImageUrl: (0, helpers_1.fileUrl)(req, project.mainImagePath),
            images: project.images.map((img) => ({ ...img, imageUrl: (0, helpers_1.fileUrl)(req, img.imagePath) })),
        });
    }
    catch (err) {
        next(err);
    }
});
// ─── Gallery ──────────────────────────────────────────────────────────────────
router.get('/gallery', async (req, res, next) => {
    try {
        const validCategories = ['COMPLETED', 'WORKERS', 'PROGRESS', 'GENERAL'];
        const { category } = req.query;
        const where = { isActive: true };
        if (category && validCategories.includes(category.toUpperCase())) {
            where.category = category.toUpperCase();
        }
        const images = await prisma_1.prisma.galleryImage.findMany({
            where,
            orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
        });
        res.json(images.map((img) => ({ ...img, imageUrl: (0, helpers_1.fileUrl)(req, img.imagePath) })));
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
