// src/components/pages/dashboard/Dashboard.jsx
import React, { useState, useEffect } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { Calendar, Filter, ChevronLeft } from 'lucide-react'
import '../../../styles/Dashboard.css'

const API_BASE = 'https://smartbuild-001-site1.ktempurl.com'

export default function Dashboard() {
  const navigate = useNavigate()
  const [presupuestos, setPresupuestos] = useState([])
  const [results, setResults]           = useState([])
  const [filtroDesc, setFiltroDesc]     = useState('')
  const [filtroFecha, setFiltroFecha]   = useState('')
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState('')

  useEffect(() => {
    const usuarioStr = localStorage.getItem('currentUser')
    if (!usuarioStr) {
      setError('Usuario no autenticado')
      setLoading(false)
      return
    }
    const user = JSON.parse(usuarioStr)
    const correo = encodeURIComponent(user.correo || user.usuario)

    fetch(`${API_BASE}/PresupuestoApi/GetPresupuestos?usuario=${correo}`)
      .then(res => {
        if (!res.ok) throw new Error(`Status ${res.status}`)
        return res.json()
      })
      .then(data => {
        setPresupuestos(data)
        setResults(data)
      })
      .catch(err => {
        console.error(err)
        setError('No se pudieron cargar los proyectos.')
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSearch = () => {
    let arr = presupuestos
    if (filtroDesc) {
      const q = filtroDesc.toLowerCase()
      arr = arr.filter(p =>
        (p.descripcion || '').toLowerCase().includes(q)
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
      <header className="dashboard-header">
        <div className="title-group">
          <button
            className="back-btn"
            onClick={() => navigate(-1)}
            title="Volver"
          >
            <ChevronLeft size={20} />
          </button>
          <h1 className="dashboard-title">Proyectos</h1>
        </div>
        <Link to="proyectos/nuevo" className="btn-add">
          + Agregar proyecto
        </Link>
      </header>

      <div className="dashboard-filters">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Buscar descripción"
            value={filtroDesc}
            onChange={e => setFiltroDesc(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <Calendar className="filter-icon" />
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
      </div>

      <div className="projects-grid">
        {results.length > 0 ? (
          results.map(p => (
            <NavLink
              key={p.idPresupuesto}
              to={`proyectos/${p.idPresupuesto}`}
              className="project-card"
            >
              <div className="card-image">
                <img
                  src={require('../../../assets/img/dashboard.png')}
                  alt={p.descripcion}
                />
              </div>
              <div className="card-info">
                <h3>{p.descripcion}</h3>
                <p>
                  <Calendar size={14} />{' '}
                  {new Date(p.fechaInicio).toLocaleDateString()}
                </p>
              </div>
            </NavLink>
          ))
        ) : (
          <p className="no-results">No se encontraron proyectos</p>
        )}
      </div>
    </div>
  )
}
