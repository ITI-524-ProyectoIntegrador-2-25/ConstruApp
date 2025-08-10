// src/components/pages/planilla/AgregarDetalle.jsx
import React, { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import Select from 'react-select'
import { http } from '../../../api/client'
import { insertPlanillaDetalle } from '../../../api/PlanillaDetalle'

function dateOnly(v) {
  if (!v) return ''
  const d = new Date(v)
  if (Number.isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}
function isHalfStep(n) {
  return Number.isFinite(n) && Math.round(n * 2) === n * 2
}

export default function AgregarDetalle() {
  const { idPlanilla } = useParams()
  const navigate = useNavigate()

  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const [projectsOpts, setProjectsOpts] = useState([])
  const [employeesOpts, setEmployeesOpts] = useState([])
  const [empleadosRaw, setEmpleadosRaw] = useState([])
  const [detallesPlanilla, setDetallesPlanilla] = useState([])
  const [rangoPlanilla, setRangoPlanilla] = useState({ ini: '', fin: '' })

  const [form, setForm] = useState({
    proyecto: null,
    empleado: null,
    fecha: '',
    salarioHora: '',
    horasOrdinarias: '',
    horasExtras: '',
    horasDobles: ''
  })

  const getUsuario = () => {
    try {
      const u = JSON.parse(localStorage.getItem('currentUser') || '{}')
      return u.correo || u.usuario || ''
    } catch {
      return ''
    }
  }

  useEffect(() => {
    const usuario = getUsuario()
    if (!usuario) return
    ;(async () => {
      try {
        const [pres, empleados, detalles, cab] = await Promise.all([
          http.get('/PresupuestoApi/GetPresupuestos', { params: { usuario } }),
          http.get('/EmpleadoApi/GetEmpleado', { params: { usuario } }),
          http.get('/PlanillaDetalleApi/GetPlanillaDetalle', { params: { usuario } }),
          http.get('/PlanillaApi/GetPlanillabyInfo', { params: { idPlanilla: Number(idPlanilla), Usuario: usuario } })
        ])

        const presOpts = (Array.isArray(pres) ? pres : []).map(p => ({ value: p.idPresupuesto, label: p.descripcion }))
        const emps = Array.isArray(empleados) ? empleados : []
        const empOpts = emps.map(e => ({ value: e.idEmpleado, label: e.nombreEmpleado || `${e.nombre || ''} ${e.apellido || ''}`.trim() }))
        const det = (Array.isArray(detalles) ? detalles : []).filter(d => d.planillaID === Number(idPlanilla))

        let cabObj = Array.isArray(cab) ? cab[0] : cab
        if (!cabObj || (!cabObj.fechaInicio && !cabObj.fechaFin)) {
          const todas = await http.get('/PlanillaApi/GetPlanilla', { params: { usuario } })
          cabObj = (Array.isArray(todas) ? todas : []).find(p => p.idPlanilla === Number(idPlanilla))
        }
        const ini = dateOnly(cabObj?.fechaInicio || cabObj?.FechaInicio)
        const fin = dateOnly(cabObj?.fechaFin || cabObj?.FechaFin)

        setProjectsOpts(presOpts)
        setEmpleadosRaw(emps)
        setEmployeesOpts(empOpts)
        setDetallesPlanilla(det)
        setRangoPlanilla({ ini, fin })
      } catch {}
    })()
  }, [idPlanilla])

  useEffect(() => {
    if (!form.empleado) return
    const emp = empleadosRaw.find(e => e.idEmpleado === form.empleado.value)
    const salario = emp?.salarioHora
    setForm(f => ({ ...f, salarioHora: salario != null ? String(salario) : f.salarioHora }))
  }, [form.empleado, empleadosRaw])

  const detallesIndex = useMemo(() => {
    const idx = new Set()
    for (const d of detallesPlanilla) idx.add(`${d.empleadoID}|${dateOnly(d.fecha)}`)
    return idx
  }, [detallesPlanilla])

  const so = Number(form.horasOrdinarias || 0)
  const se = Number(form.horasExtras || 0)
  const sd = Number(form.horasDobles || 0)
  const sh = Number(form.salarioHora || 0)
  const total = useMemo(() => (sh * so) + (sh * 1.5 * se) + (sh * 2 * sd), [sh, so, se, sd])

  const handleChange = e => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    setError('')
  }
  const handleSelectChange = (name, val) => {
    setForm(f => ({ ...f, [name]: val }))
    setError('')
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')

    if (!form.proyecto || !form.empleado || !form.fecha) {
      setError('Proyecto, empleado y fecha son obligatorios')
      return
    }

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

    const key = `${form.empleado.value}|${dStr}`
    if (detallesIndex.has(key)) {
      setError('Ese empleado ya tiene un registro en esa fecha')
      return
    }

    const usuario = getUsuario()
    if (!usuario) {
      setError('No se encontró el usuario autenticado')
      return
    }

    const ts = new Date().toISOString()
    const payload = {
      usuario,
      quienIngreso: usuario,
      cuandoIngreso: ts,
      quienModifico: usuario,
      cuandoModifico: ts,
      planillaID: Number(idPlanilla),
      empleadoID: form.empleado.value,
      presupuestoID: form.proyecto.value,
      fecha: new Date(form.fecha).toISOString(),
      salarioHora: Number(sh.toFixed(2)),
      horasOrdinarias: so,
      horasExtras: se,
      horasDobles: sd,
      detalle: 'Agregado desde formulario'
    }

    try {
      setSending(true)
      await insertPlanillaDetalle(payload)
      navigate(`/dashboard/planilla/${idPlanilla}`)
    } catch (err) {
      setError(err.message || 'Error al agregar detalle')
    } finally {
      setSending(false)
    }
  }

  const empleadoFechaBloqueado =
    form.empleado && form.fecha && detallesIndex.has(`${form.empleado.value}|${dateOnly(form.fecha)}`)

  return (
    <div className="form-dashboard-page">
      <header className="form-dashboard-header">
        <button className="back-btn" onClick={() => navigate(-1)} title="Regresar" aria-label="Regresar">
          <ChevronLeft size={20} />
        </button>
      </header>

      <form
        className="form-dashboard"
        onSubmit={handleSubmit}
        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}
      >
        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label>Proyecto</label>
          <Select
            options={projectsOpts}
            value={form.proyecto}
            onChange={val => handleSelectChange('proyecto', val)}
            placeholder="Seleccionar proyecto…"
            isDisabled={sending}
          />
        </div>

        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label>Empleado</label>
          <Select
            options={employeesOpts}
            value={form.empleado}
            onChange={val => handleSelectChange('empleado', val)}
            placeholder="Seleccionar empleado…"
            isDisabled={sending}
          />
        </div>

        <div className="form-group">
          <label>
            Fecha {rangoPlanilla.ini && rangoPlanilla.fin ? `(${rangoPlanilla.ini} → ${rangoPlanilla.fin})` : ''}
          </label>
          <input
            type="date"
            name="fecha"
            value={form.fecha}
            onChange={handleChange}
            disabled={sending}
            min={rangoPlanilla.ini || undefined}
            max={rangoPlanilla.fin || undefined}
          />
        </div>

        <div className="form-group">
          <label>Salario por hora</label>
          <input
            type="number"
            name="salarioHora"
            value={form.salarioHora}
            onChange={handleChange}
            min="0.01"
            step="0.01"
            disabled={sending || !!(form.empleado && form.salarioHora)}
          />
        </div>

        <div className="form-group">
          <label>Horas ordinarias</label>
          <input
            type="number"
            name="horasOrdinarias"
            value={form.horasOrdinarias}
            onChange={handleChange}
            min="0"
            step="0.5"
            disabled={sending}
          />
        </div>

        <div className="form-group">
          <label>Horas extras</label>
          <input
            type="number"
            name="horasExtras"
            value={form.horasExtras}
            onChange={handleChange}
            min="0"
            step="0.5"
            disabled={sending}
          />
        </div>

        <div className="form-group">
          <label>Horas dobles</label>
          <input
            type="number"
            name="horasDobles"
            value={form.horasDobles}
            onChange={handleChange}
            min="0"
            step="0.5"
            disabled={sending}
          />
        </div>

        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label>Resumen</label>
          <div className="value" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <span>Ordinarias: <strong>{so || 0}</strong></span>
            <span>Extras: <strong>{se || 0}</strong></span>
            <span>Dobles: <strong>{sd || 0}</strong></span>
            <span>Total ₡: <strong>{Number.isFinite(total) ? total.toFixed(2) : '0.00'}</strong></span>
          </div>
        </div>

        {(empleadoFechaBloqueado || error) && (
          <div className="alert alert-danger" style={{ gridColumn: '1 / -1' }}>
            {empleadoFechaBloqueado ? 'Ese empleado ya tiene un registro en esa fecha' : error}
          </div>
        )}

        <div style={{ gridColumn: '1 / -1' }}>
          <button
            type="submit"
            className="btn-submit"
            style={{ width: '100%' }}
            disabled={sending || empleadoFechaBloqueado}
          >
            {sending ? 'Agregando…' : 'Agregar registro'}
          </button>
        </div>
      </form>
    </div>
  )
}
