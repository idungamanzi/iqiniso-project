import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { adminAPI } from '../services/api'

interface AdminUser {
  id: number
  email: string
  name: string
}

interface AuthContextValue {
  user: AdminUser | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]     = useState<AdminUser | null>(null)
  const [token, setToken]   = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Restore session from sessionStorage on mount
  useEffect(() => {
    const storedToken = sessionStorage.getItem('admin_token')
    const storedUser  = sessionStorage.getItem('admin_user')
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    const res = await adminAPI.login(email, password)
    const { token: newToken, admin } = res.data
    sessionStorage.setItem('admin_token', newToken)
    sessionStorage.setItem('admin_user', JSON.stringify(admin))
    setToken(newToken)
    setUser(admin)
  }

  const logout = () => {
    sessionStorage.removeItem('admin_token')
    sessionStorage.removeItem('admin_user')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAdminAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider')
  return ctx
}
