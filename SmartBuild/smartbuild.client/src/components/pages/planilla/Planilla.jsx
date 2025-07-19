// src/components/pages/planilla/Planillas.jsx
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Calendar } from 'lucide-react'
import './Planilla.css'

const FAKE_PLANILLAS = [
  {
    id: '1',
    nombre: 'Planilla Julio 2025',
    proyecto: 'Proyecto 1',
    fechaInicio: '2025-07-01',
    fechaFin:    '2025-07-31',
    empleados: 5,
    horasOrdinarias: 160,
    horasExtras:     20
  },
  {
    id: '2',
    nombre: 'Planilla Junio 2025',
    proyecto: 'Proyecto 2',
    fechaInicio: '2025-06-01',
    fechaFin:    '2025-06-30',
    empleados: 3,
    horasOrdinarias: 150,
    horasExtras:     10
  }
]

export default function Planillas() {
  const navigate = useNavigate()
  const [projectFilter, setProjectFilter] = useState('')
  const [periodFilter, setPeriodFilter]   = useState('')

  const proyectosUnicos = Array.from(new Set(FAKE_PLANILLAS.map(p => p.proyecto)))
  const periodosUnicos  = Array.from(new Set(FAKE_PLANILLAS.map(p => p.nombre)))

  const results = FAKE_PLANILLAS.filter(p => {
    if (projectFilter && p.proyecto !== projectFilter) return false
    if (periodFilter  && p.nombre   !== periodFilter)   return false
    return true
  })

  return (
   <div className="planilla-page">
    <div className="planilla-controls">
      <div className="planilla-filters">
        <div className="filter-group">
          <label htmlFor="filterProyecto">Proyecto</label>
          <select
            id="filterProyecto"
            value={projectFilter}
            onChange={e => setProjectFilter(e.target.value)}
          >
            <option value="">Todos los proyectos</option>
            {proyectosUnicos.map(pr => (
              <option key={pr} value={pr}>{pr}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="filterPeriodo">Periodo</label>
          <select
            id="filterPeriodo"
            value={periodFilter}
            onChange={e => setPeriodFilter(e.target.value)}
          >
            <option value="">Todos los periodos</option>
            {periodosUnicos.map(pr => (
              <option key={pr} value={pr}>{pr}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="planilla-new">
        <Link to="nueva" className="btn-nueva">+ Nueva planilla</Link>
      </div>
    </div>

      {/* Listado de planillas */}
      <div className="planilla-list">
        {results.length === 0 ? (
          <p className="no-results">No hay planillas para mostrar</p>
        ) : results.map(p => (
          <Link
            key={p.id}
            to={`${p.id}`}
            className="planilla-card"
          >
            <div className="card-header">
              <h3 className="card-nombre">{p.nombre}</h3>
              <span className="card-proyecto">{p.proyecto}</span>
            </div>
            <div className="card-body">
              <div className="card-row">
                <Calendar size={14} className="icon" />
                <span>{p.fechaInicio} – {p.fechaFin}</span>
              </div>
              <div className="card-row">
                <strong>Empleados:</strong> {p.empleados}
              </div>
              <div className="card-row">
                <strong>Horas ordinarias:</strong> {p.horasOrdinarias}
              </div>
              <div className="card-row">
                <strong>Horas extras:</strong> {p.horasExtras}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
