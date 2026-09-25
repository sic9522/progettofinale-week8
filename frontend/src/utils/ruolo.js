// legge il ruolo dal claim del JWT, solo per decidere cosa mostrare in UI: la vera
// autorizzazione la fa sempre il backend (@PreAuthorize), questo non e' un controllo
// di sicurezza
export function getRuolo() {
  const token = localStorage.getItem('token')
  if (!token) return null
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.ruolo ?? null
  } catch {
    return null
  }
}

export function isAdmin() {
  return getRuolo() === 'ADMIN'
}
