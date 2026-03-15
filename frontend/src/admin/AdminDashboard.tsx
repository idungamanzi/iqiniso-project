import { useEffect, useState } from 'react'
import { adminAPI } from '../services/api'

interface Stats {
  services: number
  projects: number
  gallery: number
  messages: number
  unread: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    Promise.all([
      adminAPI.adminGetServices(),
      adminAPI.adminGetProjects(),
      adminAPI.adminGetGallery(),
      adminAPI.getMessages(),
    ]).then(([sv, pr, gl, ms]) => {
      const messages = ms.data as { status: string }[]
      setStats({
        services: (sv.data as unknown[]).length,
        projects: (pr.data as unknown[]).length,
        gallery:  (gl.data as unknown[]).length,
        messages: messages.length,
        unread:   messages.filter((m) => m.status === 'UNREAD').length,
      })
    }).catch(() => {})
  }, [])

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', marginBottom: '1.5rem' }}>
        Dashboard
      </h1>

      <div className="admin-stats">
        {[
          { label: 'Services',         num: stats?.services ?? '—', icon: '🔧' },
          { label: 'Projects',         num: stats?.projects ?? '—', icon: '🏗️' },
          { label: 'Gallery Images',   num: stats?.gallery  ?? '—', icon: '🖼️' },
          { label: 'Total Messages',   num: stats?.messages ?? '—', icon: '✉️' },
          { label: 'Unread Messages',  num: stats?.unread   ?? '—', icon: '🔔' },
        ].map(({ label, num, icon }) => (
          <div key={label} className="admin-stat">
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{icon}</div>
            <div className="admin-stat__num">{num}</div>
            <div className="admin-stat__label">{label}</div>
          </div>
        ))}
      </div>

      <div className="admin-card">
        <div className="admin-card__header">
          <div className="admin-card__title">Quick Actions</div>
        </div>
        <div className="admin-card__body" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {[
            { href: '/admin/services',  label: '+ Add Service'  },
            { href: '/admin/projects',  label: '+ Add Project'  },
            { href: '/admin/gallery',   label: '+ Upload Photo' },
            { href: '/admin/messages',  label: '📬 View Messages' },
            { href: '/admin/company',   label: '🏢 Edit Company Info' },
          ].map(({ href, label }) => (
            <a key={href} href={href} className="admin-btn admin-btn--ghost">{label}</a>
          ))}
        </div>
      </div>
    </div>
  )
}
