// src/components/pages/dashboard/FormCliente.jsx
import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import Select from 'react-select'
import '../../../styles/Dashboard.css'
import './FormCliente.css'

const API_BASE = 'https://smartbuild-001-site1.ktempurl.com'

const tipoOptions = [
  { value: 'Publico', label: 'Público' },
  { value: 'Privado', label: 'Privado' },
  { value: 'Fisico', label: 'Físico' }
]

export default function FormCliente() {
  const navigate = useNavigate()
  const alertRef = useRef(null)

  const [form, setForm] = useState({
    razonSocial:    '',
    identificacion: '',
    tipo:           null,    // ahora un objeto {value,label}
    nombreContacto: ''
  })
  const [error, setError] = useState('')

  // inputs estándar (texto, número, etc.)
  const handleChange = e => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    setError('')
  }

  // handler para react-select
  const handleSelect = option => {
    setForm(f => ({ ...f, tipo: option }))
    setError('')
  }

  const handleSubmit = async e => {
    e.preventDefault()

    if (!form.razonSocial || !form.identificacion || !form.tipo) {
      setError('Razón social, identificación y tipo son obligatorios')
      return
    }

    try {
      // obtén el usuario del localStorage
      const usuarioStr = localStorage.getItem('currentUser')
      if (!usuarioStr) throw new Error('Usuario no autenticado')
      const user = JSON.parse(usuarioStr)
      const correoUser = user.correo || user.usuario

      // payload: extraemos el valor de tipo
      const payload = {
        usuario:        correoUser,
        razonSocial:    form.razonSocial,
        identificacion: form.identificacion,
        tipo:           form.tipo.value,
      }

      const res = await fetch(
        `${API_BASE}/ClientApi/InsertClient`, {
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
        {/* Razón social */}
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

        {/* Identificación */}
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
          <Select
            name="tipo"
            options={tipoOptions}
            value={form.tipo}
            onChange={handleSelect}
            placeholder="Seleccionar tipo…"
            className="react-select-container"
            classNamePrefix="react-select"
            isClearable
            menuPlacement="auto"
            menuPosition="absolute"
            menuPortalTarget={document.body}
            styles={{
              menuPortal: (base) => ({ 
                ...base, 
                zIndex: 10000 
              }),
              menu: (base) => ({ 
                ...base, 
                zIndex: 10000 
              })
            }}
          />
        </div>

        <button type="submit" className="btn-submit">
          Guardar cliente
        </button>
      </form>
    </div>
  )
}
