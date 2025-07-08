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
          <label>Correo electrónico</label>
          <input
            type="email"
            placeholder="Escribe tu correo electrónico"
            className="input"
          />
        </div>

        <div className="form-group">
          <label>Contraseña</label>
          <div className="password-wrapper">
            <input
              type={showPwd ? 'text' : 'password'}
              placeholder="•••••••••"
              className="input"
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
            <input type="checkbox" />
            Recordarme
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
        <button type="button" className="social-btn">
          <FaGoogle size={18} />
          Continúa con Google
        </button>
        <button type="button" className="social-btn">
          <FaFacebookF size={18} />
          Continúa con Facebook
        </button>
      </div>

      <div className="footer">
        ¿No tienes una cuenta? <a href="register">Regístrarme</a>
      </div>
    </div>
  )
}
