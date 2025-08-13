import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, Edit, Calendar, Clock } from 'lucide-react'
import './Planilla.css'
import { http } from '../../../api/baseAPI'
import { getPlanillaDetalleByInfo, updatePlanillaDetalle } from '../../../api/PlanillaDetalle'

function dateOnly(v) {
  if (!v) return ''
  const d = new Date(v)
  if (Number.isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}
function isHalfStep(n) {
  return Number.isFinite(n) && Math.round(n * 2) === n * 2
}

export default function EditarDetalle() {
  const { idPlanilla, idDetallePlanilla } = useParams()
  const navigate = useNavigate()

  const [detalle, setDetalle] = useState(null)
  const [empleadoSalario, setEmpleadoSalario] = useState(null)
  const [form, setForm] = useState({ fecha: '', salarioHora: '', horasOrdinarias: '', horasExtras: '', horasDobles: '' })
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [rangoPlanilla, setRangoPlanilla] = useState({ ini: '', fin: '' })

  const getUsuario = () => {
    try {
      const u = JSON.parse(localStorage.getItem('currentUser') || '{}')
      return u.correo || u.usuario || ''
    } catch {
      return ''
    }
  }

  useEffect(() => {
    const detalleId = Number(idDetallePlanilla)
    if (!Number.isFinite(detalleId)) {
      setError('ID de detalle de planilla no válido')
      setLoading(false)
      return
    }
    ;(async () => {
      setLoading(true)
      setError('')
      try {
        const usuario = getUsuario()
        if (!usuario) throw new Error('Usuario no autenticado')

        const d = await getPlanillaDetalleByInfo(detalleId, usuario)
        if (!d) throw new Error('Detalle no encontrado')
        setDetalle(d)

        const empleados = await http.get('/EmpleadoApi/GetEmpleado', { params: { usuario } })
        const emp = Array.isArray(empleados) ? empleados.find(e => e.idEmpleado === d.empleadoID) : null
        if (emp?.salarioHora != null) setEmpleadoSalario(Number(emp.salarioHora))

        setForm({
          fecha: d.fecha ? String(d.fecha).slice(0, 10) : '',
          salarioHora: d.salarioHora ?? '',
          horasOrdinarias: d.horasOrdinarias ?? '',
          horasExtras: d.horasExtras ?? '',
          horasDobles: d.horasDobles ?? ''
        })

        let cab = await http.get('/PlanillaApi/GetPlanillabyInfo', { params: { idPlanilla: Number(d.planillaID || idPlanilla), Usuario: usuario } })
        cab = Array.isArray(cab) ? cab[0] : cab
        if (!cab || (!cab.fechaInicio && !cab.fechaFin)) {
          const todas = await http.get('/PlanillaApi/GetPlanilla', { params: { usuario } })
          cab = (Array.isArray(todas) ? todas : []).find(p => p.idPlanilla === Number(d.planillaID || idPlanilla))
        }
        const ini = dateOnly(cab?.fechaInicio || cab?.FechaInicio)
        const fin = dateOnly(cab?.fechaFin || cab?.FechaFin)
        setRangoPlanilla({ ini, fin })
      } catch (e) {
        setError(e.message || 'Error al cargar')
      } finally {
        setLoading(false)
      }
    })()
  }, [idDetallePlanilla, idPlanilla])

  useEffect(() => {
    if (empleadoSalario != null) setForm(prev => ({ ...prev, salarioHora: empleadoSalario }))
  }, [empleadoSalario])

  const handleChange = e => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    setError('')
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')

    const usuario = getUsuario()
    if (!usuario) {
      setError('Usuario no autenticado')
      return
    }

    const so = Number(form.horasOrdinarias || 0)
    const se = Number(form.horasExtras || 0)
    const sd = Number(form.horasDobles || 0)
    const sh = Number(empleadoSalario != null ? empleadoSalario : (form.salarioHora || 0))

    const dStr = dateOnly(form.fecha)
    const dNum = Date.parse(dStr)
    const iniNum = Date.parse(rangoPlanilla.ini)
    const finNum = Date.parse(rangoPlanilla.fin)

    if (Number.isFinite(iniNum) && dNum < iniNum) {
      setError(`La fecha no puede ser anterior al inicio de la planilla (${rangoPlanilla.ini})`)
      return
    }
    if (Number.isFinite(finNum) && dNum > finNum) {
      setError(`La fecha no puede ser posterior al fin de la planilla (${rangoPlanilla.fin})`)
      return
    }
    if ([so, se, sd].some(v => v < 0) || sh <= 0) {
      setError('Horas y salario deben ser mayores o iguales a 0; el salario mayor a 0')
      return
    }
    if (!isHalfStep(so) || !isHalfStep(se) || !isHalfStep(sd)) {
      setError('Las horas deben ingresarse en incrementos de 0.5')
      return
    }
    if (so + se + sd < 0.5) {
      setError('Debe registrar al menos 0.5 hora en alguna categoría')
      return
    }
    if (so + se + sd > 24) {
      setError('La suma de horas no puede superar 24 en un día')
      return
    }

    const ts = new Date().toISOString()
    const payload = {
      usuario,
      quienIngreso: detalle?.quienIngreso ?? usuario,
      cuandoIngreso: detalle?.cuandoIngreso ?? ts,
      quienModifico: usuario,
      cuandoModifico: ts,
      idDetallePlanilla: Number(idDetallePlanilla),
      planillaID: detalle?.planillaID ?? null,
      empleadoID: detalle?.empleadoID ?? null,
      presupuestoID: detalle?.presupuestoID ?? null,
      fecha: form.fecha ? new Date(form.fecha).toISOString() : null,
      salarioHora: Number(sh.toFixed(2)),
      horasOrdinarias: so,
      horasExtras: se,
      horasDobles: sd,
      detalle: detalle?.detalle ?? ''
    }

    try {
      setSending(true)
      await updatePlanillaDetalle(payload)
      if (idPlanilla) navigate(`/dashboard/planilla/${idPlanilla}`)
      else navigate(-1)
    } catch (e) {
      setError(e.message || 'Error al actualizar')
    } finally {
      setSending(false)
    }
  }

  if (loading) return <p>Cargando...</p>
  if (error && !detalle) return <p className="detalle-error">{error}</p>
  if (!detalle) return null

  return (
    <div className="empleados-page-modern form-planilla-modern">
      {/* HEADER MODERNO */}
      <div className="page-header">
        <div className="header-left">
          <button className="btn-back-modern" onClick={() => navigate(-1)} title="Volver">
            <ChevronLeft size={20} />
          </button>
          <div className="title-section">
            <h1 className="page-title">
              <Edit size={28} /> Editar detalle
            </h1>
            <p className="page-subtitle">Actualiza las horas del registro dentro del rango de la planilla</p>
          </div>
        </div>
      </div>

      {/* PANEL / FORM */}
      <div className="filters-panel">
        <div className="filters-content">
          {error && <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>{error}</div>}

          <form onSubmit={handleSubmit} className="form-dashboard"
                style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="field-label d-flex align-items-center gap-2">
                <Calendar size={16} />
                Fecha {rangoPlanilla.ini && rangoPlanilla.fin ? `(${rangoPlanilla.ini} → ${rangoPlanilla.fin})` : ''}
              </label>
              <input
                type="date"
                name="fecha"
                value={form.fecha}
                onChange={handleChange}
                required
                disabled={sending}
                min={rangoPlanilla.ini || undefined}
                max={rangoPlanilla.fin || undefined}
                className="modern-input"
              />
            </div>

            <div className="form-group">
              <label className="field-label">Salario/Hora</label>
              <input
                type="number"
                name="salarioHora"
                value={form.salarioHora}
                onChange={handleChange}
                disabled={sending || empleadoSalario != null}
                min="0.01"
                step="0.01"
                className="modern-input"
              />
            </div>

            <div className="form-group">
              <label className="field-label d-flex align-items-center gap-2">
                <Clock size={16} /> Horas Ordinarias
              </label>
              <input
                type="number"
                name="horasOrdinarias"
                value={form.horasOrdinarias}
                onChange={handleChange}
                required
                disabled={sending}
                min="0"
                step="0.5"
                className="modern-input"
              />
            </div>

            <div className="form-group">
              <label className="field-label d-flex align-items-center gap-2">
                <Clock size={16} /> Horas Extras
              </label>
              <input
                type="number"
                name="horasExtras"
                value={form.horasExtras}
                onChange={handleChange}
                required
                disabled={sending}
                min="0"
                step="0.5"
                className="modern-input"
              />
            </div>

            <div className="form-group">
              <label className="field-label d-flex align-items-center gap-2">
                <Clock size={16} /> Horas Dobles
              </label>
              <input
                type="number"
                name="horasDobles"
                value={form.horasDobles}
                onChange={handleChange}
                required
                disabled={sending}
                min="0"
                step="0.5"
                className="modern-input"
              />
            </div>

            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '.75rem' }}>
              <button
                type="button"
                className="btn-secondary-modern"
                onClick={() => (idPlanilla ? navigate(`/dashboard/planilla/${idPlanilla}`) : navigate(-1))}
                disabled={sending}
              >
                Cancelar
              </button>
              <button type="submit" className="btn-primary-modern" disabled={sending}>
                {sending ? 'Guardando…' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Tarjetas de apoyo visual */}
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon"><Calendar size={18} /></div>
          <div className="stat-content">
            <span className="stat-number">
              {rangoPlanilla.ini ? `${rangoPlanilla.ini} → ${rangoPlanilla.fin}` : '—'}
            </span>
            <span className="stat-label">Rango planilla</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><Clock size={18} /></div>
          <div className="stat-content">
            <span className="stat-number">
              {(Number(form.horasOrdinarias || 0) + Number(form.horasExtras || 0) + Number(form.horasDobles || 0)) || 0}
            </span>
            <span className="stat-label">Horas totales</span>
          </div>
        </div>
      </div>
    </div>
  )
}
