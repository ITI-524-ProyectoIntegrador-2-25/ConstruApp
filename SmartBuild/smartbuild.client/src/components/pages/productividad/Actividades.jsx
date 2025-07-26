import React, { useState, useEffect, useMemo } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { Calendar, Filter, ChevronLeft } from 'lucide-react'
import Select from 'react-select'
import '../../../styles/Dashboard.css'
import './Actividades.css'

const API_BASE = 'https://smartbuild-001-site1.ktempurl.com'

export default function Actividades() {
  const navigate = useNavigate()
  const [actividades, setActividades] = useState([])
  const [presupuestosOpts, setPresupuestosOpts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Estado unificado para filtros
  const [filtros, setFiltros] = useState({
    presupuesto: null,
    fecha: ''
  })

  useEffect(() => {
    const usrStr = localStorage.getItem('currentUser')
    if (!usrStr) {
      setError('Usuario no autenticado')
      setLoading(false)
      return
    }
    const user = JSON.parse(usrStr)
    const correo = encodeURIComponent(user.correo || user.usuario)

    // Carga paralela de actividades y presupuestos
    Promise.all([
      fetch(`${API_BASE}/ActividadApi/GetActividades?usuario=${correo}`),
      fetch(`${API_BASE}/PresupuestoApi/GetPresupuestos?usuario=${correo}`)
    ])
      .then(async ([actRes, presRes]) => {
        if (!actRes.ok) throw new Error(`Actividades status ${actRes.status}`)
        if (!presRes.ok) throw new Error(`Presupuestos status ${presRes.status}`)
        const acts = await actRes.json()
        const pres = await presRes.json()
        setActividades(acts)
        setPresupuestosOpts(
          pres.map(p => ({ value: p.idPresupuesto, label: p.descripcion }))
        )
      })
      .catch(err => {
        console.error(err)
        setError('Error cargando datos.')
      })
      .finally(() => setLoading(false))
  }, [])

  // Handler unificado para filtros
  const handleFilterChange = field => value => {
    setFiltros(current => ({
      ...current,
      [field]: value
    }))
  }

  // Filtrado en tiempo real con useMemo
  const results = useMemo(() => {
    let arr = actividades
    if (filtros.presupuesto) {
      arr = arr.filter(a => a.presupuestoID === filtros.presupuesto.value)
    }
    if (filtros.fecha) {
      arr = arr.filter(a =>
        new Date(a.fechaInicioReal).toISOString().slice(0, 10) === filtros.fecha
      )
    }
    return arr
  }, [actividades, filtros.presupuesto, filtros.fecha])

  // Limpiar filtros
  const clearFilters = () => {
    setFiltros({ presupuesto: null, fecha: '' })
  }

  if (loading) return <p>Cargando…</p>
  if (error)   return <p className="dashboard-error">{error}</p>

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div className="title-group">
          <button
            className="back-btn"
            onClick={() => navigate(-1)}
            title="Volver"
          >
            <ChevronLeft size={20} />
          </button>
          <h1 className="dashboard-title">Actividades</h1>
        </div>
      </header>

      <div className="dashboard-filters">
        <div className="filter-group">
          <Select
            options={presupuestosOpts}
            value={filtros.presupuesto}
            onChange={handleFilterChange('presupuesto')}
            isClearable
            placeholder="Filtrar por proyecto…"
            className="react-select-container"
            classNamePrefix="react-select"
            styles={{
              control: base => ({ ...base, border: 'none', boxShadow: 'none' })
            }}
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
            className="btn btn-outline-primary btn-sm"
            onClick={clearFilters}
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
          results.map(a => {
            const start = new Date(a.fechaInicioReal)

            return (
              <NavLink
                key={a.idActividad}
                to={`${a.idActividad}`}
                className="project-card"
              >
                <div className="card-image">
                  <img
                    src={require('../../../assets/img/dashboard.png')}
                    alt={a.descripcion}
                  />
                </div>
                <div className="card-info">
                  <h3>{a.descripcion}</h3>
                  <p>
                    <Calendar size={14} /> {start.toLocaleDateString()}
                  </p>
                </div>

              </NavLink>
            )
          })
        ) : (
          <p className="no-results">
            {filtros.presupuesto || filtros.fecha
              ? 'No se encontraron actividades con los filtros aplicados'
              : 'No se encontraron actividades'
            }
          </p>
        )}
      </div>

      {actividades.length > 0 && (
        <div className="results-footer">
          Mostrando {results.length} de {actividades.length} actividad{actividades.length !== 1 ? 'es' : ''}
        </div>
      )}
    </div>
  )
}
