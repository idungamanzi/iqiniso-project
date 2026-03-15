import { Router, Request, Response, NextFunction } from 'express'
import { prisma } from '../lib/prisma'
import { fileUrl } from '../utils/helpers'

const router = Router()

// ─── Company Info ─────────────────────────────────────────────────────────────
router.get('/core/info', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const info = await prisma.companyInfo.findFirst()
    if (!info) {
      res.status(503).json({ error: 'Company information not configured yet.' })
      return
    }
    res.json({ ...info, logoUrl: fileUrl(req, info.logoPath) })
  } catch (err) { next(err) }
})

// ─── Services ─────────────────────────────────────────────────────────────────
router.get('/services', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const services = await prisma.service.findMany({
      where: { isActive: true },
      orderBy: [{ order: 'asc' }, { title: 'asc' }],
    })
    res.json(services.map((s) => ({ ...s, imageUrl: fileUrl(req, s.imagePath) })))
  } catch (err) { next(err) }
})

router.get('/services/:slug', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const service = await prisma.service.findUnique({
      where: { slug: req.params.slug, isActive: true },
    })
    if (!service) { res.status(404).json({ error: 'Service not found.' }); return }
    res.json({ ...service, imageUrl: fileUrl(req, service.imagePath) })
  } catch (err) { next(err) }
})

// ─── Projects ─────────────────────────────────────────────────────────────────
router.get('/projects', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, featured, page = '1', limit = '12' } = req.query as Record<string, string>

    const where: Record<string, unknown> = {}
    if (status && ['COMPLETED', 'ONGOING', 'PLANNED'].includes(status.toUpperCase())) {
      where.status = status.toUpperCase()
    }
    if (featured === 'true') where.isFeatured = true

    const pageNum  = Math.max(1, parseInt(page))
    const pageSize = Math.min(50, Math.max(1, parseInt(limit)))
    const skip     = (pageNum - 1) * pageSize

    const [total, projects] = await Promise.all([
      prisma.project.count({ where }),
      prisma.project.findMany({
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
    ])

    res.json({
      data: projects.map((p) => ({ ...p, mainImageUrl: fileUrl(req, p.mainImagePath) })),
      pagination: { total, page: pageNum, limit: pageSize, pages: Math.ceil(total / pageSize) },
    })
  } catch (err) { next(err) }
})

router.get('/projects/:slug', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const project = await prisma.project.findUnique({
      where: { slug: req.params.slug },
      include: { images: { orderBy: { order: 'asc' } } },
    })
    if (!project) { res.status(404).json({ error: 'Project not found.' }); return }
    res.json({
      ...project,
      mainImageUrl: fileUrl(req, project.mainImagePath),
      images: project.images.map((img) => ({ ...img, imageUrl: fileUrl(req, img.imagePath) })),
    })
  } catch (err) { next(err) }
})

// ─── Gallery ──────────────────────────────────────────────────────────────────
router.get('/gallery', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validCategories = ['COMPLETED', 'WORKERS', 'PROGRESS', 'GENERAL']
    const { category } = req.query as Record<string, string>

    const where: Record<string, unknown> = { isActive: true }
    if (category && validCategories.includes(category.toUpperCase())) {
      where.category = category.toUpperCase()
    }

    const images = await prisma.galleryImage.findMany({
      where,
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    })
    res.json(images.map((img) => ({ ...img, imageUrl: fileUrl(req, img.imagePath) })))
  } catch (err) { next(err) }
})

export default router
