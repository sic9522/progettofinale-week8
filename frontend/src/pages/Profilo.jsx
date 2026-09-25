import { useEffect, useState } from 'react'

import AccediPrompt from '../components/AccediPrompt'
import CarCard from '../components/CarCard'
import CarModal from '../components/CarModal'
import Patente from '../components/Patente'
import api from '../services/api'
import { formatPrezzo } from '../utils/formatPrezzo'

const formatData = (data) => data.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' })

// garage = auto a noleggio del cliente: la card apre la modale dell'auto, accanto i
// dati del contratto (fine calcolata come in email: inizio + durata in mesi)
function NoleggioGarage({ noleggio, onApri }) {
  const inizio = new Date(noleggio.dataInizio)
  const fine = new Date(inizio)
  fine.setMonth(fine.getMonth() + noleggio.mesi)

  return (
    <div className="garage-noleggio">
      <div className="garage-noleggio-card">
        <CarCard auto={noleggio.auto} senzaPrezzo onClick={onApri} />
      </div>
      <dl className="car-modal-specs garage-noleggio-dati">
        <div className="car-modal-spec-row">
          <dt>Durata</dt>
          <dd>{noleggio.mesi} mesi</dd>
        </div>
        <div className="car-modal-spec-row">
          <dt>Periodo</dt>
          <dd>
            {formatData(inizio)} – {formatData(fine)}
          </dd>
        </div>
        <div className="car-modal-spec-row">
          <dt>Anticipo</dt>
          <dd>{formatPrezzo(noleggio.anticipo)}</dd>
        </div>
        <div className="car-modal-spec-row garage-noleggio-rata">
          <dt>Rata mensile</dt>
          <dd>{formatPrezzo(noleggio.rata)}</dd>
        </div>
      </dl>
    </div>
  )
}

function Profilo() {
  const [utente, setUtente] = useState(null)
  const [autenticato, setAutenticato] = useState(() => Boolean(localStorage.getItem('token')))
  const [loading, setLoading] = useState(autenticato)
  const [noleggi, setNoleggi] = useState([])
  const [autoAperta, setAutoAperta] = useState(null)

  useEffect(() => {
    if (!autenticato) return
    let annullato = false
    api
      .get('/api/user/me')
      .then(({ data }) => {
        if (!annullato) setUtente(data)
      })
      .catch(() => {
        if (!annullato) setAutenticato(false)
      })
      .finally(() => {
        if (!annullato) setLoading(false)
      })
    return () => {
      annullato = true
    }
  }, [autenticato])

  // tutte le auto a noleggio del cliente, dalla prima confermata in poi
  useEffect(() => {
    if (!autenticato) return
    let annullato = false
    api
      .get('/api/user/noleggi')
      .then(({ data }) => {
        if (!annullato) setNoleggi(data)
      })
      .catch(() => {})
    return () => {
      annullato = true
    }
  }, [autenticato])

  if (!autenticato) {
    return (
      <AccediPrompt
        messaggio="Accedi per vedere il tuo profilo."
        onLogin={() => {
          setLoading(true)
          setAutenticato(true)
        }}
      />
    )
  }

  return (
    // mobile: sezioni una sotto l'altra; desktop: patente a sinistra, garage a destra
    <div className="profilo">
      <section className="profilo-patente">
        <h2 className="section-subtitle solo-desktop">La tua patente</h2>
        <h3 className="garage-sottotitolo solo-desktop">Dati del conducente</h3>
        {loading && <p className="section-empty-note">Caricamento...</p>}
        {!loading && utente && <Patente utente={utente} />}
      </section>

      <section className="profilo-garage">
        <h2 className="section-subtitle">Garage</h2>
        <h3 className="garage-sottotitolo">Auto a noleggio</h3>
        {noleggi.length > 0 ? (
          <div className="garage-lista">
            {noleggi.map((n) => (
              <NoleggioGarage key={n.id} noleggio={n} onApri={() => setAutoAperta(n.auto)} />
            ))}
          </div>
        ) : (
          <p className="section-empty-note garage-vuoto">
            Nessuna auto a noleggio al momento. Quando ne noleggi una la trovi qui, con tutti i dati del contratto.
          </p>
        )}
      </section>

      <CarModal key={autoAperta?.id} auto={autoAperta} onClose={() => setAutoAperta(null)} />
    </div>
  )
}

export default Profilo
