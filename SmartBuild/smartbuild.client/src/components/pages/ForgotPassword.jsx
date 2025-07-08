import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/LoginForm.css'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const navigate = useNavigate()

  return (
    <div className="login-card">
      <button
        type="button"
        className="close-btn"
        onClick={() => navigate(-1)}
        aria-label="Cerrar"
        style={{
          position: 'absolute', top: '1rem', right: '1rem',
          background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer'
        }}
      >
        ×
      </button>

      <h2>Reiniciar mi contraseña</h2>
      <p className="subtitle">
        Introduce tu correo electrónico para restablecer la contraseña
      </p>

      <form>
        <div className="form-group">
          <label>Correo electrónico</label>
          <input
            type="email"
            className="input"
            placeholder="usuario@dominio.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>

        <button type="submit" className="submit-btn">
          Reiniciar contraseña
        </button>
      </form>
    </div>
  )
}
