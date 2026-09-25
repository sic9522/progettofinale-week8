import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import api from '../services/api'
import { segnaNotificheViste } from '../hooks/useNotificheNuove'

function AdminNotifiche() {
  const [notifiche, setNotifiche] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let annullato = false
    api
      .get('/api/admin/notifiche')
      .then(({ data }) => {
        if (annullato) return
        setNotifiche(data)
        // l'admin le sta guardando: spegne il pallino di sidebar e menu
        segnaNotificheViste()
      })
      .finally(() => {
        if (!annullato) setLoading(false)
      })
    return () => {
      annullato = true
    }
  }, [])

  return (
    <div>
      <h2 className="section-subtitle">Notifiche</h2>
      {loading && <p className="section-empty-note">Caricamento...</p>}
      {!loading && notifiche.length === 0 && <p className="section-empty-note">Nessuna richiesta al momento.</p>}
      <div className="notifica-lista">
        {notifiche.map((n) => (
          <p key={n.id} className="notifica-riga">
            Utente (<strong>{n.utenteNome} {n.utenteCognome}</strong>) ha mostrato interesse per{' '}
            {n.tipo === 'ACQUISTO' ? "l'acquisto" : 'il noleggio'} di{' '}
            <Link to={`/?auto=${n.autoId}`} className="login-link">
              questa {n.autoMarca} {n.autoModello}
            </Link>
            . Contattalo tramite email ({n.utenteEmail}) per fissare un appuntamento.
          </p>
        ))}
      </div>
    </div>
  )
}

export default AdminNotifiche
