import { useEffect, useState } from 'react'
import Modal from 'react-bootstrap/Modal'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'

import CarCard from '../components/CarCard'
import Patente from '../components/Patente'
import api from '../services/api'
import { formatPrezzo } from '../utils/formatPrezzo'

const VARIANTI_MESI = [24, 36, 48]
const ANTICIPO_DEFAULT_PERC = 20
const AUTO_PER_RIGA = 6

// nessun interesse: rata = (prezzo eventualmente scontato - anticipo) / mesi
function calcolaRata(prezzo, anticipo, mesi, percentualeSconto) {
  const scontato = percentualeSconto ? prezzo * (1 - percentualeSconto / 100) : prezzo
  return (scontato - anticipo) / Math.max(mesi, 1)
}

// stessi campi ovunque si configuri un noleggio (aggiunta o gia' a noleggio): mesi,
// anticipo e sconto sulla stessa riga, prezzo sempre calcolato in automatico dal prezzo
// dell'auto - niente prezzo manuale
function PersonalizzaForm({ prezzo, mesi, setMesi, anticipo, setAnticipo, sconto, setSconto, onAnnulla, onSalva, salvaLabel, salvaDisabled }) {
  const rata = calcolaRata(prezzo, anticipo, mesi, sconto ? Number(sconto) : null)

  return (
    <div className="noleggio-personalizza">
      <div className="car-modal-offerta-sconti">
        {VARIANTI_MESI.map((m) => (
          <button
            key={m}
            type="button"
            className={mesi === m ? 'car-modal-sconto-btn attivo' : 'car-modal-sconto-btn'}
            onClick={() => setMesi(m)}
          >
            {m} mesi
          </button>
        ))}
      </div>

      <div className="noleggio-add-riga">
        <label className="login-label">
          Anticipo (€)
          <input
            type="number"
            min="0"
            className="login-input"
            value={anticipo}
            onChange={(e) => setAnticipo(Number(e.target.value))}
          />
        </label>

        <label className="login-label">
          Sconto
          <select className="login-input" value={sconto} onChange={(e) => setSconto(e.target.value)}>
            <option value="">Nessuno</option>
            <option value="10">10%</option>
            <option value="15">15%</option>
            <option value="20">20%</option>
          </select>
        </label>
      </div>

      <p className="noleggio-rata-preview">
        Rata stimata: <strong>{formatPrezzo(rata)}/mese</strong>
      </p>

      <div className="garage-form-actions">
        <button type="button" className="garage-btn-annulla" onClick={onAnnulla}>
          Annulla
        </button>
        <button type="button" className="garage-btn-conferma" onClick={onSalva} disabled={salvaDisabled}>
          {salvaLabel}
        </button>
      </div>
    </div>
  )
}

// cerca il cliente, poi chiede conferma esplicita prima di creare davvero il noleggio:
// solo a quel punto parte l'email e il noleggio compare nel profilo del cliente
function ConfermaNoleggioModal({ auto, mesi, anticipo, sconto, onClose, onConfermato }) {
  const [termine, setTermine] = useState('')
  // risultati legati al termine che li ha prodotti: una risposta arrivata tardi per un
  // termine gia' cambiato non viene mostrata
  const [ricerca, setRicerca] = useState({ termine: '', lista: [], errore: false })
  const [clienteScelto, setClienteScelto] = useState(null)
  const [confermando, setConfermando] = useState(false)
  const [errore, setErrore] = useState('')

  const pulito = termine.trim()
  // un id e' valido anche di una cifra, il resto da 2 caratteri in su
  const cercabile = /^\d+$/.test(pulito) || pulito.length >= 2
  const aggiornata = ricerca.termine === pulito
  const risultati = cercabile && aggiornata ? ricerca.lista : []

  // ricerca live: parte 300 ms dopo l'ultima lettera, non a ogni tasto
  useEffect(() => {
    if (!cercabile) return
    let annullato = false
    const timer = setTimeout(() => {
      api
        .get('/api/admin/utenti/cerca', { params: { termine: pulito } })
        .then(({ data }) => {
          if (!annullato) setRicerca({ termine: pulito, lista: data, errore: false })
        })
        .catch(() => {
          if (!annullato) setRicerca({ termine: pulito, lista: [], errore: true })
        })
    }, 300)
    return () => {
      annullato = true
      clearTimeout(timer)
    }
  }, [pulito, cercabile])

  async function handleConferma() {
    setConfermando(true)
    setErrore('')
    try {
      await api.post(`/api/admin/auto/${auto.id}/noleggio-cliente`, {
        userId: clienteScelto.id,
        mesi,
        anticipo,
        percentualeSconto: sconto,
      })
      onConfermato()
    } catch {
      setErrore('Conferma non riuscita.')
      setConfermando(false)
    }
  }

  return (
    <Modal show onHide={onClose} centered dialogClassName="car-modal-dialog" contentClassName="car-modal-content">
      <button type="button" className="car-modal-close" aria-label="Chiudi" onClick={onClose}>
        ×
      </button>
      <div className="noleggio-invio-body">
        {!clienteScelto && (
          <>
            <h3 className="login-title noleggio-invio-titolo">Trova cliente</h3>
            <input
              type="search"
              className="login-input"
              placeholder="Cognome, nome, email o ID"
              aria-label="Cerca cliente"
              value={termine}
              onChange={(e) => setTermine(e.target.value)}
              autoFocus
            />
            {cercabile && !aggiornata && <p className="section-empty-note noleggio-ricerca-stato">Cerco...</p>}
            {cercabile && aggiornata && ricerca.errore && <p className="login-errore">Ricerca non riuscita.</p>}
            {cercabile && aggiornata && !ricerca.errore && risultati.length === 0 && (
              <p className="section-empty-note noleggio-ricerca-stato">Nessun cliente trovato.</p>
            )}
            {/* ogni cliente trovato come la sua patente: cliccarla apre la conferma */}
            <div className="noleggio-risultati">
              {risultati.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  className="noleggio-risultato-patente"
                  aria-label={`Scegli ${u.nome} ${u.cognome}`}
                  onClick={() => setClienteScelto(u)}
                >
                  <Patente utente={u} />
                </button>
              ))}
            </div>
          </>
        )}

        {clienteScelto && (
          <>
            <h3 className="login-title noleggio-invio-titolo">Confermi il noleggio?</h3>
            <div className="noleggio-conferma-patente">
              <Patente utente={clienteScelto} />
            </div>
            <dl className="car-modal-specs noleggio-conferma-riepilogo">
              <div className="car-modal-spec-row">
                <dt>Auto</dt>
                <dd>
                  {auto.marca} {auto.modello}
                </dd>
              </div>
              <div className="car-modal-spec-row">
                <dt>Durata</dt>
                <dd>{mesi} mesi</dd>
              </div>
              <div className="car-modal-spec-row">
                <dt>Anticipo</dt>
                <dd>{formatPrezzo(anticipo)}</dd>
              </div>
              {sconto && (
                <div className="car-modal-spec-row">
                  <dt>Sconto</dt>
                  <dd>-{sconto}%</dd>
                </div>
              )}
              <div className="car-modal-spec-row">
                <dt>Rata</dt>
                <dd>{formatPrezzo(calcolaRata(auto.prezzo, anticipo, mesi, sconto))}/mese</dd>
              </div>
            </dl>
            <p className="section-empty-note">
              Confermando il contratto diventa attivo: il cliente riceve l'email e lo trova nel suo garage.
            </p>
            {errore && <p className="login-errore">{errore}</p>}
            <div className="garage-form-actions">
              <button type="button" className="garage-btn-annulla" onClick={() => setClienteScelto(null)}>
                Indietro
              </button>
              <button type="button" className="garage-btn-conferma" onClick={handleConferma} disabled={confermando}>
                {confermando ? 'Conferma...' : 'Conferma contratto'}
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}

// clic su una card di "Offerte Noleggio": si sceglie una delle tre varianti pronte o si
// personalizza, "Salva" carica il preventivo in memoria, poi "Conferma" cerca il cliente
// e, dopo un'ultima conferma esplicita, crea il noleggio e manda l'email
function NoleggioManageModal({ auto, onClose, onRimuovi, onConfermato }) {
  const anticipoDefault = Math.round((auto.prezzo * ANTICIPO_DEFAULT_PERC) / 100)

  const [personalizza, setPersonalizza] = useState(false)
  const [mesi, setMesi] = useState(24)
  const [anticipo, setAnticipo] = useState(anticipoDefault)
  const [sconto, setSconto] = useState('')
  const [preventivo, setPreventivo] = useState(null)
  const [confermaAperta, setConfermaAperta] = useState(false)

  return (
    <>
    <Modal show={!confermaAperta} onHide={onClose} centered dialogClassName="car-modal-dialog" contentClassName="car-modal-content">
      <button type="button" className="car-modal-close" aria-label="Chiudi" onClick={onClose}>
        ×
      </button>
      <div className="noleggio-invio-body">
        <div className="noleggio-card-head">
          <div>
            <span className="car-card-brand">{auto.marca}</span>
            <span className="car-card-model"> {auto.modello}</span>
          </div>
          <button type="button" className="garage-remove" aria-label="Rimuovi dal noleggio" onClick={onRimuovi}>
            ×
          </button>
        </div>

        {!personalizza && (
          <>
            <div className="noleggio-varianti">
              {VARIANTI_MESI.map((m) => (
                <button
                  key={m}
                  type="button"
                  className={
                    preventivo?.origine === 'variante' && preventivo.mesi === m
                      ? 'noleggio-variante attiva'
                      : 'noleggio-variante'
                  }
                  aria-pressed={preventivo?.origine === 'variante' && preventivo.mesi === m}
                  onClick={() => setPreventivo({ origine: 'variante', mesi: m, anticipo: anticipoDefault, sconto: null })}
                >
                  <span className="noleggio-variante-mesi">{m} mesi</span>
                  <span className="noleggio-variante-rata">
                    {formatPrezzo(calcolaRata(auto.prezzo, anticipoDefault, m, null))}/mese
                  </span>
                </button>
              ))}
            </div>
            <p className="section-empty-note">Anticipo di riferimento: {formatPrezzo(anticipoDefault)}</p>
            <button
              type="button"
              className={
                preventivo?.origine === 'personalizzato'
                  ? 'noleggio-personalizza-btn attiva'
                  : 'noleggio-personalizza-btn'
              }
              aria-pressed={preventivo?.origine === 'personalizzato'}
              onClick={() => setPersonalizza(true)}
            >
              {preventivo?.origine === 'personalizzato' ? 'Personalizzato ✓' : 'Personalizza'}
            </button>

            {preventivo && (
              <div className="noleggio-preventivo-pronto">
                <span className="noleggio-preventivo-check">✓ Preventivo caricato</span>
                <button type="button" className="garage-btn-conferma" onClick={() => setConfermaAperta(true)}>
                  Conferma
                </button>
              </div>
            )}
          </>
        )}

        {personalizza && (
          <PersonalizzaForm
            prezzo={auto.prezzo}
            mesi={mesi}
            setMesi={setMesi}
            anticipo={anticipo}
            setAnticipo={setAnticipo}
            sconto={sconto}
            setSconto={setSconto}
            onAnnulla={() => setPersonalizza(false)}
            onSalva={() => {
              setPreventivo({ origine: 'personalizzato', mesi, anticipo, sconto: sconto ? Number(sconto) : null })
              setPersonalizza(false)
            }}
            salvaLabel="Salva"
          />
        )}
      </div>
    </Modal>

      {/* una modale per volta: mentre si cerca il cliente questa resta nascosta (non
          smontata, il preventivo caricato si conserva) e torna se si chiude la ricerca */}
      {confermaAperta && preventivo && (
        <ConfermaNoleggioModal
          auto={auto}
          mesi={preventivo.mesi}
          anticipo={preventivo.anticipo}
          sconto={preventivo.sconto}
          onClose={() => setConfermaAperta(false)}
          onConfermato={() => {
            setConfermaAperta(false)
            setPreventivo(null)
            onConfermato()
          }}
        />
      )}
    </>
  )
}

// clic su "Aggiungi al noleggio": stessi campi (mesi/anticipo/sconto/rata) del preventivo,
// solo per calcolare in anteprima - il prezzo resta sempre quello dell'auto, mai manuale
function NoleggioAddModal({ auto, onClose, onConferma }) {
  const anticipoDefault = Math.round((auto.prezzo * ANTICIPO_DEFAULT_PERC) / 100)

  const [mesi, setMesi] = useState(24)
  const [anticipo, setAnticipo] = useState(anticipoDefault)
  const [sconto, setSconto] = useState('')
  const [salvando, setSalvando] = useState(false)

  async function handleConferma() {
    setSalvando(true)
    await onConferma(auto.id)
  }

  return (
    <Modal show onHide={onClose} centered dialogClassName="car-modal-dialog" contentClassName="car-modal-content">
      <button type="button" className="car-modal-close" aria-label="Chiudi" onClick={onClose}>
        ×
      </button>
      <div className="noleggio-invio-body">
        <h3 className="login-title noleggio-invio-titolo">
          {auto.marca} {auto.modello}
        </h3>

        <PersonalizzaForm
          prezzo={auto.prezzo}
          mesi={mesi}
          setMesi={setMesi}
          anticipo={anticipo}
          setAnticipo={setAnticipo}
          sconto={sconto}
          setSconto={setSconto}
          onAnnulla={onClose}
          onSalva={handleConferma}
          salvaLabel="Aggiungi al noleggio"
          salvaDisabled={salvando}
        />
      </div>
    </Modal>
  )
}

// scheda del cliente con un noleggio confermato: sola lettura piu' revoca
function NoleggioClienteModal({ noleggio, onClose, onRevocato }) {
  const [revocando, setRevocando] = useState(false)

  async function handleRevoca() {
    setRevocando(true)
    await onRevocato(noleggio.id)
  }

  return (
    <Modal show onHide={onClose} centered dialogClassName="car-modal-dialog" contentClassName="car-modal-content">
      <button type="button" className="car-modal-close" aria-label="Chiudi" onClick={onClose}>
        ×
      </button>
      <div className="noleggio-invio-body">
        <div className="noleggio-card-head">
          <div>
            <span className="car-card-brand">{noleggio.auto.marca}</span>
            <span className="car-card-model"> {noleggio.auto.modello}</span>
          </div>
        </div>

        <dl className="car-modal-specs">
          <div className="car-modal-spec-row">
            <dt>Cliente</dt>
            <dd>
              {noleggio.clienteNome} {noleggio.clienteCognome}
            </dd>
          </div>
          <div className="car-modal-spec-row">
            <dt>Email</dt>
            <dd>{noleggio.clienteEmail}</dd>
          </div>
          <div className="car-modal-spec-row">
            <dt>Mesi</dt>
            <dd>{noleggio.mesi}</dd>
          </div>
          <div className="car-modal-spec-row">
            <dt>Anticipo</dt>
            <dd>{formatPrezzo(noleggio.anticipo)}</dd>
          </div>
          <div className="car-modal-spec-row">
            <dt>Rata</dt>
            <dd>{formatPrezzo(noleggio.rata)}/mese</dd>
          </div>
        </dl>

        <div className="garage-form-actions">
          <button type="button" className="garage-btn-annulla" onClick={onClose}>
            Chiudi
          </button>
          <button type="button" className="car-modal-offerta-btn" onClick={handleRevoca} disabled={revocando}>
            Revoca noleggio
          </button>
        </div>
      </div>
    </Modal>
  )
}

function RigaNoleggio({ auto, onSelect }) {
  if (auto.length === 0) return null
  return (
    <Swiper
      modules={[Navigation]}
      slidesPerView={2}
      spaceBetween={12}
      loop={auto.length > AUTO_PER_RIGA}
      navigation={auto.length > AUTO_PER_RIGA}
      breakpoints={{ 992: { slidesPerView: AUTO_PER_RIGA } }}
      className="card-carousel"
    >
      {auto.map((a) => (
        <SwiperSlide key={a.id}>
          <CarCard auto={a} senzaPrezzo onClick={() => onSelect(a)} />
        </SwiperSlide>
      ))}
    </Swiper>
  )
}

function AdminPrestiti() {
  const [autoNoleggio, setAutoNoleggio] = useState([])
  const [candidati, setCandidati] = useState([])
  const [noleggiClienti, setNoleggiClienti] = useState([])
  const [loading, setLoading] = useState(true)
  const [gestisciAuto, setGestisciAuto] = useState(null)
  const [aggiungiAuto, setAggiungiAuto] = useState(null)
  const [vediNoleggio, setVediNoleggio] = useState(null)

  async function ricarica() {
    // se l'elenco noleggi fallisce la pagina mostra comunque le auto: prima un solo
    // errore qui svuotava tutte e tre le sezioni
    const [autoRes, noleggiRes] = await Promise.all([
      api.get('/api/admin/auto', { params: { size: 100 } }),
      api.get('/api/admin/noleggi').catch(() => ({ data: [] })),
    ])
    const tutte = autoRes.data.content
    const clienti = noleggiRes.data
    const autoConCliente = new Set(clienti.map((n) => n.auto.id))

    setNoleggiClienti(clienti)
    setAutoNoleggio(tutte.filter((a) => a.disponibileNoleggio && !autoConCliente.has(a.id)))
    setCandidati(tutte.filter((a) => !a.disponibileNoleggio && a.stato === 'PUBBLICATA'))
  }

  useEffect(() => {
    let annullato = false
    ricarica().finally(() => {
      if (!annullato) setLoading(false)
    })
    return () => {
      annullato = true
    }
  }, [])

  async function aggiungiAlNoleggio(id) {
    await api.patch(`/api/admin/auto/${id}/noleggio`, { disponibile: true })
    await ricarica()
    setAggiungiAuto(null)
  }

  async function rimuoviDalNoleggio(id) {
    await api.patch(`/api/admin/auto/${id}/noleggio`, { disponibile: false })
    await ricarica()
    setGestisciAuto(null)
  }

  async function revocaNoleggio(id) {
    await api.delete(`/api/admin/noleggi/${id}`)
    await ricarica()
    setVediNoleggio(null)
  }

  // "ogni nuovo elemento si aggiunge automaticamente ad una fila": distribuzione
  // alternata, cosi' le due file restano sempre bilanciate mano a mano che crescono
  const rigaA = autoNoleggio.filter((_, i) => i % 2 === 0)
  const rigaB = autoNoleggio.filter((_, i) => i % 2 === 1)

  return (
    <div>
      <h2 className="section-subtitle">Prestiti</h2>
      {loading && <p className="section-empty-note">Caricamento...</p>}

      {!loading && (
        <>
          <h3 className="prestiti-sottotitolo">Offerte Noleggio</h3>
          {autoNoleggio.length === 0 && <p className="section-empty-note">Nessuna auto in noleggio.</p>}
          <RigaNoleggio auto={rigaA} onSelect={setGestisciAuto} />
          <RigaNoleggio auto={rigaB} onSelect={setGestisciAuto} />

          <h3 className="prestiti-sottotitolo">Noleggio Clienti</h3>
          {noleggiClienti.length === 0 && (
            <p className="section-empty-note">Nessun noleggio confermato al momento.</p>
          )}
          {noleggiClienti.length > 0 && (
            <div className="car-grid">
              {noleggiClienti.map((n) => (
                <CarCard key={n.id} auto={n.auto} senzaPrezzo onClick={() => setVediNoleggio(n)} />
              ))}
            </div>
          )}

          <h3 className="prestiti-sottotitolo">Aggiungi ai Noleggi</h3>
          {candidati.length === 0 && (
            <p className="section-empty-note">Tutte le auto pubblicate sono già in noleggio.</p>
          )}
          {candidati.length > 0 && (
            <Swiper
              modules={[Navigation]}
              slidesPerView={2}
              spaceBetween={12}
              loop={candidati.length > AUTO_PER_RIGA}
              navigation={candidati.length > AUTO_PER_RIGA}
              breakpoints={{ 992: { slidesPerView: AUTO_PER_RIGA } }}
              className="card-carousel"
            >
              {candidati.map((auto) => (
                <SwiperSlide key={auto.id}>
                  <div className="prestiti-candidato">
                    <CarCard auto={auto} senzaPrezzo />
                    <button type="button" className="login-submit" onClick={() => setAggiungiAuto(auto)}>
                      Aggiungi al noleggio
                    </button>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </>
      )}

      {gestisciAuto && (
        <NoleggioManageModal
          auto={gestisciAuto}
          onClose={() => setGestisciAuto(null)}
          onRimuovi={() => rimuoviDalNoleggio(gestisciAuto.id)}
          onConfermato={() => {
            setGestisciAuto(null)
            ricarica()
          }}
        />
      )}

      {aggiungiAuto && (
        <NoleggioAddModal auto={aggiungiAuto} onClose={() => setAggiungiAuto(null)} onConferma={aggiungiAlNoleggio} />
      )}

      {vediNoleggio && (
        <NoleggioClienteModal noleggio={vediNoleggio} onClose={() => setVediNoleggio(null)} onRevocato={revocaNoleggio} />
      )}
    </div>
  )
}

export default AdminPrestiti
