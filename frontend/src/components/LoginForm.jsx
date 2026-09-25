import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'

import api from '../services/api'

const EASE = [0.65, 0, 0.35, 1]

// l'header resta montato durante un login dalla modale: l'evento gli dice di rileggere il token
function salvaToken(token) {
  localStorage.setItem('token', token)
  window.dispatchEvent(new Event('auth-change'))
}

// stessa logica di autenticazione usata sia dalla pagina /login sia dalla modale
// aperta quando un ospite clicca un'azione che richiede il login: il chiamante decide
// solo cosa succede dopo (onLoggedIn) e se mostrare "continua come ospite"
function LoginForm({ onLoggedIn, showOspite, onOspite }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [codice, setCodice] = useState('')
  const [emailRecupero, setEmailRecupero] = useState('')
  const [step, setStep] = useState('credenziali')
  const [errore, setErrore] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleCredenziali(e) {
    e.preventDefault()
    setErrore('')
    setLoading(true)
    try {
      // l'admin non ha OTP: la risposta contiene gia' il token, si salta lo step
      const { data } = await api.post('/auth/login', { email: email.trim(), password })
      if (data?.token) {
        salvaToken(data.token)
        onLoggedIn()
        return
      }
      setStep('otp')
    } catch {
      setErrore('Email o password non valide.')
    } finally {
      setLoading(false)
    }
  }

  async function handleOtp(e) {
    e.preventDefault()
    setErrore('')
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login/verifica-otp', {
        email: email.trim(),
        codice: codice.trim(),
      })
      salvaToken(data.token)
      onLoggedIn()
    } catch {
      setErrore('Codice non valido o scaduto.')
    } finally {
      setLoading(false)
    }
  }

  async function handlePasswordDimenticata(e) {
    e.preventDefault()
    setErrore('')
    setLoading(true)
    try {
      // risponde sempre 200 anche se l'email non esiste: non c'e' nulla da gestire
      // come errore qui, solo la conferma di invio
      await api.post('/auth/password-dimenticata', { email: emailRecupero.trim() })
      setStep('password-dimenticata-ok')
    } catch {
      setErrore('Qualcosa è andato storto, riprova.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      {step === 'credenziali' && (
        <motion.form
          key="credenziali"
          className="login-form"
          onSubmit={handleCredenziali}
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.3, ease: EASE }}
        >
          <p className="login-kicker">Area riservata</p>
          <h2 className="login-title">Bentornato</h2>
          <label className="login-label">
            Email
            <input
              type="email"
              className="login-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </label>
          <label className="login-label">
            Password
            <input
              type="password"
              className="login-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>
          <button
            type="button"
            className="login-forgot"
            onClick={() => {
              setEmailRecupero(email)
              setErrore('')
              setStep('password-dimenticata')
            }}
          >
            Password dimenticata?
          </button>
          {errore && <p className="login-errore">{errore}</p>}
          <button type="submit" className="login-submit" disabled={loading}>
            {loading ? 'Invio codice...' : 'Continua'}
          </button>
          <p className="login-note">Ti invieremo un codice di verifica via email.</p>
          <p className="login-note login-registrati-note">
            Non hai un account?{' '}
            <Link to="/registrati" className="login-link">
              Registrati
            </Link>
          </p>
          {showOspite && (
            <button type="button" className="login-ospite" onClick={onOspite}>
              Continua come ospite
            </button>
          )}
        </motion.form>
      )}

      {step === 'otp' && (
        <motion.form
          key="otp"
          className="login-form"
          onSubmit={handleOtp}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 24 }}
          transition={{ duration: 0.3, ease: EASE }}
        >
          <p className="login-kicker">Area riservata</p>
          <h2 className="login-title">Bentornato</h2>
          <p className="login-note">
            Abbiamo inviato un codice a 6 cifre a <strong>{email}</strong>
          </p>
          <label className="login-label">
            Codice di verifica
            <input
              type="text"
              className="login-input login-input-otp"
              value={codice}
              onChange={(e) => setCodice(e.target.value.replace(/\D/g, '').slice(0, 6))}
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="••••••"
              required
            />
          </label>
          {errore && <p className="login-errore">{errore}</p>}
          <button type="submit" className="login-submit" disabled={loading || codice.length !== 6}>
            {loading ? 'Verifica...' : 'Accedi'}
          </button>
          <button
            type="button"
            className="login-back"
            onClick={() => {
              setStep('credenziali')
              setCodice('')
              setErrore('')
            }}
          >
            Torna indietro
          </button>
        </motion.form>
      )}

      {step === 'password-dimenticata' && (
        <motion.form
          key="password-dimenticata"
          className="login-form"
          onSubmit={handlePasswordDimenticata}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 24 }}
          transition={{ duration: 0.3, ease: EASE }}
        >
          <p className="login-kicker">Recupero password</p>
          <h2 className="login-title">Password dimenticata</h2>
          <p className="login-note">Inserisci la tua email: ti mandiamo un link per sceglierne una nuova.</p>
          <label className="login-label">
            Email
            <input
              type="email"
              className="login-input"
              value={emailRecupero}
              onChange={(e) => setEmailRecupero(e.target.value)}
              autoComplete="email"
              required
            />
          </label>
          {errore && <p className="login-errore">{errore}</p>}
          <button type="submit" className="login-submit" disabled={loading}>
            {loading ? 'Invio...' : 'Invia link'}
          </button>
          <button
            type="button"
            className="login-back"
            onClick={() => {
              setErrore('')
              setStep('credenziali')
            }}
          >
            Torna indietro
          </button>
        </motion.form>
      )}

      {step === 'password-dimenticata-ok' && (
        <motion.div
          key="password-dimenticata-ok"
          className="login-form"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: EASE }}
        >
          <p className="login-kicker">Controlla la tua email</p>
          <h2 className="login-title">Link inviato</h2>
          <p className="login-note">
            Se <strong>{emailRecupero}</strong> è un account registrato, ti abbiamo mandato un link per
            reimpostare la password. Il link scade tra 30 minuti.
          </p>
          <button type="button" className="login-submit login-submit-link" onClick={() => setStep('credenziali')}>
            Torna al login
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default LoginForm
