// src/components/pages/dashboard/Dashboard.jsx
import React, { useState, useEffect, useMemo } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { Calendar, Filter, ChevronLeft } from 'lucide-react'
import '../../../styles/Dashboard.css'

const API_BASE = 'https://smartbuild-001-site1.ktempurl.com'

export default function Dashboard() {
  const navigate = useNavigate()
  const [presupuestos, setPresupuestos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Estado unificado para filtros
  const [filtros, setFiltros] = useState({
    descripcion: '',
    fecha: ''
  })

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
      })
      .catch(err => {
        console.error(err)
        setError('No se pudieron cargar los proyectos.')
      })
      .finally(() => setLoading(false))
  }, [])

  // Handler unificado para todos los filtros
  const handleFilterChange = (field) => (e) => {
    setFiltros(current => ({
      ...current,
      [field]: e.target.value
    }))
  }

  // Funcion para filtado en tiempo real con usememo
  const results = useMemo(() => {
    let arr = presupuestos
//filtra por descripcion
    if (filtros.descripcion) {
      const q = filtros.descripcion.toLowerCase()
      arr = arr.filter(p =>
        (p.descripcion || '').toLowerCase().includes(q)
      )
    }

    // Filtro por fecha
    if (filtros.fecha) {
      arr = arr.filter(p =>
        new Date(p.fechaInicio).toISOString().slice(0, 10) === filtros.fecha
      )
    }

    return arr
  }, [presupuestos, filtros.descripcion, filtros.fecha])

  // Función para limpiar filtros
  const clearFilters = () => {
    setFiltros({
      descripcion: '',
      fecha: ''
    })
  }

  if (loading) return <p>Cargando…</p>
  if (error) return <p className="dashboard-error">{error}</p>

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
      </header>

      <div className="dashboard-filters">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Buscar descripción"
            value={filtros.descripcion}
            onChange={handleFilterChange('descripcion')}
          />
        </div>
        <div className="filter-group">
          <Calendar className="filter-icon" />
          <input
            type="date"
            value={filtros.fecha}
            onChange={handleFilterChange('fecha')}
          />
        </div>
        
        {/* Botón para limpiar filtros  */}
        {(filtros.descripcion || filtros.fecha) && (
          <button className="btn btn-outline-primary btn-sm" onClick={clearFilters} title="Limpiar filtros">
            Limpiar
          </button>
        )}
        
        <button className="btn-icon" title="Filtros avanzados">
          <Filter />
        </button>
        <Link to="proyectos/nuevo" className="btn-add">
          + Agregar proyecto
        </Link>
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
          <p className="no-results">
            {filtros.descripcion || filtros.fecha
              ? 'No se encontraron proyectos con los filtros aplicados'
              : 'No se encontraron proyectos'
            }
          </p>
        )}
      </div>

      {/* Contador de resultados */}
      {presupuestos.length > 0 && (
        <div className="results-footer">
          Mostrando {results.length} de {presupuestos.length} proyecto{presupuestos.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}