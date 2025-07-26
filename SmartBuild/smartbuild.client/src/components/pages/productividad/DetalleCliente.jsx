import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import '../../../styles/Dashboard.css'
import '../dashboard/FormDashboard.css'

const API_BASE = 'https://smartbuild-001-site1.ktempurl.com'

export default function DetalleCliente() {
  const { idCliente } = useParams()
  const navigate      = useNavigate()

  const [detalle, setDetalle]   = useState(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm]           = useState({})

  useEffect(() => {
    const usr = localStorage.getItem('currentUser')
    if (!usr) {
      setError('Usuario no autenticado')
      setLoading(false)
      return
    }
    const user   = JSON.parse(usr)
    const correo = encodeURIComponent(user.correo || user.usuario)
    const url    = `${API_BASE}/ClientApi/GetClientInfo?idCliente=${idCliente}&usuario=${correo}`

    fetch(url)
      .then(res => { if (!res.ok) throw new Error(res.status); return res.json() })
      .then(data => {
        const rec = Array.isArray(data) && data.length ? data[0] : data
        setDetalle(rec)
        setForm({
          razonSocial:    rec.razonSocial,
          identificacion: rec.identificacion,
          tipo:           rec.tipo,
          nombreContacto: rec.nombreContacto
        })
      })
      .catch(() => setError('No se encontró el cliente.'))
      .finally(() => setLoading(false))
  }, [idCliente])

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
      usuario:       user.correo || user.usuario,
      quienIngreso: detalle.quienIngreso || '',
      cuandoIngreso: detalle.cuandoIngreso || '',
      quienModifico: user.correo || user.usuario,
      cuandoModifico: ahora,
      idCliente:     detalle.idCliente,
      razonSocial:   form.razonSocial,
      identificacion: form.identificacion,
      tipo:          form.tipo,
      nombreContacto: form.nombreContacto
    }

    const res = await fetch(`${API_BASE}/ClientApi/UpdateClient`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    if (!res.ok) {
      const txt = await res.text()
      throw new Error(txt || `Status ${res.status}`)
    }
    setDetalle({ ...detalle, ...payload })
    setIsEditing(false)
  }

  if (loading) return <p>Cargando…</p>
  if (error)   return <p className="alert alert-danger">{error}</p>
  if (!detalle) return null

  return (
    <div className="form-dashboard-page" style={{ maxWidth: '900px' }}>
      <div className="form-dashboard-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ChevronLeft size={20} />
        </button>
        <h1>Cliente #{detalle.idCliente}</h1>
        {!isEditing && (
          <button className="btn-submit" style={{ marginLeft: 'auto' }} onClick={() => setIsEditing(true)}>
            Editar
          </button>
        )}
      </div>

      {isEditing ? (
        <form className="form-dashboard" onSubmit={handleSubmit} style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(240px,1fr))', gap:'1.5rem' }}>
          <div className="form-group">
            <label>Razón social</label>
            <input name="razonSocial" type="text" value={form.razonSocial} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Identificación</label>
            <input name="identificacion" type="text" value={form.identificacion} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Tipo</label>
            <input name="tipo" type="text" value={form.tipo} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Contacto</label>
            <input name="nombreContacto" type="text" value={form.nombreContacto} onChange={handleChange} required />
          </div>
          <div style={{ gridColumn:'1 / -1', display:'flex', gap:'1rem', marginTop:'1rem' }}>
            <button type="submit" className="btn-submit">Guardar cambios</button>
            <button type="button" className="btn-submit" style={{ background:'#ccc' }} onClick={() => setIsEditing(false)}>
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <div className="form-dashboard" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(240px,1fr))', gap:'1.5rem' }}>
          <div className="form-group"><label>Razón social</label><p className="value">{detalle.razonSocial}</p></div>
          <div className="form-group"><label>Identificación</label><p className="value">{detalle.identificacion}</p></div>
          <div className="form-group"><label>Tipo</label><p className="value">{detalle.tipo}</p></div>
          <div className="form-group"><label>Contacto</label><p className="value">{detalle.nombreContacto}</p></div>
          <div className="form-group"><label>Registro</label><p className="value">{detalle.cuandoIngreso ? new Date(detalle.cuandoIngreso.replace(' ','T')).toLocaleDateString() : ''}</p></div>
        </div>
      )}
    </div>
  )
}
