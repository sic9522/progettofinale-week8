import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'motion/react'

import api from '../services/api'

const EASE = [0.65, 0, 0.35, 1]

// destinazione del link nell'email di registrazione (/conferma?token=...): prima non
// esisteva, il link apriva una pagina vuota e l'account restava non verificato
function ConfermaRegistrazione() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [stato, setStato] = useState(token ? 'verifica' : 'senza-token')
  const [errore, setErrore] = useState('')
  const avviata = useRef(false)

  useEffect(() => {
    // il token vale una volta sola: in sviluppo StrictMode esegue l'effetto due volte e
    // la seconda chiamata fallirebbe coprendo l'esito della prima
    if (!token || avviata.current) return
    avviata.current = true
    api
      .get('/auth/confirm', { params: { token } })
      .then(() => setStato('ok'))
      .catch((err) => {
        setErrore(err.response?.data?.message || '')
        setStato('errore')
      })
  }, [token])

  const contenuto = {
    'senza-token': {
      kicker: 'Link non valido',
      titolo: 'Manca il token',
      nota: "Apri questa pagina dal link ricevuto via email.",
    },
    verifica: { kicker: 'Registrazione', titolo: 'Verifica in corso...', nota: '' },
    ok: {
      kicker: 'Fatto',
      titolo: 'Account confermato',
      nota: 'Da ora puoi accedere con la tua email e password.',
    },
    errore: {
      kicker: 'Link non valido',
      titolo: 'Conferma non riuscita',
      nota: errore || 'Il link è scaduto o è già stato usato. Registrati di nuovo per riceverne uno nuovo.',
    },
  }[stato]

  return (
    <div className="login-page">
      <div className="login-card">
        <motion.div
          key={stato}
          className="login-form"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: EASE }}
        >
          <p className="login-kicker">{contenuto.kicker}</p>
          <h2 className="login-title">{contenuto.titolo}</h2>
          {contenuto.nota && <p className="login-note">{contenuto.nota}</p>}
          {stato !== 'verifica' && (
            <Link to="/login" className="login-submit login-submit-link">
              Vai al login
            </Link>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default ConfermaRegistrazione
