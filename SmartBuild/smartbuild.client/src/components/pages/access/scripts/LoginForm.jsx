// src/components/pages/access/scripts/LoginForm.jsx
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { FaGoogle, FaFacebookF } from 'react-icons/fa'
import '../styles/LoginForm.css'

const API_BASE = 'https://smartbuild-001-site1.ktempurl.com'

export default function LoginForm() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd]   = useState(false)
  const [error, setError]       = useState('')
  const navigate                = useNavigate()

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')

    // petición GET al endpoint con el email como parámetro
    try {
      const res = await fetch(
        `${API_BASE}/UsuarioApi/GetUsuario?usuario=${encodeURIComponent(email)}`,
        {
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        }
      )

      if (!res.ok) {
        throw new Error(`Status ${res.status}`)
      }

      // la API devuelve un array con los datos del usuario
      const data = await res.json()
      if (!Array.isArray(data) || data.length === 0) {
        setError('Usuario no encontrado')
        return
      }

      const usuario = data[0]
      // Supongamos que la propiedad con la contraseña es "contrasena"
      if (usuario.contrasena !== password) {
        setError('La contraseña es incorrecta')
        return
      }

      // ¡Éxito!
      navigate('/dashboard')
    } catch (err) {
      console.error('Login error:', err)
      setError('Ocurrió un error al iniciar sesión, por favor inténtalo más tarde')
    }
  }

  return (
    <div className="login-card">
      <h2>Bienvenido a Build Smart!</h2>
      <p className="subtitle">Inicia sesión</p>

      <form onSubmit={handleSubmit}>
        {/* Email */}
        <div className="form-group">
          <label htmlFor="email">Correo electrónico</label>
          <input
            id="email"
            type="email"
            placeholder="Escribe tu correo electrónico"
            className="input"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>

        {/* Contraseña */}
        <div className="form-group">
          <label htmlFor="password">Contraseña</label>
          <div className="password-wrapper">
            <input
              id="password"
              type={showPwd ? 'text' : 'password'}
              placeholder="••••••••"
              className="input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="toggle-btn"
              onClick={() => setShowPwd(v => !v)}
              aria-label={showPwd ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPwd ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {/* Mensaje de error justo debajo del input de contraseña */}
          {error && (
            <div className="alert alert-danger mt-2" role="alert">
              {error}
            </div>
          )}
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
