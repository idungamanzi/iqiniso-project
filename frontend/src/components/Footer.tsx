import { Link } from 'react-router-dom'
import { useCompany } from '../context/CompanyContext'

export default function Footer() {
  const { company } = useCompany()
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="footer__grid">
        <div>
          <div className="footer__brand-name"><span>IQ</span>INISO <span style={{ color: 'var(--color-white)' }}>Construction</span></div>
          <p className="footer__desc">{company?.aboutShort || 'Quality construction services across Newcastele, South Africa.'}</p>
          <div className="footer__social">
            {company?.facebookUrl  && <a href={company.facebookUrl}  target="_blank" rel="noopener noreferrer" aria-label="Facebook">f</a>}
            {company?.instagramUrl && <a href={company.instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram">in</a>}
            {company?.linkedinUrl  && <a href={company.linkedinUrl}  target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">li</a>}
          </div>
        </div>
        <div>
          <div className="footer__heading">Quick Links</div>
          <ul className="footer__links">
            {([['/', 'Home'], ['/about', 'About'], ['/services', 'Services'], ['/projects', 'Projects'], ['/gallery', 'Gallery'], ['/contact', 'Contact']] as [string, string][]).map(([to, label]) => (
              <li key={to}><Link to={to}>{label}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <div className="footer__heading">Contact</div>
          <ul className="footer__links">
            {company?.physicalAddress && <li style={{ fontSize: '0.875rem', lineHeight: 1.5 }}>{company.physicalAddress}</li>}
            {company?.email && <li><a href={`mailto:${company.email}`}>{company.email}</a></li>}
            {company?.phone && <li><a href={`tel:${company.phone}`}>{company.phone}</a></li>}
          </ul>
        </div>
      </div>
      <div className="footer__bottom">
        <span>© {year} IQINISO Construction. All rights reserved.</span>
        {company?.registrationNumber && <span>Reg. No: {company.registrationNumber}</span>}
      </div>
    </footer>
  )
}
