import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { Calendar, Filter, ChevronLeft, Search } from 'lucide-react'
import './Clientes.css'

// Hook
import { useClientes } from '../../../hooks/cliente'

export default function Clientes() {
  const navigate = useNavigate()
  const { clientes, loadingClients, errorClients } = useClientes()

  const [results, setResults] = useState([])
  const [filtroDesc, setFiltroDesc] = useState('')
  const [filtroFecha, setFiltroFecha] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('todos')
  const [filtroContacto, setFiltroContacto] = useState('todos')

  // Sincronizar clientes del hook con la lista filtrada inicial
  useEffect(() => {
    if (Array.isArray(clientes)) {
      setResults(clientes)
    }
  }, [clientes])

  // Estadísticas calculadas
  const estadisticas = useMemo(() => {
    if (!clientes.length) return { total: 0, publicos: 0, privados: 0, conContacto: 0, sinContacto: 0, nuevosMes: 0 }
    
    return {
      total: clientes.length,
      publicos: clientes.filter(c => c.tipo === 'Publico').length,
      privados: clientes.filter(c => c.tipo === 'Privado').length,
      conContacto: clientes.filter(c => c.nombreContacto).length,
      sinContacto: clientes.filter(c => !c.nombreContacto).length,
      nuevosMes: clientes.filter(c => 
        new Date(c.cuandoIngreso) > new Date(Date.now() - 30*24*60*60*1000)
      ).length
    }
  }, [clientes])

  const handleSearch = useCallback(() => {
    let arr = clientes
    
    if (filtroDesc) {
      const q = filtroDesc.toLowerCase()
      arr = arr.filter(c =>
        (c.razonSocial || '').toLowerCase().includes(q) ||
        (c.identificacion || '').includes(q) ||
        (c.nombreContacto || '').toLowerCase().includes(q)
      )
    }
    
    if (filtroFecha) {
      arr = arr.filter(c =>
        new Date(c.cuandoIngreso).toISOString().slice(0,10) === filtroFecha
      )
    }
    
    if (filtroTipo !== 'todos') {
      arr = arr.filter(c => c.tipo === filtroTipo)
    }
    
    if (filtroContacto === 'si') {
      arr = arr.filter(c => c.nombreContacto)
    } else if (filtroContacto === 'no') {
      arr = arr.filter(c => !c.nombreContacto)
    }
    
    setResults(arr)
  }, [clientes, filtroDesc, filtroFecha, filtroTipo, filtroContacto])

  // Búsqueda automática cuando cambian los filtros
  useEffect(() => {
    handleSearch()
  }, [handleSearch])

  if (loadingClients) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="glass-loading">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-gray-700 text-lg font-medium mt-4">Cargando clientes...</p>
        </div>
      </div>
    )
  }

  if (errorClients) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="glass-error">
          <p className="text-red-600 text-lg font-medium">{errorClients}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="glass-btn mt-4"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="clientes-page">
      <div className="clientes-container">
        
        {/* Header con estadísticas */}
        <div className="clientes-header">
          <div className="header-content">
            <div className="title-group">
              <button
                onClick={() => navigate(-1)}
                className="back-btn"
                title="Volver"
              >
                <ChevronLeft size={20} />
              </button>
              <h1 className="clientes-title">Clientes</h1>
            </div>
            
            <div className="stats-group">
              <div className="stat-card">
                <span className="stat-number">{estadisticas.total}</span>
                <span className="stat-label">Total</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">{estadisticas.nuevosMes}</span>
                <span className="stat-label">Nuevos</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">{estadisticas.sinContacto}</span>
                <span className="stat-label">Sin contacto</span>
              </div>
            </div>
          </div>
        </div>

        {/* Controles de búsqueda y filtros */}
        <div className="clientes-search">
          <div className="search-controls">
            <div className="input-wrapper flex-1">
              <Search className="input-icon" size={20} />
              <input
                type="text"
                placeholder="Buscar nombre"
                value={filtroDesc}
                onChange={e => setFiltroDesc(e.target.value)}
                className="search-input"
              />
            </div>
            
            <div className="input-wrapper">
              <Calendar className="input-icon" size={20} />
              <input
                type="date"
                value={filtroFecha}
                onChange={e => setFiltroFecha(e.target.value)}
                placeholder="dd/mm/aaaa"
                className="search-input date-input"
              />
            </div>

            <button className="btn-search" onClick={handleSearch}>
              Buscar
            </button>

            <button className="btn-filter" title="Filtros avanzados">
              <Filter size={18} />
            </button>
            
            <Link to="nuevo" className="btn-add">
              + Agregar cliente
            </Link>
          </div>

          {/* Pills de filtro */}
          <div className="filter-pills">
            <button 
              className={`filter-pill ${filtroTipo === 'todos' ? 'active' : ''}`}
              onClick={() => setFiltroTipo('todos')}
            >
              Todos los tipos
            </button>
            <button 
              className={`filter-pill ${filtroTipo === 'Publico' ? 'active' : ''}`}
              onClick={() => setFiltroTipo('Publico')}
            >
              🏛️ Público ({estadisticas.publicos})
            </button>
            <button 
              className={`filter-pill ${filtroTipo === 'Privado' ? 'active' : ''}`}
              onClick={() => setFiltroTipo('Privado')}
            >
              🏢 Privado ({estadisticas.privados})
            </button>
            <button 
              className={`filter-pill ${filtroContacto === 'si' ? 'active' : ''}`}
              onClick={() => setFiltroContacto('si')}
            >
              👥 Con contacto ({estadisticas.conContacto})
            </button>
            <button 
              className={`filter-pill ${filtroContacto === 'no' ? 'active' : ''}`}
              onClick={() => setFiltroContacto('no')}
            >
              ❌ Sin contacto ({estadisticas.sinContacto})
            </button>
          </div>
        </div>

        {/* Grid de clientes */}
        <div className="clients-grid">
          {results.length > 0 ? (
            results.map(cliente => (
              <NavLink
                key={cliente.idCliente}
                to={`${cliente.idCliente}`}
                className="client-card"
              >
                {/* Imagen del dashboard mejorada */}
                <div className="card-image">
                  <div className="dashboard-bg">
                    <div className="dashboard-lines"></div>
                    <div className="dashboard-chart"></div>
                    <div className="dashboard-circles"></div>
                  </div>
                </div>

                <div className="card-info">
                  <h3 className="card-title">{cliente.razonSocial}</h3>
                  
                  <div className="card-meta">
                    <div className="meta-item">
                      <Calendar size={12} />
                      <span>{new Date(cliente.cuandoIngreso).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Indicadores adicionales */}
                  <div className="card-indicators">
                    {cliente.tipo && (
                      <div className={`indicator ${cliente.tipo?.toLowerCase()}`}>
                        {cliente.tipo === 'Publico' ? '🏛️' : '🏢'} {cliente.tipo}
                      </div>
                    )}
                    {!cliente.nombreContacto && (
                      <div className="indicator warning">
                        Sin contacto
                      </div>
                    )}
                  </div>
                </div>
              </NavLink>
            ))
          ) : (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <h3 className="empty-title">No se encontraron clientes</h3>
              <p className="empty-text">
                Prueba ajustando los filtros de búsqueda
              </p>
              <button 
                className="btn-clear-filters"
                onClick={() => {
                  setFiltroDesc('')
                  setFiltroFecha('')
                  setFiltroTipo('todos')
                  setFiltroContacto('todos')
                }}
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}