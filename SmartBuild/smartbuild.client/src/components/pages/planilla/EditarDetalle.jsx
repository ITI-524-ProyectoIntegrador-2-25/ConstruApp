// src/components/pages/planilla/EditarDetalle.jsx
import React, { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, Edit, Calendar, Clock } from 'lucide-react'
import './css/Planilla.css'

// Hooks
import {
  usePlanilla,
  usePlanillaDetalles,
  useActualizarPlanillaDetalle
} from '../../../hooks/Planilla'
import { useEmpleados } from '../../../hooks/Empleados'

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

  // Data hooks
  const { PlanillaDetalle: planillaCab, loading: loadingPlanilla, error: errorPlanilla } =
    usePlanilla(idPlanilla)
  const { Detalles, loading: loadingDetalles, error: errorDetalles } =
    usePlanillaDetalles(idPlanilla)
  const { Empleados, loading: loadingEmpleados, error: errorEmpleados } = useEmpleados()

  // Detalle que se edita
  const detalle = useMemo(() => {
    const list = Array.isArray(Detalles) ? Detalles : []
    const idNum = Number(idDetallePlanilla)
    return (
      list.find(
        d =>
          Number(d.idDetallePlanilla ?? d.IdDetallePlanilla ?? d.idPlanillaDetalle) === idNum
      ) || null
    )
  }, [Detalles, idDetallePlanilla])

  // Rango de la planilla
  const rangoPlanilla = useMemo(() => {
    if (!planillaCab) return { ini: '', fin: '' }
    return {
      ini: dateOnly(planillaCab.fechaInicio || planillaCab.FechaInicio),
      fin: dateOnly(planillaCab.fechaFin || planillaCab.FechaFin)
    }
  }, [planillaCab])

  // Salario del empleado (si existe)
  const empleadoSalario = useMemo(() => {
    if (!detalle) return null
    const emp = (Array.isArray(Empleados) ? Empleados : []).find(
      e => e.idEmpleado === (detalle.empleadoID ?? detalle.EmpleadoID)
    )
    return emp?.salarioHora != null ? Number(emp.salarioHora) : null
  }, [Empleados, detalle])

  // Form state
  const [form, setForm] = useState({
    fecha: '',
    salarioHora: '',
    horasOrdinarias: '',
    horasExtras: '',
    horasDobles: ''
  })
  const [error, setError] = useState('')

  // Inicializar form con el detalle
  useEffect(() => {
    if (!detalle) return
    setForm({
      fecha: detalle.fecha ? String(detalle.fecha).slice(0, 10) : '',
      salarioHora: detalle.salarioHora ?? '',
      horasOrdinarias: detalle.horasOrdinarias ?? '',
      horasExtras: detalle.horasExtras ?? '',
      horasDobles: detalle.horasDobles ?? ''
    })
  }, [detalle])

  // Si hay salario del empleado, úsalo (bloquea input)
  useEffect(() => {
    if (empleadoSalario != null) {
      setForm(prev => ({ ...prev, salarioHora: empleadoSalario }))
    }
  }, [empleadoSalario])

  const { actualizarPlanillaDetalle, loading: sendingApi, error: saveError } =
    useActualizarPlanillaDetalle()

  const getUsuario = () => {
    try {
      const u = JSON.parse(localStorage.getItem('currentUser') || '{}')
      return u.correo || u.usuario || ''
    } catch {
      return ''
    }
  }

  const handleChange = e => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    setError('')
  }

  // Validación: no permitir duplicado empleado+fecha en la misma planilla
  const empleadoFechaDuplicado = useMemo(() => {
    if (!detalle || !form.fecha) return false

    const myId = Number(
      detalle.idDetallePlanilla ?? detalle.IdDetallePlanilla ?? detalle.idPlanillaDetalle
    )
    const empId = Number(detalle.empleadoID ?? detalle.EmpleadoID)
    const fechaNueva = dateOnly(form.fecha)

    const list = Array.isArray(Detalles) ? Detalles : []
    return list.some(d => {
      const did = Number(d.idDetallePlanilla ?? d.IdDetallePlanilla ?? d.idPlanillaDetalle)
      const demp = Number(d.empleadoID ?? d.EmpleadoID)
      const dfecha = dateOnly(d.fecha ?? d.Fecha)
      return did !== myId && demp === empId && dfecha === fechaNueva
    })
  }, [Detalles, detalle, form.fecha])

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')

    const usuario = getUsuario()
    if (!usuario) {
      setError('Usuario no autenticado')
      return
    }

    if (empleadoFechaDuplicado) {
      setError('Ese empleado ya tiene un registro en esa fecha')
      return
    }

    const so = Number(form.horasOrdinarias || 0)
    const se = Number(form.horasExtras || 0)
    const sd = Number(form.horasDobles || 0)
    const sh = Number(empleadoSalario != null ? empleadoSalario : form.salarioHora || 0)

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
      planillaID: detalle?.planillaID ?? Number(idPlanilla) ?? null,
      empleadoID: detalle?.empleadoID ?? null,
      presupuestoID: detalle?.presupuestoID ?? null,

      fecha: form.fecha ? new Date(form.fecha).toISOString() : null,
      salarioHora: Number(sh.toFixed(2)),
      horasOrdinarias: so,
      horasExtras: se,
      horasDobles: sd,
      detalle: detalle?.detalle ?? ''
    }

    const ok = await actualizarPlanillaDetalle(payload)
    if (ok) {
      idPlanilla ? navigate(`/dashboard/planilla/${idPlanilla}`) : navigate(-1)
    } else {
      setError(saveError || 'Error al actualizar')
    }
  }

  const cargando = loadingPlanilla || loadingDetalles || loadingEmpleados
  const errorGlobal = error || errorPlanilla || errorDetalles || errorEmpleados

  if (cargando) return <p>Cargando...</p>
  if (!detalle) return <p className="detalle-error">Detalle no encontrado</p>

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
            <p className="page-subtitle">
              Actualiza las horas del registro dentro del rango de la planilla
            </p>
          </div>
        </div>
      </div>

      {/* PANEL / FORM */}
      <div className="filters-panel">
        <div className="filters-content">
          {(errorGlobal || empleadoFechaDuplicado) && (
            <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>
              {empleadoFechaDuplicado
                ? 'Ese empleado ya tiene un registro en esa fecha'
                : String(errorGlobal)}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="form-dashboard"
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}
          >
            <div className="form-group">
              <label className="field-label d-flex align-items-center gap-2">
                <Calendar size={16} />
                Fecha{' '}
                {rangoPlanilla.ini && rangoPlanilla.fin
                  ? `(${rangoPlanilla.ini} → ${rangoPlanilla.fin})`
                  : ''}
              </label>
              <input
                type="date"
                name="fecha"
                value={form.fecha}
                onChange={handleChange}
                disabled={sendingApi}
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
                disabled={sendingApi || empleadoSalario != null}
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
                disabled={sendingApi}
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
                disabled={sendingApi}
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
                disabled={sendingApi}
                min="0"
                step="0.5"
                className="modern-input"
              />
            </div>

            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '.75rem' }}>
              <button
                type="button"
                className="btn-secondary-modern"
                onClick={() =>
                  idPlanilla ? navigate(`/dashboard/planilla/${idPlanilla}`) : navigate(-1)
                }
                disabled={sendingApi}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-primary-modern"
                disabled={sendingApi || empleadoFechaDuplicado}
              >
                {sendingApi ? 'Guardando…' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Tarjetas de apoyo visual */}
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon">
            <Calendar size={18} />
          </div>
          <div className="stat-content">
            <span className="stat-number">
              {rangoPlanilla.ini ? `${rangoPlanilla.ini} → ${rangoPlanilla.fin}` : '—'}
            </span>
            <span className="stat-label">Rango planilla</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <Clock size={18} />
          </div>
          <div className="stat-content">
            <span className="stat-number">
              {Number(form.horasOrdinarias || 0) +
                Number(form.horasExtras || 0) +
                Number(form.horasDobles || 0) || 0}
            </span>
            <span className="stat-label">Horas totales</span>
          </div>
        </div>
      </div>
    </div>
  )
}
