import { z } from 'zod'

// ─── Contact ──────────────────────────────────────────────────────────────────
const SPAM_KEYWORDS = ['casino', 'viagra', 'lottery', 'click here', 'earn money fast']

function noSpam(val: string) {
  const lower = val.toLowerCase()
  return !SPAM_KEYWORDS.some((kw) => lower.includes(kw))
}

export const contactSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(150)
    .regex(/^[a-zA-Z\s'\-.]+$/, 'Name contains invalid characters'),
  email: z.string().email('Invalid email address').max(254),
  phone: z
    .string()
    .max(20)
    .regex(/^[\d\s\-+().]*$/, 'Invalid phone number')
    .optional()
    .or(z.literal('')),
  subject: z
    .string()
    .min(3, 'Subject is required')
    .max(300)
    .refine(noSpam, 'Subject contains disallowed content'),
  message: z
    .string()
    .min(20, 'Message must be at least 20 characters')
    .max(5000)
    .refine(noSpam, 'Message contains disallowed content')
    .refine(
      (val) => (val.match(/https?:\/\//g) ?? []).length <= 3,
      'Message contains too many links'
    ),
})

export type ContactInput = z.infer<typeof contactSchema>

// ─── Admin Login ──────────────────────────────────────────────────────────────
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

// ─── Service ──────────────────────────────────────────────────────────────────
export const serviceSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().min(10),
  shortDescription: z.string().max(300).optional(),
  icon: z.string().max(50).optional(),
  isActive: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
})

// ─── Project ──────────────────────────────────────────────────────────────────
export const projectSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().min(10),
  shortDescription: z.string().max(300).optional(),
  client: z.string().max(200).optional(),
  value: z.number().positive().optional().nullable(),
  location: z.string().max(300).optional(),
  startDate: z.string().datetime().optional().nullable(),
  completionDate: z.string().datetime().optional().nullable(),
  status: z.enum(['COMPLETED', 'ONGOING', 'PLANNED']).optional(),
  isFeatured: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
})

// ─── Company Info ─────────────────────────────────────────────────────────────
export const companyInfoSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  tagline: z.string().max(300).optional(),
  aboutShort: z.string().max(500).optional(),
  aboutFull: z.string().optional(),
  vision: z.string().optional(),
  mission: z.string().optional(),
  policy: z.string().optional(),
  yearEstablished: z.number().int().min(1900).max(new Date().getFullYear()).optional().nullable(),
  registrationNumber: z.string().max(100).optional(),
  registrationCertificateUrl: z.string().url().optional().or(z.literal('')),
  physicalAddress: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().max(20).optional(),
  whatsapp: z.string().max(20).optional(),
  facebookUrl: z.string().url().optional().or(z.literal('')),
  instagramUrl: z.string().url().optional().or(z.literal('')),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  twitterUrl: z.string().url().optional().or(z.literal('')),
  googleMapsEmbedUrl: z.string().optional(),
})
