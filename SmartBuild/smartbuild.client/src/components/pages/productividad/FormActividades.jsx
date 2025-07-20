// src/components/pages/productividad/FormActividades.jsx
import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import Select from 'react-select'
import '../../../styles/Dashboard.css'
import './FormActividad.css'

const API_BASE = 'https://smartbuild-001-site1.ktempurl.com'

export default function FormActividades() {
  const navigate = useNavigate()
  const alertRef = useRef(null)

  // Opciones para los selects
  const [presupuestosOpts, setPresupuestosOpts] = useState([])
  const [empleadosOpts, setEmpleadosOpts]       = useState([])

  // Estado del formulario
  const [form, setForm] = useState({
    presupuesto: null,
    empleado:    null,
    fechaInicio: '',  // datetime-local string
    fechaFin:    '',  // datetime-local string
    descripcion: '',
    estado:      ''
  })
  const [error, setError] = useState('')

  // Carga de presupuestos y empleados en paralelo
  useEffect(() => {
    const usr = localStorage.getItem('currentUser')
    if (!usr) return
    const { correo, usuario } = JSON.parse(usr)
    const usuarioParam = encodeURIComponent(correo || usuario)

    Promise.all([
      fetch(`${API_BASE}/PresupuestoApi/GetPresupuestos?usuario=${usuarioParam}`)
        .then(res => {
          if (!res.ok) throw new Error(`Status ${res.status}`)
          return res.json()
        }),
      fetch(`${API_BASE}/EmpleadoApi/GetEmpleado?usuario=${usuarioParam}`)
        .then(res => {
          if (!res.ok) throw new Error(`Status ${res.status}`)
          return res.json()
        })
    ])
      .then(([presData, empData]) => {
        setPresupuestosOpts(
          presData.map(p => ({ value: p.idPresupuesto, label: p.descripcion }))
        )
        setEmpleadosOpts(
          empData.map(emp => ({
            value: emp.idEmpleado,
            label: emp.nombreEmpleado
              ? emp.nombreEmpleado
              : `${emp.nombre || ''} ${emp.apellido || ''}`.trim()
          }))
        )
      })
      .catch(err => console.error('Error cargando opciones:', err))
  }, [])

  // Handlers genéricos
  const handleChange = e => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    setError('')
  }
  const handleSelect = field => selected => {
    setForm(f => ({ ...f, [field]: selected }))
    setError('')
  }

  // Envío del formulario
  const handleSubmit = async e => {
    e.preventDefault()
    const { presupuesto, empleado, fechaInicio, fechaFin, descripcion, estado } = form

    // Validaciones simples
    if (!presupuesto || !empleado || !fechaInicio || !fechaFin) {
      setError('Presupuesto, empleado y fechas (inicio y fin) son obligatorios')
      return
    }
    if (!descripcion.trim() || !estado.trim()) {
      setError('Descripción y estado son obligatorios')
      return
    }

    const start = new Date(fechaInicio)
    const end = new Date(fechaFin)
    if (end <= start) {
      setError('La fecha y hora de fin debe ser posterior a la de inicio')
      return
    }

    try {
      const usr = localStorage.getItem('currentUser')
      if (!usr) throw new Error('Usuario no autenticado')
      const userObj = JSON.parse(usr)
      const correoUser = userObj.correo || userObj.usuario

      // Enviamos las fechas con hora seleccionada directamente, sin conversión a ISO
      const payload = {
        usuario:               correoUser,
        presupuestoID:         presupuesto.value,
        empleadoID:            empleado.value,
        descripcion,
        fechaInicioProyectada: fechaInicio,
        fechaFinProyectada:    fechaFin,
        fechaInicioReal:       fechaInicio,
        fechaFinReal:          fechaFin,
        estado
      }

      const res = await fetch(
        `${API_BASE}/ActividadApi/InsertActividad`, {
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
      console.error('Error creando actividad:', err)
      setError(err.message || 'No se pudo guardar la actividad')
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
        <h1>Nueva Actividad</h1>
      </header>

      {error && (
        <div ref={alertRef} className="alert alert-danger">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="form-dashboard">
        {/* Presupuesto */}
        <div className="form-group">
          <label>Presupuesto asociado</label>
          <Select
            name="presupuesto"
            options={presupuestosOpts}
            value={form.presupuesto}
            onChange={handleSelect('presupuesto')}
            placeholder="Seleccionar presupuesto…"
            className="react-select-container"
            classNamePrefix="react-select"
            required
          />
        </div>

        {/* Empleado */}
        <div className="form-group">
          <label>Empleado asignado</label>
          <Select
            name="empleado"
            options={empleadosOpts}
            value={form.empleado}
            onChange={handleSelect('empleado')}
            placeholder="Seleccionar empleado…"
            className="react-select-container"
            classNamePrefix="react-select"
            required
          />
        </div>

        {/* Fecha y hora de inicio */}
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

        {/* Fecha y hora de fin */}
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

        {/* Estado */}
        <div className="form-group">
          <label>Estado</label>
          <input
            name="estado"
            type="text"
            value={form.estado}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="btn-submit">
          Guardar actividad
        </button>
      </form>
    </div>
  )
}
