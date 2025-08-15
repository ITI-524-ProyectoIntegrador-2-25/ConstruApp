import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import Select from 'react-select'
import '../../../styles/Dashboard.css'
import '../dashboard/FormDashboard.css'
// Importa tus hooks personalizados
import { useActividad,useInsertarActualizarActividades } from '../../../hooks/Actividades'
import { usePresupuestos } from '../../../hooks/dashboard'
import { useEmpleados } from '../../../hooks/Empleados'

export default function DetalleActividades() {
  const { idActividad } = useParams()
  const navigate = useNavigate()

  // Usar los hooks personalizados
  const { ActividadDetalle: detalle, loading: loadingActividad, error: errorActividad, refetch: refetchActividad } = useActividad(idActividad)
  const { presupuestos: presupuestosData, loading: loadingPresupuestos, error: errorPresupuestos } = usePresupuestos()
  const { Empleados: empleadosData, loading: loadingEmpleados, error: errorEmpleados } = useEmpleados()
  const { guardarActividad, loading: loadingGuardar, error: errorGuardar, success } = useInsertarActualizarActividades()

  // Estados locales para el formulario
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState({})

  // Formatear datos para react-select
  const presupuestos = presupuestosData.map(p => ({ 
    value: p.idPresupuesto, 
    label: p.descripcion 
  }))
  
  const empleados = empleadosData.map(e => ({ 
    value: e.idEmpleado, 
    label: e.nombreEmpleado || `${e.nombre} ${e.apellido}` 
  }))

  // Estados derivados
  const loading = loadingActividad || loadingPresupuestos || loadingEmpleados
  const error = errorActividad || errorPresupuestos || errorEmpleados

  // Inicializar el formulario cuando se cargan los datos
  useEffect(() => {
    if (detalle && presupuestosData.length > 0 && empleadosData.length > 0) {
      const presupuestoSeleccionado = presupuestosData.find(p => p.idPresupuesto === detalle.presupuestoID)
      const empleadoSeleccionado = empleadosData.find(e => e.idEmpleado === detalle.empleadoID)
      
      setForm({
        presupuesto: presupuestoSeleccionado ? { 
          value: presupuestoSeleccionado.idPresupuesto, 
          label: presupuestoSeleccionado.descripcion 
        } : null,
        empleado: empleadoSeleccionado ? { 
          value: empleadoSeleccionado.idEmpleado, 
          label: empleadoSeleccionado.nombreEmpleado || `${empleadoSeleccionado.nombre} ${empleadoSeleccionado.apellido}` 
        } : null,
        descripcion: detalle.descripcion || '',
        fechaInicioProyectada: detalle.fechaInicioProyectada?.slice(0,16) || '',
        fechaFinProyectada: detalle.fechaFinProyectada?.slice(0,16) || '',
        fechaInicioReal: detalle.fechaInicioReal?.slice(0,16) || '',
        fechaFinReal: detalle.fechaFinReal?.slice(0,16) || '',
        estado: detalle.estado || ''
      })
    }
  }, [detalle, presupuestosData, empleadosData])

  const handleChange = e => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  const handleSelect = field => selected => {
    setForm(f => ({ ...f, [field]: selected }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const usr = localStorage.getItem('currentUser')
    if (!usr) return
    const user = JSON.parse(usr)
    const ahora = new Date().toISOString()

    const payload = {
      usuario: user.correo || user.usuario,
      quienIngreso: detalle.quienIngreso,
      cuandoIngreso: detalle.cuandoIngreso,
      quienModifico: user.correo || user.usuario,
      cuandoModifico: ahora,
      idActividad: detalle.idActividad,
      presupuestoID: form.presupuesto?.value,
      empleadoID: form.empleado?.value,
      descripcion: form.descripcion,
      fechaInicioProyectada: form.fechaInicioProyectada,
      fechaFinProyectada: form.fechaFinProyectada,
      fechaInicioReal: form.fechaInicioReal,
      fechaFinReal: form.fechaFinReal,
      estado: form.estado
    }

    const resultado = await guardarActividad(payload)
    if (resultado) {
      setIsEditing(false)
    }
  }

  // Efecto para manejar el éxito de la actualización
  useEffect(() => {
    if (success) {
      alert('Actividad actualizada exitosamente')
      // Refrescar los datos después de una actualización exitosa
      refetchActividad()
    }
  }, [success, refetchActividad])


  useEffect(() => {
    if (errorGuardar) {
      alert('Error al actualizar la actividad: ' + errorGuardar)
    }
  }, [errorGuardar])

  if (loading) return <p>Cargando detalles…</p>
  if (error) return <p className="alert alert-danger">{error}</p>
  if (!detalle) return <p>No se encontró la actividad</p>

  return (
    <div className="form-dashboard-page" style={{ maxWidth: '900px' }}>
      <div className="form-dashboard-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ChevronLeft size={20}/>
        </button>
        <h1>Actividad #{detalle.idActividad}</h1>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
          <button 
            className="btn-submit" 
            style={{ background: '#007bff' }}
            onClick={refetchActividad}
            disabled={loadingActividad}
            title="Refrescar datos"
          >
            {loadingActividad ? '🔄' : '↻'}
          </button>
          {!isEditing && (
            <button className="btn-submit" onClick={() => setIsEditing(true)}>
              Editar
            </button>
          )}
        </div>
      </div>

      {isEditing ? (
        <form className="form-dashboard"
              onSubmit={handleSubmit}
              style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))',gap:'1.5rem' }}>

          {/* Presupuesto */}
          <div className="form-group">
            <label>Presupuesto</label>
            <Select
              options={presupuestos}
              value={form.presupuesto}
              onChange={handleSelect('presupuesto')}
              className="react-select-container"
              classNamePrefix="react-select"
              required
            />
          </div>

          {/* Empleado */}
          <div className="form-group">
            <label>Empleado</label>
            <Select
              options={empleados}
              value={form.empleado}
              onChange={handleSelect('empleado')}
              className="react-select-container"
              classNamePrefix="react-select"
              required
            />
          </div>

          {/* Descripción */}
          <div className="form-group">
            <label>Descripción</label>
            <textarea
              name="descripcion"
              rows={2}
              value={form.descripcion}
              onChange={handleChange}
              required
            />
          </div>

          {/* Fechas */}
          <div className="form-group">
            <label>Fecha Inicio Proyectada</label>
            <input
              type="datetime-local"
              name="fechaInicioProyectada"
              value={form.fechaInicioProyectada}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Fecha Fin Proyectada</label>
            <input
              type="datetime-local"
              name="fechaFinProyectada"
              value={form.fechaFinProyectada}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Fecha Inicio Real</label>
            <input
              type="datetime-local"
              name="fechaInicioReal"
              value={form.fechaInicioReal}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Fecha Fin Real</label>
            <input
              type="datetime-local"
              name="fechaFinReal"
              value={form.fechaFinReal}
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

          {/* Botones */}
          <div style={{ gridColumn: '1 / -1', display:'flex', gap:'1rem', marginTop:'1rem' }}>
            <button 
              type="submit" 
              className="btn-submit"
              disabled={loadingGuardar}
            >
              {loadingGuardar ? 'Guardando...' : 'Guardar cambios'}
            </button>
            <button 
              type="button" 
              className="btn-submit" 
              style={{ background:'#ccc' }} 
              onClick={() => setIsEditing(false)}
              disabled={loadingGuardar}
            >
              Cancelar
            </button>
          </div>

        </form>
      ) : (
        <div className="form-dashboard" style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))',gap:'1.5rem' }}>

          <div className="form-group">
            <label>Presupuesto</label>
            <p className="value">{presupuestos.find(p=>p.value===detalle.presupuestoID)?.label || 'No asignado'}</p>
          </div>
          <div className="form-group">
            <label>Empleado</label>
            <p className="value">{empleados.find(e=>e.value===detalle.empleadoID)?.label || 'No asignado'}</p>
          </div>
          <div className="form-group">
            <label>Descripción</label>
            <p className="value">{detalle.descripcion}</p>
          </div>
          <div className="form-group">
            <label>Fecha Inicio Proyectada</label>
            <p className="value">{detalle.fechaInicioProyectada ? new Date(detalle.fechaInicioProyectada).toLocaleString() : 'No definido'}</p>
          </div>
          <div className="form-group">
            <label>Fecha Fin Proyectada</label>
            <p className="value">{detalle.fechaFinProyectada ? new Date(detalle.fechaFinProyectada).toLocaleString() : 'No definido'}</p>
          </div>
          <div className="form-group">
            <label>Fecha Inicio Real</label>
            <p className="value">{detalle.fechaInicioReal ? new Date(detalle.fechaInicioReal).toLocaleString() : 'No definido'}</p>
          </div>
          <div className="form-group">
            <label>Fecha Fin Real</label>
            <p className="value">{detalle.fechaFinReal ? new Date(detalle.fechaFinReal).toLocaleString() : 'No definido'}</p>
          </div>
          <div className="form-group">
            <label>Duración (h)</label>
            <p className="value">
              {detalle.fechaFinReal && detalle.fechaInicioReal 
                ? ((new Date(detalle.fechaFinReal) - new Date(detalle.fechaInicioReal)) / 3600000).toFixed(2)
                : 'No calculado'
              }
            </p>
          </div>
          <div className="form-group">
            <label>Estado</label>
            <p className="value">{detalle.estado}</p>
          </div>

        </div>
      )}
    </div>
  )
}