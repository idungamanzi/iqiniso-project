import { useState } from 'react'
import { useAdminAuth } from './AuthContext'
import toast from 'react-hot-toast'

export default function AdminLogin() {
  const { login } = useAdminAuth()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) { toast.error('Please enter email and password.'); return }
    setLoading(true)
    try {
      await login(email, password)
      toast.success('Welcome back!')
    } catch {
      toast.error('Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-login">
      <div className="admin-login__box">
        <div className="admin-login__logo"><span>IQ</span>INISO</div>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-muted)', marginBottom: '2rem' }}>
          Admin Panel — Sign in to continue
        </p>

        <form onSubmit={handleSubmit}>
          <div className="admin-form-group" style={{ marginBottom: '1rem' }}>
            <label className="admin-label">Email</label>
            <input
              type="email"
              className="admin-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              autoFocus
            />
          </div>

          <div className="admin-form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="admin-label">Password</label>
            <input
              type="password"
              className="admin-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="admin-btn admin-btn--primary"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
