export interface CompanyInfo {
  id: number
  name: string
  tagline: string
  aboutShort: string
  aboutFull: string
  vision: string
  mission: string
  policy: string
  yearEstablished: number | null
  registrationNumber: string
  registrationCertificateUrl: string
  physicalAddress: string
  email: string
  phone: string
  whatsapp: string
  facebookUrl: string
  instagramUrl: string
  linkedinUrl: string
  twitterUrl: string
  googleMapsEmbedUrl: string
  logoUrl: string | null
}

export interface Service {
  id: number
  title: string
  slug: string
  description: string
  shortDescription: string
  imageUrl: string | null
  icon: string
  isActive: boolean
  order: number
}

export type ProjectStatus = 'COMPLETED' | 'ONGOING' | 'PLANNED'

export interface ProjectImage {
  id: number
  imageUrl: string | null
  caption: string
  order: number
}

export interface Project {
  id: number
  title: string
  slug: string
  description: string
  shortDescription: string
  mainImageUrl: string | null
  client: string
  value: number | null
  location: string
  startDate: string | null
  completionDate: string | null
  status: ProjectStatus
  isFeatured: boolean
  images?: ProjectImage[]
}

export interface ProjectsResponse {
  data: Project[]
  pagination: { total: number; page: number; limit: number; pages: number }
}

export interface GalleryImage {
  id: number
  title: string
  imageUrl: string | null
  category: 'COMPLETED' | 'WORKERS' | 'PROGRESS' | 'GENERAL'
  altText: string
  order: number
}

export interface ContactMessage {
  id: number
  name: string
  email: string
  phone: string
  subject: string
  message: string
  status: 'UNREAD' | 'READ' | 'REPLIED' | 'ARCHIVED'
  createdAt: string
  adminNotes: string
}

export interface ContactInput {
  name: string
  email: string
  phone?: string
  subject: string
  message: string
}

export interface AdminUser {
  id: number
  email: string
  name: string
}
