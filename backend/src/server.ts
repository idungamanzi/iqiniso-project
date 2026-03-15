import 'dotenv/config'
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import compression from 'compression'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import path from 'path'

import publicRoutes  from './routes/public'
import contactRoute  from './routes/contact'
import adminRoutes   from './routes/admin'
import { errorHandler, notFoundHandler } from './middleware/errorHandler'

const app  = express()
const PORT = parseInt(process.env.PORT ?? '3001')
const UPLOAD_DIR = process.env.UPLOAD_DIR ?? 'uploads'

// Block common attack probe paths
app.use((req, res, next) => {
  const BLOCKED = [
    '/.env', '/config', '/config.json', '/.git',
    '/wp-admin', '/phpmyadmin', '/phpinfo',
    '/server-status', '/.htaccess', '/web.config',
  ]
  if (BLOCKED.some((path) => req.path.toLowerCase().startsWith(path))) {
    res.status(404).json({ error: 'Not found.' })
    return
  }
  next()
})
// ─── Security Middleware ──────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow media files from frontend
}))

app.use(cors({
  origin: (process.env.CORS_ORIGINS ?? 'http://localhost:5173').split(',').map((o) => o.trim()),
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,
}))

// ─── General Rate Limit ───────────────────────────────────────────────────────
app.use(rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX ?? '100'),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please slow down.' },
}))

// ─── Parsing & Compression ───────────────────────────────────────────────────
app.use(compression())
app.use(express.json({ limit: '2mb' }))
app.use(express.urlencoded({ extended: true, limit: '2mb' }))

// ─── Logging ─────────────────────────────────────────────────────────────────
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))

// ─── Static Media Serving ────────────────────────────────────────────────────
// Serve uploaded files — disable directory listing
app.use('/uploads', express.static(path.resolve(UPLOAD_DIR), {
  index: false,
  dotfiles: 'deny',
}))

// ─── Routes ───────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'healthy', service: 'iqiniso-api' }))

app.use('/api/v1',         publicRoutes)
app.use('/api/v1/contact', contactRoute)
app.use('/api/v1/admin',   adminRoutes)

// ─── Error Handling ───────────────────────────────────────────────────────────
app.use(notFoundHandler)
app.use(errorHandler)

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`
  ┌─────────────────────────────────────────┐
  │   IQINISO Construction API              │
  │   http://localhost:${PORT}                  │
  │   ENV: ${process.env.NODE_ENV ?? 'development'}                    │
  └─────────────────────────────────────────┘
  `)
})

export default app
