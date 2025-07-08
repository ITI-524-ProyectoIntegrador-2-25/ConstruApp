// src/components/pages/Register.jsx
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../styles/LoginForm.css'

export default function Register() {
  const [fullName, setFullName] = useState('')
  const [gender, setGender]   = useState('')
  const [position, setPosition] = useState('')
  const [email, setEmail]     = useState('')
  const navigate = useNavigate()

  const handleSubmit = e => {
    e.preventDefault()
    // Backend
    navigate('/')
  }

  return (
    <div className="login-card register-card">
      <h2>Crea tu cuenta</h2>
      <p className="subtitle">Comienza a gestionar tu presupuesto fácilmente</p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="fullName">Escribe tu nombre completo</label>
          <input
            id="fullName"
            type="text"
            className="input"
            placeholder="Nombre completo"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="gender">Selecciona tu género</label>
          <select
            id="gender"
            className="input"
            value={gender}
            onChange={e => setGender(e.target.value)}
            required
          >
            <option value="" disabled>Género</option>
            <option value="M">Masculino</option>
            <option value="F">Femenino</option>
            <option value="O">Otro</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="position">Escribe tu puesto profesional</label>
          <input
            id="position"
            type="text"
            className="input"
            placeholder="Puesto profesional"
            value={position}
            onChange={e => setPosition(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Escribe tu correo electrónico</label>
          <input
            id="email"
            type="email"
            className="input"
            placeholder="Correo electrónico"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Contraseña</label>
          <input type="password" placeholder="••••••••" className="input" />
        </div>
        <div className="form-group">
          <label>Confirmar contraseña</label>
          <input type="password" placeholder="••••••••" className="input" />
        </div>

        {/* Sólo el checkbox aquí */}
        <div className="options-row">
          <label className="checkbox-label">
            <input type="checkbox" required />
            Estoy de acuerdo con{' '}
            <a href="#" className="forgot-link">Términos y Condiciones</a>
          </label>
        </div>

        <button type="submit" className="submit-btn">Crear cuenta</button>
      </form>

      {/* Enlace de inicio de sesión abajo, centrado */}
      <div className="footer register-footer">
        ¿Ya tienes una cuenta? <Link to="/">Iniciar sesión</Link>
      </div>
    </div>
  )
}
