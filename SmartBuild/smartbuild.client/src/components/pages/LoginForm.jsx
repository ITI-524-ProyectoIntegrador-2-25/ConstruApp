import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { FaGoogle, FaFacebookF } from 'react-icons/fa'
import '../styles/LoginForm.css'

export default function LoginForm() {
  const [showPwd, setShowPwd] = useState(false)

  return (
    <div className="login-card">
      <h2>Bienvenido a Build Smart!</h2>
      <p className="subtitle">Inicia sesión</p>

      <form>
        <div className="form-group">
          <label htmlFor="email">Correo electrónico</label>
          <input
            id="email"
            type="email"
            placeholder="Escribe tu correo electrónico"
            className="input"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Contraseña</label>
          <div className="password-wrapper">
            <input
              id="password"
              type={showPwd ? 'text' : 'password'}
              placeholder="••••••••"
              className="input"
              required
            />
            <button
              type="button"
              className="toggle-btn"
              onClick={() => setShowPwd(!showPwd)}
            >
              {showPwd ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div className="options-row">
          <label className="checkbox-label">
            <input type="checkbox" /> Recordarme
          </label>
          <Link to="/forgot-password" className="forgot-link">
            Olvidé mi contraseña
          </Link>
        </div>

        <button type="submit" className="submit-btn">
          Iniciar sesión
        </button>
      </form>

      <div className="divider">Otras formas</div>

      <div className="social-buttons">
        <button className="social-btn">
          <FaGoogle size={18} /> Continúa con Google
        </button>
        <button className="social-btn">
          <FaFacebookF size={18} /> Continúa con Facebook
        </button>
      </div>

      <div className="register-footer">
        ¿No tienes una cuenta? <Link to="/register">Regístrarme</Link>
      </div>
    </div>
  )
}

