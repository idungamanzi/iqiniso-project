import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAdminAuth } from './AuthContext'
import toast from 'react-hot-toast'

const NAV = [
  { to: '/ad1qqin',           label: 'Dashboard',    icon: '📊', end: true },
  { to: '/ad1qqin/company',   label: 'Company Info',  icon: '🏢' },
  { to: '/ad1qqin/services',  label: 'Services',      icon: '🔧' },
  { to: '/ad1qqin/projects',  label: 'Projects',      icon: '🏗️' },
  { to: '/ad1qqin/gallery',   label: 'Gallery',       icon: '🖼️' },
  { to: '/ad1qqin/messages',  label: 'Messages',      icon: '✉️' },
]

export default function AdminLayout() {
  const { user, logout } = useAdminAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/admin')
    toast.success('Logged out.')
  }

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand">
          <div className="admin-sidebar__brand-name"><span>IQ</span>INISO</div>
          <div className="admin-sidebar__sub">Admin Panel</div>
        </div>

        <ul className="admin-nav">
          {NAV.map(({ to, label, icon, end }) => (
            <li key={to} className="admin-nav__item">
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) => isActive ? 'active' : ''}
              >
                <span className="admin-nav__icon">{icon}</span>
                {label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="admin-sidebar__footer">
          <div style={{ marginBottom: '0.5rem', color: 'rgba(255,255,255,0.6)' }}>
            {user?.name}
          </div>
          <button
            className="admin-nav__item"
            onClick={handleLogout}
            style={{ padding: 0, color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            → Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="admin-main">
        <div className="admin-topbar">
          <div className="admin-topbar__title">IQINISO Construction</div>
          <div className="admin-topbar__user">
            <span>👤 {user?.email}</span>
            <a href="/" target="_blank" style={{ color: 'var(--color-amber)', fontSize: '0.8rem' }}>
              View Site ↗
            </a>
          </div>
        </div>
        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
