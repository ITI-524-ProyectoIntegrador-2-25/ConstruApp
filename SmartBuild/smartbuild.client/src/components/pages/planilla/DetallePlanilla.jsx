// src/components/pages/planilla/DetallePlanilla.jsx

import React, { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import './Planilla.css'
import Select from 'react-select'
import { getPlanilla, updatePlanilla } from '../../../api/Planilla'
import * as XLSX from 'xlsx'

const ESTADOS = ['Pendiente', 'En proceso', 'Cerrada']

const COLUMN_LABELS = {
  idDetallePlanilla: '#Código',
  fecha: 'Fecha',
  presupuestoNombre: 'Presupuesto',
  empleadoNombre: 'Empleado',
  salarioHora: 'Salario/Hora',
  horasOrdinarias: 'Horas Ordinarias',
  horasExtras: 'Horas Extras',
  horasDobles: 'Horas Dobles'
}

export default function DetallePlanilla() {
  const { idPlanilla } = useParams()
  const navigate = useNavigate()
  const [planilla, setPlanilla] = useState(null)
  const [detalles, setDetalles] = useState([])
  const [presupuestos, setPresupuestos] = useState([])
  const [empleados, setEmpleados] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState({

    nombre: '',
    fechaInicio: '',
    fechaFin: '',
    estado: ESTADOS[0]

  })

  const estadoOptions = useMemo(() => ESTADOS.map(e => ({ value: e, label: e })), [])

  useEffect(() => {
    if (!idPlanilla) {
      setError('No se proporcionó ID de planilla.')
      setLoading(false)
      return
    }

    async function fetchData() {
      setLoading(true)
      try {
        const usrStr = localStorage.getItem('currentUser')
        if (!usrStr) throw new Error('Usuario no autenticado')
        const user = JSON.parse(usrStr)
        const correo = user.correo || user.usuario

        const [todas, detallesRes, presRes, empRes] = await Promise.all([
          getPlanilla(correo),
          fetch(`https://smartbuild-001-site1.ktempurl.com/PlanillaDetalleApi/GetPlanillaDetalle?usuario=${correo}`),
          fetch(`https://smartbuild-001-site1.ktempurl.com/PresupuestoApi/GetPresupuestos?usuario=${correo}`),
          fetch(`https://smartbuild-001-site1.ktempurl.com/EmpleadoApi/GetEmpleado?usuario=${correo}`)
        ])

        if (!detallesRes.ok || !presRes.ok || !empRes.ok) throw new Error('Error cargando datos')

        const cab = todas.find(p => String(p.idPlanilla) === idPlanilla)
        if (!cab) throw new Error(`Planilla ${idPlanilla} no encontrada`)

        const allDetalles = await detallesRes.json()
        const presupuestosData = await presRes.json()
        const empleadosData = await empRes.json()

        setPresupuestos(presupuestosData)
        setEmpleados(empleadosData)
        setPlanilla(cab)

        const filtrados = allDetalles
  .filter(d => d.planillaID === parseInt(idPlanilla))
  .map(d => ({
    ...d,
    idDetallePlanilla: d.idDetallePlanilla, // Asegúrate de que este campo esté presente
    presupuestoNombre: presupuestosData.find(p => p.idPresupuesto === d.presupuestoID)?.descripcion || d.presupuestoID,
    empleadoNombre: empleadosData.find(e => e.idEmpleado === d.empleadoID)?.nombreEmpleado || `${empleadosData.find(e => e.idEmpleado === d.empleadoID)?.nombre} ${empleadosData.find(e => e.idEmpleado === d.empleadoID)?.apellido}` || d.empleadoID
  }))

        setDetalles(filtrados)
        setForm({
          nombre: cab.nombre || '',  
          fechaInicio: cab.fechaInicio?.slice(0, 10) || '',
          fechaFin: cab.fechaFin?.slice(0, 10) || '',
          estado: cab.estado || ESTADOS[0]
        })
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [idPlanilla])

  const handleChange = e => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const usrStr = localStorage.getItem('currentUser')
    if (!usrStr) return
    const user = JSON.parse(usrStr)
    const ahora = new Date().toISOString()

    const payload = {
      usuario: user.correo || user.usuario,
      quienIngreso: planilla.quienIngreso || '',
      cuandoIngreso: planilla.cuandoIngreso || '',
      quienModifico: user.correo || user.usuario,
      cuandoModifico: ahora,
      idPlanilla: planilla.idPlanilla,
      nombre: form.nombre,
      fechaInicio: form.fechaInicio,
      fechaFin: form.fechaFin,
      estado: form.estado
    }

    try {
      await updatePlanilla(payload)
      setIsEditing(false)
      setPlanilla(p => ({ ...p, ...form }))
    } catch (err) {
      console.error('Error al actualizar:', err)
      alert('Error al guardar cambios: ' + err.message)
    }
  }

  const handleCancel = () => {
    setForm({
      nombre: planilla.nombre,
      fechaInicio: planilla.fechaInicio?.slice(0, 10) || '',
      fechaFin: planilla.fechaFin?.slice(0, 10) || '',
      estado: planilla.estado
    })
    setIsEditing(false)
  }

  const exportarXLSX = () => {
    const resumen = detalles.map(d => ({
      '#Código': d.idDetallePlanilla,
      Fecha: new Date(d.fecha).toLocaleDateString(),
      Proyecto: d.presupuestoNombre,
      Empleado: d.empleadoNombre,
      'Salario/Hora': d.salarioHora,
      'Horas Ordinarias': d.horasOrdinarias,
      'Horas Extras': d.horasExtras,
      'Horas Dobles': d.horasDobles,
      'Total a Pagar': (
        d.salarioHora * d.horasOrdinarias +
        d.salarioHora * 1.5 * d.horasExtras +
        d.salarioHora * 2 * d.horasDobles
      ).toFixed(2)
    }))

    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(resumen)
    XLSX.utils.book_append_sheet(wb, ws, 'Planilla')
    XLSX.writeFile(wb, `planilla_${planilla?.idPlanilla || 'reporte'}.xlsx`)
  }

  if (loading) return <p className="detalle-loading">Cargando detalles…</p>
  if (error) return <p className="detalle-error">{error}</p>
  if (!planilla) return null

  return (
    <div className="form-dashboard-page" style={{ maxWidth: '900px' }}>
      <div className="form-dashboard-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ChevronLeft size={20} />
        </button>
        <h1>Planilla #{planilla.idPlanilla} - {planilla.nombre}</h1>
        {!isEditing && (
          <button className="btn-submit" style={{ marginLeft: 'auto' }} onClick={() => setIsEditing(true)}>
            Editar
          </button>
        )}
      </div>

      {isEditing ? (
        <form className="form-dashboard" onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
          <div className="form-group">
            <label>Nombre</label>
            <input name="nombre" type="text" value={form.nombre} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Fecha Inicio</label>
            <input name="fechaInicio" type="date" value={form.fechaInicio} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Fecha Fin</label>
            <input name="fechaFin" type="date" value={form.fechaFin} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Estado</label>
            <Select options={estadoOptions} value={{ value: form.estado, label: form.estado }} onChange={opt => setForm(f => ({ ...f, estado: opt.value }))} isSearchable={false} />
          </div>
          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="submit" className="btn-submit">Guardar cambios</button>
            <button type="button" className="btn-submit" style={{ background: '#ccc' }} onClick={handleCancel}>Cancelar</button>
          </div>
        </form>
      ) : (
        <div className="form-dashboard" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div className="form-group"><label>Nombre</label><p className="value">{planilla.nombre}</p></div>
          <div className="form-group"><label>Fecha Inicio</label><p className="value">{new Date(planilla.fechaInicio).toLocaleDateString()}</p></div>
          <div className="form-group"><label>Fecha Fin</label><p className="value">{new Date(planilla.fechaFin).toLocaleDateString()}</p></div>
          <div className="form-group"><label>Estado</label><p className="value">{planilla.estado}</p></div>
          <div className="form-group"><label>Registro</label><p className="value">{planilla.cuandoIngreso ? new Date(planilla.cuandoIngreso.replace(' ', 'T')).toLocaleDateString() : ''}</p></div>
        </div>
      )}

      <div className="detalle-items table-responsive">
        <h3>Detalle de la planilla</h3>
        <table className="detalle-table">
          <thead>
            <tr>
              {Object.keys(COLUMN_LABELS).map(key => (
                <th key={key}>{COLUMN_LABELS[key]}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {detalles.map((item, i) => (
              <tr key={i} onClick={() => navigate(`/dashboard/planilla/${idPlanilla}/EditarDetalle`)}>
                {Object.keys(COLUMN_LABELS).map((key, j) => {
                  let val = item[key];
                  if (key === 'fecha' && val) val = new Date(val).toLocaleDateString();
                  return <td key={j}>{val}</td>
                  })}
                  </tr>
                ))}
                </tbody>
        </table>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
          <button onClick={() => navigate(`/dashboard/planilla/${idPlanilla}/AgregarDetalle`)} className="btn-submit">
            Agregar registro
          </button>

          <button onClick={exportarXLSX} className="btn-submit">Exportar planilla</button>
        </div>
      </div>
    </div>
  )
}
