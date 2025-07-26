import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import Select from 'react-select'
import '../../../styles/Dashboard.css'
import './FormDashboard.css'

const API_BASE = 'https://smartbuild-001-site1.ktempurl.com'

export default function DetalleDashboard() {
  const { idPresupuesto } = useParams()
  const navigate = useNavigate()
  const [detalle, setDetalle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState({})
  const [clientOpts, setClientOpts] = useState([])

  // Carga inicial de detalle y clientes
  useEffect(() => {
    const usr = localStorage.getItem('currentUser')
    if (!usr) {
      setError('Usuario no autenticado')
      setLoading(false)
      return
    }
    const user = JSON.parse(usr)
    const correo = encodeURIComponent(user.correo || user.usuario)
    // Detalle
    fetch(`${API_BASE}/PresupuestoApi/GetPresupuestoByID?idPresupuesto=${idPresupuesto}&usuario=${correo}`)
      .then(res => { if (!res.ok) throw new Error(res.status); return res.json() })
      .then(data => {
        const det = Array.isArray(data) ? data[0] : data
        setDetalle(det)
        setForm({
          cliente: { value: det.clienteID, label: det.nombreCliente },
          fechaInicio: det.fechaInicio.slice(0,10),
          fechaFin: det.fechaFin.slice(0,10),
          fechaFinReal: det.fechaFinReal ? det.fechaFinReal.slice(0,10) : '',
          penalizacion: det.penalizacion,
          montoPenalizacion: det.montoPenalizacion,
          descripcion: det.descripcion,
          materiaPrimaCotizada: det.materiaPrimaCotizada,
          manoObraCotizada: det.manoObraCotizada,
          materiaPrimaCostoReal: det.materiaPrimaCostoReal,
          manoObraCostoReal: det.manoObraCostoReal,
          subContratoCostoReal: det.subContratoCostoReal,
          otrosGastos: det.otrosGastos
        })
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
    // Clientes
    fetch(`${API_BASE}/ClientApi/GetClients?usuario=${correo}`)
      .then(res => res.json())
      .then(data => setClientOpts(data.map(c=>({value:c.idCliente,label:c.razonSocial}))))
      .catch(console.error)
  }, [idPresupuesto])

  const handleChange = e => {
    const { name, type, value, checked } = e.target
    setForm(f => ({ ...f, [name]: type==='checkbox'?checked:value }))
  }
  const handleSelect = sel => setForm(f=>({...f, cliente: sel}))

  const handleSubmit = async e => {
    e.preventDefault()
    const usr = localStorage.getItem('currentUser')
    if(!usr) return
    const user = JSON.parse(usr)
    const ahora = new Date().toISOString()
    const payload = {
      usuario: user.correo||user.usuario,
      quienIngreso: detalle.quienIngreso,
      cuandoIngreso: detalle.cuandoIngreso,
      quienModifico: user.correo||user.usuario,
      cuandoModifico: ahora,
      idPresupuesto: detalle.idPresupuesto,
      clienteID: form.cliente.value,
      fechaInicio: new Date(form.fechaInicio).toISOString(),
      fechaFin: form.fechaFin?new Date(form.fechaFin).toISOString():null,
      fechaFinReal: form.fechaFinReal?new Date(form.fechaFinReal).toISOString():null,
      penalizacion: form.penalizacion,
      montoPenalizacion: Number(form.montoPenalizacion),
      descripcion: form.descripcion,
      materiaPrimaCotizada: Number(form.materiaPrimaCotizada),
      manoObraCotizada: Number(form.manoObraCotizada),
      materiaPrimaCostoReal: Number(form.materiaPrimaCostoReal),
      manoObraCostoReal: Number(form.manoObraCostoReal),
      subContratoCostoReal: Number(form.subContratoCostoReal),
      otrosGastos: Number(form.otrosGastos)
    }
    const res = await fetch(`${API_BASE}/PresupuestoApi/UpdatePresupuesto`,{
      method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload)
    })
    if(!res.ok) throw new Error(await res.text())
    setDetalle({...detalle,...payload})
    setIsEditing(false)
  }

  if(loading) return <p>Cargando…</p>
  if(error)   return <p className="alert alert-danger">{error}</p>

  return (
    <div className="form-dashboard-page" style={{ maxWidth: '900px' }}>
      <div className="form-dashboard-header">
        <button className="back-btn" onClick={()=>navigate(-1)}>
          <ChevronLeft size={20}/>
        </button>
        <h1>Presupuesto #{detalle.idPresupuesto}</h1>
        {!isEditing && (
          <button className="btn-submit" style={{ marginLeft: 'auto' }} onClick={()=>setIsEditing(true)}>
            Editar
          </button>
        )}
      </div>

      {isEditing ? (
        <form className="form-dashboard" onSubmit={handleSubmit} style={{ display:'grid',gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))'
 }}>
          <div className="form-group">
            <label>Cliente</label>
            <Select
              options={clientOpts}
              value={form.cliente}
              onChange={handleSelect}
              className="react-select-container"
              classNamePrefix="react-select"
            />
          </div>
          <div className="form-group">
            <label>Fecha Inicio</label>
            <input type="date" name="fechaInicio" value={form.fechaInicio} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Fecha Fin Estimada</label>
            <input type="date" name="fechaFin" value={form.fechaFin} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Fecha Fin Real</label>
            <input type="date" name="fechaFinReal" value={form.fechaFinReal} onChange={handleChange} />
          </div>
          <div className="form-group switch-group">
            <label>
              <input type="checkbox" name="penalizacion" checked={form.penalizacion} onChange={handleChange}/> Penalización
            </label>
          </div>
          {form.penalizacion && (
            <div className="form-group">
              <label>Monto Penalización</label>
              <input type="number" name="montoPenalizacion" value={form.montoPenalizacion} onChange={handleChange} />
            </div>
          )}
          <div className="form-group">
            <label>Descripción</label>
            <textarea name="descripcion" rows={3} value={form.descripcion} onChange={handleChange} />
          </div>
          {['materiaPrimaCotizada','manoObraCotizada','materiaPrimaCostoReal','manoObraCostoReal','subContratoCostoReal','otrosGastos'].map(key=> (
            <div className="form-group" key={key}>
              <label>{key.replace(/([A-Z])/g,' $1')}</label>
              <input type="number" name={key} value={form[key]} onChange={handleChange}/>
            </div>
          ))}
          <div style={{gridColumn:'1 / -1',display:'flex',gap:'1rem',marginTop:'1rem'}}>
            <button type="submit" className="btn-submit">Guardar cambios</button>
            <button type="button" className="btn-submit" style={{background:'#ccc'}} onClick={()=>setIsEditing(false)}>Cancelar</button>
          </div>
        </form>
      ) : (
        <div className="form-dashboard" style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1.5rem' }}>
          <div className="form-group"><label>Cliente</label><p className="value">{detalle.nombreCliente}</p></div>
          <div className="form-group"><label>Fecha Inicio</label><p className="value">{new Date(detalle.fechaInicio).toLocaleDateString()}</p></div>
          <div className="form-group"><label>Fecha Fin Estimada</label><p className="value">{new Date(detalle.fechaFin).toLocaleDateString()}</p></div>
          <div className="form-group"><label>Fecha Fin Real</label><p className="value">{detalle.fechaFinReal?new Date(detalle.fechaFinReal).toLocaleDateString():'N/A'}</p></div>
          <div className="form-group"><label>Penalización</label><p className="value">{detalle.penalizacion?'Sí':'No'}</p></div>
          {detalle.penalizacion && <div className="form-group"><label>Monto Penalización</label><p className="value">₡{detalle.montoPenalizacion}</p></div>}
          {['materiaPrimaCotizada','manoObraCotizada','materiaPrimaCostoReal','manoObraCostoReal','subContratoCostoReal','otrosGastos'].map(key=>(
            <div className="form-group" key={key}><label>{key.replace(/([A-Z])/g,' $1')}</label><p className="value">₡{detalle[key]}</p></div>
          ))}
        </div>
      )}
    </div>
  )
}
