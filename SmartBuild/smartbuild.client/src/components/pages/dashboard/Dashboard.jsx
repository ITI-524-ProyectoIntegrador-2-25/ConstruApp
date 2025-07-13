// src/components/pages/dashboard/Dashboard.jsx
import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Calendar, MapPin, Filter } from 'lucide-react'
import '../../../assets/img/img3.jpg'  // para que Webpack procese la carpeta
import '../../../styles/Dashboard.css'

const ALL_PROJECTS = [
  {
    id: 1,
    title: 'Proyecto 1',
    image: require('../../../assets/img/img3.jpg'),
    period: 'Hoy',
    address: '766 Sutter St, San Francisco, California'
  },
  {
    id: 2,
    title: 'Proyecto 2',
    image: require('../../../assets/img/img3.jpg'),
    period: 'Mes',
    address: '58 Middle Point Rd, San Francisco, California'
  },
  {
    id: 3,
    title: 'Proyecto 3',
    image: require('../../../assets/img/img3.jpg'),
    period: 'Hoy',
    address: '66 Ceres St, San Francisco, California'
  }
]

export default function Dashboard() {
  const [projectFilter,  setProjectFilter]  = useState('')
  const [periodFilter,   setPeriodFilter]   = useState('')
  const [locationFilter, setLocationFilter] = useState('')

  const [results, setResults] = useState(ALL_PROJECTS)

  const handleSearch = () => {
    const filtered = ALL_PROJECTS.filter(p => {
      // filtro por proyecto
      if (projectFilter && p.title !== projectFilter) return false
      // filtro por periodo
      if (periodFilter && p.period !== periodFilter) return false
      // filtro por localidad (busca substring en address)
      if (locationFilter && !p.address.includes(locationFilter)) return false
      return true
    })
    setResults(filtered)
  }

  return (
    <div className="dashboard-page">
      <h2 className="dashboard-title">Proyectos</h2>

      <div className="dashboard-filters">
        <div className="filter-group">
          <select
            value={projectFilter}
            onChange={e => setProjectFilter(e.target.value)}
          >
            <option value="">Todos los proyectos</option>
            {ALL_PROJECTS.map(p => (
              <option key={p.id} value={p.title}>{p.title}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <Calendar className="filter-icon"/>
          <select
            value={periodFilter}
            onChange={e => setPeriodFilter(e.target.value)}
          >
            <option value="">Cualquier periodo</option>
            <option value="Hoy">Hoy</option>
            <option value="Mes">Mes</option>
          </select>
        </div>

        <div className="filter-group">
          <MapPin className="filter-icon"/>
          <select
            value={locationFilter}
            onChange={e => setLocationFilter(e.target.value)}
          >
            <option value="">Cualquier localidad</option>
            <option value="San Francisco">San Francisco</option>
            <option value="California">California</option>
          </select>
        </div>

        <button className="btn-search" onClick={handleSearch}>
          Buscar
        </button>

        <button className="btn-icon" title="Filtros avanzados">
          <Filter/>
        </button>
      </div>

      <div className="projects-grid">
        {results.map(p => (
          <NavLink
            key={p.id}
            to={`/dashboard/proyectos/${p.id}`}
            className="project-card"
          >
            <div className="card-image">
              <img src={p.image} alt={p.title} />
            </div>
            <div className="card-info">
              <h3>{p.title}</h3>
              <p>
                <MapPin size={14}/> {p.address}
              </p>
            </div>
          </NavLink>
        ))}
        {results.length === 0 && (
          <p className="no-results">No se encontraron proyectos</p>
        )}
      </div>
    </div>
  )
}
