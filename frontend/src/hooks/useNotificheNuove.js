import { useEffect, useReducer } from 'react'

import api from '../services/api'

const CHIAVE_VISTE = 'notifiche-viste-at'
const INTERVALLO_MS = 30000

// stato condiviso a livello di modulo: sidebar desktop e menu mobile usano lo stesso
// hook, ma parte un solo controllo periodico verso il backend
let ultimaNotifica = null
const ascoltatori = new Set()
let timer = null

function avvisa() {
  ascoltatori.forEach((f) => f())
}

async function aggiorna() {
  try {
    const { data } = await api.get('/api/admin/notifiche')
    ultimaNotifica = data.length ? Math.max(...data.map((n) => Date.parse(n.createdAt))) : null
  } catch {
    // rete o sessione scaduta: il pallino resta com'era, riprova al giro dopo
  }
  avvisa()
}

function vistaAlle() {
  try {
    return Number(localStorage.getItem(CHIAVE_VISTE)) || 0
  } catch {
    return 0
  }
}

// l'admin ha aperto le Notifiche: tutto quello arrivato finora non e' piu' nuovo
export function segnaNotificheViste() {
  try {
    localStorage.setItem(CHIAVE_VISTE, String(Date.now()))
  } catch {
    // storage non disponibile: il pallino si spegne solo per questa sessione
  }
  avvisa()
}

// true se esiste una richiesta arrivata dopo l'ultima visita alla pagina Notifiche
export function useNotificheNuove(attivo) {
  const [, ridisegna] = useReducer((x) => x + 1, 0)

  useEffect(() => {
    if (!attivo) return
    ascoltatori.add(ridisegna)
    if (!timer) {
      aggiorna()
      timer = setInterval(aggiorna, INTERVALLO_MS)
    }
    const alRitorno = () => {
      if (document.visibilityState === 'visible') aggiorna()
    }
    document.addEventListener('visibilitychange', alRitorno)
    return () => {
      document.removeEventListener('visibilitychange', alRitorno)
      ascoltatori.delete(ridisegna)
      if (ascoltatori.size === 0) {
        clearInterval(timer)
        timer = null
      }
    }
  }, [attivo])

  return attivo && ultimaNotifica !== null && ultimaNotifica > vistaAlle()
}
