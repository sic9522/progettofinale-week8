import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from '../layouts/Layout'
import Home from '../pages/Home'
import Offerte from '../pages/Offerte'
import Preferiti from '../pages/Preferiti'
import Profilo from '../pages/Profilo'
import ChiSiamo from '../pages/ChiSiamo'
import Login from '../pages/Login'
import Registrati from '../pages/Registrati'
import ReimpostaPassword from '../pages/ReimpostaPassword'
import ConfermaRegistrazione from '../pages/ConfermaRegistrazione'
import AdminPrestiti from '../pages/AdminPrestiti'
import AdminNotifiche from '../pages/AdminNotifiche'
import { isAdmin } from '../utils/ruolo'

// prima apertura (niente token, niente scelta "ospite" per questa scheda): si parte
// dal login. Un utente gia' autenticato, o che ha scelto di continuare come ospite,
// vede subito la vetrina - anche dopo un refresh (entrambi i flag sopravvivono)
function EntrataVetrina() {
  const autenticato = Boolean(localStorage.getItem('token'))
  const ospite = sessionStorage.getItem('ospite') === 'true'
  if (!autenticato && !ospite) {
    return <Navigate to="/login" replace />
  }
  return <Home />
}

// solo interfaccia: il backend rifiuta comunque queste chiamate a chi non e' admin
// (@PreAuthorize su ogni endpoint /api/admin/...), questa e' solo per non mostrare
// una pagina vuota/rotta a chi indovina l'URL
function SoloAdmin({ children }) {
  if (!isAdmin()) {
    return <Navigate to="/" replace />
  }
  return children
}

// l'admin non ha un profilo cliente (nessuna patente/garage): stessa idea di SoloAdmin,
// ruolo invertito, per non mostrare una pagina vuota/rotta a chi indovina l'URL
function SoloUtente({ children }) {
  if (isAdmin()) {
    return <Navigate to="/" replace />
  }
  return children
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<EntrataVetrina />} />
          <Route
            path="/offerte"
            element={
              <SoloAdmin>
                <Offerte />
              </SoloAdmin>
            }
          />
          <Route path="/preferiti" element={<Preferiti />} />
          <Route
            path="/profilo"
            element={
              <SoloUtente>
                <Profilo />
              </SoloUtente>
            }
          />
          <Route path="/chi-siamo" element={<ChiSiamo />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registrati" element={<Registrati />} />
          <Route path="/reimposta-password" element={<ReimpostaPassword />} />
          <Route path="/conferma" element={<ConfermaRegistrazione />} />
          <Route
            path="/prestiti"
            element={
              <SoloAdmin>
                <AdminPrestiti />
              </SoloAdmin>
            }
          />
          <Route
            path="/notifiche"
            element={
              <SoloAdmin>
                <AdminNotifiche />
              </SoloAdmin>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes
