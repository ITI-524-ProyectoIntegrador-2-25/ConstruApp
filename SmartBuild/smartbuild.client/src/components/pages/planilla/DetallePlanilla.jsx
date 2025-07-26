import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import '../../../styles/Dashboard.css'
import Select from 'react-select'

// Hook
import { usePlanillaDetalle } from '../../../hooks/Planilla'

// Enum de estados predeterminados
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

  const isEditing = false
  const form={
    nombre:      '',
    fechaInicio: '',
    fechaFin:    '',
    estado:      ESTADOS[0]

}
  

  const { planillaDetalle, loading, error } = usePlanillaDetalle(idPlanilla)


  if (loading) return <p className="detalle-loading">Cargando detalles…</p>
  if (error) return <p className="detalle-error">{error}</p>
  if (!planillaDetalle) return null

  // formateo seguro de la fecha de registro
  const fechaRegistro = (() => {
    if (!planillaDetalle.cuandoIngreso) return ''
    const iso = planillaDetalle.cuandoIngreso.replace(' ', 'T')
    const d = new Date(iso)
    return isNaN(d) ? planillaDetalle.cuandoIngreso : d.toLocaleDateString()
  })()

  const handleChange = e => {
    const { name, value } = e.target
    form(f => ({ ...f, [name]: value }))
  }

  // 2) Enviar actualización
  const handleSubmit = async e => {
    e.preventDefault()
    const usr = localStorage.getItem('currentUser')
    if (!usr) return
    const user  = JSON.parse(usr)
    const ahora = new Date().toISOString()

    const payload = {
      usuario:        user.correo || user.usuario,
      quienIngreso:  planillaDetalle.quienIngreso || '',
      cuandoIngreso: planillaDetalle.cuandoIngreso || '',
      quienModifico: user.correo || user.usuario,
      cuandoModifico: ahora,
      idPlanilla:     planillaDetalle.idPlanilla,
      nombre:         form.nombre,
      fechaInicio:    form.fechaInicio,
      fechaFin:       form.fechaFin,
      estado:         form.estado
    }

  return (
    <div className="form-dashboard-page" style={{ maxWidth: '900px' }}>
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
            onClick={() => isEditing(true)}
          >
            Editar
          </button>
        )}
      </div>

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

      {isEditing ? (
        <form
          className="form-dashboard"
          onSubmit={handleSubmit}
          style={{
            display:            'grid',
            gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',
            gap:                '1.5rem'
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
    onChange={opt => form(f => ({ ...f, estado: opt.value }))}
    placeholder="Seleccionar estado…"
    className="react-select-container"
    classNamePrefix="react-select"
    isSearchable={false}
  />
          </div>
          <div style={{ gridColumn:'1 / -1', display:'flex', gap:'1rem', marginTop:'1rem' }}>
            <button type="submit" className="btn-submit">Guardar cambios</button>
            <button
              type="button"
              className="btn-submit"
              style={{ background:'#ccc' }}
              onClick={() => {
                form({
                  nombre:      planillaDetalle.nombre,
                  fechaInicio: planillaDetalle.fechaInicio.slice(0,10),
                  fechaFin:    planillaDetalle.fechaFin.slice(0,10),
                  estado:      planillaDetalle.estado
                })
                isEditing(false)
              }}
            >
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <div
          className="form-dashboard"
          style={{
            display:            'grid',
            gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',
            gap:                '1.5rem'
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
}