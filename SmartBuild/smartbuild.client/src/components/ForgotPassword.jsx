// src/components/ForgotPassword.jsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './LoginForm.css'  // Reutiliza los estilos del login

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const navigate = useNavigate()

  return (
    <div className="login-card">
      {/* Cerrar: vuelve a la ruta anterior */}
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
        Introduce tu correo electrónico para restablecer la contraseña
      </p>

      <form>
        <div className="form-group">
          <label>Correo electrónico</label>
          <input
            type="email"
            className="input"
            placeholder="Escribe tu correo electrónico"
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
