// src/components/pages/dashboard/Clientes.jsx
import React, { useState, useEffect } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { Calendar, Filter, ChevronLeft } from 'lucide-react'
import './Clientes.css'

const API_BASE = 'https://smartbuild-001-site1.ktempurl.com'

export default function Clientes() {
  const navigate = useNavigate()
  const [clientes, setClientes]       = useState([])
  const [results, setResults]         = useState([])
  const [filtroDesc, setFiltroDesc]   = useState('')
  const [filtroFecha, setFiltroFecha] = useState('')
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')

  useEffect(() => {
    const usuarioStr = localStorage.getItem('currentUser')
    if (!usuarioStr) {
      setError('Usuario no autenticado')
      setLoading(false)
      return
    }
    const user      = JSON.parse(usuarioStr)
    const correo    = encodeURIComponent(user.correo || user.usuario)

    fetch(`${API_BASE}/ClientApi/GetClients?usuario=${correo}`)
      .then(res => {
        if (!res.ok) throw new Error(`Status ${res.status}`)
        return res.json()
      })
      .then(data => {
        setClientes(data)
        setResults(data)
      })
      .catch(err => {
        console.error(err)
        setError('No se pudieron cargar los clientes.')
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSearch = () => {
    let arr = clientes
    if (filtroDesc) {
      const q = filtroDesc.toLowerCase()
      arr = arr.filter(c =>
        (c.razonSocial || '').toLowerCase().includes(q)
      )
    }
    if (filtroFecha) {
      arr = arr.filter(c =>
        new Date(c.cuandoIngreso).toISOString().slice(0,10) === filtroFecha
      )
    }
    setResults(arr)
  }

  if (loading) return <p>Cargando…</p>
  if (error)   return <p className="clientes-error">{error}</p>

  return (
    <div className="clientes-page">
      <header className="clientes-header">
        <div className="title-group">
          <button
            className="back-btn"
            onClick={() => navigate(-1)}
            title="Volver"
          >
            <ChevronLeft size={20} />
          </button>
          <h1 className="clientes-title">Clientes</h1>
        </div>

      </header>

      <div className="clientes-filters">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Buscar nombre"
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
        <Link to="nuevo" className="btn-add">
          + Agregar cliente
        </Link>
      </div>

      <div className="clients-grid">
        {results.length > 0 ? (
          results.map(c => (
            <NavLink
              key={c.idCliente}
              to={`${c.idCliente}`}
              className="client-card"
            >
              <div className="card-image">
                <img
                  src={require('../../../assets/img/dashboard.png')}
                  alt={c.razonSocial}
                />
              </div>
              <div className="card-info">
                <h3>{c.razonSocial}</h3>
                <p>
                  <Calendar size={14} />{' '}
                  {new Date(c.cuandoIngreso).toLocaleDateString()}
                </p>
              </div>
            </NavLink>
          ))
        ) : (
          <p className="no-results">No se encontraron clientes</p>
        )}
      </div>
    </div>
  )
}
