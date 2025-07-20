import React, { useState, useEffect } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { Calendar, Filter, ChevronLeft } from 'lucide-react'
import '../../../styles/Dashboard.css'
import './Planilla.css'

const API_BASE = 'https://smartbuild-001-site1.ktempurl.com'

export default function Planillas() {
  const navigate = useNavigate()

  const [planillas, setPlanillas]   = useState([])
  const [results, setResults]       = useState([])
  const [filtroNombre, setFiltroNombre] = useState('')
  const [filtroFecha, setFiltroFecha]   = useState('')
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')

  // 1) Carga inicial
  useEffect(() => {
    const usr = localStorage.getItem('currentUser')
    if (!usr) {
      setError('Usuario no autenticado')
      setLoading(false)
      return
    }
    const user   = JSON.parse(usr)
    const correo = encodeURIComponent(user.correo || user.usuario)

    fetch(`${API_BASE}/PlanillaApi/GetPlanilla?usuario=${correo}`)
      .then(res => {
        if (!res.ok) throw new Error(`Status ${res.status}`)
        return res.json()
      })
      .then(data => {
        setPlanillas(data)
        setResults(data)
      })
      .catch(err => {
        console.error(err)
        setError('No se pudieron cargar las planillas.')
      })
      .finally(() => setLoading(false))
  }, [])

  // 2) Filtrado
  const handleSearch = () => {
    let arr = planillas
    if (filtroNombre) {
      const q = filtroNombre.toLowerCase()
      arr = arr.filter(p =>
        (p.nombre || '').toLowerCase().includes(q)
      )
    }
    if (filtroFecha) {
      arr = arr.filter(p =>
        new Date(p.fechaInicio).toISOString().slice(0,10) === filtroFecha
      )
    }
    setResults(arr)
  }

  if (loading) return <p>Cargando…</p>
  if (error)   return <p className="dashboard-error">{error}</p>

  return (
    <div className="dashboard-page">
      {/* Header: título */}
      <header className="dashboard-header">
        <div className="title-group">
          <button
            className="back-btn"
            onClick={() => navigate(-1)}
            title="Volver"
          >
            <ChevronLeft size={20}/>
          </button>
          <h1 className="dashboard-title">Planillas</h1>
        </div>
      </header>

      {/* Filtros + botón “Nueva planilla” */}
      <div className="dashboard-filters">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Buscar nombre"
            value={filtroNombre}
            onChange={e => setFiltroNombre(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <Calendar className="filter-icon"/>
          <input
            type="date"
            value={filtroFecha}
            onChange={e => setFiltroFecha(e.target.value)}
          />
        </div>
        <button className="btn-search" onClick={handleSearch}>
          Buscar
        </button>
        <button className="btn-icon" title="Filtros avanzados">
          <Filter />
        </button>
        <Link to="nueva" className="btn-add">
          + Nueva planilla
        </Link>
      </div>

      {/* Grid de cards */}
      <div className="projects-grid">
        {results.length > 0 ? (
          results.map(p => (
            <NavLink
              key={p.idPlanilla}
              to={`${p.idPlanilla}`}
              className="project-card"
            >
              <div className="card-image">
                <img
                  src={require('../../../assets/img/dashboard.png')}
                  alt={p.nombre}
                />
              </div>
              <div className="card-info">
                <h3>{p.nombre}</h3>
                <p>
                  <Calendar size={14}/> {' '}
                  {new Date(p.fechaInicio).toLocaleDateString()}
                </p>
              </div>
            </NavLink>
          ))
        ) : (
          <p className="no-results">No se encontraron planillas</p>
        )}
      </div>
    </div>
  )
}
