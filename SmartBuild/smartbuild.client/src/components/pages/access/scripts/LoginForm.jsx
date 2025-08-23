// src/components/pages/access/scripts/LoginForm.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { FaGoogle, FaFacebookF } from 'react-icons/fa';
import '../styles/LoginForm.css';

const API_BASE = 'https://smartbuild-001-site1.ktempurl.com';

export default function LoginForm() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [remember, setRemember] = useState(() => localStorage.getItem('rememberMe') === '1'); // ⬅️ estado recordarme
  const [error, setError]       = useState('');
  const navigate                = useNavigate();

  // ⬅️ Si ya hay sesión y el usuario eligió "Recordarme", saltamos directo al dashboard
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('currentUser');
      const remembered = localStorage.getItem('rememberMe') === '1';
      if (savedUser && remembered) {
        navigate('/dashboard', { replace: true });
      }
    } catch {
      /* ignore */
    }
  }, [navigate]);

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch(
        `${API_BASE}/UsuarioApi/LoginUsuario?correo=${encodeURIComponent(email)}&contrasena=${encodeURIComponent(password)}`,
        { method: 'GET', headers: { Accept: 'application/json' } }
      );
      if (!res.ok) throw new Error(`Status ${res.status}`);

      const data = await res.json();
      const usuarioObj = Array.isArray(data) ? data[0] : data;

      // 🔧 corrección de paréntesis
      const msg = (usuarioObj?.msg || '').toLowerCase();

      if (msg.includes('autorizado') || msg.includes('ingreso')) {
        const userToStore = {
          ...usuarioObj,
          correo: email,
          usuario: email, // por compatibilidad con otras partes del código
        };

        // Persistimos usuario (como ya hacía tu código)
        localStorage.setItem('currentUser', JSON.stringify(userToStore));

        // ⬅️ persistimos preferencia de "recordarme"
        if (remember) {
          localStorage.setItem('rememberMe', '1');
          // (opcional) guardar correo para autofill futuro
          localStorage.setItem('rememberEmail', email);
        } else {
          localStorage.setItem('rememberMe', '0');
          localStorage.removeItem('rememberEmail');
        }

        navigate('/dashboard');
      } else if (msg.includes('activo')) {
        setError('Su usuario no se encuentra activo');
      } else {
        setError('Usuario o contraseña inválidos');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Ocurrió un error al iniciar sesión. Intenta más tarde.');
    }
  };

  return (
    <div className="login-card">
      <h2>Bienvenido a Build Smart!</h2>
      <p className="subtitle">Inicia sesión</p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Escribe tu correo electrónico</label>
          <input
            id="email"
            type="email"
            placeholder="Correo electrónico"
            className="input"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="username"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Escribe tu contraseña</label>
          <div className="password-wrapper">
            <input
              id="password"
              type={showPwd ? 'text' : 'password'}
              placeholder="••••••••"
              className="input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
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
          {error && (
            <div className="alert alert-danger mt-2" role="alert">
              {error}
            </div>
          )}
        </div>

        <div className="options-row">
          <label className="checkbox-label" htmlFor="rememberMe">
            <input
              id="rememberMe"
              type="checkbox"
              checked={remember}
              onChange={e => setRemember(e.target.checked)}
            />{' '}
            Recordarme
          </label>
          <Link to="/forgot-password" className="forgot-link">
            Olvidé mi contraseña
          </Link>
        </div>

        <button type="submit" className="submit-btn">Iniciar sesión</button>
      </form>

      <div className="divider">Otras formas</div>
      <div className="social-buttons">
        <button className="social-btn"><FaGoogle size={18}/> Google</button>
        <button className="social-btn"><FaFacebookF size={18}/> Facebook</button>
      </div>

      <div className="register-footer">
        ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
      </div>
    </div>
  );
}
