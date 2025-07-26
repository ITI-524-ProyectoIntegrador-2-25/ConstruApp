import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import Select from 'react-select'
import '../../../styles/Dashboard.css'
import '../dashboard/FormDashboard.css'


const API_BASE = 'https://smartbuild-001-site1.ktempurl.com'

export default function DetalleActividades() {
  const { idActividad } = useParams()
  const navigate        = useNavigate()

  const [detalle, setDetalle]         = useState(null)
  const [presupuestos, setPresupuestos] = useState([])
  const [empleados, setEmpleados]     = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')
  const [isEditing, setIsEditing]     = useState(false)
  const [form, setForm]               = useState({})

  useEffect(() => {
    const usr = localStorage.getItem('currentUser')
    if (!usr) {
      setError('Usuario no autenticado.')
      setLoading(false)
      return
    }
    const user   = JSON.parse(usr)
    const correo = encodeURIComponent(user.correo || user.usuario)

    // Carga simultánea de actividad, presupuestos y empleados
    Promise.all([
      fetch(`${API_BASE}/ActividadApi/GetActividadbyInfo?idActividad=${idActividad}&usuario=${correo}`)
        .then(res => { if (!res.ok) throw new Error(res.status); return res.json() }),
      fetch(`${API_BASE}/PresupuestoApi/GetPresupuestos?usuario=${correo}`)
        .then(res => { if (!res.ok) throw new Error(res.status); return res.json() }),
      fetch(`${API_BASE}/EmpleadoApi/GetEmpleado?usuario=${correo}`)
        .then(res => { if (!res.ok) throw new Error(res.status); return res.json() })
    ])
    .then(([rawAct, presData, empData]) => {
      const act = Array.isArray(rawAct) ? rawAct[0] : rawAct
      setDetalle(act)
      setPresupuestos(presData.map(p => ({ value: p.idPresupuesto, label: p.descripcion })))
      setEmpleados(empData.map(e => ({ value: e.idEmpleado, label: e.nombreEmpleado || `${e.nombre} ${e.apellido}` })))
      setForm({
        presupuesto: presData.find(p => p.idPresupuesto === act.presupuestoID) ? { value: act.presupuestoID, label: '' } : null,
        empleado:    empData.find(e => e.idEmpleado === act.empleadoID)   ? { value: act.empleadoID,    label: '' } : null,
        descripcion: act.descripcion,
        fechaInicioProyectada: act.fechaInicioProyectada.slice(0,16),
        fechaFinProyectada:    act.fechaFinProyectada.slice(0,16),
        fechaInicioReal:       act.fechaInicioReal.slice(0,16),
        fechaFinReal:          act.fechaFinReal.slice(0,16),
        estado:      act.estado
      })
    })
    .catch(() => setError('No se pudo cargar la información.'))
    .finally(() => setLoading(false))
  }, [idActividad])

  const handleChange = e => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }
  const handleSelect = field => selected => {
    setForm(f => ({ ...f, [field]: selected }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const usr = localStorage.getItem('currentUser')
    if (!usr) return
    const user  = JSON.parse(usr)
    const ahora = new Date().toISOString()

    const payload = {
      usuario:                 user.correo || user.usuario,
      quienIngreso:           detalle.quienIngreso,
      cuandoIngreso:          detalle.cuandoIngreso,
      quienModifico:           user.correo || user.usuario,
      cuandoModifico:          ahora,
      idActividad:            detalle.idActividad,
      presupuestoID:          form.presupuesto.value,
      empleadoID:             form.empleado.value,
      descripcion:            form.descripcion,
      fechaInicioProyectada: form.fechaInicioProyectada,
      fechaFinProyectada:    form.fechaFinProyectada,
      fechaInicioReal:       form.fechaInicioReal,
      fechaFinReal:          form.fechaFinReal,
      estado:                 form.estado
    }
    const res = await fetch(`${API_BASE}/ActividadApi/UpdateActividad`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    if (!res.ok) throw new Error(await res.text())
    setDetalle({ ...detalle, ...payload })
    setIsEditing(false)
  }

  if (loading) return <p>Cargando detalles…</p>
  if (error)   return <p className="alert alert-danger">{error}</p>
  if (!detalle) return null

  return (
    <div className="form-dashboard-page" style={{ maxWidth: '900px' }}>
      <div className="form-dashboard-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ChevronLeft size={20}/>
        </button>
        <h1>Actividad #{detalle.idActividad}</h1>
        {!isEditing && (
          <button className="btn-submit" style={{ marginLeft: 'auto' }} onClick={() => setIsEditing(true)}>
            Editar
          </button>
        )}
      </div>

      {isEditing ? (
        <form className="form-dashboard"
              onSubmit={handleSubmit}
              style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))',gap:'1.5rem' }}>

          {/* Presupuesto */}
          <div className="form-group">
            <label>Presupuesto</label>
            <Select
              options={presupuestos}
              value={form.presupuesto}
              onChange={handleSelect('presupuesto')}
              className="react-select-container"
              classNamePrefix="react-select"
              required
            />
          </div>

          {/* Empleado */}
          <div className="form-group">
            <label>Empleado</label>
            <Select
              options={empleados}
              value={form.empleado}
              onChange={handleSelect('empleado')}
              className="react-select-container"
              classNamePrefix="react-select"
              required
            />
          </div>

          {/* Descripción */}
          <div className="form-group">
            <label>Descripción</label>
            <textarea
              name="descripcion"
              rows={2}
              value={form.descripcion}
              onChange={handleChange}
              required
            />
          </div>

          {/* Fechas */}
          <div className="form-group">
            <label>Inicio Proyectada</label>
            <input
              type="datetime-local"
              name="fechaInicioProyectada"
              value={form.fechaInicioProyectada}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Fin Proyectada</label>
            <input
              type="datetime-local"
              name="fechaFinProyectada"
              value={form.fechaFinProyectada}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Inicio Real</label>
            <input
              type="datetime-local"
              name="fechaInicioReal"
              value={form.fechaInicioReal}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Fin Real</label>
            <input
              type="datetime-local"
              name="fechaFinReal"
              value={form.fechaFinReal}
              onChange={handleChange}
              required
            />
          </div>

          {/* Estado */}
          <div className="form-group">
            <label>Estado</label>
            <input
              name="estado"
              type="text"
              value={form.estado}
              onChange={handleChange}
              required
            />
          </div>

          {/* Botones */}
          <div style={{ gridColumn: '1 / -1', display:'flex', gap:'1rem', marginTop:'1rem' }}>
            <button type="submit" className="btn-submit">Guardar cambios</button>
            <button type="button" className="btn-submit" style={{ background:'#ccc' }} onClick={() => setIsEditing(false)}>Cancelar</button>
          </div>

        </form>
      ) : (
        <div className="form-dashboard" style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))',gap:'1.5rem' }}>

          <div className="form-group"><label>Presupuesto</label><p className="value">{presupuestos.find(p=>p.value===detalle.presupuestoID)?.label}</p></div>
          <div className="form-group"><label>Empleado</label><p className="value">{empleados.find(e=>e.value===detalle.empleadoID)?.label}</p></div>
          <div className="form-group"><label>Descripción</label><p className="value">{detalle.descripcion}</p></div>
          <div className="form-group"><label>Inicio Proyectada</label><p className="value">{new Date(detalle.fechaInicioProyectada).toLocaleString()}</p></div>
          <div className="form-group"><label>Fin Proyectada</label><p className="value">{new Date(detalle.fechaFinProyectada).toLocaleString()}</p></div>
          <div className="form-group"><label>Inicio Real</label><p className="value">{new Date(detalle.fechaInicioReal).toLocaleString()}</p></div>
          <div className="form-group"><label>Fin Real</label><p className="value">{new Date(detalle.fechaFinReal).toLocaleString()}</p></div>
          <div className="form-group"><label>Duración (h)</label><p className="value">{((new Date(detalle.fechaFinReal)-new Date(detalle.fechaInicioReal))/3600000).toFixed(2)}</p></div>
          <div className="form-group"><label>Estado</label><p className="value">{detalle.estado}</p></div>

        </div>
      )}
    </div>
  )
}