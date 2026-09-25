import { useState } from 'react'
import { Link } from 'react-router-dom'

import NoteLegaliModal from './NoteLegaliModal'

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3h-2.5A3.5 3.5 0 0 0 9 6.5V9H6.5v3.5H9V21h3.5v-8.5H15L15.8 9h-3.3V6.8c0-.7.5-1.3 1.2-1.3H16z" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <line x1="4" y1="4" x2="20" y2="20" />
      <line x1="20" y1="4" x2="4" y2="20" />
    </svg>
  )
}

const SOCIAL = [
  { nome: 'Instagram', href: 'https://instagram.com/sicluxorycars', Icona: InstagramIcon },
  { nome: 'Facebook', href: 'https://facebook.com/sicluxorycars', Icona: FacebookIcon },
  { nome: 'X', href: 'https://x.com/sicluxorycars', Icona: XIcon },
]

function Footer() {
  const anno = new Date().getFullYear()
  const [noteLegaliAperte, setNoteLegaliAperte] = useState(false)

  return (
    <footer className="app-footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <p className="footer-logo">SicLuxoryCars</p>
          <p className="footer-tagline">Lusso, motori e velocità. Dal 1962.</p>
        </div>

        <div className="footer-col">
          <h3 className="footer-heading">Contatti</h3>
          <p className="footer-text">Via dei Condotti 88, 00187 Roma</p>
          <p className="footer-text">info@sicluxorycars.it</p>
        </div>

        <div className="footer-col">
          <h3 className="footer-heading">Seguici</h3>
          <div className="footer-social-icons">
            {SOCIAL.map(({ nome, href, Icona }) => (
              <a key={nome} href={href} className="footer-social-btn" aria-label={nome} target="_blank" rel="noreferrer">
                <Icona />
              </a>
            ))}
          </div>
        </div>

        <nav className="footer-col footer-nav" aria-label="Navigazione footer">
          <h3 className="footer-heading">Naviga</h3>
          <div className="footer-nav-links">
            <Link to="/" className="footer-link">
              Vetrina
            </Link>
            <Link to="/preferiti" className="footer-link">
              Preferiti
            </Link>
            <Link to="/chi-siamo" className="footer-link">
              Chi Siamo
            </Link>
            <Link to="/profilo" className="footer-link">
              Profilo
            </Link>
            <button type="button" className="footer-link footer-link-btn" onClick={() => setNoteLegaliAperte(true)}>
              Note legali &amp; Cookies
            </button>
          </div>
        </nav>
      </div>

      <div className="footer-bottom">
        <p>© {anno} SicLuxoryCars S.p.A. — P.IVA 01234567890 — Tutti i diritti riservati</p>
      </div>

      <NoteLegaliModal show={noteLegaliAperte} onClose={() => setNoteLegaliAperte(false)} />
    </footer>
  )
}

export default Footer
