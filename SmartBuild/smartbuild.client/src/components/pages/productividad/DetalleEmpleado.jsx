// DetalleEmpleado.jsx
import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import '../../../styles/Dashboard.css'
import '../dashboard/FormDashboard.css'
import './DetalleEmpleado.css'

// HOOKS
import { useEmpleado, useInsertarActualizarEmpleados } from '../../../hooks/Empleados'

export default function DetalleEmpleado() {
  const { idEmpleado } = useParams()
  const navigate = useNavigate()

  const { EmpleadoDetalle, loading, error } = useEmpleado(idEmpleado)
  const { guardarEmpleado } = useInsertarActualizarEmpleados()

  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState({
    nombre: '', apellido: '', identificacion: '', correo: '',
    puesto: '', salarioHora: '', activo: 'true', fechaIngreso: ''
  })

  // Inicializa form cuando llega el EmpleadoDetalle
  React.useEffect(() => {
    if (!EmpleadoDetalle) return

    const activoStr = EmpleadoDetalle.activo != null
      ? String(EmpleadoDetalle.activo).toLowerCase()
      : 'true'

    let defaultFecha = ''
    if (EmpleadoDetalle.fechaIngreso) {
      if (EmpleadoDetalle.fechaIngreso.includes('/')) {
        const [m, d, y] = EmpleadoDetalle.fechaIngreso.split('/')
        defaultFecha = `${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`
      } else {
        defaultFecha = EmpleadoDetalle.fechaIngreso.slice(0,10)
      }
    } else if (EmpleadoDetalle.cuandoIngreso) {
      defaultFecha = new Date(EmpleadoDetalle.cuandoIngreso).toISOString().slice(0, 10)
    }

    setForm({
      nombre:         EmpleadoDetalle.nombre        ?? '',
      apellido:       EmpleadoDetalle.apellido      ?? '',
      identificacion: EmpleadoDetalle.identificacion?? '',
      correo:         EmpleadoDetalle.correo        ?? '',
      puesto:         EmpleadoDetalle.puesto        ?? '',
      salarioHora:    EmpleadoDetalle.salarioHora != null
                         ? String(EmpleadoDetalle.salarioHora)
                         : '',
      activo:         activoStr,
      fechaIngreso:   defaultFecha
    })
  }, [EmpleadoDetalle])

  const handleChange = e => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const usr = localStorage.getItem('currentUser')
    if (!usr) return alert('Usuario no autenticado')
    const user = JSON.parse(usr)
    const ahora = new Date().toISOString()

    const payload = {
      ...EmpleadoDetalle,
      ...form,
      usuario:        user.correo || user.usuario,
      quienIngreso:   EmpleadoDetalle?.quienIngreso  || (user.correo || user.usuario),
      cuandoIngreso:  EmpleadoDetalle?.cuandoIngreso || ahora,
      quienModifico:  user.correo || user.usuario,
      cuandoModifico: ahora,
      activo:         form.activo.toLowerCase()
    }

    const success = await guardarEmpleado(payload)
    if (success) {
      setIsEditing(false)
    } else {
      alert('Error al guardar')
    }
  }

  if (loading)   return <p className="detalle-loading">Cargando detalles…</p>
  if (error)     return <p className="detalle-error">{error}</p>
  if (!EmpleadoDetalle) return <p className="detalle-error">No hay datos del empleado.</p>

  return (
    <div className="form-dashboard-page" style={{ maxWidth: '900px' }}>
      <div className="form-dashboard-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ChevronLeft size={20}/>
        </button>
        <h1>Empleado #{EmpleadoDetalle.idEmpleado}</h1>
        {!isEditing && (
          <button className="btn-submit" style={{ marginLeft: 'auto' }} onClick={() => setIsEditing(true)}>
            Editar
          </button>
        )}
      </div>

      {isEditing ? (
        <form
          className="form-dashboard"
          onSubmit={handleSubmit}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '1.5rem' }}
        >
          {['nombre','apellido','identificacion','correo','puesto','salarioHora'].map(key => (
            <div className="form-group" key={key}>
              <label>{key.charAt(0).toUpperCase() + key.slice(1)}</label>
              <input name={key} value={form[key]} onChange={handleChange} required />
            </div>
          ))}
          <div className="form-group">
            <label>Activo</label>
            <select name="activo" value={form.activo} onChange={handleChange}>
              <option value="true">Sí</option>
              <option value="false">No</option>
            </select>
          </div>
          <div className="form-group">
            <label>Fecha de ingreso</label>
            <input name="fechaIngreso" type="date" value={form.fechaIngreso} onChange={handleChange} required />
          </div>

          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="submit" className="btn-submit">Guardar cambios</button>
            <button type="button" className="btn-submit" style={{ background: '#ccc' }} onClick={() => setIsEditing(false)}>Cancelar</button>
          </div>
        </form>
      ) : (
        <div
          className="form-dashboard"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '1.5rem' }}
        >
          {['nombre','apellido','identificacion','correo','puesto'].map(key => (
            <div className="form-group" key={key}>
              <label>{key.charAt(0).toUpperCase() + key.slice(1)}</label>
              <p className="value">{EmpleadoDetalle[key]}</p>
            </div>
          ))}
          <div className="form-group">
            <label>Salario por hora</label>
            <p className="value">₡{parseFloat(EmpleadoDetalle.salarioHora).toLocaleString('es-CR', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="form-group">
            <label>Activo</label>
            <p className="value">{EmpleadoDetalle.activo === 'true' ? 'Sí' : 'No'}</p>
          </div>
          <div className="form-group">
            <label>Fecha de ingreso</label>
            <p className="value">{form.fechaIngreso || '-'}</p>
          </div>
        </div>
      )}
    </div>
  )
}
