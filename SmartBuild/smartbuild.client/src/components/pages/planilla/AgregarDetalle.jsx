// src/components/pages/planilla/AgregarDetalle.jsx

import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import Select from 'react-select'

const API_BASE = 'https://smartbuild-001-site1.ktempurl.com'

export default function AgregarDetalle() {
  const { idPlanilla } = useParams()
  const navigate = useNavigate()

  const [error, setError] = useState('')
  const [projectsOpts, setProjectsOpts] = useState([])
  const [employeesOpts, setEmployeesOpts] = useState([])
  const [form, setForm] = useState({
    proyecto: null,
    empleado: null,
    fecha: '',
    salarioHora: '',
    horasOrdinarias: '',
    horasExtras: '',
    horasDobles: ''
  })

  useEffect(() => {
    const usr = JSON.parse(localStorage.getItem('currentUser') || '{}')
    const correo = encodeURIComponent(usr.correo || usr.usuario)

    fetch(`${API_BASE}/PresupuestoApi/GetPresupuestos?usuario=${correo}`)
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(data => setProjectsOpts(data.map(p => ({ value: p.idPresupuesto, label: p.descripcion }))))
      .catch(err => console.error('Error presupuestos:', err))

    fetch(`${API_BASE}/EmpleadoApi/GetEmpleado?usuario=${correo}`)
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(data => setEmployeesOpts(data.map(emp => ({ value: emp.idEmpleado, label: emp.nombreEmpleado || `${emp.nombre} ${emp.apellido}`.trim() }))))
      .catch(err => console.error('Error empleados:', err))
  }, [])

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  const handleSelectChange = (name, val) => setForm(f => ({ ...f, [name]: val }))

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.proyecto || !form.empleado || !form.fecha) {
      setError('Proyecto, empleado y fecha son obligatorios')
      return
    }

    const usr = JSON.parse(localStorage.getItem('currentUser') || '{}')
    const usuario = usr.correo || usr.usuario
    const ts = new Date().toISOString()

    const payload = {
      usuario,
      quienIngreso: usuario,
      cuandoIngreso: ts,
      quienModifico: usuario,
      cuandoModifico: ts,
      planillaID: parseInt(idPlanilla),
      empleadoID: form.empleado.value,
      presupuestoID: form.proyecto.value,
      fecha: new Date(form.fecha).toISOString(),
      salarioHora: Number(form.salarioHora) || 0,
      horasOrdinarias: Number(form.horasOrdinarias) || 0,
      horasExtras: Number(form.horasExtras) || 0,
      horasDobles: Number(form.horasDobles) || 0,
      detalle: 'Agregado desde formulario'
    }

    try {
      const res = await fetch(`${API_BASE}/PlanillaDetalleApi/InsertPlanillaDetalle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'text/plain' },
        body: JSON.stringify(payload)
      })

      const result = await res.text()
      if (!res.ok) throw new Error(result)

      navigate(`/dashboard/planilla/${idPlanilla}`)
    } catch (err) {
      console.error('Error al agregar detalle:', err)
      setError(err.message)
    }
  }

  return (
    <div className="form-dashboard-page">
      <header className="form-dashboard-header">
        <button className="back-btn" onClick={() => navigate(-1)} title="Regresar">
          <ChevronLeft size={20} />
        </button>
        <h1>Nuevo Registro de Planilla</h1>
      </header>

      <form className="form-dashboard" onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label>Proyecto</label>
          <Select
            options={projectsOpts}
            value={form.proyecto}
            onChange={val => handleSelectChange('proyecto', val)}
            placeholder="Seleccionar proyecto…"
          />
        </div>
        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label>Empleado</label>
          <Select
            options={employeesOpts}
            value={form.empleado}
            onChange={val => handleSelectChange('empleado', val)}
            placeholder="Seleccionar empleado…"
          />
        </div>
        <div className="form-group">
          <label>Fecha</label>
          <input type="date" name="fecha" value={form.fecha} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Salario por hora</label>
          <input type="number" name="salarioHora" value={form.salarioHora} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Horas ordinarias</label>
          <input type="number" name="horasOrdinarias" value={form.horasOrdinarias} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Horas extras</label>
          <input type="number" name="horasExtras" value={form.horasExtras} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Horas dobles</label>
          <input type="number" name="horasDobles" value={form.horasDobles} onChange={handleChange} />
        </div>

        {error && <div className="alert alert-danger" style={{ gridColumn: '1 / -1' }}>{error}</div>}

        <div style={{ gridColumn: '1 / -1' }}>
          <button type="submit" className="btn-submit" style={{ width: '100%' }}>
            Agregar registro
          </button>
        </div>
      </form>
    </div>
  )
}
