// src/components/pages/productividad/Subcontratos.jsx
import React, { useState, useEffect, useMemo } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { Calendar, Filter, ChevronLeft } from 'lucide-react'
import '../../../styles/Dashboard.css'
import './Actividades.css'

const API_BASE = 'https://smartbuild-001-site1.ktempurl.com'

export default function Subcontratos() {
  const navigate = useNavigate()
  const [subcontratos, setSubcontratos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filtros, setFiltros] = useState({
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

    fetch(`${API_BASE}/SubcontratoApi/GetSubcontratos?usuario=${correo}`)
      .then(async res => {
        if (!res.ok) throw new Error(`Status ${res.status}`)
        const data = await res.json()
        setSubcontratos(data)
      })
      .catch(err => {
        console.error(err)
        setError('Error cargando subcontratos.')
      })
      .finally(() => setLoading(false))
  }, [])

  const handleFilterChange = field => value => {
    setFiltros(current => ({ ...current, [field]: value }))
  }

  const clearFilters = () => {
    setFiltros({ fecha: '' })
  }

  const results = useMemo(() => {
    let arr = subcontratos
    if (filtros.fecha) {
      arr = arr.filter(s =>
        new Date(s.fechaInicioReal).toISOString().slice(0, 10) === filtros.fecha
      )
    }
    return arr
  }, [subcontratos, filtros.fecha])

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
          <h1 className="dashboard-title">Subcontratos</h1>
        </div>
      </header>

      <div className="dashboard-filters">
        <div className="filter-group">
          <Calendar className="filter-icon" />
          <input
            type="date"
            value={filtros.fecha}
            onChange={e => handleFilterChange('fecha')(e.target.value)}
          />
        </div>

        {filtros.fecha && (
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

        <Link to="nuevo" className="btn-add">
          + Nuevo subcontrato
        </Link>
      </div>

      <div className="projects-grid">
        {results.length > 0 ? (
          results.map(s => {
            const fecha = new Date(s.fechaInicioReal)

            return (
              <NavLink
                key={s.idSubcontrato}
                to={`${s.idSubcontrato}`}
                className="project-card"
              >
                <div className="card-image">
                  <img
                    src={require('../../../assets/img/dashboard.png')}
                    alt={s.descripcion}
                  />
                </div>
                <div className="card-info">
                  <h3>{s.descripcion}</h3>
                  <p>
                    <Calendar size={14} /> {fecha.toLocaleDateString()}
                  </p>
                  <p>Avance: {s.porcentajeAvance}%</p>
                  <p>Monto: ₡{s.montoCotizado.toLocaleString('es-CR')}</p>
                </div>
              </NavLink>
            )
          })
        ) : (
          <p className="no-results">
            {filtros.fecha
              ? 'No se encontraron subcontratos con esa fecha'
              : 'No se encontraron subcontratos'}
          </p>
        )}
      </div>

      {subcontratos.length > 0 && (
        <div className="results-footer">
          Mostrando {results.length} de {subcontratos.length} subcontrato
          {subcontratos.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}
