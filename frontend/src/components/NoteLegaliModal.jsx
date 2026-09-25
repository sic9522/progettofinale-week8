import Modal from 'react-bootstrap/Modal'

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <line x1="2" y1="2" x2="14" y2="14" />
      <line x1="14" y1="2" x2="2" y2="14" />
    </svg>
  )
}

function NoteLegaliModal({ show, onClose }) {
  return (
    <Modal show={show} onHide={onClose} centered scrollable dialogClassName="note-legali-dialog" contentClassName="note-legali-content">
      <button type="button" className="car-modal-close" aria-label="Chiudi" onClick={onClose}>
        <CloseIcon />
      </button>

      <div className="note-legali-body">
        <p className="cs-kicker">SicLuxoryCars</p>
        <h2 className="note-legali-title">Note legali &amp; Cookies</h2>

        <h3 className="note-legali-heading">Note legali</h3>
        <p>
          SicLuxoryCars S.p.A. — Sede legale: Via dei Condotti 88, 00187 Roma (RM). Capitale sociale € 500.000
          i.v., P.IVA 01234567890, iscritta al Registro delle Imprese di Roma, REA RM-1234567.
        </p>
        <p>
          I contenuti di questo sito (testi, fotografie, loghi e grafica) sono di proprietà esclusiva di
          SicLuxoryCars S.p.A. e ne è vietata la riproduzione senza autorizzazione scritta. Le informazioni sulle
          vetture sono fornite a scopo illustrativo e non costituiscono offerta contrattuale: prezzi, dotazioni e
          disponibilità vanno sempre confermati in sede di trattativa.
        </p>

        <h3 className="note-legali-heading">Privacy</h3>
        <p>
          I dati personali forniti in fase di registrazione (nome, cognome, username, email) sono trattati ai sensi
          del Regolamento (UE) 2016/679 (GDPR) esclusivamente per gestire l'account, i preferiti e le comunicazioni
          di servizio. Titolare del trattamento è SicLuxoryCars S.p.A.; il DPO è raggiungibile all'indirizzo
          privacy@sicluxorycars.it. Puoi esercitare i diritti di accesso, rettifica e cancellazione scrivendo allo
          stesso indirizzo.
        </p>

        <h3 className="note-legali-heading">Cookie policy</h3>
        <p>Questo sito utilizza:</p>
        <ul className="note-legali-list">
          <li>
            <strong>Cookie tecnici</strong> — necessari al funzionamento (sessione, autenticazione, preferenze di
            navigazione). Non richiedono consenso.
          </li>
          <li>
            <strong>Cookie analitici</strong> — statistiche aggregate e anonime sull'uso della vetrina, per
            migliorare il catalogo.
          </li>
          <li>
            <strong>Cookie di preferenza</strong> — ricordano le tue scelte (tema, filtri, auto preferite) tra una
            visita e l'altra.
          </li>
        </ul>
        <p>
          Non utilizziamo cookie di profilazione pubblicitaria di terze parti. Puoi eliminare i cookie in qualsiasi
          momento dalle impostazioni del tuo browser; alcune funzionalità potrebbero però non essere più
          disponibili.
        </p>

        <p className="note-legali-aggiornamento">Ultimo aggiornamento: gennaio 2025</p>
      </div>
    </Modal>
  )
}

export default NoteLegaliModal
