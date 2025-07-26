import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import '../../../styles/Dashboard.css'
import Select from 'react-select'

// Hook
import { usePlanillaDetalle } from '../../../hooks/planillas'

// Enum de estados predeterminados
const ESTADOS = ['Pendiente', 'En proceso', 'Cerrada']

// Helper para formatear “YYYY‑MM‑DD” o “YYYY‑MM‑DDTHH:MM:SS” sin shift
function formatDate(ds) {
  if (!ds) return ''
  // extrae la parte de fecha (antes de la T, o si fuera MM/DD/YYYY mantiene slash)
  const datePart = ds.split('T')[0]
  let year, month, day
  if (datePart.includes('/')) {
    // por si alguna vez tu backend devuelve con slashes
    [month, day, year] = datePart.split('/')
  } else {
    [year, month, day] = datePart.split('-')
  }
  // new Date(año, mesIndex, día) crea la fecha en tu zona local
  return new Date(+year, +month - 1, +day).toLocaleDateString()
}

export default function DetallePlanilla() {
  const { idPlanilla } = useParams()
  const navigate = useNavigate()

  const [detalle, setDetalle]     = useState(null)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState({
    nombre:      '',
    fechaInicio: '',
    fechaFin:    '',
    estado:      ESTADOS[0]
  })

  const { planillaDetalle, loading, error } = usePlanillaDetalle(idPlanilla)
  setForm({
    nombre:      rec.nombre,
    fechaInicio: fi,
    fechaFin:    ff,
    estado:      st
  })

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
    setForm(f => ({ ...f, [name]: value }))
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
      quienIngreso:  detalle.quienIngreso || '',
      cuandoIngreso: detalle.cuandoIngreso || '',
      quienModifico: user.correo || user.usuario,
      cuandoModifico: ahora,
      idPlanilla:     detalle.idPlanilla,
      nombre:         form.nombre,
      // enviamos “YYYY‑MM‑DD” tal cual en vez de ISO
      fechaInicio:    form.fechaInicio,
      fechaFin:       form.fechaFin,
      estado:         form.estado
    }

    console.log('[PUT] UpdatePlanilla payload:', JSON.stringify(payload, null, 2))

    try {
      const res = await fetch(`${API_BASE}/PlanillaApi/UpdatePlanilla`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload)
      })
      if (!res.ok) {
        const txt = await res.text()
        throw new Error(txt || `Status ${res.status}`)
      }

      // tras el PUT exitoso, vuelvo a recargar desde el servidor
if (!res.ok) {
  const txt = await res.text()
  throw new Error(txt || `Status ${res.status}`)
}

// ---- NUEVO: fetch de recarga ----
const recRes = await fetch(
  `${API_BASE}/EmpleadoApi/GetEmpleadoInfo` +
  `?idEmpleado=${detalle.idEmpleado}` +
  `&usuario=${encodeURIComponent(user.correo || user.usuario)}`
)
if (!recRes.ok) throw new Error(`Error recargando detalles: ${recRes.status}`)
const recData = await recRes.json()
const updated = Array.isArray(recData) && recData.length ? recData[0] : recData
setDetalle(updated)
// ---------------------------------

setIsEditing(false)

    } catch (err) {
      console.error(err)
      setError(err.message)
    }
  }

  if (loading) return <p className="detalle-loading">Cargando…</p>
  if (error)   return <p className="detalle-error">{error}</p>
  if (!detalle) return null

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
            onClick={() => setIsEditing(true)}
          >
            Editar
          </button>
        )}
      </header>

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
    onChange={opt => setForm(f => ({ ...f, estado: opt.value }))}
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
                setForm({
                  nombre:      detalle.nombre,
                  fechaInicio: detalle.fechaInicio.slice(0,10),
                  fechaFin:    detalle.fechaFin.slice(0,10),
                  estado:      detalle.estado
                })
                setIsEditing(false)
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
            <p className="value">{detalle.nombre}</p>
          </div>
          <div className="form-group">
            <label>Fecha Inicio</label>
            <p className="value">{formatDate(detalle.fechaInicio)}</p>
          </div>
          <div className="form-group">
            <label>Fecha Fin</label>
            <p className="value">{formatDate(detalle.fechaFin)}</p>
          </div>
          <div className="form-group">
            <label>Estado</label>
            <p className="value">{detalle.estado}</p>
          </div>
          <div className="form-group">
            <label>Registro</label>
            <p className="value">{formatDate(detalle.cuandoIngreso)}</p>
          </div>
        </div>
      )}
    </div>
  )
}