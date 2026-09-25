import { useState } from 'react'

import LoginModal from './LoginModal'

function AccediPrompt({ messaggio, onLogin }) {
  const [aperta, setAperta] = useState(false)

  return (
    <p className="section-empty-note">
      {messaggio}
      <br />
      <button type="button" className="section-login-btn" onClick={() => setAperta(true)}>
        Accedi
      </button>
      {aperta && <LoginModal onClose={() => setAperta(false)} onSuccess={onLogin} />}
    </p>
  )
}

export default AccediPrompt
