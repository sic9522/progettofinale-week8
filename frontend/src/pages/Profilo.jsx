import { useEffect, useState } from 'react'

import AccediPrompt from '../components/AccediPrompt'
import CarCard from '../components/CarCard'
import api from '../services/api'
import { formatPrezzo } from '../utils/formatPrezzo'

const GARAGE_KEY = 'garage-auto'

function leggiGarage() {
  try {
    return JSON.parse(localStorage.getItem(GARAGE_KEY)) || []
  } catch {
    return []
  }
}

function salvaGarage(lista) {
  localStorage.setItem(GARAGE_KEY, JSON.stringify(lista))
}

function AvatarPlaceholderIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4.42 3.58-7 8-7s8 2.58 8 7a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" />
    </svg>
  )
}

function Patente({ utente }) {
  const residenza = [utente.indirizzo, utente.citta].filter(Boolean).join(', ')

  return (
    <div className="patente-card">
      <div className="patente-header">
        <span className="patente-eu">I</span>
        <span className="patente-titolo">Patente di guida</span>
        <span className="patente-brand">SicLuxoryCars</span>
      </div>
      <div className="patente-body">
        <div className="patente-foto" aria-hidden="true">
          <AvatarPlaceholderIcon />
        </div>
        <dl className="patente-dati">
          <div>
            <dt>1. Cognome</dt>
            <dd>{utente.cognome}</dd>
          </div>
          <div>
            <dt>2. Nome</dt>
            <dd>{utente.nome}</dd>
          </div>
          <div>
            <dt>3. Username</dt>
            <dd>{utente.username}</dd>
          </div>
          <div>
            <dt>4a. Email</dt>
            <dd>{utente.email}</dd>
          </div>
          <div>
            <dt>5. N. tessera</dt>
            <dd className="patente-uuid">{utente.numeroTessera}</dd>
          </div>
          <div>
            <dt>8. Residenza</dt>
            <dd>{residenza || '-'}</dd>
          </div>
          {utente.societa && (
            <div>
              <dt>Società</dt>
              <dd>{utente.societa}</dd>
            </div>
          )}
        </dl>
      </div>
      <div className="patente-categorie">
        <span>B</span>
      </div>
    </div>
  )
}

function AggiungiAutoCard({ onAdd }) {
  const [aperto, setAperto] = useState(false)
  const [targa, setTarga] = useState('')
  const [modello, setModello] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!targa.trim() || !modello.trim()) return
    onAdd({ id: Date.now(), targa: targa.trim().toUpperCase(), modello: modello.trim() })
    setTarga('')
    setModello('')
    setAperto(false)
  }

  if (!aperto) {
    return (
      <button type="button" className="garage-card garage-card-add" onClick={() => setAperto(true)}>
        <span className="garage-add-icon">+</span>
        <span>Aggiungi auto</span>
      </button>
    )
  }

  return (
    <form className="garage-card garage-card-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Targa"
        value={targa}
        onChange={(e) => setTarga(e.target.value)}
        className="garage-input"
        autoFocus
        required
      />
      <input
        type="text"
        placeholder="Modello"
        value={modello}
        onChange={(e) => setModello(e.target.value)}
        className="garage-input"
        required
      />
      <div className="garage-form-actions">
        <button type="submit" className="garage-btn-conferma">
          Salva
        </button>
        <button type="button" className="garage-btn-annulla" onClick={() => setAperto(false)}>
          Annulla
        </button>
      </div>
    </form>
  )
}

function GarageCard({ auto, onRemove }) {
  return (
    <div className="garage-card">
      <button type="button" className="garage-remove" aria-label="Rimuovi auto" onClick={() => onRemove(auto.id)}>
        ×
      </button>
      <span className="garage-targa">{auto.targa}</span>
      <span className="garage-modello">{auto.modello}</span>
    </div>
  )
}

function Profilo() {
  const [utente, setUtente] = useState(null)
  const [autenticato, setAutenticato] = useState(() => Boolean(localStorage.getItem('token')))
  const [loading, setLoading] = useState(autenticato)
  const [garage, setGarage] = useState(() => leggiGarage())
  const [noleggio, setNoleggio] = useState(null)

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

  // 204 senza noleggio attivo: axios non passa per il .catch, data e' solo vuota
  useEffect(() => {
    if (!autenticato) return
    let annullato = false
    api
      .get('/api/user/noleggio')
      .then(({ data }) => {
        if (!annullato) setNoleggio(data || null)
      })
      .catch(() => {})
    return () => {
      annullato = true
    }
  }, [autenticato])

  function aggiungiAuto(auto) {
    setGarage((prev) => {
      const nuovo = [...prev, auto]
      salvaGarage(nuovo)
      return nuovo
    })
  }

  function rimuoviAuto(id) {
    setGarage((prev) => {
      const nuovo = prev.filter((a) => a.id !== id)
      salvaGarage(nuovo)
      return nuovo
    })
  }

  return (
    <div>
      {!autenticato && <AccediPrompt
          messaggio="Accedi per vedere il tuo profilo."
          onLogin={() => {
            setLoading(true)
            setAutenticato(true)
          }}
        />}
      {autenticato && loading && <p className="section-empty-note">Caricamento...</p>}
      {autenticato && !loading && utente && <Patente utente={utente} />}

      {autenticato && noleggio && (
        <>
          <h2 className="section-subtitle">Il tuo noleggio</h2>
          <div className="car-grid">
            <div>
              <CarCard auto={noleggio.auto} />
              <p className="section-empty-note">
                {noleggio.mesi} mesi, anticipo {formatPrezzo(noleggio.anticipo)}, rata {formatPrezzo(noleggio.rata)}/mese
              </p>
            </div>
          </div>
        </>
      )}

      <h2 className="section-subtitle">Garage</h2>
      <p className="section-empty-note">
        Salvato solo su questo dispositivo: il backend non ha ancora un garage vero collegato all'account, e non
        esiste un servizio che riconosce il modello dalla targa italiana, quindi va scritto a mano.
      </p>
      <div className="garage-grid">
        {garage.map((auto) => (
          <GarageCard key={auto.id} auto={auto} onRemove={rimuoviAuto} />
        ))}
        <AggiungiAutoCard onAdd={aggiungiAuto} />
      </div>
    </div>
  )
}

export default Profilo
