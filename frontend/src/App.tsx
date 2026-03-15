import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { Toaster } from 'react-hot-toast'
import { CompanyProvider } from './context/CompanyContext'
import { AdminAuthProvider, useAdminAuth } from './admin/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { HomePage } from './components/HomePageParts'
import { AboutPage, ServicesPage, ProjectsPage, GalleryPage, ContactPage } from './components/Pages'
import AdminLogin    from './admin/AdminLogin'
import AdminLayout   from './admin/AdminLayout'
import AdminDashboard from './admin/AdminDashboard'
import AdminServices  from './admin/AdminServices'
import AdminProjects  from './admin/AdminProjects'
import AdminGallery   from './admin/AdminGallery'
import AdminMessages  from './admin/AdminMessages'
import AdminCompany   from './admin/AdminCompany'
import './assets/styles/global.css'
import './admin/admin.css'

function NotFound() {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '6rem', color: 'var(--color-amber)' }}>404</h1>
      <p style={{ color: 'var(--color-mid)' }}>Page not found.</p>
      <a href="/" className="btn btn--dark">Go Home</a>
    </div>
  )
}

// Protect admin routes — redirect to login if not authenticated
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAdminAuth()
  if (loading) return null
  if (!user) return <Navigate to="/admin/login" replace />
  return <>{children}</>
}

function AdminSection() {
  const { user, loading } = useAdminAuth()
  if (loading) return null
  if (!user) return <AdminLogin />
  return (
    <Routes>
      <Route element={<RequireAuth><AdminLayout /></RequireAuth>}>
        <Route index            element={<AdminDashboard />} />
        <Route path="company"   element={<AdminCompany />}   />
        <Route path="services"  element={<AdminServices />}  />
        <Route path="projects"  element={<AdminProjects />}  />
        <Route path="gallery"   element={<AdminGallery />}   />
        <Route path="messages"  element={<AdminMessages />}  />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <AdminAuthProvider>
          <CompanyProvider>
            <Routes>
              {/* ── Public site ── */}
              <Route path="/" element={<><Navbar /><main style={{ paddingTop: '72px' }}><HomePage /></main><Footer /></>} />
              <Route path="/about"    element={<><Navbar /><main style={{ paddingTop: '72px' }}><AboutPage /></main><Footer /></>} />
              <Route path="/services" element={<><Navbar /><main style={{ paddingTop: '72px' }}><ServicesPage /></main><Footer /></>} />
              <Route path="/projects" element={<><Navbar /><main style={{ paddingTop: '72px' }}><ProjectsPage /></main><Footer /></>} />
              <Route path="/gallery"  element={<><Navbar /><main style={{ paddingTop: '72px' }}><GalleryPage /></main><Footer /></>} />
              <Route path="/contact"  element={<><Navbar /><main style={{ paddingTop: '72px' }}><ContactPage /></main><Footer /></>} />
              {/* ── Admin panel ── */}
              <Route path="/ad1qqin/*"  element={<AdminSection />} />
              {/* ── 404 ── */}
              <Route path="*" element={<><Navbar /><main style={{ paddingTop: '72px' }}><NotFound /></main><Footer /></>} />
            </Routes>
            <Toaster
              position="top-right"
              toastOptions={{
                style: { fontFamily: 'var(--font-body)', fontSize: '0.9rem' },
                success: { iconTheme: { primary: 'var(--color-amber)', secondary: '#fff' } },
              }}
            />
          </CompanyProvider>
        </AdminAuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  )
}
