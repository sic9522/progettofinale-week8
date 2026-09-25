import { useState } from 'react'
import Modal from 'react-bootstrap/Modal'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Thumbs } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/thumbs'
import { motion } from 'motion/react'

import api from '../services/api'
import LoginModal from './LoginModal'
import { formatPrezzo } from '../utils/formatPrezzo'
import { isAdmin } from '../utils/ruolo'

const EASE = [0.65, 0, 0.35, 1]
const SCONTI = [10, 15, 20]

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="18" y1="6" x2="6" y2="18" />
    </svg>
  )
}

function CarFavIcon() {
  return (
    <svg width="20" height="12" viewBox="0 0 32 18" fill="currentColor">
      <path d="M4 12 L6 6 Q7 4 10 4 H20 Q23 4 24 6 L27 12 H29 A1 1 0 0 1 30 13 V14 A1 1 0 0 1 29 15 H27 A3 3 0 1 1 21 15 H11 A3 3 0 1 1 5 15 H3 A1 1 0 0 1 2 14 V13 A1 1 0 0 1 3 12 Z" />
      <circle cx="8" cy="15" r="2" fill="var(--color-surface)" />
      <circle cx="24" cy="15" r="2" fill="var(--color-surface)" />
    </svg>
  )
}

// richiesta di contatto del cliente: finisce nelle Notifiche dell'admin, che lo
// ricontatta via email (l'email e' gia' quella dell'account, niente da compilare)
function RichiestaInfoModal({ auto, onClose }) {
  const [tipo, setTipo] = useState('ACQUISTO')
  const [stato, setStato] = useState('form')

  async function handleInvia() {
    setStato('invio')
    try {
      await api.post(`/api/auto/${auto.id}/interesse`, { tipo })
      setStato('ok')
    } catch {
      setStato('errore')
    }
  }

  return (
    <Modal show onHide={onClose} centered dialogClassName="car-modal-dialog" contentClassName="car-modal-content">
      <button type="button" className="car-modal-close" aria-label="Chiudi" onClick={onClose}>
        <CloseIcon />
      </button>
      <div className="noleggio-invio-body">
        <h3 className="login-title noleggio-invio-titolo">
          {auto.marca} {auto.modello}
        </h3>

        {stato === 'ok' ? (
          <div className="noleggio-personalizza">
            <p className="noleggio-preventivo-check">✓ Richiesta inviata</p>
            <p className="section-empty-note">Ti contatteremo via email per fissare un appuntamento.</p>
            <button type="button" className="login-submit" onClick={onClose}>
              Chiudi
            </button>
          </div>
        ) : (
          <div className="noleggio-personalizza">
            <p className="section-empty-note">Vuoi essere ricontattato per informazioni su questa auto?</p>
            <div className="car-modal-offerta-sconti">
              <button
                type="button"
                className={tipo === 'ACQUISTO' ? 'car-modal-sconto-btn attivo' : 'car-modal-sconto-btn'}
                onClick={() => setTipo('ACQUISTO')}
              >
                Acquisto
              </button>
              {auto.disponibileNoleggio && (
                <button
                  type="button"
                  className={tipo === 'NOLEGGIO' ? 'car-modal-sconto-btn attivo' : 'car-modal-sconto-btn'}
                  onClick={() => setTipo('NOLEGGIO')}
                >
                  Noleggio
                </button>
              )}
            </div>
            {stato === 'errore' && <p className="login-errore">Invio non riuscito, riprova.</p>}
            <div className="garage-form-actions">
              <button type="button" className="garage-btn-annulla" onClick={onClose}>
                Annulla
              </button>
              <button type="button" className="garage-btn-conferma" onClick={handleInvia} disabled={stato === 'invio'}>
                Richiedi contatto
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}

// legge il JSON grezzo NHTSA e tiene solo i campi non vuoti utili a un acquirente
function estraiSpecifiche(specificheJson) {
  if (!specificheJson) return []
  let s
  try {
    s = JSON.parse(specificheJson)
  } catch {
    return []
  }
  const trasmissione = [s.TransmissionStyle, s.TransmissionSpeeds && `${s.TransmissionSpeeds} marce`]
    .filter(Boolean)
    .join(' - ')
  const produzione = [s.PlantCity, s.PlantCountry].filter(Boolean).join(', ')
  const campi = [
    ['Carrozzeria', s.BodyClass],
    ['Cilindri', s.EngineCylinders],
    ['Cilindrata', s.DisplacementL && `${s.DisplacementL} L`],
    ['Potenza', s.EngineHP && `${s.EngineHP} hp`],
    ['Trazione', s.DriveType],
    ['Trasmissione', trasmissione],
    ['Porte', s.Doors],
    ['Posti', s.Seats],
    ['Alimentazione', s.FuelTypePrimary],
    ['Allestimento', s.Trim],
    ['Peso a vuoto', s.CurbWeightLB && `${s.CurbWeightLB} lb`],
    ['Produzione', produzione],
  ]
  return campi.filter(([, valore]) => valore)
}

function CarModal({ auto: autoIniziale, onClose }) {
  const [showInfo, setShowInfo] = useState(false)
  const [preferitoOk, setPreferitoOk] = useState(false)
  const [auto, setAuto] = useState(autoIniziale)
  const [offertaAperta, setOffertaAperta] = useState(false)
  const [scontoScelto, setScontoScelto] = useState('')
  const [prezzoManuale, setPrezzoManuale] = useState('')
  const [salvandoOfferta, setSalvandoOfferta] = useState(false)
  const [thumbsSwiper, setThumbsSwiper] = useState(null)
  // quale azione ha chiesto il login ('preferito' | 'info'): dopo l'accesso si prosegue con quella
  const [loginPer, setLoginPer] = useState(null)
  const [infoAperta, setInfoAperta] = useState(false)
  const admin = isAdmin()

  if (!auto) return null

  const specifiche = estraiSpecifiche(auto.specifiche)
  const stato = auto.stato === 'VENDUTA' ? 'trattativa' : 'disponibile'
  const foto = (auto.foto || []).slice(0, 7)

  // stesso calcolo del backend (AutoService.applicaOfferta): riferimento e' il prezzo
  // "vero" prima dello sconto, mai quello gia' scontato di un'offerta precedente
  function anteprimaSconto(percentuale) {
    const riferimento = auto.inOfferta ? auto.prezzoOriginale : auto.prezzo
    return Math.round(((riferimento * (100 - percentuale)) / 100) * 100) / 100
  }

  // richiede login: l'ospite accede da una modale sopra questa, senza cambiare pagina,
  // e dopo l'accesso il preferito viene aggiunto subito
  async function handleFavorite() {
    if (!localStorage.getItem('token')) {
      setLoginPer('preferito')
      return
    }
    try {
      await api.post(`/api/auto/${auto.id}/preferiti`, {})
      setPreferitoOk(true)
    } catch {
      // richiesta gia' nei preferiti o altro errore non bloccante: nessuna azione
    }
  }

  async function handleSalvaOfferta() {
    setSalvandoOfferta(true)
    try {
      const body = scontoScelto ? { percentualeSconto: Number(scontoScelto) } : { nuovoPrezzo: Number(prezzoManuale) }
      const { data } = await api.patch(`/api/admin/auto/${auto.id}/offerta`, body)
      setAuto(data)
      setOffertaAperta(false)
      setScontoScelto('')
      setPrezzoManuale('')
    } catch {
      // form resta aperto, l'admin puo' correggere e riprovare
    } finally {
      setSalvandoOfferta(false)
    }
  }

  async function handleRimuoviOfferta() {
    const { data } = await api.delete(`/api/admin/auto/${auto.id}/offerta`)
    setAuto(data)
  }

  async function handleRimuoviNoleggio() {
    const { data } = await api.patch(`/api/admin/auto/${auto.id}/noleggio`, { disponibile: false })
    setAuto(data)
  }

  return (
    <Modal show onHide={onClose} centered dialogClassName="car-modal-dialog" contentClassName="car-modal-content">
      <button type="button" className="car-modal-close" aria-label="Chiudi" onClick={onClose}>
        <CloseIcon />
      </button>
      <span
        className={`status-dot car-modal-status status-dot-${stato}`}
        aria-label={stato === 'trattativa' ? 'In trattativa' : 'Disponibile'}
      />

      <div className="car-modal-flip">
        <motion.div
          className="car-modal-flip-inner"
          animate={{ rotateY: showInfo ? 180 : 0 }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          <div className={`car-modal-face car-modal-face-front${showInfo ? ' car-modal-face-girata' : ''}`}>
            <Swiper
              modules={[Navigation, Thumbs]}
              slidesPerView={1}
              navigation={foto.length > 1}
              thumbs={{ swiper: thumbsSwiper }}
              className="car-modal-swiper"
            >
              {foto.map((f) => (
                <SwiperSlide key={f.id}>
                  <img src={f.url} alt={`${auto.marca} ${auto.modello}`} />
                </SwiperSlide>
              ))}
            </Swiper>
            {foto.length > 1 && (
              <Swiper
                onSwiper={setThumbsSwiper}
                watchSlidesProgress
                slidesPerView="auto"
                spaceBetween={8}
                className="car-modal-thumbs"
              >
                {foto.map((f) => (
                  <SwiperSlide key={f.id}>
                    <img src={f.url} alt="" />
                  </SwiperSlide>
                ))}
              </Swiper>
            )}
            <div className="car-modal-summary">
              <div className="car-modal-titles">
                <span className="car-modal-brand">{auto.marca}</span>
                <span className="car-modal-model">{auto.modello}</span>
                {auto.inOfferta ? (
                  <span className="car-modal-price">
                    <span className="car-card-price-old">{formatPrezzo(auto.prezzoOriginale)}</span>{' '}
                    {formatPrezzo(auto.prezzo)}
                  </span>
                ) : (
                  formatPrezzo(auto.prezzo) && <span className="car-modal-price">{formatPrezzo(auto.prezzo)}</span>
                )}
              </div>
              {!admin && (
                <button
                  type="button"
                  className="car-modal-fav-btn"
                  aria-label="Aggiungi ai preferiti"
                  aria-pressed={preferitoOk}
                  onClick={handleFavorite}
                >
                  <CarFavIcon />
                </button>
              )}
              <button type="button" className="car-modal-info-btn" onClick={() => setShowInfo(true)}>
                Informazioni
              </button>
            </div>

            {admin && !offertaAperta && (
              <div className="car-modal-admin-row">
                {auto.inOfferta ? (
                  <>
                    <button
                      type="button"
                      className="car-modal-offerta-btn car-modal-offerta-btn-modifica"
                      onClick={() => {
                        // parte dal prezzo scontato attuale: l'admin lo ritocca o sceglie un nuovo sconto
                        setPrezzoManuale(String(auto.prezzo))
                        setScontoScelto('')
                        setOffertaAperta(true)
                      }}
                    >
                      Modifica offerta
                    </button>
                    <button type="button" className="car-modal-offerta-btn" onClick={handleRimuoviOfferta}>
                      Rimuovi offerta
                    </button>
                  </>
                ) : (
                  <button type="button" className="car-modal-offerta-btn" onClick={() => setOffertaAperta(true)}>
                    Offerta
                  </button>
                )}
                {auto.disponibileNoleggio && (
                  <button type="button" className="car-modal-offerta-btn" onClick={handleRimuoviNoleggio}>
                    Rimuovi dal noleggio
                  </button>
                )}
              </div>
            )}

            {admin && offertaAperta && (
              <div className="car-modal-offerta-form">
                <div className="car-modal-offerta-sconti">
                  {SCONTI.map((s) => (
                    <button
                      key={s}
                      type="button"
                      className={scontoScelto === String(s) ? 'car-modal-sconto-btn attivo' : 'car-modal-sconto-btn'}
                      onClick={() => {
                        setScontoScelto(String(s))
                        setPrezzoManuale(String(anteprimaSconto(s)))
                      }}
                    >
                      -{s}%
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  className="login-input"
                  placeholder="prezzo (€)"
                  value={prezzoManuale}
                  onChange={(e) => {
                    setPrezzoManuale(e.target.value)
                    setScontoScelto('')
                  }}
                />
                <div className="garage-form-actions">
                  <button
                    type="button"
                    className="garage-btn-annulla"
                    onClick={() => {
                      setOffertaAperta(false)
                      setScontoScelto('')
                      setPrezzoManuale('')
                    }}
                  >
                    Annulla
                  </button>
                  <button
                    type="button"
                    className="garage-btn-conferma"
                    onClick={handleSalvaOfferta}
                    disabled={salvandoOfferta || (!scontoScelto && !prezzoManuale)}
                  >
                    Salva
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className={`car-modal-face car-modal-face-back${showInfo ? '' : ' car-modal-face-girata'}`}>
            <div className="car-modal-back-header">
              <h3>
                {auto.marca} {auto.modello}
              </h3>
            </div>
            <dl className="car-modal-specs">
              <div className="car-modal-spec-row">
                <dt>Anno</dt>
                <dd>{auto.anno}</dd>
              </div>
              {specifiche.map(([label, valore]) => (
                <div key={label} className="car-modal-spec-row">
                  <dt>{label}</dt>
                  <dd>{valore}</dd>
                </div>
              ))}
              {auto.descrizione && (
                <div className="car-modal-spec-row car-modal-spec-row-full">
                  <dt>Descrizione</dt>
                  <dd>{auto.descrizione}</dd>
                </div>
              )}
            </dl>

            <div className="car-modal-back-actions">
              <button type="button" className="car-modal-info-btn" onClick={() => setShowInfo(false)}>
                ← Torna indietro
              </button>
              {/* solo clienti: l'admin non chiede informazioni a se stesso */}
              {!admin && (
                <button
                  type="button"
                  className="garage-btn-conferma car-modal-richiedi-btn"
                  onClick={() => (localStorage.getItem('token') ? setInfoAperta(true) : setLoginPer('info'))}
                >
                  Info
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {loginPer && (
        <LoginModal
          onClose={() => setLoginPer(null)}
          onSuccess={loginPer === 'preferito' ? handleFavorite : () => setInfoAperta(true)}
        />
      )}
      {infoAperta && <RichiestaInfoModal auto={auto} onClose={() => setInfoAperta(false)} />}
    </Modal>
  )
}

export default CarModal
