import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { Toaster } from 'react-hot-toast'
import { CompanyProvider } from './context/CompanyContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { HomePage } from './components/HomePageParts'
import { AboutPage, ServicesPage, ProjectsPage, GalleryPage, ContactPage } from './components/Pages'
import './assets/styles/global.css'

function NotFound() {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '6rem', color: 'var(--color-amber)' }}>404</h1>
      <p style={{ color: 'var(--color-mid)' }}>Page not found.</p>
      <a href="/" className="btn btn--dark">Go Home</a>
    </div>
  )
}

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <CompanyProvider>
          <Navbar />
          <main style={{ paddingTop: '72px' }}>
            <Routes>
              <Route path="/"         element={<HomePage />}     />
              <Route path="/about"    element={<AboutPage />}    />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/gallery"  element={<GalleryPage />}  />
              <Route path="/contact"  element={<ContactPage />}  />
              <Route path="*"         element={<NotFound />}     />
            </Routes>
          </main>
          <Footer />
          <Toaster
            position="top-right"
            toastOptions={{
              style: { fontFamily: 'var(--font-body)', fontSize: '0.9rem' },
              success: { iconTheme: { primary: 'var(--color-amber)', secondary: '#fff' } },
            }}
          />
        </CompanyProvider>
      </BrowserRouter>
    </HelmetProvider>
  )
}
