// src/components/pages/dashboard/FormDashboard.jsx
import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import Select from 'react-select'
import '../../../styles/Dashboard.css'
import './FormDashboard.css'

const API_BASE = 'https://smartbuild-001-site1.ktempurl.com'

export default function FormDashboard() {
  const navigate = useNavigate()
  const alertRef = useRef(null)

  // opciones de clientes para react-select
  const [clientOpts, setClientOpts] = useState([])

  // estado del formulario 
  const [form, setForm] = useState({
    cliente:               null,   // objeto {value,label}
    fechaInicio:           '',
    fechaFin:              '',
    penalizacion:          false,
    montoPenalizacion:     0,
    descripcion:           '',
    materiaPrimaCotizada:  0,
    manoObraCotizada:      0,
    materiaPrimaCostoReal: 0,
    manoObraCostoReal:     0,
    subContratoCostoReal:  0,
    otrosGastos:           0,
    fechaFinReal:          ''
  })
  const [error, setError] = useState('')

  // Configuración de campos numéricos
  const camposNumericos = [
    { name: 'materiaPrimaCotizada', label: 'Materia Prima Cotizada' },
    { name: 'manoObraCotizada', label: 'Mano de Obra Cotizada' },
    { name: 'materiaPrimaCostoReal', label: 'Materia Prima Costo Real' },
    { name: 'manoObraCostoReal', label: 'Mano de Obra Costo Real' },
    { name: 'subContratoCostoReal', label: 'Subcontrato Costo Real' },
    { name: 'otrosGastos', label: 'Otros Gastos' }
  ]

  // Configuración de campos de fecha
  const camposFecha = [
    { name: 'fechaInicio', label: 'Fecha Inicio', required: true },
    { name: 'fechaFin', label: 'Fecha Fin', required: false },
    { name: 'fechaFinReal', label: 'Fecha Fin Real', required: false }
  ]

  // traer lista de clientes y mapear a opciones
  useEffect(() => {
    const usr = localStorage.getItem('currentUser')
    if (!usr) return
    const user   = JSON.parse(usr)
    const correo = encodeURIComponent(user.correo || user.usuario)

    fetch(`${API_BASE}/ClientApi/GetClients?usuario=${correo}`)
      .then(res => {
        if (!res.ok) throw new Error(`Status ${res.status}`)
        return res.json()
      })
      .then(data => {
        const opts = data.map(c => ({
          value: c.idCliente,
          label: c.razonSocial
        }))
        setClientOpts(opts)
      })
      .catch(err => console.error('Error cargando clientes:', err))
  }, [])

  // handler para inputs estándar 
  const handleChange = e => {
    const { name, value, type, checked } = e.target
    setForm(f => ({
      ...f,
      [name]: type === 'checkbox' ? checked : value
    }))
    setError('')
  }

  // handler para react-select
  const handleSelect = field => selected => {
    setForm(f => ({ ...f, [field]: selected }))
    setError('')
  }

  const handleSubmit = async e => {
    e.preventDefault()
    // validaciones 
    if (!form.cliente || !form.fechaInicio || !form.descripcion) {
      setError('Cliente, fecha inicio y descripción son obligatorios')
      return
    }

    try {
      const usr = localStorage.getItem('currentUser')
      if (!usr) throw new Error('Usuario no autenticado')
      const user       = JSON.parse(usr)
      const correoUser = user.correo || user.usuario

      // payload: extraemos el ID del cliente seleccionado
      const payload = {
        usuario:                 correoUser,
        clienteID:               form.cliente.value,
        fechaInicio:            new Date(form.fechaInicio).toISOString(),
        fechaFin:               form.fechaFin ? new Date(form.fechaFin).toISOString() : null,
        penalizacion:           form.penalizacion,
        montoPenalizacion:      form.montoPenalizacion,
        descripcion:            form.descripcion,
        materiaPrimaCotizada:   form.materiaPrimaCotizada,
        manoObraCotizada:       form.manoObraCotizada,
        materiaPrimaCostoReal:  form.materiaPrimaCostoReal,
        manoObraCostoReal:      form.manoObraCostoReal,
        subContratoCostoReal:   form.subContratoCostoReal,
        otrosGastos:            form.otrosGastos,
        fechaFinReal:           form.fechaFinReal 
          ? new Date(form.fechaFinReal).toISOString()
          : null
      }

      const res = await fetch(
        `${API_BASE}/PresupuestoApi/InsertPresupuesto`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept':       'application/json'
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
      console.error('Error al guardar el proyecto:', err)
      setError(err.message || 'No se pudo guardar el proyecto. Intenta de nuevo.')
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
          <label>Cliente</label>
          <Select
            name="cliente"
            options={clientOpts}
            value={form.cliente}
            onChange={handleSelect('cliente')}
            placeholder="Selecciona un cliente…"
            className="react-select-container"
            classNamePrefix="react-select"
          />
        </div>

        {/*Campos fecha optimizados */}
        {camposFecha.map(campo => (
          <div key={campo.name} className="form-group">
            <label>{campo.label}</label>
            <input
              name={campo.name}
              type="date"
              value={form[campo.name]}
              onChange={handleChange}
              required={campo.required}
            />
          </div>
        ))}

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

        {camposNumericos.map(campo => (
          <div key={campo.name} className="form-group">
            <label>{campo.label}</label>
            <input
              name={campo.name}
              type="number"
              value={form[campo.name]}
              onChange={handleChange}
            />
          </div>
        ))}

        <button type="submit" className="btn-submit">
          Guardar proyecto
        </button>
      </form>
    </div>
  )
}