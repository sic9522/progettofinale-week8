import Modal from 'react-bootstrap/Modal'

import LoginForm from './LoginForm'

// per l'ospite che clicca un'azione riservata: si accede senza lasciare la pagina,
// chiudendo la modale resta tutto com'era
function LoginModal({ onClose, onSuccess }) {
  return (
    <Modal show onHide={onClose} centered dialogClassName="car-modal-dialog" contentClassName="car-modal-content">
      <button type="button" className="car-modal-close" aria-label="Chiudi" onClick={onClose}>
        ×
      </button>
      <div className="noleggio-invio-body">
        <LoginForm
          onLoggedIn={() => {
            onClose()
            onSuccess?.()
          }}
        />
      </div>
    </Modal>
  )
}

export default LoginModal
