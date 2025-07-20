// src/components/pages/dashboard/FormCliente.jsx
import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import '../../../styles/Dashboard.css'
import './FormCliente.css'

const API_BASE = 'https://smartbuild-001-site1.ktempurl.com'

export default function FormCliente() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    razonSocial:      '',
    identificacion:   '',
    tipo:             '',
    nombreContacto:   ''
  })
  const [error, setError] = useState('')
  const alertRef = useRef(null)

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
      const usuarioStr = localStorage.getItem('currentUser')
      const user       = usuarioStr && JSON.parse(usuarioStr)
      const correoUser = user.correo || user.usuario
      const nowIso     = new Date().toISOString()

      const payload = {
        usuario:       correoUser,
        quienIngreso:  correoUser,
        cuandoIngreso: nowIso,
        quienModifico: correoUser,
        cuandoModifico: nowIso,
        idCliente:     0,
        razonSocial:   form.razonSocial,
        identificacion: form.identificacion,
        tipo:          form.tipo,
        nombreContacto: form.nombreContacto
      }

      const res = await fetch(
        `${API_BASE}/ClientApi/InsertClient`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        }
      )
      if (!res.ok) throw new Error(`Status ${res.status}`)
      navigate(-1)
    } catch (err) {
      console.error(err)
      setError('No se pudo guardar el cliente. Intenta de nuevo.')
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
            <option value="">Selecciona…</option>
            <option value="Regular">Regular</option>
            <option value="Premium">Premium</option>
          </select>
        </div>
        <div className="form-group">
          <label>Contacto</label>
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
