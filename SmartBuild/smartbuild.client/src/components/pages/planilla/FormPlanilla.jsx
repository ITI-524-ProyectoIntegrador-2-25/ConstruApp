// File: src/components/pages/planilla/FormPlanilla.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import Select from 'react-select'
import '../../../styles/Dashboard.css'
import './FormPlanilla.css'

const API_BASE = 'https://smartbuild-001-site1.ktempurl.com'

/**
 * FormPlanilla.jsx
 * Flujo Wizard de dos pasos:
 *  1. Crear planilla padre
 *  2. Seleccionar proyecto y agregar detalles
 */
export default function FormPlanilla() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [planillaId, setPlanillaId] = useState(null)
  const [error, setError] = useState('')

  // Opciones para selects
  const [projectsOpts, setProjectsOpts] = useState([])
  const [employeesOpts, setEmployeesOpts] = useState([])

  // Paso 1: planilla padre
  const [form, setForm] = useState({ nombre: '', fechaInicio: '', fechaFin: '', estado: '' })

  // Paso 2: detalles
  const [selectedProject, setSelectedProject] = useState(null)
  const [detailForm, setDetailForm] = useState({ empleado: null, fecha: '', salarioHora: '', horasOrdinarias: '', horasExtras: '', horasDobles: '' })
  const [details, setDetails] = useState([])

  // Carga de proyectos y empleados
  useEffect(() => {
    const usr = JSON.parse(localStorage.getItem('currentUser') || '{}')
    const correo = encodeURIComponent(usr.correo || usr.usuario)

    fetch(`${API_BASE}/PresupuestoApi/GetPresupuestos?usuario=${correo}`)
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(data => setProjectsOpts(data.map(p => ({ value: p.idPresupuesto, label: p.descripcion }))))
      .catch(err => console.error('Error presupuestos:', err))

    fetch(`${API_BASE}/EmpleadoApi/GetEmpleado?usuario=${correo}`)
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(data => setEmployeesOpts(
        data.map(emp => ({ value: emp.idEmpleado, label: emp.nombreEmpleado || `${emp.nombre} ${emp.apellido}`.trim() }))
      ))
      .catch(err => console.error('Error empleados:', err))
  }, [])

  // Handler paso 1
  const handlePlanillaChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setError('')
  }

  // Crear planilla
  const createPlanilla = async () => {
    console.log('createPlanilla: form=', form)
    if (!form.nombre || !form.fechaInicio || !form.fechaFin) {
      setError('Nombre y fechas son obligatorios')
      return
    }
    try {
      const usr = JSON.parse(localStorage.getItem('currentUser') || '{}')
      const usuario = usr.correo || usr.usuario
      const ts = new Date().toISOString()
      const payload = {
        usuario,
        quienIngreso: usuario,
        cuandoIngreso: ts,
        quienModifico: usuario,
        cuandoModifico: ts,
        idPlanilla: 0,
        nombre: form.nombre,
        fechaInicio: new Date(form.fechaInicio).toISOString(),
        fechaFin: new Date(form.fechaFin).toISOString(),
        estado: form.estado
      }
      console.log('createPlanilla: payload=', payload)

      const res = await fetch(
        `${API_BASE}/PlanillaApi/InsertPlanilla`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'text/plain' },
          body: JSON.stringify(payload)
        }
      )
      const text = await res.text()
      console.log('createPlanilla: status=', res.status, 'text=', text)
      if (!res.ok) throw new Error(text)

      const parsed = JSON.parse(text)
      const record = Array.isArray(parsed) ? parsed[0] : parsed
      if (!record?.id) throw new Error('ID no encontrado')
      setPlanillaId(record.id)
      console.log('createPlanilla: idPlanilla=', record.id)
      setStep(2)
    } catch (err) {
      console.error('createPlanilla error:', err)
      setError(err.message)
    }
  }

  // Handler paso 2
  const handleProjectSelect = val => { setSelectedProject(val); setError('') }
  const handleEmployeeSelect = val => { setDetailForm(d => ({ ...d, empleado: val })); setError('') }
  const handleDetailChange = e => { setDetailForm(d => ({ ...d, [e.target.name]: e.target.value })); setError('') }

  // Agregar detalle
  const addDetail = async () => {
    console.log('addDetail: detailForm=', detailForm, 'project=', selectedProject)
    if (!selectedProject || !detailForm.empleado || !detailForm.fecha) {
      setError('Proyecto, empleado y fecha obligatorios')
      return
    }
    try {
      const usr = JSON.parse(localStorage.getItem('currentUser') || '{}')
      const usuario = usr.correo || usr.usuario
      const ts = new Date().toISOString()
      const payload = {
        usuario,
        quienIngreso: usuario,
        cuandoIngreso: ts,
        quienModifico: usuario,
        cuandoModifico: ts,
        idPlanillaDetalle: 0,
        planillaID: planillaId,
        empleadoID: detailForm.empleado.value,
        presupuestoID: selectedProject.value,
        fecha: new Date(detailForm.fecha).toISOString(),
        salarioHora: Number(detailForm.salarioHora) || 0,
        horasOrdinarias: Number(detailForm.horasOrdinarias) || 0,
        horasExtras: Number(detailForm.horasExtras) || 0,
        horasDobles: Number(detailForm.horasDobles) || 0,
        detalle: 'Agregado desde formulario'
      }
      console.log('addDetail: payload=', payload)
      console.log('addDetail: enviando fetch a InsertPlanillaDetalle...')
      const resDet = await fetch(
        `${API_BASE}/PlanillaDetalleApi/InsertPlanillaDetalle`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'text/plain' },
          body: JSON.stringify(payload)
        }
      )
      console.log('addDetail: raw response=', resDet)
      const detText = await resDet.text()
      console.log('addDetail: response status=', resDet.status, 'body=', detText)
      if (!resDet.ok) throw new Error(detText)
      setDetails(d => [...d, payload])
      setDetailForm({ empleado: null, fecha: '', salarioHora: '', horasOrdinarias: '', horasExtras: '', horasDobles: '' })
    } catch (err) {
      console.error('addDetail error:', err)
      setError(err.message)
    }
  }

  return (
    <div className="form-dashboard-page">
      {step === 1 ? (
        <>
          <header className="form-dashboard-header">
            <button className="back-btn" onClick={() => navigate(-1)} title="Regresar">
              <ChevronLeft size={20} />
            </button>
            <h1>Nueva Planilla</h1>
          </header>
          <div className="form-dashboard">
            <div className="form-group">
              <label>Nombre</label>
              <input name="nombre" value={form.nombre} onChange={handlePlanillaChange} />
            </div>
            <div className="form-group">
              <label>Fecha inicio</label>
              <input name="fechaInicio" type="date" value={form.fechaInicio} onChange={handlePlanillaChange} />
            </div>
            <div className="form-group">
              <label>Fecha fin</label>
              <input name="fechaFin" type="date" value={form.fechaFin} onChange={handlePlanillaChange} />
            </div>
            <div className="form-group">
              <label>Estado</label>
              <select name="estado" value={form.estado} onChange={handlePlanillaChange}>
                <option value="">Seleccionar…</option>
                <option value="Abierta">Abierta</option>
                <option value="En progreso">En progreso</option>
                <option value="Cerrada">Cerrada</option>
              </select>
            </div>
            {error && <div className="alert alert-danger">{error}</div>}
            <button type="button" className="btn-submit" onClick={createPlanilla}>
              Siguiente →
            </button>
          </div>
        </>
      ) : (
        <>
          <header className="form-dashboard-header">
            <button className="back-btn" onClick={() => setStep(1)} title="Atrás">
              <ChevronLeft size={20} />
            </button>
            <h1>Agregar Detalles</h1>
          </header>
          <div className="form-dashboard">
            <div className="form-group">
              <label>Proyecto asociado</label>
              <Select options={projectsOpts} value={selectedProject} onChange={handleProjectSelect} placeholder="Seleccionar proyecto…" />
            </div>
            <div className="form-group">
              <label>Empleado</label>
              <Select options={employeesOpts} value={detailForm.empleado} onChange={handleEmployeeSelect} placeholder="Seleccionar empleado…" />
            </div>
            <div className="form-group">
              <label>Fecha</label>
              <input name="fecha" type="date" value={detailForm.fecha} onChange={handleDetailChange} />
            </div>
            <div className="form-group">
              <label>Salario Hora</label>
              <input name="salarioHora" type="number" value={detailForm.salarioHora} onChange={handleDetailChange} />
            </div>
            <div className="form-group">
              <label>Horas Ordinarias</label>
              <input name="horasOrdinarias" type="number" value={detailForm.horasOrdinarias} onChange={handleDetailChange} />
            </div>
            <div className="form-group">
              <label>Horas Extras</label>
              <input name="horasExtras" type="number" value={detailForm.horasExtras} onChange={handleDetailChange} />
            </div>
            <div className="form-group">
              <label>Horas Dobles</label>
              <input name="horasDobles" type="number" value={detailForm.horasDobles} onChange={handleDetailChange} />
            </div>
            {error && <div className="alert alert-danger">{error}</div>}
            <button type="button" className="btn-submit" onClick={addDetail}>
              Agregar Detalle
            </button>
            <button type="button" className="btn-submit" onClick={() => navigate(-1)} style={{ marginLeft: 8 }}>
              Finalizar
            </button>
          </div>
          <ul className="details-list">
            {details.map((d, i) => (
              <li key={i}>
                {d.empleado.label} — {new Date(d.fecha).toLocaleDateString()}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
