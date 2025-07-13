// src/components/pages/productividad/ActividadDetalle.jsx
import React, { useState, useEffect } from 'react'
import { ChevronLeft, Clock } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import './FormActividad.css'

// Simulamos un "fetch" local. En la vida real harías una llamada a tu API.
const FAKE_ACTIVIDADES = [
  {
    id: '1',
    proyectoId: '1',
    empleadoId: '2',
    fecha: '2025-07-12',
    descripcion: 'Reunión de planificación',
    entrada: '09:00',
    salida: '12:30'
  },
  {
    id: '2',
    proyectoId: '2',
    empleadoId: '1',
    fecha: '2025-07-13',
    descripcion: 'Desarrollo de módulo X',
    entrada: '10:15',
    salida: '18:00'
  },
]

const PROYECTOS = [
  { id: '1', name: 'Proyecto 1' },
  { id: '2', name: 'Proyecto 2' }
]

const EMPLEADOS = [
  { id: '1', name: 'Juan Pérez' },
  { id: '2', name: 'María Gómez' }
]

export default function ActividadDetalle() {
  const { id }       = useParams()
  const navigate     = useNavigate()

  // Estados del formulario
  const [proyecto,    setProyecto]    = useState('')
  const [empleado,    setEmpleado]    = useState('')
  const [fecha,       setFecha]       = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [entrada,     setEntrada]     = useState('')
  const [salida,      setSalida]      = useState('')
  const [duracion,    setDuracion]    = useState(0)
  const [timeError,   setTimeError]   = useState('')
  const [formError,   setFormError]   = useState('')

  // Carga datos al montar
  useEffect(() => {
    const act = FAKE_ACTIVIDADES.find(a => a.id === id)
    if (!act) {
      // si no existe, volvemos atrás
      navigate(-1)
      return
    }
    setProyecto(act.proyectoId)
    setEmpleado(act.empleadoId)
    setFecha(act.fecha)
    setDescripcion(act.descripcion)
    setEntrada(act.entrada)
    setSalida(act.salida)
  }, [id, navigate])

  // Recalcula duración y valida hora
  useEffect(() => {
    setTimeError('')
    if (!entrada || !salida) {
      setDuracion(0)
      return
    }
    const [h1, m1] = entrada.split(':').map(Number)
    const [h2, m2] = salida.split(':').map(Number)
    const start = new Date(); start.setHours(h1, m1, 0, 0)
    const end   = new Date(); end.setHours(h2, m2, 0, 0)

    if (end <= start) {
      setDuracion(0)
      setTimeError('La hora de salida debe ser posterior a la de entrada')
    } else {
      const hrs = (end - start) / 1000 / 3600
      setDuracion(+hrs.toFixed(2))
    }
  }, [entrada, salida])

  const handleSubmit = e => {
    e.preventDefault()
    if (!proyecto)    return setFormError('Selecciona un proyecto')
    if (!empleado)    return setFormError('Selecciona un empleado')
    if (!fecha)       return setFormError('Indica la fecha')
    if (!descripcion) return setFormError('Escribe una descripción')
    if (timeError)    return
    setFormError('')

    // Aquí llamarías a la API de actualización, p.ej.:
    // fetch(`${API_BASE}/ActividadApi/Update/${id}`, { ... })
    //   .then(...)
    //   .catch(...)
    console.log('Guardando cambios de actividad', {
      id, proyecto, empleado, fecha, descripcion, entrada, salida, duracion
    })

    navigate(-1)
  }

  return (
    <div className="actividad-form-page">
      <header className="actividad-form-header">
        <button onClick={() => navigate(-1)} className="back-btn" title="Volver">
          <ChevronLeft size={20}/>
        </button>
        <h1>Detalle de actividad</h1>
      </header>

      <form onSubmit={handleSubmit} className="actividad-form">
        {formError && (
          <div className="actividad-error">{formError}</div>
        )}

        <div className="form-group">
          <label>Proyecto</label>
          <select
            value={proyecto}
            onChange={e => { setProyecto(e.target.value); formError && setFormError('') }}
            required
          >
            <option value="">Seleccionar</option>
            {PROYECTOS.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Empleado</label>
          <select
            value={empleado}
            onChange={e => { setEmpleado(e.target.value); formError && setFormError('') }}
            required
          >
            <option value="">Seleccionar</option>
            {EMPLEADOS.map(u => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Fecha</label>
          <input
            type="date"
            value={fecha}
            onChange={e => { setFecha(e.target.value); formError && setFormError('') }}
            required
          />
        </div>

        <div className="form-group">
          <label>Descripción</label>
          <textarea
            rows={3}
            value={descripcion}
            onChange={e => { setDescripcion(e.target.value); formError && setFormError('') }}
            required
          />
        </div>

        <div className="form-group time-group">
          <div>
            <label>Hora de entrada</label>
            <div className="time-input">
              <Clock size={16} className="icon-clock"/>
              <input
                type="time"
                value={entrada}
                onChange={e => setEntrada(e.target.value)}
                required
              />
            </div>
          </div>
          <div>
            <label>Hora de salida</label>
            <div className="time-input">
              <Clock size={16} className="icon-clock"/>
              <input
                type="time"
                value={salida}
                onChange={e => setSalida(e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        {timeError && (
          <div className="actividad-error">{timeError}</div>
        )}

        <div className="form-group">
          <label>Duración (hs)</label>
          <input type="text" value={duracion} readOnly />
        </div>

        <button type="submit" className="btn-submit" disabled={!!timeError}>
          Guardar cambios
        </button>
      </form>
    </div>
  )
}
