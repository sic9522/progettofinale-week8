import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'

import api from '../services/api'

const EASE = [0.65, 0, 0.35, 1]

function ReimpostaPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [conferma, setConferma] = useState('')
  const [errore, setErrore] = useState('')
  const [loading, setLoading] = useState(false)
  const [completato, setCompletato] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setErrore('')
    if (password !== conferma) {
      setErrore('Le due password non coincidono.')
      return
    }
    setLoading(true)
    try {
      await api.post('/auth/reimposta-password', { token, password })
      setCompletato(true)
    } catch (err) {
      setErrore(err.response?.data?.message || 'Link non valido o scaduto.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <AnimatePresence mode="wait" initial={false}>
          {!token ? (
            <motion.div
              key="senza-token"
              className="login-form"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
            >
              <p className="login-kicker">Link non valido</p>
              <h2 className="login-title">Manca il token</h2>
              <p className="login-note">Apri questa pagina dal link ricevuto via email.</p>
              <Link to="/login" className="login-submit login-submit-link">
                Torna al login
              </Link>
            </motion.div>
          ) : completato ? (
            <motion.div
              key="completato"
              className="login-form"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
            >
              <p className="login-kicker">Fatto</p>
              <h2 className="login-title">Password aggiornata</h2>
              <p className="login-note">Da ora puoi accedere con la nuova password.</p>
              <Link to="/login" className="login-submit login-submit-link">
                Vai al login
              </Link>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              className="login-form"
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
            >
              <p className="login-kicker">Recupero password</p>
              <h2 className="login-title">Scegli una nuova password</h2>
              <label className="login-label">
                Nuova password
                <input
                  type="password"
                  className="login-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </label>
              <label className="login-label">
                Conferma password
                <input
                  type="password"
                  className="login-input"
                  value={conferma}
                  onChange={(e) => setConferma(e.target.value)}
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </label>
              <p className="login-note">La password deve avere almeno 8 caratteri.</p>
              {errore && <p className="login-errore">{errore}</p>}
              <button type="submit" className="login-submit" disabled={loading}>
                {loading ? 'Salvataggio...' : 'Salva nuova password'}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default ReimpostaPassword
