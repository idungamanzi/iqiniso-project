import { useState, useEffect } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { useCompany } from '../context/CompanyContext'

const NAV_LINKS = [
  { to: '/',         label: 'Home'     },
  { to: '/about',    label: 'About'    },
  { to: '/services', label: 'Services' },
  { to: '/projects', label: 'Projects' },
  { to: '/gallery',  label: 'Gallery'  },
  { to: '/contact',  label: 'Contact', cta: true },
]

export default function Navbar() {
  const { company } = useCompany()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const close = () => setOpen(false)
    window.addEventListener('resize', close)
    return () => window.removeEventListener('resize', close)
  }, [])

  return (
    <nav className="navbar" aria-label="Main navigation">
      <div className="navbar__inner">
        <Link to="/" className="navbar__logo" aria-label="IQINISO Construction Home">
          {company?.logoUrl
            ? <img src={company.logoUrl} alt="IQINISO Construction logo" />
            : <><span>IQ</span>INISO</>}
        </Link>

        <ul className="navbar__links" role="list">
          {NAV_LINKS.map(({ to, label, cta }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  [cta && 'navbar__cta', isActive && 'active'].filter(Boolean).join(' ')
                }
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>

        <button
          className="navbar__burger"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span /><span /><span />
        </button>
      </div>

      {open && (
        <div style={{ background: '#111', padding: '1rem 1.5rem 1.5rem' }}>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {NAV_LINKS.map(({ to, label }) => (
              <li key={to}>
                <NavLink
                  to={to} end={to === '/'}
                  onClick={() => setOpen(false)}
                  style={({ isActive }) => ({
                    color: isActive ? 'var(--color-amber)' : 'rgba(255,255,255,0.8)',
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    textTransform: 'uppercase' as const,
                    letterSpacing: '0.05em',
                  })}
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  )
}
