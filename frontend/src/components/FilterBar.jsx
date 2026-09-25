import { useState } from 'react'
import { BRANDS } from '../data/brands'

// sort ammessi dal backend: prezzo, anno, marca, createdAt (AutoService.SORT_CONSENTITI)
const SORT_MODES = [
  { key: 'data', label: 'Data', sort: 'createdAt,desc' },
  { key: 'prezzo', label: 'Prezzo', sort: 'prezzo,asc' },
  { key: 'anno', label: 'Anno', sort: 'anno,asc' },
]

function initials(name) {
  const parole = name.split(' ')
  if (parole.length > 1) return parole.map((p) => p[0]).join('').toUpperCase()
  return name.length <= 3 ? name.toUpperCase() : name.slice(0, 2).toUpperCase()
}

function SortIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 5v14M7 5 3.5 8.5M7 5l3.5 3.5" />
      <path d="M17 19V5m0 14 3.5-3.5M17 19l-3.5-3.5" />
    </svg>
  )
}

function FilterBar({ onChange = () => {} }) {
  const [marca, setMarca] = useState(null)
  const [sortIndex, setSortIndex] = useState(0)

  function selezionaMarca(slug) {
    const nuova = marca === slug ? null : slug
    setMarca(nuova)
    onChange({ marca: nuova, sort: SORT_MODES[sortIndex].sort })
  }

  function cambiaOrdinamento() {
    const nuovoIndex = (sortIndex + 1) % SORT_MODES.length
    setSortIndex(nuovoIndex)
    onChange({ marca, sort: SORT_MODES[nuovoIndex].sort })
  }

  return (
    <div className="filter-bar">
      {BRANDS.map((brand) => (
        <button
          key={brand.slug}
          type="button"
          className="brand-chip"
          aria-pressed={marca === brand.slug}
          aria-label={brand.name}
          onClick={() => selezionaMarca(brand.slug)}
        >
          <img
            src={`/brands/${brand.slug}.svg`}
            alt=""
            onError={(e) => e.currentTarget.parentElement.classList.add('is-missing')}
          />
          <span className="brand-chip-fallback" aria-hidden="true">
            {initials(brand.name)}
          </span>
        </button>
      ))}

      <button type="button" className="sort-chip" onClick={cambiaOrdinamento}>
        <SortIcon />
        <span>{SORT_MODES[sortIndex].label}</span>
      </button>
    </div>
  )
}

export default FilterBar
