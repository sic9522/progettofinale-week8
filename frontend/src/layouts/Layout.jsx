import { Outlet, useLocation } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import SidebarDesktop from '../components/SidebarDesktop'

// login/registrati/reimposta-password devono stare in un solo schermo, senza scroll:
// header e footer (multi-colonna) le farebbero sforare l'altezza della viewport su mobile
const SENZA_HEADER_FOOTER = ['/login', '/registrati', '/reimposta-password', '/conferma']

function Layout() {
  const location = useLocation()
  // l'intro di Chi Siamo dopo il login e' a schermo pieno: solo contenuto e la X
  const introPostLogin = location.pathname === '/chi-siamo' && new URLSearchParams(location.search).has('intro')
  const mostraHeaderFooter = !SENZA_HEADER_FOOTER.includes(location.pathname) && !introPostLogin

  return (
    <>
      {mostraHeaderFooter && <Header />}
      <div className={mostraHeaderFooter ? 'app-body-row' : 'app-body-row senza-chrome'}>
        <main className="app-main">
          <Outlet />
        </main>
        {mostraHeaderFooter && <SidebarDesktop />}
      </div>
      {mostraHeaderFooter && <Footer />}
    </>
  )
}

export default Layout
