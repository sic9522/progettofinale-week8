import api from './api'
import { BRANDS } from '../data/brands'

let precaricata = null

async function scarica() {
  const [top, offerte, ...perMarca] = await Promise.all([
    api.get('/api/auto', { params: { sort: 'prezzo,desc', size: 12 } }),
    api.get('/api/auto', { params: { inOfferta: true, size: 24 } }),
    ...BRANDS.map((brand) => api.get('/api/auto', { params: { marca: brand.name, size: 12 } })),
  ])
  const dati = {
    topCars: top.data.content,
    offerte: offerte.data.content,
    perMarca: Object.fromEntries(BRANDS.map((brand, i) => [brand.slug, perMarca[i].data.content])),
  }
  // prima foto di ogni card: il browser la mette in cache, la vetrina appare gia' completa
  const tutte = [...dati.topCars, ...dati.offerte, ...Object.values(dati.perMarca).flat()]
  for (const auto of tutte) {
    const url = auto.foto?.[0]?.url
    if (url) new Image().src = url
  }
  return dati
}

// chiamata dall'intro di Chi Siamo dopo il login: mentre l'utente legge, la vetrina
// e' gia' in download
export function precaricaVetrina() {
  if (!precaricata) precaricata = scarica()
}

// usa il precaricamento una sola volta (poi i dati tornano freschi a ogni visita);
// se era fallito, riprova invece di mostrare l'errore
export function caricaVetrina() {
  const p = precaricata ? precaricata.catch(scarica) : scarica()
  precaricata = null
  return p
}
