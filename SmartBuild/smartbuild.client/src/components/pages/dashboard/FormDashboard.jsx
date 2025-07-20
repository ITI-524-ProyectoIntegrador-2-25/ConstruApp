// src/components/pages/dashboard/FormDashboard.jsx
import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import '../../../styles/Dashboard.css'
import './FormDashboard.css'  

const API_BASE = 'https://smartbuild-001-site1.ktempurl.com'

export default function FormDashboard() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    clienteID:  '',
    fechaInicio:'',
    fechaFin:   '',
    penalizacion: false,
    montoPenalizacion: 0,
    descripcion: '',
    materiaPrimaCotizada: 0,
    manoObraCotizada:    0,
    materiaPrimaCostoReal:0,
    manoObraCostoReal:   0,
    subContratoCostoReal:0,
    otrosGastos:         0,
    fechaFinReal:        ''
  })
  const [error, setError] = useState('')
  const alertRef = useRef(null)

  const handleChange = e => {
    const { name, value, type, checked } = e.target
    setForm(f => ({
      ...f,
      [name]: type === 'checkbox' ? checked : value
    }))
    setError('')
  }

  const handleSubmit = async e => {
    e.preventDefault()
    // validaciones mínimas
    if (!form.clienteID || !form.fechaInicio || !form.descripcion) {
      setError('Cliente, fecha inicio y descripción son obligatorios')
      return
    }
    try {
      const res = await fetch(
        `${API_BASE}/PresupuestoApi/InsertPresupuesto`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept':       'application/json'
          },
          body: JSON.stringify(form)
        }
      )
      if (!res.ok) {
        const txt = await res.text()
        throw new Error(txt || `Status ${res.status}`)
      }
      // opcional: const data = await res.json()
      navigate(-1)
    } catch (err) {
      console.error(err)
      setError('No se pudo guardar el proyecto. Inténtalo de nuevo.')
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
        <h1>Nuevo Proyecto</h1>
      </header>

      {error && (
        <div ref={alertRef} className="alert alert-danger">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="form-dashboard">
        <div className="form-group">
          <label>Cliente ID</label>
          <input
            name="clienteID"
            type="number"
            value={form.clienteID}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Fecha Inicio</label>
          <input
            name="fechaInicio"
            type="date"
            value={form.fechaInicio}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Fecha Fin</label>
          <input
            name="fechaFin"
            type="date"
            value={form.fechaFin}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>
            <input
              name="penalizacion"
              type="checkbox"
              checked={form.penalizacion}
              onChange={handleChange}
            /> Penalización
          </label>
        </div>

        {form.penalizacion && (
          <div className="form-group">
            <label>Monto Penalización</label>
            <input
              name="montoPenalizacion"
              type="number"
              value={form.montoPenalizacion}
              onChange={handleChange}
            />
          </div>
        )}

        <div className="form-group">
          <label>Descripción</label>
          <textarea
            name="descripcion"
            rows={3}
            value={form.descripcion}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Materia Prima Cotizada</label>
          <input
            name="materiaPrimaCotizada"
            type="number"
            value={form.materiaPrimaCotizada}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Mano de Obra Cotizada</label>
          <input
            name="manoObraCotizada"
            type="number"
            value={form.manoObraCotizada}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Materia Prima Costo Real</label>
          <input
            name="materiaPrimaCostoReal"
            type="number"
            value={form.materiaPrimaCostoReal}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Mano de Obra Costo Real</label>
          <input
            name="manoObraCostoReal"
            type="number"
            value={form.manoObraCostoReal}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Subcontrato Costo Real</label>
          <input
            name="subContratoCostoReal"
            type="number"
            value={form.subContratoCostoReal}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Otros Gastos</label>
          <input
            name="otrosGastos"
            type="number"
            value={form.otrosGastos}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Fecha Fin Real</label>
          <input
            name="fechaFinReal"
            type="date"
            value={form.fechaFinReal}
            onChange={handleChange}
          />
        </div>

        <button type="submit" className="btn-submit">
          Guardar proyecto
        </button>
      </form>
    </div>
  )
}
