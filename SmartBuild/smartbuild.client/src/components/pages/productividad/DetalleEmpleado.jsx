import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import '../../../styles/Dashboard.css'
import '../dashboard/FormDashboard.css'
import './DetalleEmpleado.css'

const API_BASE = 'https://smartbuild-001-site1.ktempurl.com'

export default function DetalleEmpleado() {
  const { idEmpleado } = useParams()
  const navigate = useNavigate()

  const [detalle, setDetalle]     = useState(null)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')
  const [isEditing, setIsEditing] = useState(false)

  const [form, setForm] = useState({
    nombre:        '',
    apellido:      '',
    identificacion:'',
    correo:        '',
    puesto:        '',
    salarioHora:   '',
    activo:        'true',
    fechaIngreso:  ''    // YYYY-MM-DD
  })

  // 1. Carga inicial con normalización
  useEffect(() => {
    const usr = localStorage.getItem('currentUser')
    if (!usr) {
      console.error('Usuario no autenticado – no hay currentUser')
      setError('Usuario no autenticado')
      setLoading(false)
      return
    }
    const user   = JSON.parse(usr)
    const correo = encodeURIComponent(user.correo || user.usuario)
    const url    = `${API_BASE}/EmpleadoApi/GetEmpleadoInfo?idEmpleado=${idEmpleado}&usuario=${correo}`

    console.log('[GET] URL GetEmpleadoInfo:', url)
    fetch(url)
      .then(res => {
        console.log('[GET] Status:', res.status)
        if (!res.ok) throw new Error(`Status ${res.status}`)
        return res.json()
      })
      .then(data => {
        console.log('[GET] Data recibida:', data)
        const rec = Array.isArray(data) && data.length ? data[0] : data

        // Normaliza activo
        const activoStr = rec.activo != null
          ? String(rec.activo).toLowerCase()
          : 'true'

        // Calcula fechaIngreso en YYYY-MM-DD
        let defaultFecha = ''
        if (rec.fechaIngreso) {
          // si viene en formato MM/DD/YYYY
          if (rec.fechaIngreso.includes('/')) {
            const [m, d, y] = rec.fechaIngreso.split('/')
            defaultFecha = `${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`
          } else {
            defaultFecha = rec.fechaIngreso.slice(0, 10)
          }
        } else if (rec.cuandoIngreso) {
          defaultFecha = new Date(rec.cuandoIngreso).toISOString().slice(0, 10)
        }

        setDetalle(rec)
        setForm({
          nombre:         rec.nombre        ?? '',
          apellido:       rec.apellido      ?? '',
          identificacion: rec.identificacion?? '',
          correo:         rec.correo        ?? '',
          puesto:         rec.puesto        ?? '',
          salarioHora:    rec.salarioHora != null
                             ? String(rec.salarioHora)
                             : '',
          activo:         activoStr,
          fechaIngreso:   defaultFecha
        })
      })
      .catch(err => {
        console.error('[GET] Error al cargar empleado:', err)
        setError('No se encontró el empleado.')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [idEmpleado])

  const handleChange = e => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  // 2. Guardar cambios y actualizar estado local
  const handleSubmit = async e => {
    e.preventDefault()
    const usr = localStorage.getItem('currentUser')
    if (!usr) {
      console.error('No hay usuario en localStorage')
      return
    }
    const user  = JSON.parse(usr)
    const ahora = new Date().toISOString()

    const quienIngreso  = detalle.quienIngreso  || (user.correo || user.usuario)
    const cuandoIngreso = detalle.cuandoIngreso || ahora

    const payload = {
      usuario:        user.correo || user.usuario,
      quienIngreso,
      cuandoIngreso,
      quienModifico:  user.correo || user.usuario,
      cuandoModifico: ahora,
      idEmpleado:     detalle.idEmpleado,
      nombre:         form.nombre,
      apellido:       form.apellido,
      identificacion: form.identificacion,
      correo:         form.correo,
      puesto:         form.puesto,
      salarioHora:    form.salarioHora,
      fechaIngreso:   form.fechaIngreso,
      activo:         form.activo.toLowerCase()
    }

    console.log('[PUT] Payload normalizado:', JSON.stringify(payload, null, 2))
    const putUrl = `${API_BASE}/EmpleadoApi/UpdateEmpleado`
    console.log('[PUT] URL UpdateEmpleado:', putUrl)

    try {
      const res = await fetch(putUrl, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload)
      })
      console.log('[PUT] Status:', res.status)
      if (!res.ok) {
        const txt = await res.text()
        console.error('[PUT] Error text:', txt)
        throw new Error(txt || `Status ${res.status}`)
      }

      // Actualiza el estado local con el payload enviado
      setDetalle(prev => ({
        ...prev,
        ...payload
      }))
      setForm({
        ...form,
        fechaIngreso: payload.fechaIngreso
      })
      setIsEditing(false)
    } catch (err) {
      console.error('[PUT] Exception en handleSubmit:', err)
      setError(err.message)
    }
  }

  if (loading)   return <p className="detalle-loading">Cargando detalles…</p>
  if (error)     return <p className="detalle-error">{error}</p>
  if (!detalle)  return <p className="detalle-error">No hay datos del empleado.</p>

  return (
    <div className="form-dashboard-page" style={{ maxWidth: '900px' }}>
      <div className="form-dashboard-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ChevronLeft size={20}/>
        </button>
        <h1>Empleado #{detalle.idEmpleado}</h1>
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
          {/* Campos editables */}
          <div className="form-group">
            <label>Nombre</label>
            <input
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Apellido</label>
            <input
              name="apellido"
              value={form.apellido}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Identificación</label>
            <input
              name="identificacion"
              value={form.identificacion}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Correo</label>
            <input
              name="correo"
              type="email"
              value={form.correo}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Puesto</label>
            <input
              name="puesto"
              value={form.puesto}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Salario por hora</label>
            <input
              name="salarioHora"
              type="text"
              value={form.salarioHora}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Activo</label>
            <select
              name="activo"
              value={form.activo}
              onChange={handleChange}
            >
              <option value="true">Sí</option>
              <option value="false">No</option>
            </select>
          </div>
          <div className="form-group">
            <label>Fecha de ingreso</label>
            <input
              name="fechaIngreso"
              type="date"
              value={form.fechaIngreso}
              onChange={handleChange}
              required
            />
          </div>

          <div style={{ gridColumn:'1 / -1', display:'flex', gap:'1rem', marginTop:'1rem' }}>
            <button type="submit" className="btn-submit">Guardar cambios</button>
            <button
              type="button"
              className="btn-submit"
              style={{ background: '#ccc' }}
              onClick={() => {
                // Restaurar formulario y cancelar
                const fallback = detalle.fechaIngreso
                  ? detalle.fechaIngreso.slice(0,10)
                  : detalle.cuandoIngreso
                    ? new Date(detalle.cuandoIngreso).toISOString().slice(0,10)
                    : ''
                setForm({
                  nombre:         detalle.nombre        ?? '',
                  apellido:       detalle.apellido      ?? '',
                  identificacion: detalle.identificacion?? '',
                  correo:         detalle.correo        ?? '',
                  puesto:         detalle.puesto        ?? '',
                  salarioHora:    detalle.salarioHora != null
                                     ? String(detalle.salarioHora)
                                     : '',
                  activo:         String(detalle.activo).toLowerCase(),
                  fechaIngreso:   fallback
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
          {/* Vista de solo lectura */}
          <div className="form-group">
            <label>Nombre</label>
            <p className="value">{detalle.nombre}</p>
          </div>
          <div className="form-group">
            <label>Apellido</label>
            <p className="value">{detalle.apellido}</p>
          </div>
          <div className="form-group">
            <label>Identificación</label>
            <p className="value">{detalle.identificacion}</p>
          </div>
          <div className="form-group">
            <label>Correo</label>
            <p className="value">{detalle.correo}</p>
          </div>
          <div className="form-group">
            <label>Puesto</label>
            <p className="value">{detalle.puesto}</p>
          </div>
          <div className="form-group">
            <label>Salario por hora</label>
            <p className="value">
              ₡{parseFloat(detalle.salarioHora)
                .toLocaleString('es-CR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="form-group">
            <label>Activo</label>
            <p className="value">
              {detalle.activo === 'true' ? 'Sí' : 'No'}
            </p>
          </div>
          <div className="form-group">
            <label>Fecha de ingreso</label>
            <p className="value">
              {form.fechaIngreso || '-'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
