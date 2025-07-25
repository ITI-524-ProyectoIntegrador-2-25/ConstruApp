import React, { useState, useEffect } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { ChevronLeft, Filter, Calendar } from 'lucide-react'
import '../../../styles/Dashboard.css'
import './Empleados.css'

const API_BASE = 'https://smartbuild-001-site1.ktempurl.com'

export default function Empleados() {
  const navigate = useNavigate()
  const [empleados, setEmpleados] = useState([])
  const [results, setResults] = useState([])
  const [filtroNombre, setFiltroNombre] = useState('')
  const [filtroPuesto, setFiltroPuesto] = useState('')
  const [filtroFecha, setFiltroFecha] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const usuarioStr = localStorage.getItem('currentUser')
    if (!usuarioStr) {
      setError('Usuario no autenticado')
      setLoading(false)
      return
    }
    const user = JSON.parse(usuarioStr)
    const correo = encodeURIComponent(user.correo || user.usuario)

    fetch(`${API_BASE}/EmpleadoApi/GetEmpleado?usuario=${correo}`)
      .then(res => {
        if (!res.ok) throw new Error(`Status ${res.status}`)
        return res.json()
      })
      .then(data => {
        setEmpleados(data)
        setResults(data)
      })
      .catch(err => {
        console.error(err)
        setError('No se pudieron cargar los empleados.')
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSearch = () => {
    let arr = empleados
    if (filtroNombre) {
      const q = filtroNombre.toLowerCase()
      arr = arr.filter(e => (`${e.nombre} ${e.apellido}` || '').toLowerCase().includes(q))
    }
    if (filtroPuesto) {
      arr = arr.filter(e => e.puesto.toLowerCase().includes(filtroPuesto.toLowerCase()))
    }
    if (filtroFecha) {
      // Supone que existe e.fechaIngreso en formato ISO
      arr = arr.filter(e =>
        new Date(e.fechaIngreso).toISOString().slice(0,10) === filtroFecha
      )
    }
    setResults(arr)
  }

  if (loading) return <p>Cargando…</p>
  if (error) return <p className="empleados-error">{error}</p>

  return (
    <div className="empleados-page">
      <header className="empleados-header">
        <div className="title-group">
          <button className="back-btn" onClick={() => navigate(-1)} title="Volver">
            <ChevronLeft size={20} />
          </button>
          <h1 className="empleados-title">Empleados</h1>
        </div>
      </header>

      <div className="empleados-filters">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Buscar nombre"
            value={filtroNombre}
            onChange={e => setFiltroNombre(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <Filter className="filter-icon" />
          <input
            type="text"
            placeholder="Buscar puesto"
            value={filtroPuesto}
            onChange={e => setFiltroPuesto(e.target.value)}
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
        <Link to="nuevo" className="btn-add">
          + Agregar empleado
        </Link>
      </div>

      <div className="empleados-list">
        {results.length > 0 ? (
          results.map(emp => (
            <NavLink
              key={emp.idEmpleado}
              to={`${emp.idEmpleado}`}
              className="empleado-card"
            >
              <div className="card-image">
                <img
                  src={require('../../../assets/img/dashboard.png')}
                  alt={`${emp.nombre} ${emp.apellido}`}
                />
              </div>
              <div className="card-info">
                <h3>{emp.nombre} {emp.apellido}</h3>
                <p>{emp.puesto}</p>
              </div>
            </NavLink>
          ))
        ) : (
          <p className="no-results">No se encontraron empleados</p>
        )}
      </div>

      {empleados.length > 0 && (
        <div className="results-footer">
          Mostrando {results.length} de {empleados.length} empleado{empleados.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}
