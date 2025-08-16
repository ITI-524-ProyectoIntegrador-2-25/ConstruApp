import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import Select from 'react-select'
import '../../../styles/Dashboard.css'
import '../dashboard/FormDashboard.css'
import './DetalleActividades.css'
// hooks personalizados
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
  const { guardarActividad, loading: loadingGuardar, success } = useInsertarActualizarActividades()

  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState({})

  const getNombreEmpleado = (empleado) => {
    if (!empleado) return 'Sin nombre'
    
    if (empleado.nombreEmpleado) return empleado.nombreEmpleado
    
    const nombre = empleado.nombre || ''
    const apellido = empleado.apellido || ''
    
    if (nombre || apellido) {
      return `${nombre} ${apellido}`.trim()
    }
    
    return `Empleado ID: ${empleado.idEmpleado}`
  }

  // Mapear empleados correctamente
  let empleados = []
  if (empleadosData && Array.isArray(empleadosData)) {
    empleados = empleadosData.map((e, index) => ({
      value: String(e.idEmpleado),
      label: getNombreEmpleado(e),
      idEmpleado: e.idEmpleado
    }))
  }

  // Formatear datos para react-select
  const presupuestos = presupuestosData.map(p => ({ 
    value: p.idPresupuesto, 
    label: p.descripcion 
  }))

  // Estados derivados
  const loading = loadingActividad || loadingPresupuestos || loadingEmpleados
  const error = errorActividad || errorPresupuestos || errorEmpleados

  // Inicializar el formulario cuando se cargan los datos
  useEffect(() => {
    if (detalle && presupuestosData.length > 0 && empleadosData.length > 0) {
      const presupuestoSeleccionado = presupuestosData.find(p => p.idPresupuesto === detalle.presupuestoID)
      
      // Buscar empleado usando la propiedad correcta
      const empleadoId = detalle.empleadoID || detalle.idEmpleado
      const empleadoSeleccionado = empleadosData.find(e => {
        return Number(e.idEmpleado) === Number(empleadoId)
      })
      
      setForm({
        presupuesto: presupuestoSeleccionado ? { 
          value: presupuestoSeleccionado.idPresupuesto, 
          label: presupuestoSeleccionado.descripcion 
        } : null,
        empleado: empleadoSeleccionado ? { 
          value: String(empleadoSeleccionado.idEmpleado),
          label: getNombreEmpleado(empleadoSeleccionado)
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

  // Manejar selección de empleado
  const handleSelectEmpleado = (selectedOption) => {
    setForm(f => ({ 
      ...f, 
      empleado: selectedOption 
    }))
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
      empleadoID: form.empleado?.idEmpleado || form.empleado?.value,
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

  // Maneja el éxito de la actualización
  useEffect(() => {
    if (success) {
      refetchActividad()
    }
  }, [success, refetchActividad])

  if (loading) return <p>Cargando detalles…</p>
  if (error) return <p className="alert alert-danger">{error}</p>
  if (!detalle) return <p>No se encontró la actividad</p>

  // Encontrar el empleado actual para la vista de solo lectura
  const empleadoId = detalle.empleadoID || detalle.idEmpleado
  const empleadoActual = empleadosData.find(e => Number(e.idEmpleado) === Number(empleadoId))

  return (
  <div className="form-dashboard-page">
    <div className="form-dashboard-header">
      <button className="back-btn" onClick={() => navigate(-1)}>
        <ChevronLeft size={20}/>
      </button>
      <h1>Actividad #{detalle.idActividad}</h1>
      <div className="form-dashboard-header-actions">
        <button 
          className="btn-submit" 
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
      <form 
        className="form-dashboard"
        onSubmit={handleSubmit}
      >
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
            placeholder="Seleccionar presupuesto..."
            menuPortalTarget={document.body}
            styles={{
              menuPortal: (base) => ({
                ...base,
                zIndex: 9999
              })
            }}
          />
        </div>

        {/* Empleado */}
        <div className="form-group">
          <label>Empleado</label>
          <Select
            options={empleados}
            value={form.empleado}
            onChange={handleSelectEmpleado}
            className="react-select-container"
            classNamePrefix="react-select"
            required
            placeholder="Seleccionar empleado..."
            isSearchable={true}
            getOptionLabel={(option) => option.label}
            getOptionValue={(option) => String(option.value)}
            isOptionSelected={(option, selectValue) => {
              return selectValue && String(option.value) === String(selectValue.value)
            }}
            isOptionEqualToValue={(option, value) => {
              return String(option.value) === String(value.value)
            }}
            noOptionsMessage={() => 'No hay empleados disponibles'}
            menuPortalTarget={document.body}
            styles={{
              menuPortal: (base) => ({
                ...base,
                zIndex: 9999
              })
            }}
          />
        </div>

        {/* Descripción */}
        <div className="form-group full-width">
          <label>Descripción</label>
          <textarea
            name="descripcion"
            rows={3}
            value={form.descripcion}
            onChange={handleChange}
            required
            placeholder="Descripción de la actividad..."
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
            placeholder="Estado de la actividad..."
          />
        </div>

        {/* Botones */}
        <div className="form-buttons">
          <button 
            type="submit" 
            className="btn-submit"
            disabled={loadingGuardar}
          >
            {loadingGuardar ? 'Guardando...' : 'Guardar cambios'}
          </button>
          <button 
            type="button" 
            className="btn-submit btn-cancel"
            onClick={() => setIsEditing(false)}
            disabled={loadingGuardar}
          >
            Cancelar
          </button>
        </div>
      </form>
    ) : (
      <div className="form-dashboard form-dashboard-readonly">
        <div className="form-group">
          <label>Presupuesto</label>
          <p className="value">
            {presupuestos.find(p=>p.value===detalle.presupuestoID)?.label || 'No asignado'}
          </p>
        </div>
        
        <div className="form-group">
          <label>Empleado</label>
          <p className="value">
            {empleadoActual ? getNombreEmpleado(empleadoActual) : 'No asignado'}
          </p>
        </div>
        
        <div className="form-group full-width">
          <label>Descripción</label>
          <p className="value">{detalle.descripcion}</p>
        </div>
        
        <div className="form-group">
          <label>Fecha Inicio Proyectada</label>
          <p className="value">
            {detalle.fechaInicioProyectada ? 
              new Date(detalle.fechaInicioProyectada).toLocaleString() : 
              'No definido'
            }
          </p>
        </div>
        
        <div className="form-group">
          <label>Fecha Fin Proyectada</label>
          <p className="value">
            {detalle.fechaFinProyectada ? 
              new Date(detalle.fechaFinProyectada).toLocaleString() : 
              'No definido'
            }
          </p>
        </div>
        
        <div className="form-group">
          <label>Fecha Inicio Real</label>
          <p className="value">
            {detalle.fechaInicioReal ? 
              new Date(detalle.fechaInicioReal).toLocaleString() : 
              'No definido'
            }
          </p>
        </div>
        
        <div className="form-group">
          <label>Fecha Fin Real</label>
          <p className="value">
            {detalle.fechaFinReal ? 
              new Date(detalle.fechaFinReal).toLocaleString() : 
              'No definido'
            }
          </p>
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