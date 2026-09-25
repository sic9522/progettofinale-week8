import { Outlet, useLocation } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import SidebarDesktop from '../components/SidebarDesktop'

// login/registrati/reimposta-password devono stare in un solo schermo, senza scroll:
// header e footer (multi-colonna) le farebbero sforare l'altezza della viewport su mobile
const SENZA_HEADER_FOOTER = ['/login', '/registrati', '/reimposta-password']

function Layout() {
  const location = useLocation()
  const mostraHeaderFooter = !SENZA_HEADER_FOOTER.includes(location.pathname)

  return (
    <>
      {mostraHeaderFooter && <Header />}
      <div className="app-body-row">
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
