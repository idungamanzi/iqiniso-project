import { Router, Request, Response, NextFunction } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import rateLimit from 'express-rate-limit'
import { prisma } from '../lib/prisma'
import { requireAuth } from '../middleware/auth'
import { uploadService, uploadProject, uploadGallery, uploadCompany } from '../middleware/upload'
import { serviceSchema, projectSchema, companyInfoSchema, loginSchema } from '../utils/schemas'
import { slugify, fileUrl } from '../utils/helpers'
import fs from 'fs'

const router = Router()

// Strict rate limit: 5 login attempts per 15 minutes per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many login attempts. Try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
})

// ─── Auth ─────────────────────────────────────────────────────────────────────
router.post('/login', loginLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = loginSchema.parse(req.body)

    const admin = await prisma.adminUser.findUnique({ where: { email } })
    if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
      // Same response for both "not found" and "wrong password" — prevents enumeration
      res.status(401).json({ error: 'Invalid credentials.' })
      return
    }

    const secret = process.env.JWT_SECRET!
    const token = jwt.sign({ adminId: admin.id, email: admin.email }, secret, { expiresIn: '4h' })
    res.json({ token, admin: { id: admin.id, email: admin.email, name: admin.name } })
  } catch (err) { next(err) }
})

// All routes below require authentication
router.use(requireAuth)

// ─── Company Info ─────────────────────────────────────────────────────────────
router.get('/company', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const info = await prisma.companyInfo.findFirst()
    res.json(info ? { ...info, logoUrl: fileUrl(req, info.logoPath) } : null)
  } catch (err) { next(err) }
})

router.put('/company', uploadCompany.single('logo'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = companyInfoSchema.parse(
      typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    )

    const existing = await prisma.companyInfo.findFirst()
    const logoPath = req.file ? req.file.path : undefined

    // Delete old logo if a new one is uploaded
    if (logoPath && existing?.logoPath) {
      fs.unlink(existing.logoPath, () => {})
    }

    const info = await prisma.companyInfo.upsert({
      where: { id: 1 },
      update: { ...data, ...(logoPath ? { logoPath } : {}) },
      create: { id: 1, ...data, ...(logoPath ? { logoPath } : {}) },
    })

    res.json({ ...info, logoUrl: fileUrl(req, info.logoPath) })
  } catch (err) { next(err) }
})

// ─── Services ─────────────────────────────────────────────────────────────────
router.get('/services', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const services = await prisma.service.findMany({ orderBy: [{ order: 'asc' }, { title: 'asc' }] })
    res.json(services.map((s) => ({ ...s, imageUrl: fileUrl(req, s.imagePath) })))
  } catch (err) { next(err) }
})

router.post('/services', uploadService.single('image'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = serviceSchema.parse(typeof req.body === 'string' ? JSON.parse(req.body) : req.body)
    const slug = slugify(data.title)
    const service = await prisma.service.create({
      data: { ...data, slug, imagePath: req.file?.path ?? null },
    })
    res.status(201).json({ ...service, imageUrl: fileUrl(req, service.imagePath) })
  } catch (err) { next(err) }
})

router.put('/services/:id', uploadService.single('image'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id)
    const data = serviceSchema.partial().parse(typeof req.body === 'string' ? JSON.parse(req.body) : req.body)

    const existing = await prisma.service.findUnique({ where: { id } })
    if (!existing) { res.status(404).json({ error: 'Service not found.' }); return }

    const imagePath = req.file ? req.file.path : undefined
    if (imagePath && existing.imagePath) fs.unlink(existing.imagePath, () => {})

    const updated = await prisma.service.update({
      where: { id },
      data: { ...data, ...(imagePath ? { imagePath } : {}), ...(data.title ? { slug: slugify(data.title) } : {}) },
    })
    res.json({ ...updated, imageUrl: fileUrl(req, updated.imagePath) })
  } catch (err) { next(err) }
})

router.delete('/services/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id)
    const service = await prisma.service.findUnique({ where: { id } })
    if (!service) { res.status(404).json({ error: 'Service not found.' }); return }
    if (service.imagePath) fs.unlink(service.imagePath, () => {})
    await prisma.service.delete({ where: { id } })
    res.status(204).send()
  } catch (err) { next(err) }
})

// ─── Projects ─────────────────────────────────────────────────────────────────
router.get('/projects', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const projects = await prisma.project.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      include: { images: true },
    })
    res.json(projects.map((p) => ({
      ...p,
      mainImageUrl: fileUrl(req, p.mainImagePath),
      images: p.images.map((img) => ({ ...img, imageUrl: fileUrl(req, img.imagePath) })),
    })))
  } catch (err) { next(err) }
})

router.post('/projects', uploadProject.single('mainImage'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = projectSchema.parse(typeof req.body === 'string' ? JSON.parse(req.body) : req.body)
    const slug = slugify(data.title)
    const project = await prisma.project.create({
      data: {
        ...data,
        slug,
        mainImagePath: req.file?.path ?? null,
        startDate: data.startDate ? new Date(data.startDate) : null,
        completionDate: data.completionDate ? new Date(data.completionDate) : null,
      },
    })
    res.status(201).json({ ...project, mainImageUrl: fileUrl(req, project.mainImagePath) })
  } catch (err) { next(err) }
})

router.put('/projects/:id', uploadProject.single('mainImage'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id)
    const data = projectSchema.partial().parse(typeof req.body === 'string' ? JSON.parse(req.body) : req.body)

    const existing = await prisma.project.findUnique({ where: { id } })
    if (!existing) { res.status(404).json({ error: 'Project not found.' }); return }

    const mainImagePath = req.file ? req.file.path : undefined
    if (mainImagePath && existing.mainImagePath) fs.unlink(existing.mainImagePath, () => {})

    const updated = await prisma.project.update({
      where: { id },
      data: {
        ...data,
        ...(mainImagePath ? { mainImagePath } : {}),
        ...(data.title ? { slug: slugify(data.title) } : {}),
        ...(data.startDate ? { startDate: new Date(data.startDate) } : {}),
        ...(data.completionDate ? { completionDate: new Date(data.completionDate) } : {}),
      },
    })
    res.json({ ...updated, mainImageUrl: fileUrl(req, updated.mainImagePath) })
  } catch (err) { next(err) }
})

router.delete('/projects/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id)
    const project = await prisma.project.findUnique({ where: { id }, include: { images: true } })
    if (!project) { res.status(404).json({ error: 'Project not found.' }); return }
    if (project.mainImagePath) fs.unlink(project.mainImagePath, () => {})
    project.images.forEach((img) => fs.unlink(img.imagePath, () => {}))
    await prisma.project.delete({ where: { id } })
    res.status(204).send()
  } catch (err) { next(err) }
})

// ─── Gallery ──────────────────────────────────────────────────────────────────
router.get('/gallery', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const images = await prisma.galleryImage.findMany({ orderBy: [{ order: 'asc' }, { createdAt: 'desc' }] })
    res.json(images.map((img) => ({ ...img, imageUrl: fileUrl(req, img.imagePath) })))
  } catch (err) { next(err) }
})

router.post('/gallery', uploadGallery.single('image'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) { res.status(400).json({ error: 'Image file is required.' }); return }
    const { title = '', category = 'GENERAL', altText = '', order = '0' } = req.body as Record<string, string>
    const image = await prisma.galleryImage.create({
      data: { title, imagePath: req.file.path, category: category as never, altText, order: parseInt(order) },
    })
    res.status(201).json({ ...image, imageUrl: fileUrl(req, image.imagePath) })
  } catch (err) { next(err) }
})

router.delete('/gallery/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id)
    const image = await prisma.galleryImage.findUnique({ where: { id } })
    if (!image) { res.status(404).json({ error: 'Image not found.' }); return }
    fs.unlink(image.imagePath, () => {})
    await prisma.galleryImage.delete({ where: { id } })
    res.status(204).send()
  } catch (err) { next(err) }
})

// ─── Contact Messages ─────────────────────────────────────────────────────────
router.get('/messages', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
    })
    res.json(messages)
  } catch (err) { next(err) }
})

router.patch('/messages/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id)
    const { status, adminNotes } = req.body as { status?: string; adminNotes?: string }
    const updated = await prisma.contactMessage.update({
      where: { id },
      data: { ...(status ? { status: status as never } : {}), ...(adminNotes !== undefined ? { adminNotes } : {}) },
    })
    res.json(updated)
  } catch (err) { next(err) }
})

export default router
