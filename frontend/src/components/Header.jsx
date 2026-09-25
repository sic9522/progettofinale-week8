import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate, useSearchParams } from 'react-router-dom'
import Offcanvas from 'react-bootstrap/Offcanvas'
import Nav from 'react-bootstrap/Nav'
import Dropdown from 'react-bootstrap/Dropdown'
import { motion, AnimatePresence } from 'motion/react'

import { NAV_ITEMS_ADMIN, NAV_ITEMS_UTENTE } from '../data/navItems'
import { useIsDesktop } from '../hooks/useIsDesktop'
import { isAdmin } from '../utils/ruolo'
import api from '../services/api'

const SITE_NAME = 'SicLuxoryCars'
const EASE = [0.65, 0, 0.35, 1]

function HamburgerIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function ProfileIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 20c1.5-4 5-6 7.5-6s6 2 7.5 6" />
    </svg>
  )
}

function CarIcon() {
  return (
    <svg width="22" height="13" viewBox="0 0 32 18" fill="currentColor">
      <path d="M4 12 L6 6 Q7 4 10 4 H20 Q23 4 24 6 L27 12 H29 A1 1 0 0 1 30 13 V14 A1 1 0 0 1 29 15 H27 A3 3 0 1 1 21 15 H11 A3 3 0 1 1 5 15 H3 A1 1 0 0 1 2 14 V13 A1 1 0 0 1 3 12 Z" />
      <circle cx="8" cy="15" r="2" fill="var(--color-header-bg)" />
      <circle cx="24" cy="15" r="2" fill="var(--color-header-bg)" />
    </svg>
  )
}

// admin su desktop: il logout vive in fondo alla sidebar, qui resta solo nome+icona,
// senza menu ne' caret (niente Profilo per l'admin, niente Logout duplicato)
function AccountMenu({ className, isDesktop, autenticato, admin, nomeUtente, onLogout }) {
  if (isDesktop && admin) {
    return (
      <span className={className}>
        <ProfileIcon />
        {autenticato && <span className="header-account-nome">Admin</span>}
      </span>
    )
  }

  return (
    <Dropdown align="end">
      <Dropdown.Toggle as="button" className={className} aria-label="Menu profilo">
        <ProfileIcon />
        {isDesktop && autenticato && nomeUtente && <span className="header-account-nome">{nomeUtente}</span>}
      </Dropdown.Toggle>
      <Dropdown.Menu>
        {autenticato ? (
          <>
            {!admin && (
              <Dropdown.Item as={Link} to="/profilo">
                Profilo
              </Dropdown.Item>
            )}
            <Dropdown.Item onClick={onLogout}>Logout</Dropdown.Item>
          </>
        ) : (
          <Dropdown.Item as={Link} to="/login">
            Accedi
          </Dropdown.Item>
        )}
      </Dropdown.Menu>
    </Dropdown>
  )
}

function Header() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const termineRicerca = searchParams.get('q')
  const titolo = termineRicerca || SITE_NAME
  const isDesktop = useIsDesktop()

  const [autenticato, setAutenticato] = useState(() => Boolean(localStorage.getItem('token')))
  const [admin, setAdmin] = useState(isAdmin)
  const [nomeUtente, setNomeUtente] = useState('')
  const navItems = admin ? NAV_ITEMS_ADMIN : NAV_ITEMS_UTENTE

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus()
  }, [searchOpen])

  useEffect(() => {
    function aggiorna() {
      setAutenticato(Boolean(localStorage.getItem('token')))
      setAdmin(isAdmin())
    }
    window.addEventListener('auth-change', aggiorna)
    return () => window.removeEventListener('auth-change', aggiorna)
  }, [])

  // solo per mostrare il nome accanto all'icona account su desktop
  useEffect(() => {
    if (!autenticato) {
      setNomeUtente('')
      return
    }
    let annullato = false
    api
      .get('/api/user/me')
      .then(({ data }) => {
        if (!annullato) setNomeUtente(data.nome)
      })
      .catch(() => {})
    return () => {
      annullato = true
    }
  }, [autenticato])

  function handleLogout() {
    localStorage.removeItem('token')
    setAutenticato(false)
    setAdmin(false)
    navigate('/login')
  }

  function handleSearchSubmit(e) {
    e.preventDefault()
    setSearchOpen(false)
    const termine = query.trim()
    setQuery('')
    navigate(termine ? `/?q=${encodeURIComponent(termine)}` : '/')
  }

  function handleSearchToggle() {
    setSearchOpen((open) => {
      if (open) setQuery('')
      return !open
    })
  }

  function handleTitleClick() {
    navigate('/')
  }

  const searchToggleBtn = (
    <button
      type="button"
      className="header-icon-btn"
      aria-label={searchOpen ? 'Chiudi ricerca' : 'Cerca'}
      onClick={handleSearchToggle}
    >
      <AnimatePresence mode="wait" initial={false}>
        {searchOpen ? (
          <motion.span
            key="car"
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 6 }}
            transition={{ duration: 0.2 }}
          >
            <CarIcon />
          </motion.span>
        ) : (
          <motion.span
            key="lens"
            initial={{ opacity: 0, x: 6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            transition={{ duration: 0.2 }}
          >
            <SearchIcon />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  )

  return (
    <>
      <header className="app-header">
        {!isDesktop && (
          <>
            <div className="header-side header-side-left">
              <AccountMenu
                className="header-icon-btn"
                isDesktop={isDesktop}
                autenticato={autenticato}
                admin={admin}
                nomeUtente={nomeUtente}
                onLogout={handleLogout}
              />
            </div>

            <div className="header-center">
              <AnimatePresence mode="wait" initial={false}>
                {searchOpen ? (
                  <motion.form
                    key="search"
                    className="header-search"
                    onSubmit={handleSearchSubmit}
                    initial={{ clipPath: 'inset(0 100% 0 0)' }}
                    animate={{ clipPath: 'inset(0 0% 0 0)' }}
                    exit={{ clipPath: 'inset(0 100% 0 0)' }}
                    transition={{ duration: 0.4, ease: EASE }}
                  >
                    <input
                      ref={inputRef}
                      type="search"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Cerca marca o modello..."
                      className="header-search-input"
                    />
                    <button type="submit" className="header-search-submit" aria-label="Cerca">
                      <SearchIcon />
                    </button>
                  </motion.form>
                ) : (
                  <motion.h1
                    key="title"
                    className="header-title"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <button type="button" className="header-title-btn" onClick={handleTitleClick}>
                      {titolo}
                    </button>
                  </motion.h1>
                )}
              </AnimatePresence>
            </div>

            <div className="header-side header-side-right">
              {searchToggleBtn}
              <button
                type="button"
                className="header-icon-btn"
                aria-label="Apri menu"
                onClick={() => setSidebarOpen(true)}
              >
                <HamburgerIcon />
              </button>
            </div>
          </>
        )}

        {isDesktop && (
          <>
            <div className="header-title-desktop">
              <button type="button" className="header-title-btn" onClick={handleTitleClick}>
                {titolo}
              </button>
            </div>

            <div className="header-side-right-desktop">
              <div className="header-search-desktop">
                <AnimatePresence>
                  {searchOpen && (
                    <motion.form
                      className="header-search header-search-desktop-form"
                      onSubmit={handleSearchSubmit}
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 240, opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: EASE }}
                    >
                      <input
                        ref={inputRef}
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Cerca marca o modello..."
                        className="header-search-input"
                      />
                      <button type="submit" className="header-search-submit" aria-label="Cerca">
                        <SearchIcon />
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>
                {searchToggleBtn}
              </div>

              <AccountMenu
                className="header-account-desktop"
                isDesktop={isDesktop}
                autenticato={autenticato}
                admin={admin}
                nomeUtente={nomeUtente}
                onLogout={handleLogout}
              />
            </div>
          </>
        )}
      </header>

      {!isDesktop && (
        <Offcanvas
          show={sidebarOpen}
          onHide={() => setSidebarOpen(false)}
          placement="end"
          aria-label="Menu"
          className="app-sidebar"
          style={{ '--bs-offcanvas-width': 'fit-content' }}
        >
          <Offcanvas.Header closeButton />
          <Offcanvas.Body>
            <Nav className="flex-column app-sidebar-nav">
              {navItems.map((item) => (
                <Nav.Link
                  key={item.to}
                  as={NavLink}
                  to={item.to}
                  end={item.end}
                  onClick={() => setSidebarOpen(false)}
                >
                  {item.label}
                </Nav.Link>
              ))}
            </Nav>
          </Offcanvas.Body>
        </Offcanvas>
      )}
    </>
  )
}

export default Header
