import { useEffect, useState } from 'react'

import CarCard from '../components/CarCard'
import CarModal from '../components/CarModal'
import api from '../services/api'

function Offerte() {
  const [offerte, setOfferte] = useState([])
  const [loading, setLoading] = useState(true)
  const [autoSelezionata, setAutoSelezionata] = useState(null)

  useEffect(() => {
    let annullato = false
    api
      .get('/api/auto', { params: { inOfferta: true, size: 100 } })
      .then(({ data }) => {
        if (!annullato) setOfferte(data.content)
      })
      .finally(() => {
        if (!annullato) setLoading(false)
      })
    return () => {
      annullato = true
    }
  }, [])

  return (
    <div>
      <h2 className="section-subtitle">Offerte</h2>
      {loading && <p className="section-empty-note">Caricamento...</p>}
      {!loading && offerte.length === 0 && <p className="section-empty-note">Nessuna auto in offerta al momento.</p>}
      {!loading && offerte.length > 0 && (
        <div className="car-grid">
          {offerte.map((auto) => (
            <CarCard key={auto.id} auto={auto} onClick={() => setAutoSelezionata(auto)} />
          ))}
        </div>
      )}

      <CarModal key={autoSelezionata?.id} auto={autoSelezionata} onClose={() => setAutoSelezionata(null)} />
    </div>
  )
}

export default Offerte
