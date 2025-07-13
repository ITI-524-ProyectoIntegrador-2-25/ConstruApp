// src/components/pages/productividad/FormActividades.jsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import './FormActividad.css'

export default function FormActividades() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    proyecto:    '',
    empleado:    '',
    fecha:       '',
    entrada:     '',
    salida:      '',
    descripcion: ''
  })
  const [error, setError] = useState('')

  const handleChange = e => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    setError('')
  }

  const calcDur = (inStr, outStr) => {
    const [h1,m1] = inStr.split(':').map(Number)
    const [h2,m2] = outStr.split(':').map(Number)
    const start = new Date(); start.setHours(h1,m1)
    const end   = new Date(); end.setHours(h2,m2)
    return ((end - start)/3600000).toFixed(2)
  }

  const handleSubmit = e => {
    e.preventDefault()
    if (!form.proyecto || !form.empleado || !form.fecha) {
      setError('Proyecto, empleado y fecha son obligatorios')
      return
    }
    if (calcDur(form.entrada, form.salida) <= 0) {
      setError('La hora de salida debe ser posterior a la de entrada')
      return
    }
    // aquí llamarías a tu API POST
    console.log('📤 Crear actividad', form)
    navigate(-1)
  }

  return (
    <div className="actividad-form-page">
      <header className="actividad-form-header">
        <button onClick={() => navigate(-1)} className="back-btn">
          <ChevronLeft size={20}/>
        </button>
        <h1>Nueva actividad</h1>
      </header>

      {error && <div className="alert alert-danger">{error}</div>}

    
    
      <form onSubmit={handleSubmit} className="actividad-form">
        {/** Proyecto */}
        <div className="form-group">
          <label>Proyecto</label>
          <input
            name="proyecto"
            type="text"
            className="input"
            value={form.proyecto}
            onChange={handleChange}
            required
          />
        </div>

        {/** Empleado */}
        <div className="form-group">
          <label>Empleado</label>
          <input
            name="empleado"
            type="text"
            className="input"
            value={form.empleado}
            onChange={handleChange}
            required
          />
        </div>

        {/** Fecha */}
        <div className="form-group">
          <label>Fecha</label>
          <input
            name="fecha"
            type="date"
            className="input"
            value={form.fecha}
            onChange={handleChange}
            required
          />
        </div>

        {/** Descripción */}
        <div className="form-group">
          <label>Descripción</label>
          <textarea
            name="descripcion"
            rows={3}
            className="input"
            value={form.descripcion}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Hora de entrada</label>
          <input
            name="entrada"
            type="time"
            value={form.entrada}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Hora de salida</label>
          <input
            name="salida"
            type="time"
            value={form.salida}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Duración (hs)</label>
          <input
            type="text"
            value={form.entrada && form.salida ? calcDur(form.entrada, form.salida) : ''}
            readOnly
            placeholder=""
          />
        </div>

        <button type="submit" className="btn-submit">
          Guardar actividad
        </button>
      </form>
    </div>
  )
}
