import { useState, useEffect, useRef } from 'react'
import { adminAPI } from '../services/api'
import toast from 'react-hot-toast'

interface Service {
  id: number
  title: string
  slug: string
  description: string
  shortDescription: string
  imageUrl: string | null
  isActive: boolean
  order: number
}

interface FormState {
  title: string
  description: string
  shortDescription: string
  order: string
  isActive: boolean
  image: File | null
}

const EMPTY: FormState = {
  title: '', description: '', shortDescription: '',
  order: '0', isActive: true, image: null,
}

export default function AdminServices() {
  const [services, setServices] = useState<Service[]>([])
  const [loading,  setLoading]  = useState(true)
  const [modal,    setModal]    = useState(false)
  const [editing,  setEditing]  = useState<Service | null>(null)
  const [form,     setForm]     = useState<FormState>(EMPTY)
  const [saving,   setSaving]   = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const load = () => {
    setLoading(true)
    adminAPI.adminGetServices()
      .then((r) => setServices(r.data as Service[]))
      .catch(() => toast.error('Failed to load services.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openAdd = () => {
    setEditing(null)
    setForm(EMPTY)
    setModal(true)
  }

  const openEdit = (s: Service) => {
    setEditing(s)
    setForm({
      title: s.title,
      description: s.description,
      shortDescription: s.shortDescription,
      order: String(s.order),
      isActive: s.isActive,
      image: null,
    })
    setModal(true)
  }

  const handleSave = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      toast.error('Title and description are required.')
      return
    }
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('title',            form.title)
      fd.append('description',      form.description)
      fd.append('shortDescription', form.shortDescription)
      fd.append('order',            form.order)
      fd.append('isActive',         String(form.isActive))
      if (form.image) fd.append('image', form.image)

      if (editing) {
        await adminAPI.updateService(editing.id, fd)
        toast.success('Service updated.')
      } else {
        await adminAPI.createService(fd)
        toast.success('Service created.')
      }
      setModal(false)
      load()
    } catch {
      toast.error('Failed to save service.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
    try {
      await adminAPI.deleteService(id)
      toast.success('Service deleted.')
      load()
    } catch {
      toast.error('Failed to delete service.')
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem' }}>Services</h1>
        <button className="admin-btn admin-btn--primary" onClick={openAdd}>+ Add Service</button>
      </div>

      <div className="admin-card">
        {loading ? (
          <div className="admin-empty">Loading…</div>
        ) : services.length === 0 ? (
          <div className="admin-empty">No services yet. Add your first service.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Title</th>
                <th>Short Description</th>
                <th>Order</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map((s) => (
                <tr key={s.id}>
                  <td>
                    {s.imageUrl
                      ? <img src={s.imageUrl} alt={s.title} className="admin-table__img" />
                      : <div className="admin-table__img" style={{ background: 'var(--color-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🔧</div>
                    }
                  </td>
                  <td><strong>{s.title}</strong></td>
                  <td style={{ color: 'var(--color-mid)', maxWidth: 200 }}>{s.shortDescription || '—'}</td>
                  <td>{s.order}</td>
                  <td>
                    <span className={`admin-badge admin-badge--${s.isActive ? 'active' : 'inactive'}`}>
                      {s.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => openEdit(s)}>Edit</button>
                      <button className="admin-btn admin-btn--danger admin-btn--sm" onClick={() => handleDelete(s.id, s.title)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="admin-modal-overlay" onClick={() => setModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal__header">
              <div className="admin-modal__title">{editing ? 'Edit Service' : 'Add Service'}</div>
              <button className="admin-modal__close" onClick={() => setModal(false)}>✕</button>
            </div>
            <div className="admin-modal__body">
              <div className="admin-form-grid">
                <div className="admin-form-group admin-form-grid--full">
                  <label className="admin-label">Title *</label>
                  <input className="admin-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>
                <div className="admin-form-group admin-form-grid--full">
                  <label className="admin-label">Short Description</label>
                  <input className="admin-input" value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} placeholder="One line summary" />
                </div>
                <div className="admin-form-group admin-form-grid--full">
                  <label className="admin-label">Full Description *</label>
                  <textarea className="admin-textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Display Order</label>
                  <input type="number" className="admin-input" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} min="0" />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Status</label>
                  <select className="admin-select" value={form.isActive ? 'true' : 'false'} onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })}>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
                <div className="admin-form-group admin-form-grid--full">
                  <label className="admin-label">Image</label>
                  <div className="admin-file-input" onClick={() => fileRef.current?.click()}>
                    {form.image
                      ? <><div>📎 {form.image.name}</div></>
                      : <div>Click to upload image (JPEG, PNG, WebP — max 10MB)</div>
                    }
                    {editing?.imageUrl && !form.image && (
                      <img src={editing.imageUrl} alt="current" className="admin-preview-img" />
                    )}
                  </div>
                  <input
                    ref={fileRef} type="file" accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => setForm({ ...form, image: e.target.files?.[0] ?? null })}
                  />
                </div>
              </div>
            </div>
            <div className="admin-modal__footer">
              <button className="admin-btn admin-btn--ghost" onClick={() => setModal(false)}>Cancel</button>
              <button className="admin-btn admin-btn--primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : editing ? 'Update Service' : 'Create Service'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
