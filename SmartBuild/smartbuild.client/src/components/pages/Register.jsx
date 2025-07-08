// src/components/pages/Register.jsx

import React, { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { CSSTransition } from 'react-transition-group'
import 'bootstrap/dist/css/bootstrap.min.css'
import '../../components/styles/LoginForm.css'

export default function Register() {
  const [showPwd, setShowPwd]           = useState(false)
  const [showPwd2, setShowPwd2]         = useState(false)
  const [password, setPassword]         = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError]               = useState('')
  const termsRef                        = useRef(null)
  const alertRef                        = useRef(null)   // 🆕 ref para la alerta

  const handleSubmit = e => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }
    if (!termsRef.current.checked) {
      setError('Debes aceptar los Términos y Condiciones')
      return
    }
    setError('')
    // … lógica de envío …
  }

  // Limpia el error tan pronto como el usuario escriba
  const clearError = () => {
    if (error) setError('')
  }

  return (
    <div className="register-card">
      <h2>Crea tu cuenta</h2>
      <p className="subtitle">
        Comienza a gestionar tu presupuesto fácilmente
      </p>

      <form onSubmit={handleSubmit}>
        {/* Nombre completo */}
        <div className="form-group">
          <label>Escribe tu nombre completo</label>
          <input
            type="text"
            placeholder="Nombre completo"
            className="input"
            required
            onChange={clearError}
          />
        </div>

        {/* Género */}
        <div className="form-group">
          <label>Selecciona tu género</label>
          <select
            className="input"
            required
            onChange={clearError}
          >
            <option value="">Género</option>
            <option>Masculino</option>
            <option>Femenino</option>
            <option>Otro</option>
          </select>
        </div>

        {/* Puesto profesional */}
        <div className="form-group">
          <label>Escribe tu puesto profesional</label>
          <input
            type="text"
            placeholder="Puesto profesional"
            className="input"
            required
            onChange={clearError}
          />
        </div>

        {/* Correo electrónico */}
        <div className="form-group">
          <label>Escribe tu correo electrónico</label>
          <input
            type="email"
            placeholder="Correo electrónico"
            className="input"
            required
            onChange={clearError}
          />
        </div>

        {/* Contraseña */}
        <div className="form-group">
          <label>Contraseña</label>
          <div className="password-wrapper">
            <input
              type={showPwd ? 'text' : 'password'}
              placeholder="••••••••"
              className="input"
              required
              value={password}
              onChange={e => { setPassword(e.target.value); clearError() }}
            />
            <button
              type="button"
              className="toggle-btn"
              onClick={() => setShowPwd(!showPwd)}
            >
              {showPwd ? <EyeOff size={20}/> : <Eye size={20}/>}
            </button>
          </div>
        </div>

        {/* Confirmar contraseña */}
        <div className="form-group">
          <label>Confirmar contraseña</label>
          <div className="password-wrapper">
            <input
              type={showPwd2 ? 'text' : 'password'}
              placeholder="••••••••"
              className="input"
              required
              value={confirmPassword}
              onChange={e => { setConfirmPassword(e.target.value); clearError() }}
            />
            <button
              type="button"
              className="toggle-btn"
              onClick={() => setShowPwd2(!showPwd2)}
            >
              {showPwd2 ? <EyeOff size={20}/> : <Eye size={20}/>}
            </button>
          </div>
        </div>

        {/* Alerta animada con ref para evitar findDOMNode */}
        <CSSTransition
          in={!!error}
          timeout={300}
          classNames="fade-alert"
          unmountOnExit
          nodeRef={alertRef}           // 🆕 pasamos aquí el ref
        >
          <div
            ref={alertRef}             // 🆕 asignamos el ref al div
            className="alert alert-danger alert-dismissible"
            role="alert"
          >
            {error}
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={() => setError('')}
            />
          </div>
        </CSSTransition>

        {/* Términos y condiciones */}
        <div className="options-row">
          <label className="checkbox-label">
            <input
              type="checkbox"
              ref={termsRef}
              onChange={clearError}
            />
            Estoy de acuerdo con&nbsp;
            <Link to="#">Términos y Condiciones</Link>
          </label>
        </div>

        {/* Botón Crear cuenta */}
        <button type="submit" className="submit-btn">
          Crear cuenta
        </button>
      </form>

      <div className="register-footer">
        ¿Ya tienes una cuenta? <Link to="/">Iniciar sesión</Link>
      </div>
    </div>
  )
}
