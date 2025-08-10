// src/components/pages/planilla/EditarDetalle.jsx
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import './Planilla.css'
import { http } from '../../../api/client'
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
    <div className="form-dashboard-page">
      <header className="form-dashboard-header">
        <button className="back-btn" onClick={() => navigate(-1)} title="Regresar" aria-label="Regresar">
          <ChevronLeft size={20} />
        </button>
        <h1>Editar Detalle de Planilla #{idDetallePlanilla}</h1>
      </header>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit} className="form-dashboard">
        <div className="form-group">
          <label>Fecha {rangoPlanilla.ini && rangoPlanilla.fin ? `(${rangoPlanilla.ini} → ${rangoPlanilla.fin})` : ''}</label>
          <input
            type="date"
            name="fecha"
            value={form.fecha}
            onChange={handleChange}
            required
            disabled={sending}
            min={rangoPlanilla.ini || undefined}
            max={rangoPlanilla.fin || undefined}
          />
        </div>

        <div className="form-group">
          <label>Salario/Hora</label>
          <input
            type="number"
            name="salarioHora"
            value={form.salarioHora}
            onChange={handleChange}
            disabled={sending || empleadoSalario != null}
            min="0.01"
            step="0.01"
          />
        </div>

        <div className="form-group">
          <label>Horas Ordinarias</label>
          <input
            type="number"
            name="horasOrdinarias"
            value={form.horasOrdinarias}
            onChange={handleChange}
            required
            disabled={sending}
            min="0"
            step="0.5"
          />
        </div>

        <div className="form-group">
          <label>Horas Extras</label>
          <input
            type="number"
            name="horasExtras"
            value={form.horasExtras}
            onChange={handleChange}
            required
            disabled={sending}
            min="0"
            step="0.5"
          />
        </div>

        <div className="form-group">
          <label>Horas Dobles</label>
          <input
            type="number"
            name="horasDobles"
            value={form.horasDobles}
            onChange={handleChange}
            required
            disabled={sending}
            min="0"
            step="0.5"
          />
        </div>

        <button type="submit" className="btn-submit" disabled={sending}>
          {sending ? 'Guardando…' : 'Guardar Cambios'}
        </button>
        <button
          type="button"
          className="btn-submit"
          style={{ background: '#ccc', marginLeft: 12 }}
          onClick={() => (idPlanilla ? navigate(`/dashboard/planilla/${idPlanilla}`) : navigate(-1))}
          disabled={sending}
        >
          Cancelar
        </button>
      </form>
    </div>
  )
}
