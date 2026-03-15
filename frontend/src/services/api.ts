import axios, { AxiosError } from 'axios'
import type {
  CompanyInfo, Service, Project, ProjectsResponse,
  GalleryImage, ContactInput
} from '../types'

const BASE_URL = (import.meta as unknown as { env: Record<string, string> }).env.VITE_API_BASE_URL ?? '/api/v1'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
})

// Attach JWT token for admin calls
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('admin_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Normalize errors
api.interceptors.response.use(
  (res) => res,
  (err: AxiosError) => {
    if (err.code === 'ECONNABORTED') throw new Error('Request timed out.')
    if (!err.response) throw new Error('Network error. Check your connection.')
    if (err.response.status === 429) throw new Error('Too many requests. Please wait and try again.')
    if (err.response.status >= 500) throw new Error('Server error. Please try again later.')
    throw err
  }
)

// ─── Public API ───────────────────────────────────────────────────────────────
export const companyAPI = {
  getInfo: () => api.get<CompanyInfo>('/core/info'),
}

export const servicesAPI = {
  getAll:    ()           => api.get<Service[]>('/services'),
  getBySlug: (slug: string) => api.get<Service>(`/services/${slug}`),
}

export const projectsAPI = {
  getAll:      (params: Record<string, string | number | boolean> = {}) =>
                 api.get<ProjectsResponse>('/projects', { params }),
  getBySlug:   (slug: string) => api.get<Project>(`/projects/${slug}`),
  getFeatured: () => api.get<ProjectsResponse>('/projects', { params: { featured: true } }),
  getByStatus: (status: string) => api.get<ProjectsResponse>('/projects', { params: { status } }),
}

export const galleryAPI = {
  getAll: (params: Record<string, string> = {}) =>
    api.get<GalleryImage[]>('/gallery', { params }),
}

export const contactAPI = {
  submit: (data: ContactInput) => api.post('/contact', data),
}

// ─── Admin API ────────────────────────────────────────────────────────────────
export const adminAPI = {
  login: (email: string, password: string) =>
    api.post<{ token: string; admin: { id: number; email: string; name: string } }>(
      '/admin/login', { email, password }
    ),

  // Messages
  getMessages: () => api.get('/admin/messages'),
  updateMessage: (id: number, data: { status?: string; adminNotes?: string }) =>
    api.patch(`/admin/messages/${id}`, data),

  // Services (multipart for image upload)
  adminGetServices: () => api.get('/admin/services'),
  createService: (form: FormData) =>
    api.post('/admin/services', form, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateService: (id: number, form: FormData) =>
    api.put(`/admin/services/${id}`, form, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteService: (id: number) => api.delete(`/admin/services/${id}`),

  // Projects
  adminGetProjects: () => api.get('/admin/projects'),
  createProject: (form: FormData) =>
    api.post('/admin/projects', form, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateProject: (id: number, form: FormData) =>
    api.put(`/admin/projects/${id}`, form, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteProject: (id: number) => api.delete(`/admin/projects/${id}`),

  // Gallery
  adminGetGallery: () => api.get('/admin/gallery'),
  uploadGalleryImage: (form: FormData) =>
    api.post('/admin/gallery', form, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteGalleryImage: (id: number) => api.delete(`/admin/gallery/${id}`),

  // Company Info
  getCompany: () => api.get('/admin/company'),
  updateCompany: (form: FormData) =>
    api.put('/admin/company', form, { headers: { 'Content-Type': 'multipart/form-data' } }),
}

export default api
