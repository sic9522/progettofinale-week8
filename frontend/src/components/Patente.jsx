function AvatarPlaceholderIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4.42 3.58-7 8-7s8 2.58 8 7a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" />
    </svg>
  )
}

// patente del cliente: nel profilo e nella ricerca cliente dell'admin (Prestiti), cosi'
// l'admin riconosce la persona giusta dagli stessi dati che vede lei
function Patente({ utente }) {
  const residenza = [utente.indirizzo, utente.citta].filter(Boolean).join(', ')

  return (
    <div className="patente-card">
      <div className="patente-header">
        <span className="patente-eu">I</span>
        <span className="patente-titolo">Patente di guida</span>
        <span className="patente-brand">SicLuxoryCars</span>
      </div>
      <div className="patente-body">
        <div className="patente-foto" aria-hidden="true">
          <AvatarPlaceholderIcon />
        </div>
        <dl className="patente-dati">
          <div>
            <dt>1. Cognome</dt>
            <dd>{utente.cognome}</dd>
          </div>
          <div>
            <dt>2. Nome</dt>
            <dd>{utente.nome}</dd>
          </div>
          <div>
            <dt>3. Username</dt>
            <dd>{utente.username}</dd>
          </div>
          <div>
            <dt>4a. Email</dt>
            <dd>{utente.email}</dd>
          </div>
          <div>
            <dt>5. N. tessera</dt>
            <dd className="patente-uuid">{utente.numeroTessera}</dd>
          </div>
          <div>
            <dt>8. Residenza</dt>
            <dd>{residenza || '-'}</dd>
          </div>
          {utente.societa && (
            <div>
              <dt>Società</dt>
              <dd>{utente.societa}</dd>
            </div>
          )}
        </dl>
      </div>
      <div className="patente-categorie">
        <span>B</span>
      </div>
    </div>
  )
}

export default Patente
