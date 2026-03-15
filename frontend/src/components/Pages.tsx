import { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'
import { SEO, PageHero, Spinner, ErrorMessage } from './UI'
import { useFetch } from '../hooks/useFetch'
import { servicesAPI, projectsAPI, galleryAPI, contactAPI } from '../services/api'
import { useCompany } from '../context/CompanyContext'
import type { Service, ProjectsResponse, GalleryImage, ContactInput } from '../types'

// ─── About Page ───────────────────────────────────────────────────────────────
export function AboutPage() {
  const { company } = useCompany()
  return (
    <>
      <SEO title="About Us" description="Learn about IQINISO Construction — our history, vision, mission and values." />
      <PageHero label="Our Story" title="About IQINISO Construction" subtitle="Built on integrity, driven by excellence." />
      <section className="section">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'start' }}>
            <div>
              <div className="section-label">Who We Are</div>
              <h2 className="section-title">A Legacy of Quality Construction</h2>
              <p style={{ color: 'var(--color-mid)', lineHeight: 1.8, whiteSpace: 'pre-line', marginBottom: '2rem' }}>
                {company?.aboutFull || 'IQINISO Construction is a proudly South African construction company.'}
              </p>
              {company?.registrationNumber && (
                <div style={{ padding: '1rem 1.25rem', background: 'var(--color-light)', borderRadius: 'var(--radius-sm)', borderLeft: '4px solid var(--color-amber)' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>Company Registration</div>
                  <strong>{company.registrationNumber}</strong>
                  {company.registrationCertificateUrl && (
                    <a href={company.registrationCertificateUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'block', marginTop: '0.5rem', color: 'var(--color-amber)', fontSize: '0.85rem', fontWeight: 600 }}>View Certificate →</a>
                  )}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {company?.vision && (
                <div style={{ padding: '1.75rem', background: 'var(--color-charcoal)', borderRadius: 'var(--radius-md)', color: 'var(--color-white)' }}>
                  <div className="section-label" style={{ color: 'var(--color-amber)' }}>Our Vision</div>
                  <p style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.7 }}>{company.vision}</p>
                </div>
              )}
              {company?.mission && (
                <div style={{ padding: '1.75rem', background: 'var(--color-amber)', borderRadius: 'var(--radius-md)' }}>
                  <div className="section-label" style={{ color: 'var(--color-black)' }}>Our Mission</div>
                  <p style={{ color: 'rgba(0,0,0,0.75)', lineHeight: 1.7 }}>{company.mission}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      {company?.policy && (
        <section className="section section--light">
          <div className="container" style={{ maxWidth: 760 }}>
            <div className="section-label">How We Operate</div>
            <h2 className="section-title">Company Policies</h2>
            <div style={{ color: 'var(--color-mid)', lineHeight: 1.9, whiteSpace: 'pre-line', marginTop: '1.5rem' }}>{company.policy}</div>
          </div>
        </section>
      )}
    </>
  )
}

// ─── Services Page ────────────────────────────────────────────────────────────
export function ServicesPage() {
  const { data, loading, error } = useFetch<Service[]>(servicesAPI.getAll)
  return (
    <>
      <SEO title="Services" description="IQINISO Construction services — residential, commercial, renovations, roofing, civil works." />
      <PageHero label="What We Build" title="Our Services" subtitle="Comprehensive construction solutions tailored to your needs." />
      <section className="section">
        <div className="container">
          {loading && <Spinner />}
          {error   && <ErrorMessage message={error} />}
          {data && (
            <div className="grid-3">
              {data.map((s) => (
                <div key={s.id} className="card">
                  {s.imageUrl && <img className="card-img" src={s.imageUrl} alt={s.title} loading="lazy" />}
                  <div className="card-body" style={{ borderTop: '3px solid var(--color-amber)' }}>
                    <h3 className="card-title">{s.title}</h3>
                    <p className="card-text" style={{ marginTop: '0.5rem' }}>{s.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}

// ─── Projects Page ────────────────────────────────────────────────────────────
const PROJECT_FILTERS = [
  { value: '',          label: 'All Projects' },
  { value: 'COMPLETED', label: 'Completed'    },
  { value: 'ONGOING',   label: 'Ongoing'      },
]

export function ProjectsPage() {
  const [filter, setFilter] = useState('')
  const { data, loading, error } = useFetch<ProjectsResponse>(
    () => projectsAPI.getAll(filter ? { status: filter } : {}),
    [filter]
  )
  const projects = data?.data ?? []

  return (
    <>
      <SEO title="Projects" description="Browse IQINISO Construction's completed and ongoing projects across South Africa." />
      <PageHero label="Our Portfolio" title="Projects" subtitle="A track record of successful construction projects." />
      <section className="section">
        <div className="container">
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
            {PROJECT_FILTERS.map(({ value, label }) => (
              <button key={value} onClick={() => setFilter(value)} className={`btn ${filter === value ? 'btn--primary' : 'btn--dark'}`} style={{ padding: '0.6rem 1.5rem', fontSize: '0.85rem' }}>{label}</button>
            ))}
          </div>
          {loading && <Spinner />}
          {error   && <ErrorMessage message={error} />}
          {!loading && !error && projects.length === 0 && <p style={{ textAlign: 'center', color: 'var(--color-muted)', padding: '3rem' }}>No projects found.</p>}
          <div className="grid-3">
            {projects.map((p) => (
              <Link to={`/projects/${p.slug}`} key={p.id} className="card" style={{ display: 'block' }}>
                {p.mainImageUrl && <img className="card-img" src={p.mainImageUrl} alt={p.title} loading="lazy" />}
                <div className="card-body">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span className={`badge badge--${p.status.toLowerCase()}`}>{p.status}</span>
                    {p.location && <span style={{ fontSize: '0.78rem', color: 'var(--color-muted)' }}>📍 {p.location}</span>}
                  </div>
                  <h3 className="card-title">{p.title}</h3>
                  <p className="card-text" style={{ marginTop: '0.4rem' }}>{p.shortDescription?.slice(0, 120)}</p>
                  {(p.startDate || p.completionDate) && (
                    <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--color-muted)', display: 'flex', gap: '1rem' }}>
                      {p.startDate && <span>Start: {p.startDate.slice(0, 10)}</span>}
                      {p.completionDate && <span>Complete: {p.completionDate.slice(0, 10)}</span>}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

// ─── Gallery Page ─────────────────────────────────────────────────────────────
const GALLERY_CATS = [
  { value: '',          label: 'All'      },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'WORKERS',   label: 'Workers'  },
  { value: 'PROGRESS',  label: 'Progress' },
  { value: 'GENERAL',   label: 'General'  },
]

export function GalleryPage() {
  const [cat, setCat]             = useState('')
  const [lightboxIdx, setLightboxIdx] = useState(-1)

  const { data, loading, error } = useFetch<GalleryImage[]>(
    () => galleryAPI.getAll(cat ? { category: cat } : {}),
    [cat]
  )
  const images = data ?? []
  const slides = images.map((img) => ({ src: img.imageUrl ?? '', alt: img.altText || img.title }))

  return (
    <>
      <SEO title="Gallery" description="Photo gallery of IQINISO Construction projects, workers, and progress." />
      <PageHero label="Our Work in Pictures" title="Gallery" subtitle="A visual journey through our construction projects." />
      <section className="section">
        <div className="container">
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
            {GALLERY_CATS.map(({ value, label }) => (
              <button key={value} onClick={() => setCat(value)} className={`btn ${cat === value ? 'btn--primary' : 'btn--dark'}`} style={{ padding: '0.5rem 1.25rem', fontSize: '0.82rem' }}>{label}</button>
            ))}
          </div>
          {loading && <Spinner />}
          {error   && <ErrorMessage message={error} />}
          {!loading && !error && images.length === 0 && <p style={{ textAlign: 'center', color: 'var(--color-muted)', padding: '3rem' }}>No images found.</p>}
          <div className="gallery-grid">
            {images.map((img, idx) => (
              <button key={img.id} onClick={() => setLightboxIdx(idx)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'zoom-in', borderRadius: 'var(--radius-sm)', overflow: 'hidden', aspectRatio: '4/3', display: 'block', width: '100%' }} aria-label={`View ${img.title || 'image'}`}>
                <img src={img.imageUrl ?? ''} alt={img.altText || img.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease', display: 'block' }} onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')} onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')} />
              </button>
            ))}
          </div>
        </div>
      </section>
      <Lightbox open={lightboxIdx >= 0} index={lightboxIdx} close={() => setLightboxIdx(-1)} slides={slides} />
    </>
  )
}

// ─── Contact Page ─────────────────────────────────────────────────────────────
const INITIAL: ContactInput = { name: '', email: '', phone: '', subject: '', message: '' }

function validateContact(v: ContactInput): Record<string, string> {
  const e: Record<string, string> = {}
  if (!v.name.trim() || v.name.trim().length < 2) e.name = 'Full name required (min 2 chars).'
  if (!v.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) e.email = 'Valid email required.'
  if (!v.subject.trim()) e.subject = 'Subject is required.'
  if (!v.message.trim() || v.message.trim().length < 20) e.message = 'Message must be at least 20 characters.'
  return e
}

export function ContactPage() {
  const { company } = useCompany()
  const [values, setValues]   = useState<ContactInput>(INITIAL)
  const [errors, setErrors]   = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setValues((v) => ({ ...v, [name]: value }))
    if (errors[name]) setErrors((err) => { const { [name]: _, ...rest } = err; return rest })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validateContact(values)
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      await contactAPI.submit(values)
      setSent(true)
      setValues(INITIAL)
      toast.success('Message sent! We will get back to you shortly.')
    } catch (err: unknown) {
      const apiErrors = (err as { response?: { data?: { errors?: Record<string, string[]> } } })?.response?.data?.errors
      if (apiErrors) {
        setErrors(Object.fromEntries(Object.entries(apiErrors).map(([k, v]) => [k, Array.isArray(v) ? v[0] : String(v)])))
      } else {
        toast.error(err instanceof Error ? err.message : 'Failed to send. Please try again.')
      }
    } finally { setLoading(false) }
  }

  return (
    <>
      <SEO title="Contact Us" description="Get in touch with IQINISO Construction for a free quote or consultation." />
      <PageHero label="Get In Touch" title="Contact Us" subtitle="Ready to build? We would love to hear from you." />
      <section className="section">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'start' }}>
            <div>
              <div className="section-label">Our Details</div>
              <h2 className="section-title" style={{ marginBottom: '2rem' }}>Let's Talk</h2>
              {([
                { icon: '📍', label: 'Address',  value: company?.physicalAddress, href: null },
                { icon: '📞', label: 'Phone',    value: company?.phone, href: `tel:${company?.phone}` },
                { icon: '✉️', label: 'Email',    value: company?.email, href: `mailto:${company?.email}` },
                { icon: '💬', label: 'WhatsApp', value: company?.whatsapp, href: `https://wa.me/${company?.whatsapp?.replace(/\D/g, '')}` },
              ] as { icon: string; label: string; value?: string; href: string | null }[])
                .filter(({ value }) => value)
                .map(({ icon, label, value, href }) => (
                  <div key={label} style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'flex-start' }}>
                    <div style={{ width: '44px', height: '44px', background: 'var(--color-amber)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1.2rem' }}>{icon}</div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.2rem' }}>{label}</div>
                      {href ? <a href={href} style={{ color: 'var(--color-dark)', fontWeight: 500 }}>{value}</a> : <span style={{ fontWeight: 500 }}>{value}</span>}
                    </div>
                  </div>
                ))}
              {company?.googleMapsEmbedUrl && (
                <div style={{ marginTop: '2rem', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
                  <iframe src={company.googleMapsEmbedUrl} width="100%" height="200" style={{ border: 0, display: 'block' }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Office location" />
                </div>
              )}
            </div>
            <div style={{ background: 'var(--color-light)', padding: '2.5rem', borderRadius: 'var(--radius-md)' }}>
              {sent ? (
                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', marginBottom: '0.75rem' }}>Message Received!</h3>
                  <p style={{ color: 'var(--color-mid)' }}>Our team will contact you shortly.</p>
                  <button onClick={() => setSent(false)} className="btn btn--dark" style={{ marginTop: '1.5rem' }}>Send Another Message</button>
                </div>
              ) : (
                <>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: '1.75rem' }}>Send Us a Message</h3>
                  <form onSubmit={handleSubmit} noValidate>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
                      {([['name','Full Name *','text'], ['email','Email *','email'], ['phone','Phone','tel'], ['subject','Subject *','text']] as [keyof ContactInput, string, string][]).map(([name, label, type]) => (
                        <div key={name} className="form-group">
                          <label className="form-label" htmlFor={name}>{label}</label>
                          <input id={name} name={name} type={type} value={values[name]} onChange={handleChange} className={`form-input${errors[name] ? ' error' : ''}`} />
                          {errors[name] && <span className="form-error">{errors[name]}</span>}
                        </div>
                      ))}
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="message">Message *</label>
                      <textarea id="message" name="message" value={values.message} onChange={handleChange} className={`form-textarea${errors.message ? ' error' : ''}`} placeholder="Tell us about your project..." />
                      {errors.message && <span className="form-error">{errors.message}</span>}
                    </div>
                    <button type="submit" className="btn btn--primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}>
                      {loading ? 'Sending…' : 'Send Message'}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
