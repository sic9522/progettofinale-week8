import { formatPrezzo } from '../utils/formatPrezzo'

function CarPlaceholderIcon() {
  return (
    <svg width="64" height="36" viewBox="0 0 32 18" fill="currentColor">
      <path d="M4 12 L6 6 Q7 4 10 4 H20 Q23 4 24 6 L27 12 H29 A1 1 0 0 1 30 13 V14 A1 1 0 0 1 29 15 H27 A3 3 0 1 1 21 15 H11 A3 3 0 1 1 5 15 H3 A1 1 0 0 1 2 14 V13 A1 1 0 0 1 3 12 Z" />
      <circle cx="8" cy="15" r="2" fill="var(--color-muted)" />
      <circle cx="24" cy="15" r="2" fill="var(--color-muted)" />
    </svg>
  )
}

function CarTitleOverlay({ brand, model }) {
  return (
    <div className="car-card-title-overlay">
      <span className="car-card-brand">{brand}</span>
      <span className="car-card-model">{model}</span>
    </div>
  )
}

// stato gestito dall'admin: per ora solo VENDUTA mappata su "trattativa", il backend
// (StatoAuto) non ha ancora un valore "in trattativa" vero e proprio
function CarCard({ auto, compact = false, senzaPrezzo = false, onClick }) {
  const Root = onClick ? 'button' : 'article'
  const status = auto.stato === 'VENDUTA' ? 'trattativa' : 'disponibile'
  const photoUrl = auto.foto?.[0]?.url

  return (
    <Root type={onClick ? 'button' : undefined} className={compact ? 'car-card car-card-compact' : 'car-card'} onClick={onClick}>
      <div className="car-card-image">
        {auto.disponibileNoleggio && <span className="car-card-badge">Noleggio</span>}
        <span
          className={`status-dot status-dot-${status}`}
          aria-label={status === 'trattativa' ? 'In trattativa' : 'Disponibile'}
        />
        {photoUrl ? (
          <img className="car-card-photo" src={photoUrl} alt={`${auto.marca} ${auto.modello}`} />
        ) : (
          <CarPlaceholderIcon />
        )}
        <CarTitleOverlay brand={auto.marca} model={auto.modello} />
      </div>
      {auto.inOfferta && !senzaPrezzo && (
        <div className="car-card-offer-price">
          <span className="car-card-price-old">{formatPrezzo(auto.prezzoOriginale)}</span>
          <span className="car-card-price-new">{formatPrezzo(auto.prezzo)}</span>
        </div>
      )}
    </Root>
  )
}

export default CarCard
