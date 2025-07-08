import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import '../../components/styles/LoginForm.css'

export default function Register() {
  const [showPwd, setShowPwd]   = useState(false)
  const [showPwd2, setShowPwd2] = useState(false)

  return (
    <div className="register-card">
      <h2>Crea tu cuenta</h2>
      <p className="subtitle">
        Comienza a gestionar tu presupuesto fácilmente
      </p>
      <form>
        <div className="form-group">
          <label>Escribe tu nombre completo</label>
          <input
            type="text"
            placeholder="Nombre completo"
            className="input"
          />
        </div>
        <div className="form-group">
          <label>Selecciona tu género</label>
          <select className="input">
            <option>Género</option>
            <option>Femenino</option>
            <option>Masculino</option>
            <option>Otro</option>
          </select>
        </div>
        <div className="form-group">
          <label>Escribe tu puesto profesional</label>
          <input
            type="text"
            placeholder="Puesto profesional"
            className="input"
          />
        </div>
        <div className="form-group">
          <label>Escribe tu correo electrónico</label>
          <input
            type="email"
            placeholder="Correo electrónico"
            className="input"
          />
        </div>
        <div className="form-group">
          <label>Contraseña</label>
          <div className="password-wrapper">
            <input
              type={showPwd ? 'text' : 'password'}
              placeholder="••••••••"
              className="input"
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
        <div className="form-group">
          <label>Confirmar contraseña</label>
          <div className="password-wrapper">
            <input
              type={showPwd2 ? 'text' : 'password'}
              placeholder="••••••••"
              className="input"
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
        <div className="options-row">
          <label className="checkbox-label">
            <input type="checkbox" />
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
