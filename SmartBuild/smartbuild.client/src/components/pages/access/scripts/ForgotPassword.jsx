import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/LoginForm.css' // O donde tengas tu CSS

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')

  const handleSubmit = e => {
    e.preventDefault()
    // lógica para enviar el email...
  }

  return (
    <div className="login-card">
      {/* botón cerrar */}
      <button
        type="button"
        className="close-btn"
        onClick={() => navigate(-1)}
        aria-label="Cerrar"
      >
        ×
      </button>

      <h2>Reiniciar mi contraseña</h2>
      <p className="subtitle">
        Introduce tu correo electrónico para restablecer tu contraseña
      </p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Correo electrónico</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Escribe tu correo electrónico"
            className="input"
            required
          />
        </div>

        <button type="submit" className="submit-btn">
          Reiniciar contraseña
        </button>
      </form>
    </div>
  )
}
