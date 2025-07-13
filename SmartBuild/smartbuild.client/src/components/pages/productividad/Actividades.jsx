// src/components/pages/productividad/Actividades.jsx
import React, { useState } from 'react'
import { Link, useNavigate} from 'react-router-dom'
import { Calendar, ChevronLeft } from 'lucide-react'
import './Actividades.css'

const FAKE_ACTIVIDADES = [
  { id:'1', proyecto:'Proyecto 1', empleado:'María Gómez', fecha:'2025-07-12', entrada:'09:00', salida:'12:30' },
  { id:'2', proyecto:'Proyecto 2', empleado:'Juan Pérez',   fecha:'2025-07-13', entrada:'10:15', salida:'18:00' }
]

export default function Actividades() {
  const navigate = useNavigate()
  const [projectFilter, setProjectFilter] = useState('')
  const [dateFilter,    setDateFilter]    = useState('')

  const proyectosUnicos = Array.from(new Set(FAKE_ACTIVIDADES.map(a => a.proyecto)))
  const results = FAKE_ACTIVIDADES.filter(a => {
    if (projectFilter && a.proyecto !== projectFilter) return false
    if (dateFilter    && a.fecha    !== dateFilter)    return false
    return true
  })

  return (
    <div className="actividades-page">
      <header className="actividades-header">
        <button
          className="back-btn"
          onClick={() => navigate(-1)}
          title="Regresar"
        >
          <ChevronLeft size={20} />
        </button>
        <h2 className="actividades-title">Actividades</h2>
      </header>

      <div className="actividades-filters">
        <div className="filter-group">
          <label htmlFor="filterProyecto">Proyecto</label>
          <select
            id="filterProyecto"
            value={projectFilter}
            onChange={e => setProjectFilter(e.target.value)}
          >
            <option value="">Todos los proyectos</option>
            {proyectosUnicos.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="filterFecha">Fecha</label>
          <input
            id="filterFecha"
            type="date"
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
          />
        </div>
      </div>

      <div className="actividades-new">
        <Link to="nueva" className="btn-nueva">+ Nueva actividad</Link>
      </div>

      <div className="actividades-list">
        {results.length === 0 && (
          <p className="no-results">No hay actividades que mostrar</p>
        )}
        {results.map(a => {
          const [h1, m1] = a.entrada.split(':').map(Number)
          const [h2, m2] = a.salida.split(':').map(Number)
          const start = new Date(); start.setHours(h1, m1)
          const end   = new Date(); end.setHours(h2, m2)
          const dur   = ((end - start)/1000/3600).toFixed(2)

          return (
            <Link key={a.id} to={`${a.id}`} className="actividad-card">
              <div className="card-header">
                <h3 className="card-proyecto">{a.proyecto}</h3>
                <span className="card-empleado">{a.empleado}</span>
              </div>
              <div className="card-body">
                <div className="card-row">
                  <Calendar size={14} className="icon"/>
                  <span>{a.fecha}</span>
                </div>
                <ClockEntryExit entrada={a.entrada} salida={a.salida} duracion={dur} />
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

function ClockEntryExit({ entrada, salida, duracion }) {
  return (
    <div className="times">
      <div className="time-row"><strong>Entrada:</strong> {entrada}</div>
      <div className="time-row"><strong>Salida:</strong> {salida}</div>
      <div className="time-row"><strong>Duración:</strong> {duracion} hs</div>
    </div>
  )
}
