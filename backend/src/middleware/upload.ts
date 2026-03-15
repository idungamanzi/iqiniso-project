import multer, { FileFilterCallback } from 'multer'
import path from 'path'
import fs from 'fs'
import { Request } from 'express'

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE_MB ?? '10') * 1024 * 1024
const UPLOAD_DIR = process.env.UPLOAD_DIR ?? 'uploads'

// Ensure upload subdirectories exist on startup
const SUBDIRS = ['services', 'projects', 'gallery', 'company']
SUBDIRS.forEach((dir) => {
  const fullPath = path.join(UPLOAD_DIR, dir)
  if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true })
})

function storage(subdir: string) {
  return multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, path.join(UPLOAD_DIR, subdir))
    },
    filename: (_req, file, cb) => {
      // Sanitize filename — strip path traversal attempts
      const ext = path.extname(file.originalname).toLowerCase()
      const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`
      cb(null, safeName)
    },
  })
}

function fileFilter(_req: Request, file: Express.Multer.File, cb: FileFilterCallback) {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Only JPEG, PNG, and WebP images are allowed.'))
  }
}

export const uploadService = multer({ storage: storage('services'), fileFilter, limits: { fileSize: MAX_FILE_SIZE } })
export const uploadProject  = multer({ storage: storage('projects'), fileFilter, limits: { fileSize: MAX_FILE_SIZE } })
export const uploadGallery  = multer({ storage: storage('gallery'),  fileFilter, limits: { fileSize: MAX_FILE_SIZE } })
export const uploadCompany  = multer({ storage: storage('company'),  fileFilter, limits: { fileSize: MAX_FILE_SIZE } })
