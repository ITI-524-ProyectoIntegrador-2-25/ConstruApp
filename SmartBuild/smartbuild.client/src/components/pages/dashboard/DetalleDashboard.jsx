import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import '../../../styles/Dashboard.css'


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
    fechaIngreso:  ''
  })

  // 1) Carga inicial
  useEffect(() => {
    const usr = localStorage.getItem('currentUser')
    if (!usr) {
      setError('Usuario no autenticado')
      setLoading(false)
      return
    }
    const user   = JSON.parse(usr)
    const correo = encodeURIComponent(user.correo || user.usuario)

    fetch(`${API_BASE}/EmpleadoApi/GetEmpleadoInfo?idEmpleado=${idEmpleado}&usuario=${correo}`)
      .then(res => {
        if (!res.ok) throw new Error(`Status ${res.status}`)
        return res.json()
      })
      .then(data => {
        const rec = Array.isArray(data) && data.length ? data[0] : data
        setDetalle(rec)
        setForm({
          nombre:        rec.nombre        ?? '',
          apellido:      rec.apellido      ?? '',
          identificacion:rec.identificacion?? '',
          correo:        rec.correo        ?? '',
          puesto:        rec.puesto        ?? '',
          salarioHora:   rec.salarioHora != null
                            ? String(rec.salarioHora)
                            : '',
          activo:        rec.activo != null
                            ? String(rec.activo)
                            : 'true',
          fechaIngreso:  rec.fechaIngreso
                            ? rec.fechaIngreso.slice(0,10)
                            : (rec.cuandoIngreso
                                ? rec.cuandoIngreso.slice(0,10)
                                : '')
        })
      })
      .catch(() => setError('No se encontró el empleado.'))
      .finally(() => setLoading(false))
  }, [idEmpleado])

  const handleChange = e => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    setError('')
  }

  // 2) Guardar cambios igual que en Presupuestos
  const handleSubmit = async e => {
    e.preventDefault()
    const usr = localStorage.getItem('currentUser')
    if (!usr) return
    const user  = JSON.parse(usr)
    const ahora = new Date().toISOString()

    // Rellenar defaults para quien/quandoIngreso
    const quienIngreso  = detalle.quienIngreso  || (user.correo || user.usuario)
    const cuandoIngreso = detalle.cuandoIngreso || ahora

    // Construimos payload EXACTAMENTE como tu API lo pide
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
      activo:         form.activo
    }

    try {
      const res = await fetch(`${API_BASE}/EmpleadoApi/UpdateEmpleado`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload)
      })
      if (!res.ok) {
        const txt = await res.text()
        throw new Error(txt || `Status ${res.status}`)
      }

      // Igual que en Presupuestos: actualizamos el estado local
      setDetalle(prev => ({
        ...prev,
        ...payload
      }))
      setIsEditing(false)
    } catch (err) {
      console.error(err)
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
          <div className="form-group">
            <label>Nombre</label>
            <input name="nombre" value={form.nombre} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Apellido</label>
            <input name="apellido" value={form.apellido} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Identificación</label>
            <input name="identificacion" value={form.identificacion} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Correo</label>
            <input name="correo" type="email" value={form.correo} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Puesto</label>
            <input name="puesto" value={form.puesto} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Salario por hora</label>
            <input name="salarioHora" type="text" value={form.salarioHora} onChange={handleChange} required />
          </div>
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
          <div style={{ gridColumn:'1 / -1', display:'flex', gap:'1rem', marginTop:'1rem' }}>
            <button type="submit" className="btn-submit">Guardar cambios</button>
            <button
              type="button"
              className="btn-submit"
              style={{ background:'#ccc' }}
              onClick={() => setIsEditing(false)}
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
          <div className="form-group"><label>Nombre</label><p className="value">{detalle.nombre}</p></div>
          <div className="form-group"><label>Apellido</label><p className="value">{detalle.apellido}</p></div>
          <div className="form-group"><label>Identificación</label><p className="value">{detalle.identificacion}</p></div>
          <div className="form-group"><label>Correo</label><p className="value">{detalle.correo}</p></div>
          <div className="form-group"><label>Puesto</label><p className="value">{detalle.puesto}</p></div>
          <div className="form-group">
            <label>Salario por hora</label>
            <p className="value">
              ₡{parseFloat(detalle.salarioHora).toLocaleString('es-CR',{minimumFractionDigits:2})}
            </p>
          </div>
          <div className="form-group"><label>Activo</label><p className="value">{detalle.activo==='true'?'Sí':'No'}</p></div>
          <div className="form-group"><label>Fecha de ingreso</label><p className="value">{detalle.fechaIngreso}</p></div>
        </div>
      )}
    </div>
  )
}
