// src/components/pages/productividad/Actividades.jsx
import React, { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Calendar, Filter, ChevronLeft } from 'lucide-react'
import Select from 'react-select'
import '../../../styles/Dashboard.css'
import './Actividades.css'

const API_BASE = 'https://smartbuild-001-site1.ktempurl.com'

export default function Actividades() {
  const navigate = useNavigate()
  const [actividades, setActividades] = useState([])
  const [results, setResults] = useState([])
  const [filtroPresupuesto, setFiltroPresupuesto] = useState(null)
  const [filtroFecha, setFiltroFecha] = useState('')
  const [presupuestosOpts, setPresupuestosOpts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const usr = localStorage.getItem('currentUser')
    if (!usr) {
      setError('Usuario no autenticado')
      setLoading(false)
      return
    }
    const user = JSON.parse(usr)
    const correo = encodeURIComponent(user.correo || user.usuario)

    // Cargar actividades
    fetch(`${API_BASE}/ActividadApi/GetActividades?usuario=${correo}`)
      .then(res => {
        if (!res.ok) throw new Error(`Status ${res.status}`)
        return res.json()
      })
      .then(data => {
        setActividades(data)
        setResults(data)
      })
      .catch(err => {
        console.error(err)
        setError('No se pudieron cargar las actividades.')
      })

    // Cargar presupuestos para filtro
    fetch(`${API_BASE}/PresupuestoApi/GetPresupuestos?usuario=${correo}`)
      .then(res => {
        if (!res.ok) throw new Error(`Status ${res.status}`)
        return res.json()
      })
      .then(data => {
        const opts = data.map(p => ({
          value: p.idPresupuesto,
          label: p.descripcion
        }))
        setPresupuestosOpts(opts)
      })
      .catch(err => console.error('Error cargando presupuestos:', err))
      .finally(() => setLoading(false))
  }, [])

  const handleSearch = () => {
    let arr = actividades
    if (filtroPresupuesto) {
      arr = arr.filter(a => a.presupuestoID === filtroPresupuesto.value)
    }
    if (filtroFecha) {
      arr = arr.filter(a =>
        new Date(a.fechaInicioReal).toISOString().slice(0,10) === filtroFecha
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
            <ChevronLeft size={20}/>
          </button>
          <h1 className="dashboard-title">Actividades</h1>
        </div>
      </header>

      <div className="dashboard-filters">
        <div className="filter-group">
          <Select
            options={presupuestosOpts}
            value={filtroPresupuesto}
            onChange={setFiltroPresupuesto}
            isClearable
            placeholder="Filtrar por proyecto…"
            className="react-select-container"
            classNamePrefix="react-select"
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
        <button className="btn-search" onClick={handleSearch}>Buscar</button>
        <button className="btn-icon" title="Filtros avanzados">
          <Filter />
        </button>
        <NavLink to="nueva" className="btn-add">+ Nueva actividad</NavLink>
      </div>

      <div className="projects-grid">
        {results.length > 0 ? (
          results.map(a => {
            const start = new Date(a.fechaInicioReal)
            const end   = new Date(a.fechaFinReal)
            const dur   = ((end - start) / 3600000).toFixed(2)
            return (
              <NavLink
                key={a.idActividad}
                to={`${a.idActividad}`}
                className="project-card"
              >
                <div className="card-info">
                  <h3>{a.descripcion}</h3>
                  <p>
                    <Calendar size={14}/> {start.toLocaleDateString()}
                  </p>
                </div>
                <div className="card-extra">
                  <span>Entrada: {start.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</span>
                  <span>Salida: {end.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</span>
                  <span>Dur: {dur}h</span>
                </div>
              </NavLink>
            )
          })
        ) : (
          <p className="no-results">No se encontraron actividades</p>
        )}
      </div>
    </div>
  )
}
