import { useState, useEffect, useRef } from 'react'
import { adminAPI } from '../services/api'
import toast from 'react-hot-toast'

interface GalleryImage {
  id: number
  title: string
  imageUrl: string | null
  category: string
  altText: string
  order: number
  isActive: boolean
}

const CATEGORIES = ['GENERAL', 'COMPLETED', 'WORKERS', 'PROGRESS']

export default function AdminGallery() {
  const [images,   setImages]  = useState<GalleryImage[]>([])
  const [loading,  setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [filter,   setFilter]  = useState('')
  const [form, setForm] = useState({ title: '', category: 'GENERAL', altText: '', order: '0' })
  const fileRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const load = () => {
    setLoading(true)
    adminAPI.adminGetGallery()
      .then((r) => setImages(r.data as GalleryImage[]))
      .catch(() => toast.error('Failed to load gallery.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleUpload = async () => {
    if (!selectedFile) { toast.error('Please select an image.'); return }
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('image',    selectedFile)
      fd.append('title',    form.title)
      fd.append('category', form.category)
      fd.append('altText',  form.altText)
      fd.append('order',    form.order)
      await adminAPI.uploadGalleryImage(fd)
      toast.success('Image uploaded.')
      setSelectedFile(null)
      setForm({ title: '', category: 'GENERAL', altText: '', order: '0' })
      if (fileRef.current) fileRef.current.value = ''
      load()
    } catch {
      toast.error('Failed to upload image.')
    } finally { setUploading(false) }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this image? This cannot be undone.')) return
    try {
      await adminAPI.deleteGalleryImage(id)
      toast.success('Image deleted.')
      load()
    } catch { toast.error('Failed to delete image.') }
  }

  const filtered = filter ? images.filter((i) => i.category === filter) : images

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', marginBottom: '1.5rem' }}>Gallery</h1>

      {/* Upload panel */}
      <div className="admin-card" style={{ marginBottom: '1.5rem' }}>
        <div className="admin-card__header">
          <div className="admin-card__title">Upload New Image</div>
        </div>
        <div className="admin-card__body">
          <div className="admin-form-grid">
            <div className="admin-form-group admin-form-grid--full">
              <label className="admin-label">Image File *</label>
              <div className="admin-file-input" onClick={() => fileRef.current?.click()}>
                {selectedFile ? `📎 ${selectedFile.name}` : 'Click to select image (JPEG, PNG, WebP)'}
              </div>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
                onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)} />
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Title (optional)</label>
              <input className="admin-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Newcastle project 2025" />
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Category</label>
              <select className="admin-select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Alt Text (accessibility)</label>
              <input className="admin-input" value={form.altText} onChange={(e) => setForm({ ...form, altText: e.target.value })} placeholder="Describe the image" />
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Display Order</label>
              <input type="number" className="admin-input" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} min="0" />
            </div>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <button className="admin-btn admin-btn--primary" onClick={handleUpload} disabled={uploading || !selectedFile}>
              {uploading ? 'Uploading…' : '↑ Upload Image'}
            </button>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <button className={`admin-btn admin-btn--sm ${!filter ? 'admin-btn--primary' : 'admin-btn--ghost'}`} onClick={() => setFilter('')}>All ({images.length})</button>
        {CATEGORIES.map((c) => (
          <button key={c} className={`admin-btn admin-btn--sm ${filter === c ? 'admin-btn--primary' : 'admin-btn--ghost'}`} onClick={() => setFilter(c)}>
            {c} ({images.filter((i) => i.category === c).length})
          </button>
        ))}
      </div>

      {/* Image grid */}
      {loading ? (
        <div className="admin-empty">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="admin-empty">No images in this category yet.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
          {filtered.map((img) => (
            <div key={img.id} style={{ background: 'white', borderRadius: 'var(--radius-md)', overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
              <div style={{ position: 'relative', aspectRatio: '4/3' }}>
                <img
                  src={img.imageUrl ?? ''}
                  alt={img.altText || img.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
                <span style={{ position: 'absolute', top: 6, left: 6, background: 'rgba(0,0,0,0.6)', color: 'white', fontSize: '0.65rem', padding: '2px 6px', borderRadius: 3 }}>
                  {img.category}
                </span>
              </div>
              <div style={{ padding: '0.6rem' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-mid)', marginBottom: '0.4rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {img.title || 'Untitled'}
                </div>
                <button className="admin-btn admin-btn--danger admin-btn--sm" style={{ width: '100%', justifyContent: 'center' }} onClick={() => handleDelete(img.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
