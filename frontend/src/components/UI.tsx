import { Helmet } from 'react-helmet-async'

export function Spinner() {
  return (
    <div className="loading-wrap" role="status" aria-label="Loading">
      <div className="spinner" />
    </div>
  )
}

export function ErrorMessage({ message }: { message?: string | null }) {
  return (
    <div className="error-msg">
      <strong>Something went wrong</strong>
      {message ?? 'Please try refreshing the page.'}
    </div>
  )
}

interface SEOProps { title?: string; description?: string; image?: string }
export function SEO({ title, description, image }: SEOProps) {
  const siteName = 'IQINISO Construction'
  const fullTitle = title ? `${title} | ${siteName}` : siteName
  return (
    <Helmet>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      {image && <meta property="og:image" content={image} />}
      <meta name="robots" content="index, follow" />
    </Helmet>
  )
}

interface PageHeroProps { label?: string; title: string; subtitle?: string }
export function PageHero({ label, title, subtitle }: PageHeroProps) {
  return (
    <section className="page-hero">
      <div className="page-hero__inner">
        {label && <div className="section-label page-hero__label">{label}</div>}
        <h1 className="page-hero__title fade-up">{title}</h1>
        {subtitle && <p className="page-hero__sub fade-up fade-up-1">{subtitle}</p>}
      </div>
    </section>
  )
}
