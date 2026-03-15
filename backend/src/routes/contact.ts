import { Router, Request, Response, NextFunction } from 'express'
import rateLimit from 'express-rate-limit'
import nodemailer from 'nodemailer'
import { prisma } from '../lib/prisma'
import { contactSchema } from '../utils/schemas'
import { getClientIp } from '../utils/helpers'

const router = Router()

// Strict rate limit for contact: 5 requests per hour per IP
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: parseInt(process.env.CONTACT_RATE_LIMIT_MAX ?? '5'),
  message: { error: 'Too many messages submitted. Please wait before trying again.' },
  standardHeaders: true,
  legacyHeaders: false,
})

router.post('/', contactLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate — throws ZodError which is caught by errorHandler middleware
    const data = contactSchema.parse(req.body)

    const message = await prisma.contactMessage.create({
      data: {
        ...data,
        phone: data.phone ?? '',
        ipAddress: getClientIp(req),
        userAgent: (req.headers['user-agent'] ?? '').slice(0, 500),
      },
    })

    // Send email notification (non-blocking — failure won't break the response)
    sendEmailNotification(message).catch((err: unknown) => {
      console.error('[CONTACT EMAIL] Failed to send notification:', err)
    })

    res.status(201).json({
      message: 'Your message has been received. We will be in touch shortly.',
    })
  } catch (err) { next(err) }
})

async function sendEmailNotification(msg: {
  name: string; email: string; phone: string; subject: string; message: string; createdAt: Date
}) {
  const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, CONTACT_RECIPIENT } = process.env
  if (!EMAIL_HOST || !EMAIL_USER || !EMAIL_PASS || !CONTACT_RECIPIENT) return

  const transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: parseInt(EMAIL_PORT ?? '587'),
    secure: false,
    auth: { user: EMAIL_USER, pass: EMAIL_PASS },
  })

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
  })
}

export default router
