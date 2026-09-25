export function formatPrezzo(valore) {
  if (valore == null) return null
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(valore)
}
