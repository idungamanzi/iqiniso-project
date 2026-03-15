import { useState, useEffect, useRef } from 'react'
import { adminAPI } from '../services/api'
import toast from 'react-hot-toast'

interface CompanyForm {
  name: string
  tagline: string
  aboutShort: string
  aboutFull: string
  vision: string
  mission: string
  policy: string
  yearEstablished: string
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
  logo: File | null
  logoUrl?: string | null
}

const EMPTY: CompanyForm = {
  name: '', tagline: '', aboutShort: '', aboutFull: '',
  vision: '', mission: '', policy: '',
  yearEstablished: '', registrationNumber: '', registrationCertificateUrl: '',
  physicalAddress: '', email: '', phone: '', whatsapp: '',
  facebookUrl: '', instagramUrl: '', linkedinUrl: '', twitterUrl: '',
  googleMapsEmbedUrl: '', logo: null, logoUrl: null,
}

export default function AdminCompany() {
  const [form,    setForm]    = useState<CompanyForm>(EMPTY)
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)
  const [tab,     setTab]     = useState<'basic' | 'about' | 'contact' | 'social'>('basic')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    adminAPI.getCompany()
      .then((r) => {
        const d = r.data as Record<string, unknown>
        if (d) setForm({ ...EMPTY, ...d, yearEstablished: d.yearEstablished ? String(d.yearEstablished) : '', logo: null })
      })
      .catch(() => toast.error('Failed to load company info.'))
      .finally(() => setLoading(false))
  }, [])

  const set = (field: keyof CompanyForm, value: string) =>
    setForm((f) => ({ ...f, [field]: value }))

  const handleSave = async () => {
    setSaving(true)
    try {
      const fd = new FormData()
      const fields: (keyof CompanyForm)[] = [
        'name', 'tagline', 'aboutShort', 'aboutFull', 'vision', 'mission', 'policy',
        'registrationNumber', 'registrationCertificateUrl', 'physicalAddress',
        'email', 'phone', 'whatsapp', 'facebookUrl', 'instagramUrl',
        'linkedinUrl', 'twitterUrl', 'googleMapsEmbedUrl',
      ]
      fields.forEach((f) => fd.append(f, (form[f] as string) ?? ''))
      if (form.yearEstablished) fd.append('yearEstablished', form.yearEstablished)
      if (form.logo) fd.append('logo', form.logo)

      await adminAPI.updateCompany(fd)
      toast.success('Company information saved.')
    } catch {
      toast.error('Failed to save. Please try again.')
    } finally { setSaving(false) }
  }

  if (loading) return <div className="admin-empty">Loading…</div>

  const tabs = [
    { key: 'basic',   label: '🏢 Basic Info'   },
    { key: 'about',   label: '📖 About & Vision' },
    { key: 'contact', label: '📞 Contact'       },
    { key: 'social',  label: '🔗 Social & Map'  },
  ] as const

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem' }}>Company Information</h1>
        <button className="admin-btn admin-btn--primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : '💾 Save Changes'}
        </button>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '2px solid var(--color-border)', paddingBottom: '0' }}>
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '0.6rem 1rem', fontFamily: 'var(--font-display)',
              fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: tab === key ? 'var(--color-amber)' : 'var(--color-muted)',
              borderBottom: tab === key ? '2px solid var(--color-amber)' : '2px solid transparent',
              marginBottom: '-2px',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="admin-card">
        <div className="admin-card__body">
          {tab === 'basic' && (
            <div className="admin-form-grid">
              <div className="admin-form-group admin-form-grid--full">
                <label className="admin-label">Company Name</label>
                <input className="admin-input" value={form.name} onChange={(e) => set('name', e.target.value)} />
              </div>
              <div className="admin-form-group admin-form-grid--full">
                <label className="admin-label">Tagline / Slogan</label>
                <input className="admin-input" value={form.tagline} onChange={(e) => set('tagline', e.target.value)} placeholder="e.g. Building the Future, Delivering Excellence" />
              </div>
              <div className="admin-form-group">
                <label className="admin-label">Year Established</label>
                <input type="number" className="admin-input" value={form.yearEstablished} onChange={(e) => set('yearEstablished', e.target.value)} placeholder="e.g. 2015" />
              </div>
              <div className="admin-form-group">
                <label className="admin-label">Registration Number</label>
                <input className="admin-input" value={form.registrationNumber} onChange={(e) => set('registrationNumber', e.target.value)} />
              </div>
              <div className="admin-form-group admin-form-grid--full">
                <label className="admin-label">Registration Certificate URL</label>
                <input className="admin-input" value={form.registrationCertificateUrl} onChange={(e) => set('registrationCertificateUrl', e.target.value)} placeholder="https://..." />
              </div>
              <div className="admin-form-group admin-form-grid--full">
                <label className="admin-label">Logo</label>
                <div className="admin-file-input" onClick={() => fileRef.current?.click()}>
                  {form.logo ? `📎 ${form.logo.name}` : 'Click to upload logo (PNG/SVG recommended)'}
                  {form.logoUrl && !form.logo && (
                    <img src={form.logoUrl} alt="Current logo" style={{ height: 40, marginTop: '0.5rem', display: 'block' }} />
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
                  onChange={(e) => setForm({ ...form, logo: e.target.files?.[0] ?? null })} />
              </div>
            </div>
          )}

          {tab === 'about' && (
            <div className="admin-form-grid">
              <div className="admin-form-group admin-form-grid--full">
                <label className="admin-label">Short Description (shown in hero/footer)</label>
                <textarea className="admin-textarea" style={{ minHeight: 70 }} value={form.aboutShort} onChange={(e) => set('aboutShort', e.target.value)} />
              </div>
              <div className="admin-form-group admin-form-grid--full">
                <label className="admin-label">Full About Us</label>
                <textarea className="admin-textarea" style={{ minHeight: 150 }} value={form.aboutFull} onChange={(e) => set('aboutFull', e.target.value)} />
              </div>
              <div className="admin-form-group">
                <label className="admin-label">Vision</label>
                <textarea className="admin-textarea" value={form.vision} onChange={(e) => set('vision', e.target.value)} />
              </div>
              <div className="admin-form-group">
                <label className="admin-label">Mission</label>
                <textarea className="admin-textarea" value={form.mission} onChange={(e) => set('mission', e.target.value)} />
              </div>
              <div className="admin-form-group admin-form-grid--full">
                <label className="admin-label">Company Policies</label>
                <textarea className="admin-textarea" style={{ minHeight: 150 }} value={form.policy} onChange={(e) => set('policy', e.target.value)} />
              </div>
            </div>
          )}

          {tab === 'contact' && (
            <div className="admin-form-grid">
              <div className="admin-form-group admin-form-grid--full">
                <label className="admin-label">Physical Address</label>
                <textarea className="admin-textarea" style={{ minHeight: 70 }} value={form.physicalAddress} onChange={(e) => set('physicalAddress', e.target.value)} />
              </div>
              <div className="admin-form-group">
                <label className="admin-label">Email Address</label>
                <input type="email" className="admin-input" value={form.email} onChange={(e) => set('email', e.target.value)} />
              </div>
              <div className="admin-form-group">
                <label className="admin-label">Phone Number</label>
                <input className="admin-input" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+27 81 000 0000" />
              </div>
              <div className="admin-form-group">
                <label className="admin-label">WhatsApp Number</label>
                <input className="admin-input" value={form.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} placeholder="+27 81 000 0000" />
              </div>
            </div>
          )}

          {tab === 'social' && (
            <div className="admin-form-grid">
              <div className="admin-form-group">
                <label className="admin-label">Facebook URL</label>
                <input className="admin-input" value={form.facebookUrl} onChange={(e) => set('facebookUrl', e.target.value)} placeholder="https://facebook.com/..." />
              </div>
              <div className="admin-form-group">
                <label className="admin-label">Instagram URL</label>
                <input className="admin-input" value={form.instagramUrl} onChange={(e) => set('instagramUrl', e.target.value)} placeholder="https://instagram.com/..." />
              </div>
              <div className="admin-form-group">
                <label className="admin-label">LinkedIn URL</label>
                <input className="admin-input" value={form.linkedinUrl} onChange={(e) => set('linkedinUrl', e.target.value)} placeholder="https://linkedin.com/..." />
              </div>
              <div className="admin-form-group">
                <label className="admin-label">Twitter / X URL</label>
                <input className="admin-input" value={form.twitterUrl} onChange={(e) => set('twitterUrl', e.target.value)} placeholder="https://twitter.com/..." />
              </div>
              <div className="admin-form-group admin-form-grid--full">
                <label className="admin-label">Google Maps Embed URL</label>
                <input className="admin-input" value={form.googleMapsEmbedUrl} onChange={(e) => set('googleMapsEmbedUrl', e.target.value)} placeholder="https://www.google.com/maps/embed?pb=..." />
                <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginTop: '0.35rem' }}>
                  Get this from Google Maps → Share → Embed a map → copy the src URL only
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
        <button className="admin-btn admin-btn--primary" onClick={handleSave} disabled={saving} style={{ padding: '0.75rem 2rem' }}>
          {saving ? 'Saving…' : '💾 Save All Changes'}
        </button>
      </div>
    </div>
  )
}
