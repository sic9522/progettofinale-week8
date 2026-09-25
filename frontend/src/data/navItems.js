export const NAV_ITEMS_UTENTE = [
  { to: '/', label: 'Vetrina', end: true },
  { to: '/preferiti', label: 'Preferiti' },
  { to: '/profilo', label: 'Profilo' },
  { to: '/chi-siamo', label: 'Chi Siamo' },
]

// l'admin non vede vetrine "per il pubblico" (preferiti, chi siamo) ne' il profilo
// dal menu: gestisce solo catalogo, noleggi e richieste dei clienti
export const NAV_ITEMS_ADMIN = [
  { to: '/', label: 'Vetrina', end: true },
  { to: '/offerte', label: 'Offerte' },
  { to: '/prestiti', label: 'Prestiti' },
  { to: '/notifiche', label: 'Notifiche' },
]
