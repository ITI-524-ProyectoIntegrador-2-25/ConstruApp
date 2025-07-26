// src/components/pages/dashboard/DetalleDashboard.jsx
import React, { useState, useEffect } from 'react'

import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import Select from 'react-select'
import '../../../styles/Dashboard.css'
import './FormDashboard.css'

// Hook
import { usePresupuestoDetalle, useInsertarActualizarPresupuesto } from '../../../hooks/dashboard';
import { useClientes } from '../../../hooks/cliente'
// import { label } from 'framer-motion/client'

export default function DetalleDashboard() {
  const { idPresupuesto } = useParams()
  const navigate = useNavigate()

  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState({
    cliente: { },
    fechaInicio: '',
    fechaFin: '',
    fechaFinReal: '',
    penalizacion: false,
    montoPenalizacion: 0,
    descripcion: '',
    materiaPrimaCotizada: 0,
    manoObraCotizada: 0,
    materiaPrimaCostoReal: 0,
    manoObraCostoReal: 0,
    subContratoCostoReal: 0,
    otrosGastos: 0
  })

  const { presupuestoDetalle, loading, error } = usePresupuestoDetalle(idPresupuesto)
  const { clientes, loadingClients, errorClients } = useClientes()
  const { insertarActualizarPresupuesto, loadingUpdate, error: errorGuardar } = useInsertarActualizarPresupuesto();

  useEffect(() => {
    if (presupuestoDetalle) {
      setForm({
        cliente: { value: presupuestoDetalle.clienteID, label: presupuestoDetalle.nombreCliente },
        fechaInicio: presupuestoDetalle.fechaInicio?.slice(0, 10) || '',
        fechaFin: presupuestoDetalle.fechaFin?.slice(0, 10) || '',
        fechaFinReal: presupuestoDetalle.fechaFinReal?.slice(0, 10) || '',
        penalizacion: presupuestoDetalle.penalizacion || false,
        montoPenalizacion: presupuestoDetalle.montoPenalizacion || 0,
        descripcion: presupuestoDetalle.descripcion || '',
        materiaPrimaCotizada: presupuestoDetalle.materiaPrimaCotizada || 0,
        manoObraCotizada: presupuestoDetalle.manoObraCotizada || 0,
        materiaPrimaCostoReal: presupuestoDetalle.materiaPrimaCostoReal || 0,
        manoObraCostoReal: presupuestoDetalle.manoObraCostoReal || 0,
        subContratoCostoReal: presupuestoDetalle.subContratoCostoReal || 0,
        otrosGastos: presupuestoDetalle.otrosGastos || 0
      })
    }
  }, [presupuestoDetalle])

  if (loading) return <p className="detalle-loading">Cargando detalles…</p>
  if (error) return <p className="detalle-error">{error}</p>
  if (loadingClients) return <p className="detalle-loading">Cargando detalles…</p>
  if (errorClients) return <p className="detalle-error">{error}</p>
  if (!presupuestoDetalle) return <p className="detalle-error">No se encontró el detalle del presupuesto.</p>
  if (!clientes) return <p className="detalle-error">No se encontraron clientes.</p>

  const optionsClientes = 
    clientes.map(c => ({ value: c.idCliente, label: c.razonSocial }));
  
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
      usuario: user.correo || user.usuario,
      quienIngreso: presupuestoDetalle.quienIngreso,
      cuandoIngreso: presupuestoDetalle.cuandoIngreso,
      quienModifico: user.correo || user.usuario,
      cuandoModifico: ahora,
      idPresupuesto: presupuestoDetalle.idPresupuesto,
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
    
    const success = await insertarActualizarPresupuesto(payload);
    if(loadingUpdate) return <p className="detalle-loading">Guardando presupuesto…</p>
    if (!success) {
      throw new Error(errorGuardar || 'No se pudo insertar el proyecto');
    }

    setIsEditing(false)
  }


  // Array de campos monetarios
  // const camposMonetarios = [
  //   { key: 'montoPenalizacion', label: 'Monto penalización:', condicional: presupuestoDetalle.penalizacion },
  //   { key: 'materiaPrimaCotizada', label: 'Materia prima (cotizada):' },
  //   { key: 'manoObraCotizada', label: 'Mano de obra (cotizada):' },
  //   { key: 'materiaPrimaCostoReal', label: 'Materia prima (real):' },
  //   { key: 'manoObraCostoReal', label: 'Mano de obra (real):' },
  //   { key: 'subContratoCostoReal', label: 'Subcontrato (real):' },
  //   { key: 'otrosGastos', label: 'Otros gastos:' }
  // ]

  return (
    <div className="form-dashboard-page" style={{ maxWidth: '900px' }}>
      <div className="form-dashboard-header">
        <button className="back-btn" onClick={()=>navigate(-1)}>
          <ChevronLeft size={20}/>
        </button>
        <h1>Presupuesto #{presupuestoDetalle.idPresupuesto} - {presupuestoDetalle.descripcion}</h1>
        {!isEditing && (
          <button className="btn-submit" style={{ marginLeft: 'auto' }} onClick={()=> setIsEditing(true)}>
            Editar
          </button>
        )}
      </div>

      {isEditing ? (
        <form className="form-dashboard" onSubmit={handleSubmit} style={{ display:'grid',gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))'}}>
          <div className="form-group">
            <label>Cliente</label>
            <Select
              options={optionsClientes}
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
            <button type="button" className="btn-submit" style={{background:'#ccc'}} onClick={()=> setIsEditing(false) }>Cancelar</button>
          </div>
        </form>
      ) : (
        <div className="form-dashboard" style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1.5rem' }}>
          <div className="form-group"><label>Cliente</label><p className="value">{presupuestoDetalle.nombreCliente}</p></div>
          <div className="form-group"><label>Fecha Inicio</label><p className="value">{new Date(presupuestoDetalle.fechaInicio).toLocaleDateString()}</p></div>
          <div className="form-group"><label>Fecha Fin Estimada</label><p className="value">{new Date(presupuestoDetalle.fechaFin).toLocaleDateString()}</p></div>
          <div className="form-group"><label>Fecha Fin Real</label><p className="value">{presupuestoDetalle.fechaFinReal?new Date(presupuestoDetalle.fechaFinReal).toLocaleDateString():'N/A'}</p></div>
          <div className="form-group"><label>Penalización</label><p className="value">{presupuestoDetalle.penalizacion?'Sí':'No'}</p></div>
          {presupuestoDetalle.penalizacion && <div className="form-group"><label>Monto Penalización</label><p className="value">₡{presupuestoDetalle.montoPenalizacion}</p></div>}
          {['materiaPrimaCotizada','manoObraCotizada','materiaPrimaCostoReal','manoObraCostoReal','subContratoCostoReal','otrosGastos'].map(key=>(
            <div className="form-group" key={key}><label>{key.replace(/([A-Z])/g,' $1')}</label><p className="value">₡{presupuestoDetalle[key]}</p></div>
          ))}
        </div>
      )}
    </div>
  )
}
