import React, { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Calendar,
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
  const [filtros, setFiltros] = useState({
    fecha: '',
    tipoFecha: 'reales',
    proveedor: '',
    avanceMin: '',
    avanceMax: '',
    montoMin: '',
    montoMax: '',
    sinContactos: false,
    sinPagos: false
  })

  const [pagosPorSubcontrato, setPagosPorSubcontrato] = useState({})
  const [contactosPorSubcontrato, setContactosPorSubcontrato] = useState({})
  const [expandedId, setExpandedId] = useState(null)
  const [expandedContactsId, setExpandedContactsId] = useState(null)
  const [descExpandedId, setDescExpandedId] = useState(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  // Fetch subcontratos + todos pagos y contactos al montar
  useEffect(() => {
    const usrStr = localStorage.getItem('currentUser')
    if (!usrStr) {
      setError('Usuario no autenticado')
      setLoading(false)
      return
    }
    const user = JSON.parse(usrStr)
    const correo = encodeURIComponent(user.correo || user.usuario)

    const fetchData = async () => {
      try {
        const [subRes, pagosRes, contactosRes] = await Promise.all([
          fetch(`${API_BASE}/SubcontratoApi/GetSubcontratos?usuario=${correo}`),
          fetch(`${API_BASE}/PagoSubcontratoApi/GetPagosSubcontrato?usuario=${correo}`),
          fetch(`${API_BASE}/ContactApi/GetContacts?usuario=${correo}`)
        ])
        if (!subRes.ok || !pagosRes.ok || !contactosRes.ok) throw new Error('Error en API')

        const subData = await subRes.json()
        const pagosData = await pagosRes.json()
        const contactosData = await contactosRes.json()

        setSubcontratos(subData)

        // Map pagos por subcontrato
        const pagosMap = {}
        pagosData.forEach(p => {
          if (!pagosMap[p.subcontratoID]) pagosMap[p.subcontratoID] = []
          pagosMap[p.subcontratoID].push(p)
        })
        setPagosPorSubcontrato(pagosMap)

        // Map contactos por subcontrato
        const contactosMap = {}
        contactosData.forEach(c => {
          if (!contactosMap[c.subcontratoID]) contactosMap[c.subcontratoID] = []
          contactosMap[c.subcontratoID].push(c)
        })
        setContactosPorSubcontrato(contactosMap)

      } catch (err) {
        console.error(err)
        setError('Error cargando datos.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const toggleExpand = (idSubcontrato) => {
    setExpandedId(prev => prev === idSubcontrato ? null : idSubcontrato)
  }

  const toggleExpandContacts = (idSubcontrato) => {
    setExpandedContactsId(prev => prev === idSubcontrato ? null : idSubcontrato)
  }

  const toggleDescExpand = (idSubcontrato) => {
    setDescExpandedId(prev => prev === idSubcontrato ? null : idSubcontrato)
  }

  const handleFilterChange = field => value => {
    setFiltros(current => ({ ...current, [field]: value }))
  }

  const clearFilters = () => {
    setFiltros({
      fecha: '',
      tipoFecha: 'reales',
      proveedor: '',
      avanceMin: '',
      avanceMax: '',
      montoMin: '',
      montoMax: '',
      sinContactos: false,
      sinPagos: false
    })
  }

  const activeFiltersCount = Object.values(filtros).filter(val => val && val !== 'reales' && val !== false).length

  const results = useMemo(() => {
    let arr = subcontratos

    if (filtros.fecha) {
      arr = arr.filter(s => {
        const inicio = filtros.tipoFecha === 'reales' ? s.fechaInicioReal : s.fechaInicioProyectada
        return new Date(inicio).toISOString().slice(0, 10) === filtros.fecha
      })
    }
    if (filtros.proveedor) {
      arr = arr.filter(s =>
        s.nombreProveedor?.toLowerCase().includes(filtros.proveedor.toLowerCase())
      )
    }
    if (filtros.avanceMin) arr = arr.filter(s => s.porcentajeAvance >= Number(filtros.avanceMin))
    if (filtros.avanceMax) arr = arr.filter(s => s.porcentajeAvance <= Number(filtros.avanceMax))
    if (filtros.montoMin) arr = arr.filter(s => s.montoCotizado >= Number(filtros.montoMin))
    if (filtros.montoMax) arr = arr.filter(s => s.montoCotizado <= Number(filtros.montoMax))

    if (filtros.sinContactos) {
      arr = arr.filter(s => !contactosPorSubcontrato[s.idSubcontrato] || contactosPorSubcontrato[s.idSubcontrato].length === 0)
    }

    if (filtros.sinPagos) {
      arr = arr.filter(s => !pagosPorSubcontrato[s.idSubcontrato] || pagosPorSubcontrato[s.idSubcontrato].length === 0)
    }

    return arr
  }, [
    subcontratos,
    filtros,
    pagosPorSubcontrato,
    contactosPorSubcontrato
  ])

  if (loading) return <p>Cargando…</p>
  if (error) return <p className="dashboard-error">{error}</p>

  return (
    <div className="dashboard-page">
      {/* HEADER MODERNO */}
      <header className="actividades-header">
        <div className="header-container">
          <div className="header-content">
            <div className="header-left">
              <button 
                onClick={() => navigate(-1)} 
                className="back-btn-modern"
                title="Volver"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="header-title-group">
                <div className="title-with-icon">
                  <FileText size={28} />
                  <h1 className="main-title">Subcontratos</h1>
                </div>
                <p className="header-subtitle">Gestiona tus subcontratos y pagos</p>
              </div>
            </div>

            <div className="header-buttons">
              <Link to="nuevo" className="btn-add">+ Nuevo subcontrato</Link>
              <Link to="pagos/nuevo" className="btn-add" style={{ marginLeft: '0.5rem' }}>Pagos</Link>
            </div>
          </div>
        </div>
      </header>

      {/* FILTERS DROPDOWN */}
      <div className="filters-dropdown-wrapper">
        <button
          className="btn-action"
          onClick={() => setDropdownOpen(prev => !prev)}
        >
          Filtros {activeFiltersCount > 0 && <span className="filters-badge">+{activeFiltersCount}</span>}
        </button>

        {dropdownOpen && (
          <div className="filters-dropdown-card">
            <div className="filters-row">
              <Calendar className="filter-icon" />
              <select
                value={filtros.tipoFecha}
                onChange={e => handleFilterChange('tipoFecha')(e.target.value)}
              >
                <option value="reales">Fechas reales</option>
                <option value="proyectadas">Fechas proyectadas</option>
              </select>

              <input
                type="date"
                value={filtros.fecha}
                onChange={e => handleFilterChange('fecha')(e.target.value)}
              />

              <input
                type="text"
                placeholder="Proveedor"
                value={filtros.proveedor}
                onChange={e => handleFilterChange('proveedor')(e.target.value)}
              />
            </div>

            <div className="filters-row">
              <input
                type="number"
                placeholder="Min %"
                value={filtros.avanceMin}
                onChange={e => handleFilterChange('avanceMin')(e.target.value)}
                min={0} max={100}
              />
              <input
                type="number"
                placeholder="Max %"
                value={filtros.avanceMax}
                onChange={e => handleFilterChange('avanceMax')(e.target.value)}
                min={0} max={100}
              />
              <input
                type="number"
                placeholder="Min ₡"
                value={filtros.montoMin}
                onChange={e => handleFilterChange('montoMin')(e.target.value)}
                min={0}
              />
              <input
                type="number"
                placeholder="Max ₡"
                value={filtros.montoMax}
                onChange={e => handleFilterChange('montoMax')(e.target.value)}
                min={0}
              />
            </div>

            <div className="filters-row">
              <label>
                <input
                  type="checkbox"
                  checked={filtros.sinContactos}
                  onChange={e => handleFilterChange('sinContactos')(e.target.checked)}
                />
                Sin contactos
              </label>
              <label style={{ marginLeft: '1rem' }}>
                <input
                  type="checkbox"
                  checked={filtros.sinPagos}
                  onChange={e => handleFilterChange('sinPagos')(e.target.checked)}
                />
                Sin pagos
              </label>
            </div>

            {(activeFiltersCount > 0) && (
              <button className="btn btn-outline-primary btn-sm" onClick={clearFilters}>
                Limpiar filtros
              </button>
            )}
          </div>
        )}
      </div>

      {/* TABLA */}
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
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <Link
                            to="#"
                            onClick={e => {
                              e.preventDefault()
                              toggleExpand(s.idSubcontrato)
                            }}
                            className="btn-link"
                          >
                            <Banknote size={14} style={{ marginRight: 4 }} />
                            {isExpanded ? 'Ocultar pagos' : 'Ver pagos'}
                          </Link>

                          <Link
                            to="#"
                            onClick={e => {
                              e.preventDefault()
                              toggleExpandContacts(s.idSubcontrato)
                            }}
                            className="btn-link"
                          >
                            <User size={14} style={{ marginRight: 4 }} />
                            {expandedContactsId === s.idSubcontrato ? 'Ocultar contactos' : 'Ver contactos'}
                          </Link>

                          <Link to={`editar/${s.idSubcontrato}`} className="btn-link">
                            <Edit3 size={14} style={{ marginRight: 4 }} />
                            Editar
                          </Link>
                        </div>
                      </td>
                    </tr>

                    {/* Pagos */}
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

                    {/* Contactos */}
                    {expandedContactsId === s.idSubcontrato && (
                      <tr className="contacts-row">
                        <td colSpan={7}>
                          {contactosPorSubcontrato[s.idSubcontrato]?.length > 0 && (
                            <table className="payments-table">
                              <thead>
                                <tr>
                                  <th>Nombre</th>
                                  <th>Teléfono</th>
                                  <th>Correo Electrónico</th>
                                  <th>Principal</th>
                                </tr>
                              </thead>
                              <tbody>
                                {contactosPorSubcontrato[s.idSubcontrato].map(contacto => (
                                  <tr key={contacto.idContacto}>
                                    <td>{contacto.nombreCompleto}</td>
                                    <td>{contacto.telefono}</td>
                                    <td>{contacto.correoElectronico}</td>
                                    <td>{contacto.esPrincipal ? 'Sí' : 'No'}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}

                          {/* Botón siempre visible */}
                          <Link
                            to={`/dashboard/productividad/subcontratos/contactos/nuevo?subcontratoId=${s.idSubcontrato}`}
                            className="btn-add"
                            style={{ marginTop: '0.5rem', display: 'inline-block' }}
                          >
                            Añadir contactos
                          </Link>
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
            {activeFiltersCount > 0
              ? 'No se encontraron subcontratos con esos filtros'
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
