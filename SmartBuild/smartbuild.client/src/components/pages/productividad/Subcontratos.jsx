import React, { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Calendar, Filter, ChevronLeft, DollarSign } from 'lucide-react'
import '../../../styles/Dashboard.css'
import './Subcontratos.css'

const API_BASE = 'https://smartbuild-001-site1.ktempurl.com'

export default function Subcontratos() {
  const navigate = useNavigate()
  const [subcontratos, setSubcontratos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filtros, setFiltros] = useState({ fecha: '' })

  // Para pagos desplegados
  const [pagosPorSubcontrato, setPagosPorSubcontrato] = useState({})
  const [expandedId, setExpandedId] = useState(null)

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

  const fetchPagos = async (idSubcontrato) => {
    const usrStr = localStorage.getItem('currentUser')
    if (!usrStr) return
    const user = JSON.parse(usrStr)
    const correo = encodeURIComponent(user.correo || user.usuario)

    try {
      const res = await fetch(`${API_BASE}/PagoSubcontratoApi/GetPagosSubcontrato?usuario=${correo}`)
      if (!res.ok) throw new Error(`Status ${res.status}`)
      const data = await res.json()
      // Filtrar pagos para este subcontrato
      const pagosFiltrados = data.filter(p => p.subcontratoID === idSubcontrato)
      setPagosPorSubcontrato(prev => ({ ...prev, [idSubcontrato]: pagosFiltrados }))
    } catch (err) {
      console.error('Error cargando pagos:', err)
      setPagosPorSubcontrato(prev => ({ ...prev, [idSubcontrato]: [] }))
    }
  }

  const toggleExpand = (idSubcontrato) => {
    if (expandedId === idSubcontrato) {
      setExpandedId(null)
    } else {
      setExpandedId(idSubcontrato)
      if (!pagosPorSubcontrato[idSubcontrato]) {
        fetchPagos(idSubcontrato)
      }
    }
  }

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
          <h1 className="dashboard-title">Subcontratos</h1>
        </div>

        <Link to="nuevo" className="btn-add">+ Nuevo subcontrato</Link>
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

        <button className="btn-icon" title="Filtros avanzados"><Filter /></button>

        <Link
          to="pagos/nuevo"
          className="btn btn-outline-primary btn-sm"
          title="Ver pagos de subcontratos"
        >
          <DollarSign size={16} style={{ marginRight: 4 }} />
          Pagos
        </Link>
      </div>

      <div className="projects-table-wrapper">
        {results.length > 0 ? (
          <table className="projects-table">
            <thead>
              <tr>
                <th>Proveedor</th>
                <th>Descripción</th>
                <th>Fecha Inicio Real</th>
                <th>Avance</th>
                <th>Monto (₡)</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {results.map(s => {
                const fecha = new Date(s.fechaInicioReal)
                const isExpanded = expandedId === s.idSubcontrato
                return (
                  <React.Fragment key={s.idSubcontrato}>
                  <tr>
                    <td>{s.nombreProveedor || 'Sin especificar'}</td>
                    <td>{s.descripcion}</td>
                    <td>{fecha.toLocaleDateString()}</td>
                    <td>{s.porcentajeAvance}%</td>
                    <td>{s.montoCotizado.toLocaleString('es-CR')}</td>
                    <td>
                    <Link
                      to="#"
                      onClick={e => {
                      e.preventDefault()
                      toggleExpand(s.idSubcontrato)
                      }}
                      className="btn-link"
                      style={{ marginRight: '1rem' }}
                    >
                      {isExpanded ? 'Ocultar pagos' : 'Ver pagos'}
                    </Link>
                    <Link
                      to={`editar/${s.idSubcontrato}`}
                      className="btn-link"
                    >
                      Editar
                    </Link>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr className="payments-row">
                    <td colSpan={6}>
                      {pagosPorSubcontrato[s.idSubcontrato]?.length > 0 ? (
                      <table className="payments-table">
                        <thead>
                        <tr>
                          <th>ID Pago</th>
                          <th>Monto Pagado (₡)</th>
                          <th>Fecha Pago</th>
                        </tr>
                        </thead>
                        <tbody>
                        {pagosPorSubcontrato[s.idSubcontrato].map(pago => (
                          <tr key={pago.idPago}>
                          <td>{pago.idPago}</td>
                          <td>{pago.montoPagado.toLocaleString('es-CR')}</td>
                          <td>{new Date(pago.fechaPago).toLocaleDateString()}</td>
                          </tr>
                        ))}
                        </tbody>
                      </table>
                      ) : (
                      <p>No hay pagos registrados para este subcontrato.</p>
                      )}
                    </td>
                    </tr>
                  )}
                  </React.Fragment>
                )
              })}
            </tbody>
          </table>
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
