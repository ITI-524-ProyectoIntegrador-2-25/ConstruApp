// src/components/pages/Register.jsx
import React, { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { CSSTransition } from 'react-transition-group'
import 'bootstrap/dist/css/bootstrap.min.css'
import '../styles/LoginForm.css'


export default function Register() {
  const [fullName, setFullName]           = useState('')
  const [gender, setGender]               = useState('')
  const [position, setPosition]           = useState('')
  const [email, setEmail]                 = useState('')
  const [password, setPassword]           = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [strength, setStrength]           = useState({ score: 0, label: '', color: 'danger' })
  const [error, setError]                 = useState('')
  const termsRef                          = useRef(null)
  const alertRef                          = useRef(null)
  const [showPwd,  setShowPwd]  = useState(false)
  const [showPwd2, setShowPwd2] = useState(false)

  // Evalúa fuerza de contraseña
  const evaluateStrength = pwd => {
    let score = 0
    if (pwd.length >= 8) score++
    if (/[A-Z]/.test(pwd)) score++
    if (/[0-9]/.test(pwd)) score++
    if (/[^A-Za-z0-9]/.test(pwd)) score++
    const labels = ['Muy débil','Débil','Media','Fuerte']
    const colors = ['danger','warning','info','success']
    setStrength({ score, label: labels[score-1]||'', color: colors[score-1]||'secondary' })
  }

  const onNameChange = e => {
    const val = e.target.value
    if (/^[A-Za-zÀ-ÿ\s]*$/.test(val) && val.length <= 32) {
      setFullName(val)
      if (error) setError('')
    }
  }

  const onPositionChange = e => {
    const val = e.target.value
    if (/^[A-Za-zÀ-ÿ\s]*$/.test(val) && val.length <= 32) {
      setPosition(val)
      if (error) setError('')
    }
  }

  const onEmailChange = e => {
    const val = e.target.value
    if (val.length <= 32) {
      setEmail(val)
      if (error) setError('')
    }
  }

  const onPwdChange = e => {
    const val = e.target.value
    if (val.length <= 32) {
      setPassword(val)
      evaluateStrength(val)
      if (error) setError('')
    }
  }

  const onConfirmPwdChange = e => {
    const val = e.target.value
    if (val.length <= 32) {
      setConfirmPassword(val)
      if (error) setError('')
    }
  }

  const handleSubmit = e => {
    e.preventDefault()
    if (!fullName) {
      setError('El nombre es obligatorio')
    } else if (!gender) {
      setError('Debes seleccionar un género')
    } else if (!position) {
      setError('El puesto es obligatorio')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Email no válido')
    } else if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
    } else if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
    } else if (!termsRef.current.checked) {
      setError('Debes aceptar los Términos y Condiciones')
    } else {
      setError('')
      // … lógica de envío …
    }
  }

  return (
    <div className="register-card">
      <h2>Crea tu cuenta</h2>
      <p className="subtitle">Comienza a gestionar tu presupuesto fácilmente</p>

      <form onSubmit={handleSubmit}>
        {/* Nombre completo */}
        <div className="form-group">
          <label htmlFor="fullName">Escribe tu nombre completo</label>
          <input
            id="fullName"
            type="text"
            className="input"
            value={fullName}
            onChange={onNameChange}
            placeholder="Nombre completo"
            required
          />
        </div>

        {/* Género */}
        <div className="form-group">
          <label htmlFor="gender">Selecciona tu género</label>
          <select
            id="gender"
            className="input"
            value={gender}
            onChange={e => { setGender(e.target.value); if(error) setError('') }}
            required
          >
            <option value="">Género</option>
            <option>Masculino</option>
            <option>Femenino</option>
            <option>Otro</option>
          </select>
        </div>

        {/* Puesto profesional */}
        <div className="form-group">
          <label htmlFor="position">Escribe tu puesto profesional</label>
          <input
            id="position"
            type="text"
            className="input"
            value={position}
            onChange={onPositionChange}
            placeholder="Puesto profesional"
            required
          />
        </div>

        {/* Correo electrónico */}
        <div className="form-group">
          <label htmlFor="email">Escribe tu correo electrónico</label>
          <input
            id="email"
            type="email"
            className="input"
            value={email}
            onChange={onEmailChange}
            placeholder="Correo electrónico"
            required
          />
        </div>

        {/* Contraseña */}
        <div className="form-group">
          <label htmlFor="password">Escribe tu contraseña</label>
          <div className="password-wrapper">
            <input
              id="password"
              type={showPwd ? 'text' : 'password'}
              className="input"
              value={password}
              onChange={onPwdChange}
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              className="toggle-btn"
              onClick={() => setShowPwd(!showPwd)}
              aria-label={showPwd ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPwd ? <EyeOff size={20}/> : <Eye size={20}/>}
            </button>
          </div>
          {/* Indicador de fuerza */}
          <div className="mt-2">
            <div className="d-flex justify-content-between mb-1">
              <small>Fuerza: {strength.label}</small>
              <small>{password.length}/32</small>
            </div>
            <div className="progress">
              <div
                className={`progress-bar bg-${strength.color}`}
                role="progressbar"
                style={{ width: `${(strength.score / 4) * 100}%` }}
                aria-valuenow={strength.score}
                aria-valuemin={0}
                aria-valuemax={4}
              />
            </div>
          </div>
        </div>

        {/* Confirmar contraseña */}
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirmar contraseña</label>
          <div className="password-wrapper">
            <input
              id="confirmPassword"
              type={showPwd2 ? 'text' : 'password'}
              className="input"
              value={confirmPassword}
              onChange={onConfirmPwdChange}
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              className="toggle-btn"
              onClick={() => setShowPwd2(!showPwd2)}
              aria-label={showPwd2 ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPwd2 ? <EyeOff size={20}/> : <Eye size={20}/>}
            </button>
          </div>
        </div>

        {/* Alerta de errores */}
        <CSSTransition
          in={!!error}
          timeout={300}
          classNames="fade-alert"
          unmountOnExit
          nodeRef={alertRef}
        >
          <div
            ref={alertRef}
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
              onChange={() => error && setError('')}
            />
            Estoy de acuerdo con&nbsp;
            <Link to="#">Términos y Condiciones</Link>
          </label>
        </div>

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
