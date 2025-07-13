// src/components/pages/Register.jsx
import React, { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { CSSTransition } from 'react-transition-group'
import 'bootstrap/dist/css/bootstrap.min.css'
import '../styles/LoginForm.css'

const API_BASE = 'https://smartbuild-001-site1.ktempurl.com'

export default function Register() {
  const [firstName, setFirstName]       = useState('')
  const [lastName, setLastName]         = useState('')
  const [position, setPosition]         = useState('')
  const [email, setEmail]               = useState('')
  const [password, setPassword]         = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole]                 = useState('')
  const [strength, setStrength]         = useState({ score: 0, label: '', color: 'danger' })
  const [error, setError]               = useState('')
  const termsRef                        = useRef(null)
  const alertRef                        = useRef(null)
  const [showPwd, setShowPwd]           = useState(false)
  const [showPwd2, setShowPwd2]         = useState(false)
  const navigate                        = useNavigate()

  // Evalúa la fuerza de la contraseña
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

  const handleSubmit = async e => {
    e.preventDefault()

    // 1) Validaciones básicas
    if (!firstName)                return setError('El nombre es obligatorio')
    if (!lastName)                 return setError('El apellido es obligatorio')
    if (!position)                 return setError('El puesto es obligatorio')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError('Email no válido')
    if (password.length < 8)       return setError('La contraseña debe tener al menos 8 caracteres')
    if (password !== confirmPassword) return setError('Las contraseñas no coinciden')
    if (!role)                     return setError('Debes seleccionar un rol')
    if (!termsRef.current.checked) return setError('Debes aceptar los Términos y Condiciones')

    setError('')
    const now = new Date().toISOString()

    // 2) Payload completo según API
    const payload = {
      usuario:       `${firstName}.${lastName}`,
      quienIngreso: 'web-app',
      cuandoIngreso: now,
      quienModifico: 'web-app',
      cuandoModifico: now,
      idUsuario:     0,
      nombre:        firstName,
      apellido:      lastName,
      correo:        email,
      contrasena:    password,
      puesto:        position,
      rol:           role,
      estado:        true
    }

    try {
      const res = await fetch(`${API_BASE}/UsuarioApi/InsertUsuario`, {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept':       'text/plain'
        },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || `Status ${res.status}`)
      }

      // Si la respuesta es JSON, también puedes hacer:
      // const data = await res.json()
      // console.log(data)

      navigate('/')  // redirige a login
    } catch (err) {
      console.error('Fetch error:', err)
      setError('Hubo un problema al comunicarse con el servidor.')
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
            onChange={e => { setFirstName(e.target.value); error && setError('') }}
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
            onChange={e => { setLastName(e.target.value); error && setError('') }}
            placeholder="Apellido"
          />
        </div>

        {/* Puesto */}
        <div className="form-group">
          <label htmlFor="position">Escribe tu puesto de trabajo</label>
          <input
            id="position"
            type="text"
            className="input"
            value={position}
            onChange={e => { setPosition(e.target.value); error && setError('') }}
            placeholder="Puesto profesional"
          />
        </div>

        {/* Correo */}
        <div className="form-group">
          <label htmlFor="email">Escribe tu correo electrónico</label>
          <input
            id="email"
            type="email"
            className="input"
            value={email}
            onChange={e => { setEmail(e.target.value); error && setError('') }}
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
              onChange={e => {
                setPassword(e.target.value)
                evaluateStrength(e.target.value)
                error && setError('')
              }}
              placeholder="••••••••"
            />
            <button
              type="button"
              className="toggle-btn"
              onClick={() => setShowPwd(v => !v)}
              aria-label={showPwd ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPwd ? <EyeOff size={20}/> : <Eye size={20}/>}
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
              onChange={e => { setConfirmPassword(e.target.value); error && setError('') }}
              placeholder="••••••••"
            />
            <button
              type="button"
              className="toggle-btn"
              onClick={() => setShowPwd2(v => !v)}
              aria-label={showPwd2 ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPwd2 ? <EyeOff size={20}/> : <Eye size={20}/>}
            </button>
          </div>
        </div>

        {/* Rol */}
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

        {/* Error */}
        <CSSTransition
          in={!!error}
          timeout={300}
          classNames="fade-alert"
          unmountOnExit
          nodeRef={alertRef}
        >
          <div ref={alertRef} className="alert alert-danger" role="alert">
            {error}
            <button
              type="button"
              className="btn-close"
              onClick={() => setError('')}
            />
          </div>
        </CSSTransition>

        {/* Términos */}
        <div className="options-row">
          <label className="checkbox-label">
            <input
              type="checkbox"
              ref={termsRef}
              onChange={() => error && setError('')}
            /> Estoy de acuerdo con&nbsp;
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
