import React, { useState, useMemo } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { Calendar, Filter, ChevronLeft } from 'lucide-react'
import Select from 'react-select'
import { useActividades } from '../../../hooks/Actividades'
import '../../../styles/Dashboard.css'
import './Actividades.css'

export default function Actividades() {
  const navigate = useNavigate()
  const { Actividades, loadingActividades, errorActividades } = useActividades()

  const [filtros, setFiltros] = useState({ presupuesto: null, fecha: '' })

  const handleFilterChange = field => value => {
    setFiltros(f => ({ ...f, [field]: value }))
  }

  const results = useMemo(() => {
    let arr = Actividades
    if (filtros.presupuesto) {
      arr = arr.filter(a => a.descripcion === filtros.presupuesto.value)
    }
    if (filtros.fecha) {
      arr = arr.filter(a =>
        new Date(a.fechaInicioReal).toISOString().slice(0, 10) === filtros.fecha
      )
    }
    return arr
  }, [Actividades, filtros.presupuesto, filtros.fecha])

  const clearFilters = () => {
    setFiltros({ presupuesto: null, fecha: '' })
  }

  if (loadingActividades) return <p>Cargando…</p>
  if (errorActividades) return <p className="dashboard-error">{errorActividades}</p>

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div className="title-group">
          <button onClick={() => navigate(-1)} className="back-btn" title="Volver">
            <ChevronLeft size={20} />
          </button>
          <h1 className="dashboard-title">Actividades</h1>
        </div>
      </header>

      <div className="dashboard-filters">
        <div className="filter-group">
          <Select
            options={Actividades.map(a => ({
              value: a.descripcion,
              label: a.descripcion 
            }))}
            value={filtros.presupuesto}
            onChange={handleFilterChange('presupuesto')}
            isClearable
            placeholder="Filtrar por proyecto…"
            className="react-select-container"
            classNamePrefix="react-select"
            styles={{ control: base => ({ ...base, border: 'none', boxShadow: 'none' }) }}
          />
        </div>

        <div className="filter-group">
          <Calendar className="filter-icon" />
          <input
            type="date"
            value={filtros.fecha}
            onChange={e => handleFilterChange('fecha')(e.target.value)}
          />
        </div>

        {(filtros.presupuesto || filtros.fecha) && (
          <button
            onClick={clearFilters}
            className="btn btn-outline-primary btn-sm"
            title="Limpiar filtros"
          >
            Limpiar
          </button>
        )}

        <button className="btn-icon" title="Filtros avanzados">
          <Filter />
        </button>

        <Link to="nueva" className="btn-add">
          + Nueva actividad
        </Link>
      </div>

      <div className="projects-grid">
        {results.length > 0 ? (
          results.map(a => (
            <NavLink key={a.idActividad} to={`${a.idActividad}`} className="project-card">
              <div className="card-image">
                <img
                  src={require('../../../assets/img/dashboard.png')}
                  alt={a.descripcion}
                />
              </div>
              <div className="card-info">
                <h3>{a.descripcion}</h3>
                <p>
                  <Calendar size={14} />{' '}
                  {new Date(a.fechaInicioReal).toLocaleDateString()}
                </p>
              </div>
            </NavLink>
          ))
        ) : (
          <p className="no-results">
            {filtros.presupuesto || filtros.fecha
              ? 'No hay actividades con esos filtros'
              : 'No se encontraron actividades'}
          </p>
        )}
      </div>

      {Actividades.length > 0 && (
        <div className="results-footer">
          Mostrando {results.length} de {Actividades.length}{' '}
          actividad{Actividades.length !== 1 ? 'es' : ''}
        </div>
      )}
    </div>
  )
}
