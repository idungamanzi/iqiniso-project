import { useState, useEffect } from 'react'
import { adminAPI } from '../services/api'
import toast from 'react-hot-toast'

interface Message {
  id: number
  name: string
  email: string
  phone: string
  subject: string
  message: string
  status: string
  ipAddress: string
  createdAt: string
  adminNotes: string
}

const STATUS_OPTIONS = ['UNREAD', 'READ', 'REPLIED', 'ARCHIVED']

export default function AdminMessages() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading,  setLoading]  = useState(true)
  const [selected, setSelected] = useState<Message | null>(null)
  const [notes,    setNotes]    = useState('')
  const [filter,   setFilter]   = useState('')
  const [saving,   setSaving]   = useState(false)

  const load = () => {
    setLoading(true)
    adminAPI.getMessages()
      .then((r) => setMessages(r.data as Message[]))
      .catch(() => toast.error('Failed to load messages.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openMessage = (m: Message) => {
    setSelected(m)
    setNotes(m.adminNotes)
    // Auto-mark as read
    if (m.status === 'UNREAD') {
      adminAPI.updateMessage(m.id, { status: 'READ' })
        .then(() => setMessages((prev) => prev.map((msg) => msg.id === m.id ? { ...msg, status: 'READ' } : msg)))
        .catch(() => {})
    }
  }

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await adminAPI.updateMessage(id, { status })
      setMessages((prev) => prev.map((m) => m.id === id ? { ...m, status } : m))
      if (selected?.id === id) setSelected((s) => s ? { ...s, status } : s)
      toast.success('Status updated.')
    } catch { toast.error('Failed to update status.') }
  }

  const handleSaveNotes = async () => {
    if (!selected) return
    setSaving(true)
    try {
      await adminAPI.updateMessage(selected.id, { adminNotes: notes })
      setMessages((prev) => prev.map((m) => m.id === selected.id ? { ...m, adminNotes: notes } : m))
      toast.success('Notes saved.')
    } catch { toast.error('Failed to save notes.') }
    finally { setSaving(false) }
  }

  const filtered = filter ? messages.filter((m) => m.status === filter) : messages
  const unreadCount = messages.filter((m) => m.status === 'UNREAD').length

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem' }}>
          Messages {unreadCount > 0 && <span style={{ fontSize: '1rem', background: 'var(--color-amber)', color: 'black', borderRadius: '99px', padding: '0.1rem 0.6rem', marginLeft: '0.5rem' }}>{unreadCount} new</span>}
        </h1>
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <button className={`admin-btn admin-btn--sm ${!filter ? 'admin-btn--primary' : 'admin-btn--ghost'}`} onClick={() => setFilter('')}>All</button>
        {STATUS_OPTIONS.map((s) => (
          <button key={s} className={`admin-btn admin-btn--sm ${filter === s ? 'admin-btn--primary' : 'admin-btn--ghost'}`} onClick={() => setFilter(s)}>
            {s} ({messages.filter((m) => m.status === s).length})
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 1fr' : '1fr', gap: '1.5rem' }}>
        {/* Message list */}
        <div className="admin-card">
          {loading ? (
            <div className="admin-empty">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="admin-empty">No messages found.</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr><th>From</th><th>Subject</th><th>Date</th><th>Status</th></tr>
              </thead>
              <tbody>
                {filtered.map((m) => (
                  <tr key={m.id} onClick={() => openMessage(m)} style={{ cursor: 'pointer', fontWeight: m.status === 'UNREAD' ? 700 : 400 }}>
                    <td>
                      <div>{m.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>{m.email}</div>
                    </td>
                    <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.subject}</td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--color-muted)', whiteSpace: 'nowrap' }}>
                      {new Date(m.createdAt).toLocaleDateString()}
                    </td>
                    <td><span className={`admin-badge admin-badge--${m.status.toLowerCase()}`}>{m.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Message detail */}
        {selected && (
          <div className="admin-card">
            <div className="admin-card__header">
              <div className="admin-card__title">{selected.subject}</div>
              <button className="admin-modal__close" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="admin-card__body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem 1rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
                <div><span style={{ color: 'var(--color-muted)' }}>From:</span> <strong>{selected.name}</strong></div>
                <div><span style={{ color: 'var(--color-muted)' }}>Email:</span> <a href={`mailto:${selected.email}`} style={{ color: 'var(--color-amber)' }}>{selected.email}</a></div>
                {selected.phone && <div><span style={{ color: 'var(--color-muted)' }}>Phone:</span> {selected.phone}</div>}
                <div><span style={{ color: 'var(--color-muted)' }}>Date:</span> {new Date(selected.createdAt).toLocaleString()}</div>
              </div>

              <div style={{ background: 'var(--color-light)', borderRadius: 'var(--radius-sm)', padding: '1rem', marginBottom: '1.25rem', fontSize: '0.9rem', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                {selected.message}
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label className="admin-label">Reply</label>
                <a
                  href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject)}`}
                  className="admin-btn admin-btn--primary"
                  style={{ display: 'inline-flex' }}
                >
                  ✉️ Reply via Email
                </a>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label className="admin-label">Update Status</label>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {STATUS_OPTIONS.map((s) => (
                    <button
                      key={s}
                      className={`admin-btn admin-btn--sm ${selected.status === s ? 'admin-btn--primary' : 'admin-btn--ghost'}`}
                      onClick={() => handleStatusChange(selected.id, s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="admin-label">Admin Notes</label>
                <textarea className="admin-textarea" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Internal notes — not visible to sender" style={{ minHeight: 80 }} />
                <button className="admin-btn admin-btn--ghost admin-btn--sm" onClick={handleSaveNotes} disabled={saving} style={{ marginTop: '0.5rem' }}>
                  {saving ? 'Saving…' : 'Save Notes'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
