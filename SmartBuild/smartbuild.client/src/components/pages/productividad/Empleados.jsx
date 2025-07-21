// src/components/pages/planilla/Planillas.jsx
import React, { useState, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import './Empleados.css'

const API_BASE = 'https://smartbuild-001-site1.ktempurl.com'

export default function Empleados() {
  const [empleados, setEmpleados] = useState([])
  const [results, setResults] = useState([])
  const [projectFilter, setProjectFilter] = useState('')
  const [periodFilter, setPeriodFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const usuarioStr = localStorage.getItem('currentUser')
    if (!usuarioStr) {
      setError('Usuario no autenticado')
      setLoading(false)
      return
    }
    const user = JSON.parse(usuarioStr)
    const correo = encodeURIComponent(user.correo || user.usuario)

    fetch(`${API_BASE}/EmpleadoApi/GetEmpleado?usuario=${correo}`)
      .then(res => {
        if (!res.ok) throw new Error(`Status ${res.status}`)
        return res.json()
      })
      .then(data => {
        setEmpleados(data)
        setResults(data)
      })
      .catch(err => {
        console.error(err)
        setError('No se pudieron cargar los empleados.')
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    let filtered = empleados
    if (projectFilter) {
      filtered = filtered.filter(e => e.puesto === projectFilter)
    }
    if (periodFilter) {
      filtered = filtered.filter(e => `${e.nombre} ${e.apellido}` === periodFilter)
    }
    setResults(filtered)
  }, [projectFilter, periodFilter, empleados])

  const proyectosUnicos = Array.from(new Set(empleados.map(p => p.puesto)))
  const periodosUnicos = Array.from(new Set(empleados.map(p => `${p.nombre} ${p.apellido}`)))

  if (loading) return <p>Cargando empleados…</p>
  if (error) return <p className="planilla-error">{error}</p>

  return (
    <div className="planilla-page">
      <div className="planilla-controls">
        <div className="planilla-filters">
          <div className="filter-group">
            <label htmlFor="filterProyecto">Rol</label>
            <select
              id="filterProyecto"
              value={projectFilter}
              onChange={e => setProjectFilter(e.target.value)}
            >
              <option value="">Todos los roles</option>
              {proyectosUnicos.map(pr => (
                <option key={pr} value={pr}>{pr}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="filterPeriodo">Nombre</label>
            <select
              id="filterPeriodo"
              value={periodFilter}
              onChange={e => setPeriodFilter(e.target.value)}
            >
              <option value="">Todos los nombres</option>
              {periodosUnicos.map(pr => (
                <option key={pr} value={pr}>{pr}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="planilla-new">
          <Link to="/dashboard/productividad/empleados/nuevo" className="btn-nueva">
            + Nuevo empleado
          </Link>
        </div>
      </div>

      <div className="planilla-list">
        {results.length === 0 ? (
          <p className="no-results">No hay empleados para mostrar</p>
        ) : results.map(emp => (
          <NavLink
            key={emp.idEmpleado}
            to={`${emp.idEmpleado}`}
            className="planilla-card"
          >
            <div className="card-header">
              <h3 className="card-nombre">{emp.nombre} {emp.apellido}</h3>
              <span className="card-proyecto">{emp.puesto}</span>
            </div>
            <div className="card-body">
              <div className="card-row">
                <strong>Correo:</strong> {emp.correo}
              </div>
              <div className="card-row">
                <strong>Identificación:</strong> {emp.identificacion}
              </div>
              <div className="card-row">
                <strong>Salario por hora:</strong> ₡{parseFloat(emp.salarioHora || 0).toLocaleString('es-CR', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </NavLink>
        ))}
      </div>
    </div>
  )
}
