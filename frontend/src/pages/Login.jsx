import { useNavigate } from 'react-router-dom'

import LoginForm from '../components/LoginForm'
import { isAdmin } from '../utils/ruolo'

const DESTINAZIONE_POST_LOGIN = '/chi-siamo?intro=1'

function Login() {
  const navigate = useNavigate()

  function handleOspite() {
    sessionStorage.setItem('ospite', 'true')
    navigate(DESTINAZIONE_POST_LOGIN)
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <LoginForm
          showOspite
          onOspite={handleOspite}
          onLoggedIn={() => navigate(isAdmin() ? '/' : DESTINAZIONE_POST_LOGIN)}
        />
      </div>
    </div>
  )
}

export default Login
