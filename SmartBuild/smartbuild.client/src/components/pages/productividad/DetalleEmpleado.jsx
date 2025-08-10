// DetalleEmpleado.jsx - Versión Mejorada
import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, Edit2, Save, X, User, Mail, IdCard, Briefcase, DollarSign, Calendar, CheckCircle, XCircle } from 'lucide-react'
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

    // DEBUG: Ver qué formato viene la fecha
    console.log('EmpleadoDetalle completo:', EmpleadoDetalle)
    console.log('fechaIngreso original:', EmpleadoDetalle.fechaIngreso)
    console.log('cuandoIngreso original:', EmpleadoDetalle.cuandoIngreso)

    let activoStr = 'true'
    if (EmpleadoDetalle.activo != null) {
      const valor = EmpleadoDetalle.activo
      if (valor === 1 || valor === '1' || valor === true || valor === 'true') {
        activoStr = 'true'
      } else if (valor === 0 || valor === '0' || valor === false || valor === 'false') {
        activoStr = 'false'
      }
    }

    // Manejo robusto de fechas - SIMPLIFICADO
    const formatearFechaParaInput = (fecha) => {
      if (!fecha) return ''
      
      console.log('Procesando fecha:', fecha, typeof fecha)
      
      try {
        // Para fechas ISO como "2025-08-09T06:00:00.000Z"
        const fechaObj = new Date(fecha)
        if (!isNaN(fechaObj.getTime())) {
          const año = fechaObj.getFullYear()
          const mes = String(fechaObj.getMonth() + 1).padStart(2, '0')
          const dia = String(fechaObj.getDate()).padStart(2, '0')
          return `${año}-${mes}-${dia}`
        }
        
        return ''
      } catch (error) {
        console.warn('Error al formatear fecha:', fecha, error)
        return ''
      }
    }
    
    const defaultFecha = formatearFechaParaInput(EmpleadoDetalle.fechaIngreso) || 
                         formatearFechaParaInput(EmpleadoDetalle.cuandoIngreso)
    
    console.log('Fecha formateada para input:', defaultFecha)

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

    let fechaFormateada = form.fechaIngreso
    if (form.fechaIngreso && form.fechaIngreso.includes('-')) {
      fechaFormateada = form.fechaIngreso // Ya está en formato correcto
    }

    // Construir payload limpio - solo campos necesarios
    const payload = {
      idEmpleado: EmpleadoDetalle.idEmpleado,
      nombre: form.nombre.trim(),
      apellido: form.apellido.trim(),
      identificacion: form.identificacion.trim(),
      correo: form.correo.trim(),
      puesto: form.puesto.trim(),
      salarioHora: parseFloat(form.salarioHora) || 0,
      activo: form.activo === 'true' ? 1 : 0,
      fechaIngreso: fechaFormateada,
      usuario: user.correo || user.usuario,
      quienIngreso: EmpleadoDetalle.quienIngreso,
      cuandoIngreso: EmpleadoDetalle.cuandoIngreso,
      quienModifico: user.correo || user.usuario,
      cuandoModifico: ahora
    }// Para debug

    try {
      const success = await guardarEmpleado(payload)
      if (success) {
        setIsEditing(false)
        alert('Empleado actualizado correctamente')
      } else {
        alert('Error al guardar los cambios')
      }
    } catch (error) {
      console.error('Error en handleSubmit:', error)
      alert('Error al guardar: ' + error.message)
    }
  }

  // Función helper para determinar si está activo
  const isEmployeeActive = (activo) => {
    return activo === 1 || activo === '1' || activo === true || activo === 'true'
  }

  // Configuración de campos con iconos y metadatos
  const fieldsConfig = {
    nombre: { icon: User, label: 'Nombre', type: 'text' },
    apellido: { icon: User, label: 'Apellido', type: 'text' },
    identificacion: { icon: IdCard, label: 'Identificación', type: 'text' },
    correo: { icon: Mail, label: 'Correo electrónico', type: 'email' },
    puesto: { icon: Briefcase, label: 'Puesto', type: 'text' },
    salarioHora: { icon: DollarSign, label: 'Salario por hora', type: 'number' }
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
      {/* Header mejorado */}
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
              <button type="submit" form="employee-form" className="btn-primary">
                <Save size={16} />
                <span>Guardar</span>
              </button>
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={() => setIsEditing(false)}
              >
                <X size={16} />
                <span>Cancelar</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Contenido principal */}
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
                  
                  // Formateo especial para salario
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
                    {form.fechaIngreso ? 
                      new Date(form.fechaIngreso).toLocaleDateString('es-CR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) 
                      : '-'
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