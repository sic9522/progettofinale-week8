import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'

import FilterBar from '../components/FilterBar'
import CarCard from '../components/CarCard'
import CarModal from '../components/CarModal'
import { BRANDS } from '../data/brands'
import api from '../services/api'
import { caricaVetrina } from '../services/vetrina'
import { isAdmin } from '../utils/ruolo'

function BrandRow({ brand, cars, onSelect }) {
  if (cars.length === 0) return null
  return (
    <>
      <h2 className="section-subtitle">{brand.name}</h2>
      <Swiper
        modules={[Navigation]}
        slidesPerView={3}
        spaceBetween={12}
        loop={cars.length > 4}
        navigation={cars.length > 4}
        breakpoints={{ 992: { slidesPerView: 4 } }}
        className="card-carousel"
      >
        {cars.map((auto) => (
          <SwiperSlide key={auto.id}>
            <CarCard auto={auto} onClick={() => onSelect(auto)} />
          </SwiperSlide>
        ))}
      </Swiper>
    </>
  )
}

function Home() {
  const [searchParams] = useSearchParams()
  const termineRicerca = searchParams.get('q')
  const autoIdParam = searchParams.get('auto')

  const [topCars, setTopCars] = useState([])
  const [offerte, setOfferte] = useState([])
  const [brandCars, setBrandCars] = useState({})
  const [loading, setLoading] = useState(true)
  const [errore, setErrore] = useState(false)
  const [autoSelezionata, setAutoSelezionata] = useState(null)

  const [risultatiRicerca, setRisultatiRicerca] = useState([])
  const [risultatiPerTermine, setRisultatiPerTermine] = useState(null)
  const caricandoRicerca = Boolean(termineRicerca) && risultatiPerTermine !== termineRicerca

  const prefersReducedMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // link dalla pagina Notifiche ("questa Ferrari F40"): apre subito la modale di
  // quell'auto invece di farla cercare a mano nel catalogo
  useEffect(() => {
    if (!autoIdParam) return
    let annullato = false
    api
      .get(`/api/auto/${autoIdParam}`)
      .then(({ data }) => {
        if (!annullato) setAutoSelezionata(data)
      })
      .catch(() => {})
    return () => {
      annullato = true
    }
  }, [autoIdParam])

  useEffect(() => {
    if (termineRicerca) return
    let annullato = false

    async function carica() {
      try {
        const dati = await caricaVetrina()
        if (annullato) return
        setTopCars(dati.topCars)
        setOfferte(dati.offerte)
        setBrandCars(dati.perMarca)
      } catch {
        if (!annullato) setErrore(true)
      } finally {
        if (!annullato) setLoading(false)
      }
    }

    carica()
    return () => {
      annullato = true
    }
  }, [termineRicerca])

  // "q" cerca gia' su marca, modello e descrizione lato backend (AutoSpecifications):
  // basta questa unica chiamata per far comparire sia una marca che un modello cercato
  useEffect(() => {
    if (!termineRicerca) return
    let annullato = false
    api
      .get('/api/auto', { params: { q: termineRicerca, size: 24 } })
      .then(({ data }) => {
        if (annullato) return
        setRisultatiRicerca(data.content)
        setRisultatiPerTermine(termineRicerca)
      })
      .catch(() => {
        if (annullato) return
        setRisultatiRicerca([])
        setRisultatiPerTermine(termineRicerca)
      })
    return () => {
      annullato = true
    }
  }, [termineRicerca])

  return (
    <div>
      <FilterBar />

      {termineRicerca ? (
        <>
          {caricandoRicerca && <p className="section-empty-note">Ricerca in corso...</p>}
          {!caricandoRicerca && risultatiRicerca.length === 0 && (
            <p className="section-empty-note">Nessun risultato per "{termineRicerca}".</p>
          )}
          {!caricandoRicerca && risultatiRicerca.length > 0 && (
            <div className="car-grid">
              {risultatiRicerca.map((auto) => (
                <CarCard key={auto.id} auto={auto} onClick={() => setAutoSelezionata(auto)} />
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          {loading && <p className="section-empty-note">Caricamento catalogo...</p>}
          {errore && <p className="section-empty-note">Catalogo non disponibile al momento.</p>}

          {!loading && !errore && (
            <>
              {!isAdmin() && offerte.length > 0 && (
                <>
                  <h2 className="section-subtitle">Offerte</h2>
                  <Swiper
                    modules={[Autoplay, Navigation]}
                    slidesPerView={2}
                    spaceBetween={12}
                    loop={offerte.length > 6}
                    navigation={offerte.length > 6}
                    breakpoints={{ 992: { slidesPerView: 6 } }}
                    autoplay={prefersReducedMotion ? false : { delay: 3000, disableOnInteraction: false }}
                    className="card-carousel"
                  >
                    {offerte.map((auto) => (
                      <SwiperSlide key={auto.id}>
                        <CarCard auto={auto} compact onClick={() => setAutoSelezionata(auto)} />
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </>
              )}

              <h2 className="section-subtitle">Top Car</h2>
              <Swiper
                modules={[Autoplay, Navigation]}
                slidesPerView={2}
                spaceBetween={12}
                loop={topCars.length > 3}
                navigation={topCars.length > 3}
                breakpoints={{ 992: { slidesPerView: 3 } }}
                autoplay={prefersReducedMotion ? false : { delay: 5000, disableOnInteraction: false }}
                className="card-carousel"
              >
                {topCars.map((auto) => (
                  <SwiperSlide key={auto.id}>
                    <CarCard auto={auto} onClick={() => setAutoSelezionata(auto)} />
                  </SwiperSlide>
                ))}
              </Swiper>

              {BRANDS.map((brand) => (
                <BrandRow
                  key={brand.slug}
                  brand={brand}
                  cars={brandCars[brand.slug] || []}
                  onSelect={setAutoSelezionata}
                />
              ))}
            </>
          )}
        </>
      )}

      <CarModal key={autoSelezionata?.id} auto={autoSelezionata} onClose={() => setAutoSelezionata(null)} />
    </div>
  )
}

export default Home
