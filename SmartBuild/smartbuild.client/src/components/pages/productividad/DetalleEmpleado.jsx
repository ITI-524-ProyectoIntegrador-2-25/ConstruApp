// DetalleEmpleado.jsx - Versión corregida para sincronización
import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, Edit2, Save, X, User, Mail, IdCard, Briefcase, BadgeCent, Calendar, CheckCircle, XCircle } from 'lucide-react'
import '../../../styles/Dashboard.css'
import '../dashboard/FormDashboard.css'
import './DetalleEmpleado.css'

// HOOKS
import { useEmpleado, useInsertarActualizarEmpleados } from '../../../hooks/Empleados'

export default function DetalleEmpleado() {
  const { idEmpleado } = useParams()
  const navigate = useNavigate()

  // 🔹 Agregamos refetch para recargar datos después de actualizar
  const { EmpleadoDetalle, loading, error, refetch } = useEmpleado(idEmpleado)
  const { guardarEmpleado } = useInsertarActualizarEmpleados()

  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false) 
  const [form, setForm] = useState({
    nombre: '', apellido: '', identificacion: '', correo: '',
    puesto: '', salarioHora: '', activo: 'true', fechaIngreso: ''
  })


  const normalizeActivoForDB = (activo) => {
    return activo === 'true' ? true : false
  }

  // Inicializa form cuando llega el EmpleadoDetalle
  React.useEffect(() => {
    if (!EmpleadoDetalle) return

    const formatearFechaParaInput = (fecha) => {
      if (!fecha) return ''
      try {
        const fechaObj = new Date(fecha)
        if (!isNaN(fechaObj.getTime())) {
          return fechaObj.toISOString().split('T')[0]
        }
        return ''
      } catch {
        return ''
      }
    }

    const defaultFecha = formatearFechaParaInput(EmpleadoDetalle.fechaIngreso) || 
                         formatearFechaParaInput(EmpleadoDetalle.cuandoIngreso)

    setForm({
      nombre:         EmpleadoDetalle.nombre        ?? '',
      apellido:       EmpleadoDetalle.apellido      ?? '',
      identificacion: EmpleadoDetalle.identificacion?? '',
      correo:         EmpleadoDetalle.correo        ?? '',
      puesto:         EmpleadoDetalle.puesto        ?? '',
      salarioHora:    EmpleadoDetalle.salarioHora != null
                         ? String(EmpleadoDetalle.salarioHora)
                         : '',
      activo:         normalizeActivoForDB(EmpleadoDetalle.activo),
      fechaIngreso:   defaultFecha
    })
  }, [EmpleadoDetalle])

  const handleChange = e => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  const handleSubmit = async e => {
  e.preventDefault()
  
  if (!form.nombre.trim() || !form.identificacion.trim()) {
    return
  }
  
  const usr = localStorage.getItem('currentUser')
  if (!usr) return

  setIsSaving(true)

  try {
    // Parsear usuario actual
    let usuarioActual;
    try {
      const userObj = JSON.parse(usr);
      usuarioActual = userObj.correo || userObj.usuario || usr;
    } catch {
      usuarioActual = usr;
    }

    // Preparar fecha en formato ISO
    let fechaISO = ''
    if (form.fechaIngreso) {
      try {
        const fechaLocal = new Date(form.fechaIngreso + 'T12:00:00')
        fechaISO = fechaLocal.toISOString()
      } catch {
        fechaISO = new Date().toISOString()
      }
    }

    const payload = {
      // Campos de auditoría obligatorios
      usuario: usuarioActual,
      quienIngreso: EmpleadoDetalle?.quienIngreso || usuarioActual,
      cuandoIngreso: EmpleadoDetalle?.cuandoIngreso || new Date().toISOString(),
      quienModifico: usuarioActual,
      cuandoModifico: new Date().toISOString(),
      
      // Datos del empleado
      idEmpleado: Number(idEmpleado),
      nombre: form.nombre.trim(),
      apellido: form.apellido.trim(),
      identificacion: form.identificacion.trim(),
      puesto: form.puesto.trim(),
      salarioHora: String(form.salarioHora || '0'),
      fechaIngreso: fechaISO,
      correo: form.correo.trim(),
      activo: form.activo === 'true' ? 'True' : 'False'
    }

    const success = await guardarEmpleado(payload)
    
    if (success) {
      await refetch()
      setIsEditing(false)
    } else {
      throw new Error('La operación de guardado falló')
    }
    
  } catch (error) {
    await refetch()
  } finally {
    setIsSaving(false)
  }
}

  const handleCancelEdit = () => {
    setIsEditing(false)
    if (EmpleadoDetalle) {
      const formatearFechaParaInput = (fecha) => {
        if (!fecha) return ''
        try {
          const fechaObj = new Date(fecha)
          if (!isNaN(fechaObj.getTime())) {
            return fechaObj.toISOString().split('T')[0]
          }
          return ''
        } catch {
          return ''
        }
      }

      const defaultFecha = formatearFechaParaInput(EmpleadoDetalle.fechaIngreso) || 
                           formatearFechaParaInput(EmpleadoDetalle.cuandoIngreso)

      setForm({
        nombre:         EmpleadoDetalle.nombre        ?? '',
        apellido:       EmpleadoDetalle.apellido      ?? '',
        identificacion: EmpleadoDetalle.identificacion?? '',
        correo:         EmpleadoDetalle.correo        ?? '',
        puesto:         EmpleadoDetalle.puesto        ?? '',
        salarioHora:    EmpleadoDetalle.salarioHora != null
                           ? String(EmpleadoDetalle.salarioHora)
                           : '',
        activo:         normalizeActivoForDB(EmpleadoDetalle.activo),
        fechaIngreso:   defaultFecha
      })
    }
  }

  const isEmployeeActive = (activo) => {
    return activo === 1 || activo === '1' || activo === true || activo === 'true' || activo === 'True'
  }

  const fieldsConfig = {
    nombre: { icon: User, label: 'Nombre', type: 'text' },
    apellido: { icon: User, label: 'Apellido', type: 'text' },
    identificacion: { icon: IdCard, label: 'Identificación', type: 'text' },
    correo: { icon: Mail, label: 'Correo electrónico', type: 'email' },
    puesto: { icon: Briefcase, label: 'Puesto', type: 'text' },
    salarioHora: { icon: BadgeCent, label: 'Salario por hora', type: 'number' }
  }

  if (loading) return (
    <div className="detalle-loading-container">
      <div className="loading-spinner"></div>
      <p>Cargando información del empleado...</p>
    </div>
  )

  if (error) return (
    <div className="detalle-error-container">
      <XCircle size={48} className="error-icon" />
      <h2>Error al cargar</h2>
      <p>{error}</p>
      <button onClick={() => navigate(-1)} className="btn-secondary">
        Volver
      </button>
    </div>
  )

  if (!EmpleadoDetalle) return (
    <div className="detalle-error-container">
      <User size={48} className="error-icon" />
      <h2>Empleado no encontrado</h2>
      <p>No se encontraron datos para este empleado.</p>
      <button onClick={() => navigate(-1)} className="btn-secondary">
        Volver
      </button>
    </div>
  )

  return (
    <div className="detalle-empleado-container">
      {/* Header */}
      <div className="detalle-header">
        <div className="header-left">
          <button className="btn-back" onClick={() => navigate(-1)}>
            <ChevronLeft size={20}/>
            <span>Volver</span>
          </button>
          <div className="employee-title">
            <div className="employee-avatar">
              <User size={24} />
            </div>
            <div>
              <h1>
                {EmpleadoDetalle.nombre} {EmpleadoDetalle.apellido}
              </h1>
              <p className="employee-id">ID: #{EmpleadoDetalle.idEmpleado}</p>
            </div>
          </div>
        </div>
        
        <div className="header-right">
          <div className={`status-badge ${isEmployeeActive(EmpleadoDetalle.activo) ? 'active' : 'inactive'}`}>
            {isEmployeeActive(EmpleadoDetalle.activo) ? (
              <>
                <CheckCircle size={16} />
                <span>Activo</span>
              </>
            ) : (
              <>
                <XCircle size={16} />
                <span>Inactivo</span>
              </>
            )}
          </div>
          
          {!isEditing ? (
            <button className="btn-primary" onClick={() => setIsEditing(true)}>
              <Edit2 size={16} />
              <span>Editar</span>
            </button>
          ) : (
            <div className="edit-actions">
              <button 
                type="submit" 
                form="employee-form" 
                className="btn-primary"
                disabled={isSaving} 
              >
                {isSaving ? (
                  <>
                    <div className="loading-spinner-small"></div>
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>Guardar</span>
                  </>
                )}
              </button>
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={handleCancelEdit}
                disabled={isSaving} 
              >
                <X size={16} />
                <span>Cancelar</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Contenido */}
      <div className="detalle-content">
        {isEditing ? (
          <form
            id="employee-form"
            className="employee-form"
            onSubmit={handleSubmit}
          >
            <div className="form-section">
              <h3 className="section-title">
                <User size={20} />
                Información Personal
              </h3>
              <div className="form-grid">
                {Object.entries(fieldsConfig).map(([key, config]) => {
                  const Icon = config.icon
                  return (
                    <div className="form-field" key={key}>
                      <label className="field-label">
                        <Icon size={16} />
                        {config.label}
                      </label>
                      <input 
                        name={key}
                        type={config.type}
                        value={form[key]} 
                        onChange={handleChange}
                        className="field-input"
                        required
                        disabled={isSaving} 
                        step={key === 'salarioHora' ? '0.01' : undefined}
                        min={key === 'salarioHora' ? '0' : undefined}
                      />
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="form-section">
              <h3 className="section-title">
                <Briefcase size={20} />
                Información Laboral
              </h3>
              <div className="form-grid">
                <div className="form-field">
                  <label className="field-label">
                    <CheckCircle size={16} />
                    Estado
                  </label>
                  <select 
                    name="activo" 
                    value={form.activo} 
                    onChange={handleChange}
                    className="field-select"
                    disabled={isSaving} 
                  >
                    <option value="true">Activo</option>
                    <option value="false">Inactivo</option>
                  </select>
                </div>
                
                <div className="form-field">
                  <label className="field-label">
                    <Calendar size={16} />
                    Fecha de ingreso
                  </label>
                  <input 
                    name="fechaIngreso" 
                    type="date" 
                    value={form.fechaIngreso} 
                    onChange={handleChange}
                    className="field-input"
                    disabled={isSaving} // 🔹 Deshabilitar mientras guarda
                    required 
                  />
                </div>
              </div>
            </div>
          </form>
        ) : (
          <div className="employee-details">
            <div className="details-section">
              <h3 className="section-title">
                <User size={20} />
                Información Personal
              </h3>
              <div className="details-grid">
                {Object.entries(fieldsConfig).map(([key, config]) => {
                  const Icon = config.icon
                  let displayValue = EmpleadoDetalle[key]
                  if (key === 'salarioHora' && displayValue) {
                    displayValue = `₡${parseFloat(displayValue).toLocaleString('es-CR', { 
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2 
                    })}`
                  }
                  return (
                    <div className="detail-field" key={key}>
                      <div className="field-label">
                        <Icon size={16} />
                        {config.label}
                      </div>
                      <div className="field-value">
                        {displayValue || '-'}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="details-section">
              <h3 className="section-title">
                <Briefcase size={20} />
                Información Laboral
              </h3>
              <div className="details-grid">
                <div className="detail-field">
                  <div className="field-label">
                    <CheckCircle size={16} />
                    Estado
                  </div>
                  <div className="field-value">
                    <span className={`status-indicator ${isEmployeeActive(EmpleadoDetalle.activo) ? 'active' : 'inactive'}`}>
                      {isEmployeeActive(EmpleadoDetalle.activo) ? (
                        <>
                          <CheckCircle size={14} />
                          Activo
                        </>
                      ) : (
                        <>
                          <XCircle size={14} />
                          Inactivo
                        </>
                      )}
                    </span>
                  </div>
                </div>
                
                <div className="detail-field">
                  <div className="field-label">
                    <Calendar size={16} />
                    Fecha de ingreso
                  </div>
                  <div className="field-value">
                    {EmpleadoDetalle.fechaIngreso ? 
                      new Date(EmpleadoDetalle.fechaIngreso).toLocaleDateString('es-CR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) 
                      : (EmpleadoDetalle.cuandoIngreso ? 
                          new Date(EmpleadoDetalle.cuandoIngreso).toLocaleDateString('es-CR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          }) 
                          : '-'
                        )
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}