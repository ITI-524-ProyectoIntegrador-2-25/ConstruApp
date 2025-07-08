import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import '../../components/styles/LoginForm.css'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')

  return (
    <div className="login-card">
      <Link to="/" className="back-link">← Volver al login</Link>
      <h2>Reiniciar mi contraseña</h2>
      <p className="subtitle">
        Introduce tu correo electrónico para restablecer tu contraseña
      </p>
      <form>
        <div className="form-group">
          <label>Correo electrónico</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Escribe tu correo electrónico"
            className="input"
          />
        </div>
        <button type="submit" className="submit-btn">
          Reiniciar contraseña
        </button>
      </form>
    </div>
  )
}
