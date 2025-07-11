// src/components/pages/Register.jsx
import React, { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { CSSTransition } from 'react-transition-group'
import 'bootstrap/dist/css/bootstrap.min.css'
import '../styles/LoginForm.css'

export default function Register() {
  const [firstName, setFirstName]       = useState('')
  const [lastName, setLastName]         = useState('')
  const [position, setPosition]         = useState('')
  const [email, setEmail]               = useState('')
  const [password, setPassword]         = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole]                 = useState('')
  const [projects, setProjects]         = useState([])
  const [companies, setCompanies]       = useState([])
  const [strength, setStrength]         = useState({ score: 0, label: '', color: 'danger' })
  const [error, setError]               = useState('')
  const termsRef                        = useRef(null)
  const alertRef                        = useRef(null)
  const [showPwd, setShowPwd]           = useState(false)
  const [showPwd2, setShowPwd2]         = useState(false)

  // Evalúa fuerza de contraseña
  const evaluateStrength = pwd => {
    let score = 0
    if (pwd.length >= 8)         score++
    if (/[A-Z]/.test(pwd))        score++
    if (/[0-9]/.test(pwd))        score++
    if (/[^A-Za-z0-9]/.test(pwd)) score++
    const labels = ['Muy débil','Débil','Media','Fuerte']
    const colors = ['danger','warning','info','success']
    setStrength({
      score,
      label: labels[score - 1] || '',
      color: colors[score - 1] || 'secondary'
    })
  }

  // Handlers de campos
  const onFirstNameChange = e => {
    const v = e.target.value
    if (/^[A-Za-zÀ-ÿ\s]*$/.test(v) && v.length <= 32) {
      setFirstName(v)
      error && setError('')
    }
  }
  const onLastNameChange = e => {
    const v = e.target.value
    if (/^[A-Za-zÀ-ÿ\s]*$/.test(v) && v.length <= 32) {
      setLastName(v)
      error && setError('')
    }
  }
  const onPositionChange   = e => { const v = e.target.value; if (/^[A-Za-zÀ-ÿ\s]*$/.test(v) && v.length <= 32) { setPosition(v); error && setError('') } }
  const onEmailChange      = e => { const v = e.target.value; if (v.length <= 32) { setEmail(v); error && setError('') } }
  const onPwdChange        = e => { const v = e.target.value; if (v.length <= 32) { setPassword(v); evaluateStrength(v); error && setError('') } }
  const onConfirmPwdChange = e => { const v = e.target.value; if (v.length <= 32) { setConfirmPassword(v); error && setError('') } }
  const onProjectsChange   = e => { setProjects(Array.from(e.target.selectedOptions, o => o.value)); error && setError('') }
  const onCompaniesChange  = e => { setCompanies(Array.from(e.target.selectedOptions, o => o.value)); error && setError('') }

  const handleSubmit = e => {
    e.preventDefault()
    if (!firstName) {
      setError('El nombre es obligatorio')
    } else if (!lastName) {
      setError('El apellido es obligatorio')
    } else if (!position) {
      setError('El puesto es obligatorio')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Email no válido')
    } else if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
    } else if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
    } else if (!role) {
      setError('Debes seleccionar un rol')
    } else if (projects.length === 0) {
      setError('Selecciona al menos un proyecto')
    } else if (companies.length === 0) {
      setError('Selecciona al menos una empresa')
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
        {/* Nombre */}
        <div className="form-group">
          <label htmlFor="firstName">Escribe tu nombre</label>
          <input
            id="firstName"
            type="text"
            className="input"
            value={firstName}
            onChange={onFirstNameChange}
            placeholder="Nombre"
          />
        </div>

        {/* Apellido */}
        <div className="form-group">
          <label htmlFor="lastName">Escribe tu apellido</label>
          <input
            id="lastName"
            type="text"
            className="input"
            value={lastName}
            onChange={onLastNameChange}
            placeholder="Apellido"
          />
        </div>

        {/* Puesto profesional */}
        <div className="form-group">
          <label htmlFor="position">Escribe tu puesto de trabajo</label>
          <input
            id="position"
            type="text"
            className="input"
            value={position}
            onChange={onPositionChange}
            placeholder="Puesto profesional"
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
    />
    <button
      type="button"
      className="toggle-btn"
      onClick={() => setShowPwd(!showPwd)}
      aria-label={showPwd ? 'Ocultar contraseña' : 'Mostrar contraseña'}
    >
      {showPwd ? <Eye size={20}/> : <EyeOff size={20}/>}
    </button>
  </div>
  <div className="mt-2">
    <div className="d-flex justify-content-between mb-1">
      <small>Fuerza: {strength.label}</small>
      <small>{password.length}/32</small>
    </div>
    <div className="progress">
      <div
        className={`progress-bar bg-${strength.color}`}
        role="progressbar"
        style={{ width: `${(strength.score/4)*100}%` }}
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
    />
    <button
      type="button"
      className="toggle-btn"
      onClick={() => setShowPwd2(!showPwd2)}
      aria-label={showPwd2 ? 'Ocultar contraseña' : 'Mostrar contraseña'}
    >
      {showPwd2 ? <Eye size={20}/> : <EyeOff size={20}/>}
    </button>
  </div>
</div>


        {/* Rol (permiso) */}
        <div className="form-group">
          <label htmlFor="role">Selecciona un rol</label>
          <select
            id="role"
            className="input"
            value={role}
            onChange={e => { setRole(e.target.value); error && setError('') }}
          >
            <option value="">Roles</option>
            <option value="admin">Administrador</option>
            <option value="manager">Gerente</option>
            <option value="employee">Empleado</option>
          </select>
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
