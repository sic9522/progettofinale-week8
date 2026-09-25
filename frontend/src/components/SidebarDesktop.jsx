import { useEffect, useRef, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'

import { NAV_ITEMS_ADMIN, NAV_ITEMS_UTENTE } from '../data/navItems'
import { isAdmin } from '../utils/ruolo'
import { segnaNotificheViste, useNotificheNuove } from '../hooks/useNotificheNuove'

function Icona({ children }) {
  return (
    <svg
      className="app-sidebar-icona"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

// per path: navItems.js resta dati puri, condiviso anche col menu mobile che non usa icone
const ICONE = {
  '/': (
    <Icona>
      <path d="M3 10.5 12 4l9 6.5" />
      <path d="M5 9.5V20h14V9.5" />
      <path d="M10 20v-5h4v5" />
    </Icona>
  ),
  '/offerte': (
    <Icona>
      <path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z" />
      <circle cx="8" cy="8" r="1.5" />
    </Icona>
  ),
  '/preferiti': (
    <Icona>
      <path d="M12 20.5s-7.5-4.6-9.2-9.3C1.7 8 3.8 4.5 7.3 4.5c2 0 3.5 1.1 4.7 2.7 1.2-1.6 2.7-2.7 4.7-2.7 3.5 0 5.6 3.5 4.5 6.7-1.7 4.7-9.2 9.3-9.2 9.3z" />
    </Icona>
  ),
  '/profilo': (
    <Icona>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 20c1.5-4 5-6 7.5-6s6 2 7.5 6" />
    </Icona>
  ),
  '/chi-siamo': (
    <Icona>
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="11" x2="12" y2="16.5" />
      <line x1="12" y1="7.5" x2="12" y2="7.6" />
    </Icona>
  ),
  '/prestiti': (
    <Icona>
      <circle cx="8" cy="15" r="4" />
      <path d="M11 12 20 3" />
      <path d="M16 7l3 3" />
      <path d="M18 5l2 2" />
    </Icona>
  ),
  '/notifiche': (
    <Icona>
      <path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z" />
      <path d="M10 20.5a2 2 0 0 0 4 0" />
    </Icona>
  ),
}

const ICONA_MENU = (
  <Icona>
    <line x1="4" y1="7" x2="20" y2="7" />
    <line x1="4" y1="12" x2="20" y2="12" />
    <line x1="4" y1="17" x2="20" y2="17" />
  </Icona>
)

const ICONA_LOGOUT = (
  <Icona>
    <path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" />
    <path d="M10 16l-4-4 4-4" />
    <line x1="6" y1="12" x2="15" y2="12" />
  </Icona>
)

function SidebarDesktop() {
  const navigate = useNavigate()
  const [aperta, setAperta] = useState(false)
  const admin = isAdmin()
  const navItems = admin ? NAV_ITEMS_ADMIN : NAV_ITEMS_UTENTE
  const notificheNuove = useNotificheNuove(admin)

  const asideRef = useRef(null)

  // aperta sopra il contenuto: un tocco fuori (header compreso) o uno scroll della
  // pagina la richiudono. Lo scroll/rotella dentro la sidebar stessa non conta
  useEffect(() => {
    if (!aperta) return
    const chiudiSeFuori = (e) => {
      if (!asideRef.current?.contains(e.target)) setAperta(false)
    }
    const chiudi = () => setAperta(false)
    document.addEventListener('pointerdown', chiudiSeFuori)
    document.addEventListener('wheel', chiudiSeFuori, { passive: true })
    window.addEventListener('scroll', chiudi, { passive: true })
    return () => {
      document.removeEventListener('pointerdown', chiudiSeFuori)
      document.removeEventListener('wheel', chiudiSeFuori)
      window.removeEventListener('scroll', chiudi)
    }
  }, [aperta])

  function handleLogout() {
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <>
      <aside ref={asideRef} className={aperta ? 'app-sidebar-desktop aperta' : 'app-sidebar-desktop'}>
      <h2 className="section-subtitle app-sidebar-titolo">
        <button
          type="button"
          className="app-sidebar-voce"
          aria-expanded={aperta}
          aria-label={aperta ? 'Chiudi menu' : 'Apri menu'}
          onClick={() => setAperta((a) => !a)}
        >
          <span className="app-sidebar-label">Menu</span>
          {ICONA_MENU}
        </button>
      </h2>

      <nav className="app-sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            title={item.label}
            aria-label={item.label}
            className={({ isActive }) => `nav-link app-sidebar-voce${isActive ? ' active' : ''}`}
            onClick={() => {
              setAperta(false)
              if (item.to === '/notifiche') segnaNotificheViste()
            }}
          >
            <span className="app-sidebar-label">{item.label}</span>
            <span className="app-sidebar-icona-box">
              {ICONE[item.to]}
              {item.to === '/notifiche' && notificheNuove && (
                <span className="notifica-pallino" aria-label="Nuove notifiche" />
              )}
            </span>
          </NavLink>
        ))}
      </nav>

      {admin && (
        <button
          type="button"
          className="app-sidebar-logout app-sidebar-voce"
          title="Logout"
          aria-label="Logout"
          onClick={handleLogout}
        >
          <span className="app-sidebar-label">Logout</span>
          {ICONA_LOGOUT}
        </button>
      )}
      </aside>
    </>
  )
}

export default SidebarDesktop
