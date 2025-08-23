import React, { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Calendar,
  Filter,
  ChevronLeft,
  DollarSign,
  TrendingUp,
  Edit3,
  Banknote,
  User,
  FileText
} from 'lucide-react'
import '../../../styles/Dashboard.css'
import './Subcontratos.css'

const API_BASE = 'https://smartbuild-001-site1.ktempurl.com'

export default function Subcontratos() {
  const navigate = useNavigate()
  const [subcontratos, setSubcontratos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filtros, setFiltros] = useState({ fecha: '', tipoFecha: 'reales' }) // 'reales' o 'proyectadas'

  const [pagosPorSubcontrato, setPagosPorSubcontrato] = useState({})
  const [expandedId, setExpandedId] = useState(null)
  const [descExpandedId, setDescExpandedId] = useState(null)

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

  const toggleDescExpand = (idSubcontrato) => {
    setDescExpandedId(prev => prev === idSubcontrato ? null : idSubcontrato)
  }

  const handleFilterChange = field => value => {
    setFiltros(current => ({ ...current, [field]: value }))
  }

  const clearFilters = () => {
    setFiltros({ fecha: '', tipoFecha: 'reales' })
  }

  const results = useMemo(() => {
    let arr = subcontratos
    if (filtros.fecha) {
      arr = arr.filter(s => {
        const inicio = filtros.tipoFecha === 'reales' ? s.fechaInicioReal : s.fechaInicioProyectada
        return new Date(inicio).toISOString().slice(0, 10) === filtros.fecha
      })
    }
    return arr
  }, [subcontratos, filtros.fecha, filtros.tipoFecha])

  if (loading) return <p>Cargando…</p>
  if (error) return <p className="dashboard-error">{error}</p>

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div className="title-group">
          <button className="back-btn" onClick={() => navigate(-1)} title="Volver">
            <ChevronLeft size={20} />
          </button>
          <h1 className="dashboard-title">📑 Subcontratos</h1>
        </div>

        <Link to="nuevo" className="btn-add">+ Nuevo subcontrato</Link>
      </header>

      <div className="dashboard-filters">
        <div className="filter-group">
          <Calendar className="filter-icon" />

          <select
            value={filtros.tipoFecha}
            onChange={e => handleFilterChange('tipoFecha')(e.target.value)}
            style={{ marginRight: '0.5rem' }}
          >
            <option value="reales">Fechas reales</option>
            <option value="proyectadas">Fechas proyectadas</option>
          </select>

          <input
            type="date"
            value={filtros.fecha}
            onChange={e => handleFilterChange('fecha')(e.target.value)}
          />
        </div>

        {filtros.fecha && (
          <button className="btn btn-outline-primary btn-sm" onClick={clearFilters} title="Limpiar filtros">
            Limpiar
          </button>
        )}

        <button className="btn-icon" title="Filtros avanzados"><Filter /></button>

        <Link to="pagos/nuevo" className="btn btn-outline-primary btn-sm" title="Registrar pagos">
          <DollarSign size={16} style={{ marginRight: 4 }} />
          Pagos
        </Link>
      </div>

      <div className="projects-table-wrapper">
        {results.length > 0 ? (
          <table className="projects-table">
            <thead>
              <tr>
                <th><User size={14} style={{ marginRight: 4 }} /> Proveedor</th>
                <th><FileText size={14} style={{ marginRight: 4 }} /> Descripción</th>
                <th><Calendar size={14} style={{ marginRight: 4 }} /> Fecha Inicio</th>
                <th><Calendar size={14} style={{ marginRight: 4 }} /> Fecha Fin</th>
                <th><TrendingUp size={14} style={{ marginRight: 4 }} /> Avance</th>
                <th><DollarSign size={14} style={{ marginRight: 4 }} /> Monto (₡)</th>
                <th>⚙️ Acciones</th>
              </tr>
            </thead>
            <tbody>
              {results.map(s => {
                const inicio = filtros.tipoFecha === 'reales' ? s.fechaInicioReal : s.fechaInicioProyectada
                const fin = filtros.tipoFecha === 'reales' ? s.fechaFinReal : s.fechaFinProyectada
                const fechaInicio = new Date(inicio)
                const fechaFin = new Date(fin)

                const isExpanded = expandedId === s.idSubcontrato
                const isDescExpanded = descExpandedId === s.idSubcontrato

                return (
                  <React.Fragment key={s.idSubcontrato}>
                    <tr>
                      <td>{s.nombreProveedor || 'Sin especificar'}</td>
                      <td
                        onClick={() => toggleDescExpand(s.idSubcontrato)}
                        className={`description-cell ${isDescExpanded ? 'expanded' : ''}`}
                        title={s.descripcion}
                      >
                        {isDescExpanded
                          ? s.descripcion
                          : s.descripcion.length > 20
                          ? s.descripcion.slice(0, 20) + '…'
                          : s.descripcion}
                      </td>
                      <td>{fechaInicio.toLocaleDateString()}</td>
                      <td>{fechaFin.toLocaleDateString()}</td>
                      <td>
                        <div className="progress-bar" title={`${s.porcentajeAvance}%`}>
                          <div
                            className="progress-bar-fill"
                            style={{ width: `${Math.min(s.porcentajeAvance, 100)}%` }}
                          />
                        </div>
                        <span style={{ marginLeft: 8 }}>{s.porcentajeAvance}%</span>
                      </td>
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
                          <Banknote size={14} style={{ marginRight: 4 }} />
                          {isExpanded ? 'Ocultar pagos' : 'Ver pagos'}
                        </Link>
                        <Link to={`editar/${s.idSubcontrato}`} className="btn-link">
                          <Edit3 size={14} style={{ marginRight: 4 }} />
                          Editar
                        </Link>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="payments-row">
                        <td colSpan={7}>
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
                                {/* Fila de total */}
<tr className="total-row" style={{ backgroundColor: '#f0f0f0' }}>
  <td style={{ fontWeight: 'bold' }}>Total</td>
  <td style={{ fontWeight: 'bold' }}>
    {pagosPorSubcontrato[s.idSubcontrato]
      .reduce((sum, pago) => sum + pago.montoPagado, 0)
      .toLocaleString('es-CR')}
  </td>
  <td></td>
</tr>

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
