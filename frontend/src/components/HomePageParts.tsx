// ─── HomePage.tsx ─────────────────────────────────────────────────────────────
import { Link } from 'react-router-dom'
import { SEO, Spinner, ErrorMessage } from './UI'
import { useFetch } from '../hooks/useFetch'
import { servicesAPI, projectsAPI } from '../services/api'
import { useCompany } from '../context/CompanyContext'
import type { Service, ProjectsResponse } from '../types'

export function HomePage() {
  const { company } = useCompany()

  return (
    <>
      <SEO description="IQINISO Construction — trusted South African construction company. Residential, commercial and civil projects delivered with excellence." />

      {/* Hero */}
      <section style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0d0d0d 0%, #1a1a1a 60%, #222 100%)', display: 'flex', alignItems: 'center', paddingTop: '72px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(232,160,32,0.04) 40px, rgba(232,160,32,0.04) 80px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', left: 0, top: '15%', width: '6px', height: '60%', background: 'var(--color-amber)', borderRadius: '0 4px 4px 0' }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="section-label fade-up">South Africa's Trusted Builders</div>
          <h1 className="fade-up fade-up-1" style={{ fontSize: 'clamp(3rem, 8vw, 6rem)', color: '#fff', lineHeight: 1.05, maxWidth: 800, marginBottom: '1.5rem' }}>
            {company?.tagline || 'Building the Future,\nDelivering Excellence'}
          </h1>
          <p className="fade-up fade-up-2" style={{ color: 'rgba(255,255,255,0.65)', fontSize: '1.1rem', maxWidth: 520, lineHeight: 1.8, marginBottom: '2.5rem' }}>
            {company?.aboutShort || 'IQINISO Construction delivers world-class residential, commercial, and civil construction projects with unmatched quality and integrity.'}
          </p>
          <div className="fade-up fade-up-3" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/projects" className="btn btn--primary">View Our Projects</Link>
            <Link to="/contact"  className="btn btn--outline">Get a Quote</Link>
          </div>
          <div style={{ display: 'flex', gap: '3rem', marginTop: '4rem', flexWrap: 'wrap' }}>
            {[
              { num: company?.yearEstablished ? `${new Date().getFullYear() - company.yearEstablished}+` : '10+', label: 'Years Experience' },
              { num: '8+', label: 'Projects Completed' },
              { num: '100%', label: 'Client Satisfaction' },
            ].map(({ num, label }) => (
              <div key={label}>
                <div style={{ fontSize: '2.5rem', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--color-amber)' }}>{num}</div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="section section--light">
        <div className="container">
          <div className="section-label">What We Do</div>
          <h2 className="section-title">Our Services</h2>
          <p className="section-body" style={{ marginBottom: '3rem' }}>From foundations to finishing touches — comprehensive construction solutions.</p>
          <ServicesPreview />
          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <Link to="/services" className="btn btn--dark">All Services</Link>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="section section--dark">
        <div className="container">
          <div className="section-label">Our Work</div>
          <h2 className="section-title section-title--light">Featured Projects</h2>
          <p className="section-body section-body--light" style={{ marginBottom: '3rem' }}>A selection of our most impactful construction projects.</p>
          <FeaturedProjects />
          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <Link to="/projects" className="btn btn--primary">View All Projects</Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'var(--color-amber)', padding: '5rem 1.5rem', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 3rem)', color: 'var(--color-black)', marginBottom: '1rem' }}>Ready to Start Your Project?</h2>
          <p style={{ color: 'rgba(0,0,0,0.65)', marginBottom: '2rem', maxWidth: 500, margin: '0 auto 2rem' }}>Contact us today for a free consultation and quote.</p>
          <Link to="/contact" className="btn btn--dark" style={{ fontSize: '1.1rem', padding: '1rem 2.5rem' }}>Contact Us Today</Link>
        </div>
      </section>
    </>
  )
}

function ServicesPreview() {
  const { data, loading, error } = useFetch<Service[]>(servicesAPI.getAll)
  if (loading) return <Spinner />
  if (error)   return <ErrorMessage message={error} />
  return (
    <div className="grid-3">
      {(data ?? []).slice(0, 6).map((s) => (
        <div key={s.id} className="card">
          {s.imageUrl && <img className="card-img" src={s.imageUrl} alt={s.title} loading="lazy" />}
          <div className="card-body" style={{ borderTop: '3px solid var(--color-amber)' }}>
            <h3 className="card-title">{s.title}</h3>
            <p className="card-text">{s.shortDescription || s.description.slice(0, 120)}…</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function FeaturedProjects() {
  const { data, loading, error } = useFetch<ProjectsResponse>(projectsAPI.getFeatured)
  if (loading) return <Spinner />
  if (error)   return <ErrorMessage message={error} />
  return (
    <div className="grid-3">
      {(data?.data ?? []).slice(0, 3).map((p) => (
        <Link to={`/projects/${p.slug}`} key={p.id} className="card">
          {p.mainImageUrl && <img className="card-img" src={p.mainImageUrl} alt={p.title} loading="lazy" />}
          <div className="card-body">
            <span className={`badge badge--${p.status.toLowerCase()}`} style={{ marginBottom: '0.75rem', display: 'inline-block' }}>{p.status}</span>
            <h3 className="card-title">{p.title}</h3>
            <p className="card-text">{p.shortDescription?.slice(0, 100)}…</p>
          </div>
        </Link>
      ))}
    </div>
  )
}
