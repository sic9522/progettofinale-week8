import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'

import api from '../services/api'

const EASE = [0.65, 0, 0.35, 1]

const CAMPO_VUOTO = {
  nome: '',
  cognome: '',
  username: '',
  email: '',
  password: '',
  via: '',
  civico: '',
  cap: '',
  citta: '',
}

function Registrati() {
  const [campi, setCampi] = useState(CAMPO_VUOTO)
  const [errore, setErrore] = useState('')
  const [loading, setLoading] = useState(false)
  const [completato, setCompletato] = useState(false)

  function handleChange(e) {
    const { name, value } = e.target
    setCampi((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErrore('')
    setLoading(true)
    try {
      const indirizzo = [campi.via.trim(), campi.civico.trim()].filter(Boolean).join(' ')
      await api.post('/auth/register', {
        nome: campi.nome.trim(),
        cognome: campi.cognome.trim(),
        username: campi.username.trim(),
        email: campi.email.trim(),
        password: campi.password,
        indirizzo: indirizzo || undefined,
        citta: campi.citta.trim() || undefined,
        cap: campi.cap.trim() || undefined,
      })
      setCompletato(true)
    } catch (err) {
      setErrore(err.response?.data?.message || 'Registrazione non riuscita. Riprova.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <AnimatePresence mode="wait" initial={false}>
          {completato ? (
            <motion.div
              key="conferma"
              className="login-form registrati-conferma"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
            >
              <p className="login-kicker">Quasi fatto</p>
              <h2 className="login-title">Controlla la tua email</h2>
              <p className="login-note">
                Abbiamo inviato un link di conferma a <strong>{campi.email}</strong>. Aprilo per attivare il tuo
                account, poi potrai accedere.
              </p>
              <Link to="/login" className="login-submit login-submit-link">
                Vai al login
              </Link>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3, ease: EASE }}
            >
              <p className="login-kicker">Nuovo account</p>
              <h2 className="login-title">Registrati</h2>

              <form className="login-form" onSubmit={handleSubmit}>
                <div className="registrati-coppia">
                  <label className="login-label">
                    Nome
                    <input
                      type="text"
                      name="nome"
                      className="login-input"
                      value={campi.nome}
                      onChange={handleChange}
                      autoComplete="given-name"
                      required
                    />
                  </label>
                  <label className="login-label">
                    Cognome
                    <input
                      type="text"
                      name="cognome"
                      className="login-input"
                      value={campi.cognome}
                      onChange={handleChange}
                      autoComplete="family-name"
                      required
                    />
                  </label>
                </div>
                <label className="login-label">
                  Username
                  <input
                    type="text"
                    name="username"
                    className="login-input"
                    value={campi.username}
                    onChange={handleChange}
                    autoComplete="username"
                    required
                  />
                </label>
                <label className="login-label">
                  Email
                  <input
                    type="email"
                    name="email"
                    className="login-input"
                    value={campi.email}
                    onChange={handleChange}
                    autoComplete="email"
                    required
                  />
                </label>
                <label className="login-label">
                  Password
                  <input
                    type="password"
                    name="password"
                    className="login-input"
                    value={campi.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />
                </label>
                <p className="login-note">La password deve avere almeno 8 caratteri.</p>

                <label className="login-label">
                  Via
                  <input
                    type="text"
                    name="via"
                    className="login-input"
                    value={campi.via}
                    onChange={handleChange}
                    autoComplete="address-line1"
                  />
                </label>
                <div className="registrati-terzina">
                  <label className="login-label">
                    Civico
                    <input
                      type="text"
                      name="civico"
                      className="login-input"
                      value={campi.civico}
                      onChange={handleChange}
                      autoComplete="address-line2"
                    />
                  </label>
                  <label className="login-label">
                    CAP
                    <input
                      type="text"
                      name="cap"
                      className="login-input"
                      value={campi.cap}
                      onChange={handleChange}
                      autoComplete="postal-code"
                      inputMode="numeric"
                    />
                  </label>
                  <label className="login-label">
                    Città
                    <input
                      type="text"
                      name="citta"
                      className="login-input"
                      value={campi.citta}
                      onChange={handleChange}
                      autoComplete="address-level2"
                    />
                  </label>
                </div>
                {errore && <p className="login-errore">{errore}</p>}
                <button type="submit" className="login-submit" disabled={loading}>
                  {loading ? 'Registrazione...' : 'Crea account'}
                </button>
                <p className="login-note">
                  Hai già un account?{' '}
                  <Link to="/login" className="login-link">
                    Accedi
                  </Link>
                </p>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default Registrati
