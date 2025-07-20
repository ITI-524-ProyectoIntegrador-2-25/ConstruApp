// src/components/pages/planilla/FormPlanilla.jsx
import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import Select from 'react-select'
import '../../../styles/Dashboard.css'
import './FormPlanilla.css'

const API_BASE = 'https://smartbuild-001-site1.ktempurl.com'

export default function FormPlanilla() {
  const navigate = useNavigate()
  const alertRef = useRef(null)

  // listas de proyectos y empleados en formato { value, label }
  const [projectsOpts, setProjectsOpts]   = useState([])
  const [employeesOpts, setEmployeesOpts] = useState([])

  // estado del formulario
  const [form, setForm] = useState({
    proyecto: null,    // objeto { value, label }
    empleados: [],     // array de objetos { value, label }
    nombre: '',
    fechaInicio: '',
    fechaFin: '',
    estado: ''
  })
  const [error, setError] = useState('')

  // carga proyectos para el dropdown
  useEffect(() => {
    const usr = localStorage.getItem('currentUser')
    if (!usr) return
    const user   = JSON.parse(usr)
    const correo = encodeURIComponent(user.correo || user.usuario)

    fetch(`${API_BASE}/PresupuestoApi/GetPresupuestos?usuario=${correo}`)
      .then(res => {
        if (!res.ok) throw new Error(`Status ${res.status}`)
        return res.json()
      })
      .then(data => {
        const opts = data.map(p => ({
          value: p.idPresupuesto,
          label: p.descripcion
        }))
        setProjectsOpts(opts)
      })
      .catch(err => console.error('Error cargando proyectos:', err))
  }, [])

  // carga empleados para el multi-select (mostrar nombre completo)
  useEffect(() => {
    const usr = localStorage.getItem('currentUser')
    if (!usr) return
    const user   = JSON.parse(usr)
    const correo = encodeURIComponent(user.correo || user.usuario)

    fetch(`${API_BASE}/EmpleadoApi/GetEmpleado?usuario=${correo}`)
      .then(res => {
        if (!res.ok) throw new Error(`Status ${res.status}`)
        return res.json()
      })
      .then(data => {
        const opts = data.map(emp => {
          // Prioriza el campo nombreEmpleado si existe;
          // en caso contrario, concatena nombre + apellido (filtrando null/undefined)
          const label = emp.nombreEmpleado
            || `${emp.nombre || ''} ${emp.apellido || ''}`.trim()
          return {
            value: emp.idEmpleado,
            label
          }
        })
        setEmployeesOpts(opts)
      })
      .catch(err => console.error('Error cargando empleados:', err))
  }, [])

  // handler para inputs estándar
  const handleChange = e => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
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
    if (!form.proyecto || !form.nombre || !form.fechaInicio || !form.fechaFin) {
      setError('Proyecto, nombre y ambas fechas son obligatorios')
      return
    }

    try {
      const usr = localStorage.getItem('currentUser')
      if (!usr) throw new Error('Usuario no autenticado')
      const user       = JSON.parse(usr)
      const correoUser = user.correo || user.usuario

      // construye payload extrayendo IDs de los select
      const payload = {
        usuario:       correoUser,
        nombre:        form.nombre,
        fechaInicio:   new Date(form.fechaInicio).toISOString(),
        fechaFin:      new Date(form.fechaFin).toISOString(),
        estado:        form.estado,
        idPlanilla:    0,
        idPresupuesto: form.proyecto.value,
        empleados:     form.empleados.map(e => e.value)
      }

      const res = await fetch(
        `${API_BASE}/PlanillaApi/InsertPlanilla`, {
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
      console.error('Error al guardar planilla:', err)
      setError(err.message || 'No se pudo guardar la planilla.')
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
          <ChevronLeft size={20} />
        </button>
        <h1>Nueva Planilla</h1>
      </header>

      {error && (
        <div ref={alertRef} className="alert alert-danger">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="form-dashboard">
        {/* Proyecto asociado */}
        <div className="form-group">
          <label>Proyecto asociado</label>
          <Select
            name="proyecto"
            options={projectsOpts}
            value={form.proyecto}
            onChange={handleSelect('proyecto')}
            placeholder="Seleccionar proyecto…"
            className="react-select-container"
            classNamePrefix="react-select"
          />
        </div>

        {/* Empleados asociados */}
        <div className="form-group">
          <label>Empleados asociados</label>
          <Select
            name="empleados"
            options={employeesOpts}
            value={form.empleados}
            onChange={handleSelect('empleados')}
            isMulti
            placeholder="Seleccionar empleados…"
            className="react-select-container"
            classNamePrefix="react-select"
          />
        </div>

        {/* Nombre de la planilla */}
        <div className="form-group">
          <label>Nombre</label>
          <input
            name="nombre"
            type="text"
            value={form.nombre}
            onChange={handleChange}
            required
          />
        </div>

        {/* Fecha de inicio */}
        <div className="form-group">
          <label>Fecha inicio</label>
          <input
            name="fechaInicio"
            type="date"
            value={form.fechaInicio}
            onChange={handleChange}
            required
          />
        </div>

        {/* Fecha de fin */}
        <div className="form-group">
          <label>Fecha fin</label>
          <input
            name="fechaFin"
            type="date"
            value={form.fechaFin}
            onChange={handleChange}
            required
          />
        </div>

        {/* Estado */}
        <div className="form-group">
          <label>Estado</label>
          <select
            name="estado"
            value={form.estado}
            onChange={handleChange}
          >
            <option value="">Seleccionar…</option>
            <option value="Abierta">Abierta</option>
            <option value="En progreso">En progreso</option>
            <option value="Cerrada">Cerrada</option>
          </select>
        </div>

        <button type="submit" className="btn-submit">
          Guardar planilla
        </button>
      </form>
    </div>
  )
}
