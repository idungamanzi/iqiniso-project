import { useState, useEffect, useRef } from 'react'
import { adminAPI } from '../services/api'
import toast from 'react-hot-toast'

interface Project {
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
  status: string
  isFeatured: boolean
  order: number
}

interface FormState {
  title: string
  description: string
  shortDescription: string
  client: string
  value: string
  location: string
  startDate: string
  completionDate: string
  status: string
  isFeatured: boolean
  order: string
  image: File | null
}

const EMPTY: FormState = {
  title: '', description: '', shortDescription: '',
  client: '', value: '', location: '',
  startDate: '', completionDate: '',
  status: 'ONGOING', isFeatured: false, order: '0', image: null,
}

export default function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading,  setLoading]  = useState(true)
  const [modal,    setModal]    = useState(false)
  const [editing,  setEditing]  = useState<Project | null>(null)
  const [form,     setForm]     = useState<FormState>(EMPTY)
  const [saving,   setSaving]   = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const load = () => {
    setLoading(true)
    adminAPI.adminGetProjects()
      .then((r) => setProjects(r.data as Project[]))
      .catch(() => toast.error('Failed to load projects.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openAdd = () => { setEditing(null); setForm(EMPTY); setModal(true) }

  const openEdit = (p: Project) => {
    setEditing(p)
    setForm({
      title: p.title, description: p.description,
      shortDescription: p.shortDescription, client: p.client,
      value: p.value ? String(p.value) : '',
      location: p.location,
      startDate: p.startDate ? p.startDate.slice(0, 10) : '',
      completionDate: p.completionDate ? p.completionDate.slice(0, 10) : '',
      status: p.status, isFeatured: p.isFeatured,
      order: String(p.order), image: null,
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
      fd.append('client',           form.client)
      fd.append('location',         form.location)
      fd.append('status',           form.status)
      fd.append('isFeatured',       String(form.isFeatured))
      fd.append('order',            form.order)
      if (form.value)          fd.append('value',          form.value)
      if (form.startDate)      fd.append('startDate',      new Date(form.startDate).toISOString())
      if (form.completionDate) fd.append('completionDate', new Date(form.completionDate).toISOString())
      if (form.image)          fd.append('mainImage',      form.image)

      if (editing) {
        await adminAPI.updateProject(editing.id, fd)
        toast.success('Project updated.')
      } else {
        await adminAPI.createProject(fd)
        toast.success('Project created.')
      }
      setModal(false)
      load()
    } catch {
      toast.error('Failed to save project.')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
    try {
      await adminAPI.deleteProject(id)
      toast.success('Project deleted.')
      load()
    } catch { toast.error('Failed to delete project.') }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem' }}>Projects</h1>
        <button className="admin-btn admin-btn--primary" onClick={openAdd}>+ Add Project</button>
      </div>

      <div className="admin-card">
        {loading ? (
          <div className="admin-empty">Loading…</div>
        ) : projects.length === 0 ? (
          <div className="admin-empty">No projects yet. Add your first project.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th><th>Title</th><th>Status</th>
                <th>Client</th><th>Featured</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.id}>
                  <td>
                    {p.mainImageUrl
                      ? <img src={p.mainImageUrl} alt={p.title} className="admin-table__img" />
                      : <div className="admin-table__img" style={{ background: 'var(--color-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🏗️</div>
                    }
                  </td>
                  <td><strong>{p.title}</strong>{p.location && <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>📍 {p.location}</div>}</td>
                  <td><span className={`admin-badge admin-badge--${p.status.toLowerCase()}`}>{p.status}</span></td>
                  <td>{p.client || '—'}</td>
                  <td>{p.isFeatured ? '⭐' : '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => openEdit(p)}>Edit</button>
                      <button className="admin-btn admin-btn--danger admin-btn--sm" onClick={() => handleDelete(p.id, p.title)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <div className="admin-modal-overlay" onClick={() => setModal(false)}>
          <div className="admin-modal" style={{ maxWidth: 700 }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal__header">
              <div className="admin-modal__title">{editing ? 'Edit Project' : 'Add Project'}</div>
              <button className="admin-modal__close" onClick={() => setModal(false)}>✕</button>
            </div>
            <div className="admin-modal__body">
              <div className="admin-form-grid">
                <div className="admin-form-group admin-form-grid--full">
                  <label className="admin-label">Project Title *</label>
                  <input className="admin-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>
                <div className="admin-form-group admin-form-grid--full">
                  <label className="admin-label">Short Description</label>
                  <input className="admin-input" value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} />
                </div>
                <div className="admin-form-group admin-form-grid--full">
                  <label className="admin-label">Full Description *</label>
                  <textarea className="admin-textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Client</label>
                  <input className="admin-input" value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Location</label>
                  <input className="admin-input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Project Value (ZAR)</label>
                  <input type="number" className="admin-input" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} placeholder="e.g. 250000" />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Status</label>
                  <select className="admin-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option value="ONGOING">Ongoing</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="PLANNED">Planned</option>
                  </select>
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Start Date</label>
                  <input type="date" className="admin-input" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Completion Date</label>
                  <input type="date" className="admin-input" value={form.completionDate} onChange={(e) => setForm({ ...form, completionDate: e.target.value })} />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Featured on Home Page</label>
                  <select className="admin-select" value={form.isFeatured ? 'true' : 'false'} onChange={(e) => setForm({ ...form, isFeatured: e.target.value === 'true' })}>
                    <option value="true">Yes — show on home page</option>
                    <option value="false">No</option>
                  </select>
                </div>
                <div className="admin-form-group admin-form-grid--full">
                  <label className="admin-label">Main Image</label>
                  <div className="admin-file-input" onClick={() => fileRef.current?.click()}>
                    {form.image ? <div>📎 {form.image.name}</div> : <div>Click to upload main project image</div>}
                    {editing?.mainImageUrl && !form.image && (
                      <img src={editing.mainImageUrl} alt="current" className="admin-preview-img" />
                    )}
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
                    onChange={(e) => setForm({ ...form, image: e.target.files?.[0] ?? null })} />
                </div>
              </div>
            </div>
            <div className="admin-modal__footer">
              <button className="admin-btn admin-btn--ghost" onClick={() => setModal(false)}>Cancel</button>
              <button className="admin-btn admin-btn--primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : editing ? 'Update Project' : 'Create Project'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
