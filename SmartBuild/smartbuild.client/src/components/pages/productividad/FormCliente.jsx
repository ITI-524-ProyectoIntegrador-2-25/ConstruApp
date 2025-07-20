// src/components/pages/dashboard/FormCliente.jsx
import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import '../../../styles/Dashboard.css'
import './FormCliente.css'

const API_BASE = 'https://smartbuild-001-site1.ktempurl.com'

export default function FormCliente() {
  const navigate = useNavigate()
  const alertRef = useRef(null)

  const [form, setForm] = useState({
    razonSocial:    '',
    identificacion: '',
    tipo:           '',
    nombreContacto: ''
  })
  const [error, setError] = useState('')

  const handleChange = e => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    setError('')
  }

const handleSubmit = async e => {
  e.preventDefault()

  if (!form.razonSocial || !form.identificacion) {
    setError('Razón social e identificación son obligatorios')
    return
  }

  try {
    // 1) Leer raw y parsear
    const usuarioStr = localStorage.getItem('currentUser')
    console.log('🌐 currentUser raw:', usuarioStr)
    if (!usuarioStr) throw new Error('Usuario no autenticado')
    const user = JSON.parse(usuarioStr)
    console.log('🧑 user object:', user)

    // 2) Extraer correo real
    const correoUser = user.correo
                    || user.usuario
                    || user.email
                    || user.username
                    || user.userName
    if (!correoUser) throw new Error('No se encontró el email del usuario')

    // 3) Payload
    const payload = {
      usuario:        correoUser,
      razonSocial:    form.razonSocial,
      identificacion: form.identificacion,
      tipo:           form.tipo,
      nombreContacto: form.nombreContacto
    }

      console.log('Payload enviado al API:', payload) // <-- Agregado
      // Llamada POST al API
      const res = await fetch(
        `${API_BASE}/ClientApi/InsertClient`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept':       'text/plain'
          },
          body: JSON.stringify(payload)
        }
      )
      if (!res.ok) {
        const txt = await res.text()
        throw new Error(txt || `Status ${res.status}`)
      }

      // Regresar al listado
      navigate(-1)
    } catch (err) {
      console.error('Error al guardar cliente:', err)
      setError(err.message || 'No se pudo guardar el cliente. Inténtalo de nuevo.')
    }
  }

  return (
    <div className="form-dashboard-page">
      <header className="form-dashboard-header">
        <button
          className="back-btn"
          onClick={() => navigate(-1)}
          title="Regresar"
        >
          <ChevronLeft size={20}/>
        </button>
        <h1>Nuevo Cliente</h1>
      </header>

      {error && (
        <div ref={alertRef} className="alert alert-danger">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="form-dashboard">
        <div className="form-group">
          <label>Razón social</label>
          <input
            name="razonSocial"
            type="text"
            value={form.razonSocial}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Identificación</label>
          <input
            name="identificacion"
            type="text"
            value={form.identificacion}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Tipo de cliente</label>
          <select
            name="tipo"
            value={form.tipo}
            onChange={handleChange}
          >
            <option value="">Seleccionar tipo</option>
            <option value="Publico">Publico</option>
            <option value="Privado">Privado</option>
            <option value="Fisico">Fisico</option>
          </select>
        </div>

        <div className="form-group">
          <label>Nombre del contacto</label>
          <input
            name="nombreContacto"
            type="text"
            value={form.nombreContacto}
            onChange={handleChange}
          />
        </div>

        <button type="submit" className="btn-submit">
          Guardar cliente
        </button>
      </form>
    </div>
  )
}
