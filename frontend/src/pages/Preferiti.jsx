import { useEffect, useState } from 'react'

import AccediPrompt from '../components/AccediPrompt'
import CarCard from '../components/CarCard'
import CarModal from '../components/CarModal'
import api from '../services/api'

function Preferiti() {
  const [preferiti, setPreferiti] = useState([])
  const [autenticato, setAutenticato] = useState(() => Boolean(localStorage.getItem('token')))
  const [loading, setLoading] = useState(autenticato)
  const [autoSelezionata, setAutoSelezionata] = useState(null)

  useEffect(() => {
    if (!autenticato) return
    let annullato = false
    api
      .get('/api/preferiti')
      .then(({ data }) => {
        if (!annullato) setPreferiti(data)
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

  return (
    <div>
      <h2 className="section-subtitle">CarDreams</h2>
      {!autenticato && <AccediPrompt
          messaggio="Accedi per vedere i tuoi preferiti."
          onLogin={() => {
            setLoading(true)
            setAutenticato(true)
          }}
        />}
      {autenticato && loading && <p className="section-empty-note">Caricamento...</p>}
      {autenticato && !loading && preferiti.length === 0 && (
        <p className="section-empty-note">Nessuna auto nei preferiti.</p>
      )}
      {autenticato && !loading && preferiti.length > 0 && (
        <div className="car-grid">
          {preferiti.map((p) => (
            <CarCard key={p.id} auto={p.auto} onClick={() => setAutoSelezionata(p.auto)} />
          ))}
        </div>
      )}

      <h2 className="section-subtitle">Rent</h2>
      <p className="section-empty-note">
        Il noleggio non è ancora una funzionalità del backend: nessuna auto noleggiata da mostrare qui per ora.
      </p>

      <CarModal key={autoSelezionata?.id} auto={autoSelezionata} onClose={() => setAutoSelezionata(null)} />
    </div>
  )
}

export default Preferiti
