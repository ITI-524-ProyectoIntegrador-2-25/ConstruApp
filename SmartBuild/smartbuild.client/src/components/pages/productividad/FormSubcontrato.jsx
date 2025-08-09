// src/components/pages/productividad/FormSubcontrato.jsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import '../../../styles/Dashboard.css'
import './FormActividad.css'

const API_BASE = 'https://smartbuild-001-site1.ktempurl.com'

export default function FormSubcontrato() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    descripcion: '',
    fechaInicio: '',
    fechaFin: '',
    porcentajeAvance: '',
    montoCotizado: ''
  })
  const [error, setError] = useState('')

  const handleChange = e => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    setError('')
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const { descripcion, fechaInicio, fechaFin, porcentajeAvance, montoCotizado } = form

    if (!descripcion.trim() || !fechaInicio || !fechaFin) {
      setError('Descripción, fecha de inicio y fin son obligatorias')
      return
    }

    const start = new Date(fechaInicio)
    const end = new Date(fechaFin)
    if (end <= start) {
      setError('La fecha de fin debe ser posterior a la de inicio')
      return
    }

    try {
      const usr = localStorage.getItem('currentUser')
      if (!usr) throw new Error('Usuario no autenticado')
      const { correo, usuario } = JSON.parse(usr)
      const quien = correo || usuario
      const ahora = new Date().toISOString()

      const payload = {
        usuario: quien,
        quienIngreso: quien,
        cuandoIngreso: ahora,
        quienModifico: quien,
        cuandoModifico: ahora,
        idSubcontrato: 0,
        descripcion,
        fechaInicioProyectada: fechaInicio,
        fechaFinProyectada: fechaFin,
        fechaInicioReal: fechaInicio,
        fechaFinReal: fechaFin,
        porcentajeAvance: parseFloat(porcentajeAvance) || 0,
        montoCotizado: parseFloat(montoCotizado) || 0
      }

      const res = await fetch(`${API_BASE}/SubcontratoApi/InsertSubcontrato`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/plain'
        },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const msg = await res.text()
        throw new Error(msg || `Status ${res.status}`)
      }

      navigate(-1)
    } catch (err) {
      console.error('Error creando subcontrato:', err)
      setError(err.message || 'No se pudo guardar el subcontrato')
    }
  }

  return (
    <div className="form-dashboard-page">
      <header className="form-dashboard-header">
        <button className="back-btn" onClick={() => navigate(-1)} title="Regresar">
          <ChevronLeft size={20} />
        </button>
        <h1>Nuevo Subcontrato</h1>
      </header>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit} className="form-dashboard">
        {/* Descripción */}
        <div className="form-group">
          <label>Descripción</label>
          <textarea
            name="descripcion"
            rows={3}
            value={form.descripcion}
            onChange={handleChange}
            required
          />
        </div>

        {/* Fecha de inicio */}
        <div className="form-group">
          <label>Fecha y hora de inicio</label>
          <input
            name="fechaInicio"
            type="datetime-local"
            value={form.fechaInicio}
            onChange={handleChange}
            required
          />
        </div>

        {/* Fecha de fin */}
        <div className="form-group">
          <label>Fecha y hora de fin</label>
          <input
            name="fechaFin"
            type="datetime-local"
            value={form.fechaFin}
            onChange={handleChange}
            required
          />
        </div>

        {/* Porcentaje de avance */}
        <div className="form-group">
          <label>Porcentaje de avance (%)</label>
          <input
            name="porcentajeAvance"
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={form.porcentajeAvance}
            onChange={handleChange}
          />
        </div>

        {/* Monto cotizado */}
        <div className="form-group">
          <label>Monto cotizado (₡)</label>
          <input
            name="montoCotizado"
            type="number"
            min="0"
            step="0.01"
            value={form.montoCotizado}
            onChange={handleChange}
          />
        </div>

        <button type="submit" className="btn-submit">
          Guardar subcontrato
        </button>
      </form>
    </div>
  )
}
