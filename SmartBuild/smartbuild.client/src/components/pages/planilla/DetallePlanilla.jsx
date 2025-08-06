import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import '../../../styles/Dashboard.css'
import Select from 'react-select'

// Hook
import { usePlanillaDetalle } from '../../../hooks/Planilla'
// API
import { updatePlanilla } from '../../../api/Planilla'

const ESTADOS = ['Pendiente', 'En proceso', 'Cerrada']

function formatDate(ds) {
  if (!ds) return ''
  const datePart = ds.split('T')[0]
  let year, month, day
  if (datePart.includes('/')) {
    [month, day, year] = datePart.split('/')
  } else {
    [year, month, day] = datePart.split('-')
  }
  return new Date(+year, +month - 1, +day).toLocaleDateString()
}

export default function DetallePlanilla() {
  const { idPlanilla } = useParams()
  const navigate = useNavigate()

  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState({
    nombre: '',
    fechaInicio: '',
    fechaFin: '',
    estado: ESTADOS[0]
  })

  const { planillaDetalle, loading, error } = usePlanillaDetalle(idPlanilla)

  // Inicializar formulario cuando se cargan los datos
  useEffect(() => {
    if (planillaDetalle) {
      setForm({
        nombre: planillaDetalle.nombre || '',
        fechaInicio: planillaDetalle.fechaInicio ? planillaDetalle.fechaInicio.slice(0, 10) : '',
        fechaFin: planillaDetalle.fechaFin ? planillaDetalle.fechaFin.slice(0, 10) : '',
        estado: planillaDetalle.estado || ESTADOS[0]
      })
    }
  }, [planillaDetalle])

  if (loading) return <p className="detalle-loading">Cargando detalles…</p>
  if (error) return <p className="detalle-error">{error}</p>
  if (!planillaDetalle) return null

  // Formateo de fecha de registro
  const fechaRegistro = (() => {
    if (!planillaDetalle.cuandoIngreso) return ''
    const iso = planillaDetalle.cuandoIngreso.replace(' ', 'T')
    const d = new Date(iso)
    return isNaN(d) ? planillaDetalle.cuandoIngreso : d.toLocaleDateString()
  })()

  // Manejadores de eventos
  const handleChange = e => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const usr = localStorage.getItem('currentUser')
    if (!usr) return
    
    const user = JSON.parse(usr)
    const ahora = new Date().toISOString()

    const payload = {
      usuario: user.correo || user.usuario,
      quienIngreso: planillaDetalle.quienIngreso || '',
      cuandoIngreso: planillaDetalle.cuandoIngreso || '',
      quienModifico: user.correo || user.usuario,
      cuandoModifico: ahora,
      idPlanilla: planillaDetalle.idPlanilla,
      nombre: form.nombre,
      fechaInicio: form.fechaInicio,
      fechaFin: form.fechaFin,
      estado: form.estado
    }

    try {
      await updatePlanilla(payload)
      setIsEditing(false)
      // Opcional: recargar datos o mostrar mensaje de éxito
    } catch (error) {
      console.error('Error al actualizar:', error)
    }
  }

  const handleCancel = () => {
    setForm({
      nombre: planillaDetalle.nombre,
      fechaInicio: planillaDetalle.fechaInicio.slice(0, 10),
      fechaFin: planillaDetalle.fechaFin.slice(0, 10),
      estado: planillaDetalle.estado
    })
    setIsEditing(false)
  }

  return (
    <div className="form-dashboard-page" style={{ maxWidth: '900px' }}>
      {/* Header */}
      <div className="form-dashboard-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ChevronLeft size={20}/>
        </button>
        <h2 className="detalle-title">
          Planilla #{planillaDetalle.idPlanilla}
        </h2>
        {!isEditing && (
          <button
            className="btn-submit"
            style={{ marginLeft: 'auto' }}
            onClick={() => setIsEditing(true)}
          >
            Editar
          </button>
        )}
      </div>

      {/* Información de solo lectura */}
      <div className="detalle-grid">
        <div className="detalle-row">
          <span className="label">Nombre:</span>
          <span className="value">{planillaDetalle.nombre}</span>
        </div>
        <div className="detalle-row">
          <span className="label">Fecha inicio:</span>
          <span className="value">
            {new Date(planillaDetalle.fechaInicio).toLocaleDateString()}
          </span>
        </div>
        <div className="detalle-row">
          <span className="label">Fecha fin:</span>
          <span className="value">
            {new Date(planillaDetalle.fechaFin).toLocaleDateString()}
          </span>
        </div>
        <div className="detalle-row">
          <span className="label">Estado:</span>
          <span className="value">{planillaDetalle.estado}</span>
        </div>
        <div className="detalle-row">
          <span className="label">Registro:</span>
          <span className="value">{fechaRegistro}</span>
        </div>
      </div>

      {/* Formulario de edición o vista de solo lectura */}
      {isEditing ? (
        <form
          className="form-dashboard"
          onSubmit={handleSubmit}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))',
            gap: '1.5rem'
          }}
        >
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
          <div className="form-group">
            <label>Fecha Inicio</label>
            <input
              name="fechaInicio"
              type="date"
              value={form.fechaInicio}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Fecha Fin</label>
            <input
              name="fechaFin"
              type="date"
              value={form.fechaFin}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Estado</label>
            <Select
              name="estado"
              options={ESTADOS.map(e => ({ value: e, label: e }))}
              value={form.estado ? { value: form.estado, label: form.estado } : null}
              onChange={opt => setForm(f => ({ ...f, estado: opt.value }))}
              placeholder="Seleccionar estado…"
              className="react-select-container"
              classNamePrefix="react-select"
              isSearchable={false}
            />
          </div>
          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="submit" className="btn-submit">Guardar cambios</button>
            <button
              type="button"
              className="btn-submit"
              style={{ background: '#ccc' }}
              onClick={handleCancel}
            >
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <div
          className="form-dashboard"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))',
            gap: '1.5rem'
          }}
        >
          <div className="form-group">
            <label>Nombre</label>
            <p className="value">{planillaDetalle.nombre}</p>
          </div>
          <div className="form-group">
            <label>Fecha Inicio</label>
            <p className="value">{formatDate(planillaDetalle.fechaInicio)}</p>
          </div>
          <div className="form-group">
            <label>Fecha Fin</label>
            <p className="value">{formatDate(planillaDetalle.fechaFin)}</p>
          </div>
          <div className="form-group">
            <label>Estado</label>
            <p className="value">{planillaDetalle.estado}</p>
          </div>
          <div className="form-group">
            <label>Registro</label>
            <p className="value">{formatDate(planillaDetalle.cuandoIngreso)}</p>
          </div>
        </div>
      )}
    </div>
  )
}